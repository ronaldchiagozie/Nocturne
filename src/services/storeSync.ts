import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  type Unsubscribe,
} from 'firebase/firestore';
import { getProduct, PRODUCTS, ProductId } from '../data/products';
import { getDb, isFirebaseConfigured, getFirebaseInitError } from '../lib/firebase';
import type { CartItem } from '../types';

import { getLagosDayStart, type ProductStock, type StoreMeta } from './storeLedger';
export type { ProductStock, StoreMeta } from './storeLedger';
export {
  formatTimeRemaining,
  getCycleTimeRemaining,
  getLagosDayStart,
  getTotalMaxStock,
  getTotalStock,
} from './storeLedger';

const PHANTOM_MIN_MS = 2 * 60 * 1000;
const PHANTOM_MAX_MS = 5 * 60 * 1000;

const PHANTOM_STOCK_FLOOR = 7;

const DEFAULT_STOCK: Record<ProductId, { max: number }> = {
  no03: { max: 12 },
  no05: { max: 12 },
  no07: { max: 14 },
};

export type StoreSnapshot = {
  meta: StoreMeta;
  inventory: Record<ProductId, ProductStock>;
  source: 'firebase' | 'local';
};

const LOCAL_KEY = 'nocturne_store_sync';

function useFirebaseStore(): boolean {
  return isFirebaseConfigured && !getFirebaseInitError();
}

export function freshInventory(): Record<ProductId, ProductStock> {
  return (Object.keys(PRODUCTS) as ProductId[]).reduce(
    (acc, id) => {
      acc[id] = { productId: id, stock: DEFAULT_STOCK[id].max, maxStock: DEFAULT_STOCK[id].max };
      return acc;
    },
    {} as Record<ProductId, ProductStock>,
  );
}

function freshMeta(): StoreMeta {
  const now = Date.now();
  return { cycleStartedAt: getLagosDayStart(now), lastPhantomAt: now, totalSoldThisCycle: 0 };
}

function randomPhantomDelay() {
  return PHANTOM_MIN_MS + Math.random() * (PHANTOM_MAX_MS - PHANTOM_MIN_MS);
}

function maybeRefreshCycle(meta: StoreMeta, inventory: Record<ProductId, ProductStock>) {
  const todayStart = getLagosDayStart();
  const lagosAligned = meta.cycleStartedAt === getLagosDayStart(meta.cycleStartedAt);
  const capsMismatch = (Object.keys(PRODUCTS) as ProductId[]).some(
    (id) => inventory[id].maxStock !== DEFAULT_STOCK[id].max,
  );

  if (meta.cycleStartedAt >= todayStart && lagosAligned && !capsMismatch) {
    return { meta, inventory, refreshed: false };
  }

  return {
    meta: { cycleStartedAt: todayStart, lastPhantomAt: Date.now(), totalSoldThisCycle: 0 },
    inventory: freshInventory(),
    refreshed: true,
  };
}

function syncInventoryCaps(inventory: Record<ProductId, ProductStock>) {
  for (const id of Object.keys(PRODUCTS) as ProductId[]) {
    const cap = DEFAULT_STOCK[id].max;
    if (inventory[id].maxStock !== cap) {
      inventory[id] = { productId: id, stock: cap, maxStock: cap };
    }
  }
}

function maybePhantomPurchase(
  meta: StoreMeta,
  inventory: Record<ProductId, ProductStock>,
) {
  const now = Date.now();
  if (now - meta.lastPhantomAt < randomPhantomDelay()) return { meta, inventory };

  const candidates = (Object.keys(inventory) as ProductId[]).filter(
    (id) => inventory[id].stock > PHANTOM_STOCK_FLOOR,
  );
  if (candidates.length === 0) return { meta, inventory };

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const next = { ...inventory, [pick]: { ...inventory[pick], stock: inventory[pick].stock - 1 } };

  return {
    meta: {
      ...meta,
      lastPhantomAt: now,
      totalSoldThisCycle: meta.totalSoldThisCycle + 1,
    },
    inventory: next,
  };
}

function loadLocal(): StoreSnapshot {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreSnapshot;
      let { meta, inventory } = parsed;
      syncInventoryCaps(inventory);
      const refreshed = maybeRefreshCycle(meta, inventory);
      meta = refreshed.meta;
      inventory = refreshed.inventory;
      if (!refreshed.refreshed) {
        const phantom = maybePhantomPurchase(meta, inventory);
        meta = phantom.meta;
        inventory = phantom.inventory;
      }
      const snap = { meta, inventory, source: 'local' as const };
      saveLocal(snap);
      return snap;
    }
  } catch {
  }

  const snap: StoreSnapshot = {
    meta: freshMeta(),
    inventory: freshInventory(),
    source: 'local',
  };
  saveLocal(snap);
  return snap;
}

function saveLocal(snap: StoreSnapshot) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(snap));
  } catch {
  }
}

const localListeners = new Set<(snap: StoreSnapshot) => void>();

function notifyLocal() {
  const snap = loadLocal();
  localListeners.forEach((fn) => fn(snap));
}

export function subscribeStore(onData: (snap: StoreSnapshot) => void): Unsubscribe {
  if (!useFirebaseStore()) {
    onData(loadLocal());
    localListeners.add(onData);
    const interval = window.setInterval(() => notifyLocal(), 30_000);
    return () => {
      localListeners.delete(onData);
      window.clearInterval(interval);
    };
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[Nocturne] Firebase unavailable — using local inventory.', err);
    }
    onData(loadLocal());
    localListeners.add(onData);
    const interval = window.setInterval(() => notifyLocal(), 30_000);
    return () => {
      localListeners.delete(onData);
      window.clearInterval(interval);
    };
  }

  const metaRef = doc(db, 'store', 'meta');
  const inventoryCol = collection(db, 'inventory');

  let cachedMeta: StoreMeta | null = null;
  let cachedInventory: Record<ProductId, ProductStock> | null = null;
  let fellBackToLocal = false;

  const emit = () => {
    if (cachedMeta && cachedInventory) {
      onData({
        meta: cachedMeta,
        inventory: cachedInventory,
        source: 'firebase',
      });
    }
  };

  const fallbackLocal = (reason: unknown) => {
    if (fellBackToLocal) return;
    fellBackToLocal = true;
    if (import.meta.env.DEV) {
      console.warn('[Nocturne] Firebase sync unavailable — using local inventory.', reason);
    }
    onData(loadLocal());
    localListeners.add(onData);
  };

  ensureFirebaseStore()
    .then(() => import('./catalogSync').then(({ seedCatalogToFirebase }) => seedCatalogToFirebase()))
    .catch(fallbackLocal);

  const unsubMeta = onSnapshot(
    metaRef,
    (snap) => {
      if (snap.exists()) {
        cachedMeta = snap.data() as StoreMeta;
      }
      emit();
    },
    fallbackLocal,
  );

  const unsubInv = onSnapshot(
    inventoryCol,
    (snap) => {
      const inv = freshInventory();
      snap.forEach((d) => {
        const id = d.id as ProductId;
        if (id in PRODUCTS) inv[id] = d.data() as ProductStock;
      });
      cachedInventory = inv;
      emit();
    },
    fallbackLocal,
  );

  const phantomInterval = window.setInterval(() => {
    runPhantomTick().catch(() => {});
  }, 60_000);

  return () => {
    unsubMeta();
    unsubInv();
    window.clearInterval(phantomInterval);
    localListeners.delete(onData);
  };
}

async function ensureFirebaseStore() {
  const db = getDb();
  const metaRef = doc(db, 'store', 'meta');

  await runTransaction(db, async (tx) => {
    const metaSnap = await tx.get(metaRef);
    if (metaSnap.exists()) return;

    tx.set(metaRef, freshMeta());

    for (const id of Object.keys(PRODUCTS) as ProductId[]) {
      const ref = doc(db, 'inventory', id);
      tx.set(ref, {
        productId: id,
        stock: DEFAULT_STOCK[id].max,
        maxStock: DEFAULT_STOCK[id].max,
      });
    }
  });
}

async function runPhantomTick() {
  if (!useFirebaseStore()) {
    notifyLocal();
    return;
  }

  const db = getDb();
  const metaRef = doc(db, 'store', 'meta');

  await runTransaction(db, async (tx) => {
    const metaSnap = await tx.get(metaRef);
    if (!metaSnap.exists()) return;

    let meta = metaSnap.data() as StoreMeta;
    const inventory: Record<ProductId, ProductStock> = freshInventory();

    for (const id of Object.keys(PRODUCTS) as ProductId[]) {
      const ref = doc(db, 'inventory', id);
      const invSnap = await tx.get(ref);
      if (invSnap.exists()) inventory[id] = invSnap.data() as ProductStock;
    }

    const refreshed = maybeRefreshCycle(meta, inventory);
    meta = refreshed.meta;
    Object.assign(inventory, refreshed.inventory);
    syncInventoryCaps(inventory);

    if (!refreshed.refreshed) {
      const phantom = maybePhantomPurchase(meta, inventory);
      meta = phantom.meta;
      Object.assign(inventory, phantom.inventory);
    }

    tx.set(metaRef, meta);
    for (const id of Object.keys(PRODUCTS) as ProductId[]) {
      tx.set(doc(db, 'inventory', id), inventory[id]);
    }
  });
}

function qtyByProduct(items: CartItem[]): Record<ProductId, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.productId] = (acc[item.productId] ?? 0) + item.qty;
      return acc;
    },
    {} as Record<ProductId, number>,
  );
}

export function applyPurchase(
  meta: StoreMeta,
  inventory: Record<ProductId, ProductStock>,
  items: CartItem[],
):
  | { ok: true; meta: StoreMeta; inventory: Record<ProductId, ProductStock> }
  | { ok: false; reason: string } {
  const counts = qtyByProduct(items);
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  for (const [productId, qty] of Object.entries(counts) as [ProductId, number][]) {
    if (inventory[productId].stock < qty) {
      return { ok: false, reason: `${getProduct(productId).title} is sold out for today.` };
    }
  }

  for (const [productId, qty] of Object.entries(counts) as [ProductId, number][]) {
    inventory[productId] = {
      ...inventory[productId],
      stock: inventory[productId].stock - qty,
    };
  }

  meta = { ...meta, totalSoldThisCycle: meta.totalSoldThisCycle + totalQty };
  return { ok: true, meta, inventory };
}

export async function purchaseFromStore(
  items: CartItem[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!useFirebaseStore()) {
    const snap = loadLocal();
    const result = applyPurchase(snap.meta, snap.inventory, items);
    if (result.ok === false) return result;
    saveLocal({ ...snap, meta: result.meta, inventory: result.inventory });
    notifyLocal();
    return { ok: true };
  }

  const db = getDb();
  const metaRef = doc(db, 'store', 'meta');

  try {
    await runTransaction(db, async (tx) => {
      const metaSnap = await tx.get(metaRef);
      if (!metaSnap.exists()) throw new Error('Store not initialized');

      let meta = metaSnap.data() as StoreMeta;
      const inventory: Record<ProductId, ProductStock> = freshInventory();

      for (const id of Object.keys(PRODUCTS) as ProductId[]) {
        const ref = doc(db, 'inventory', id);
        const invSnap = await tx.get(ref);
        if (invSnap.exists()) inventory[id] = invSnap.data() as ProductStock;
      }

      const result = applyPurchase(meta, inventory, items);
      if (result.ok === false) throw new Error(result.reason);

      tx.set(metaRef, result.meta);
      for (const id of Object.keys(PRODUCTS) as ProductId[]) {
        tx.set(doc(db, 'inventory', id), result.inventory[id]);
      }
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Purchase failed.';
    return { ok: false, reason: message };
  }
}
