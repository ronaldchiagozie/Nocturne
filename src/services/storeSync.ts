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

const CYCLE_MS = 24 * 60 * 60 * 1000;
const PHANTOM_MIN_MS = 2 * 60 * 1000;
const PHANTOM_MAX_MS = 5 * 60 * 1000;

const DEFAULT_STOCK: Record<ProductId, { max: number }> = {
  no03: { max: 8 },
  no05: { max: 6 },
  no07: { max: 12 },
};

export interface ProductStock {
  productId: ProductId;
  stock: number;
  maxStock: number;
}

export interface StoreMeta {
  cycleStartedAt: number;
  lastPhantomAt: number;
  totalSoldThisCycle: number;
}

export type StoreSnapshot = {
  meta: StoreMeta;
  inventory: Record<ProductId, ProductStock>;
  source: 'firebase' | 'local';
};

const LOCAL_KEY = 'nocturne_store_sync';

function useFirebaseStore(): boolean {
  return isFirebaseConfigured && !getFirebaseInitError();
}

function freshInventory(): Record<ProductId, ProductStock> {
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
  return { cycleStartedAt: now, lastPhantomAt: now, totalSoldThisCycle: 0 };
}

function randomPhantomDelay() {
  return PHANTOM_MIN_MS + Math.random() * (PHANTOM_MAX_MS - PHANTOM_MIN_MS);
}

function maybeRefreshCycle(meta: StoreMeta, inventory: Record<ProductId, ProductStock>) {
  const now = Date.now();
  if (now - meta.cycleStartedAt < CYCLE_MS) return { meta, inventory, refreshed: false };

  return {
    meta: { cycleStartedAt: now, lastPhantomAt: now, totalSoldThisCycle: 0 },
    inventory: freshInventory(),
    refreshed: true,
  };
}

function maybePhantomPurchase(
  meta: StoreMeta,
  inventory: Record<ProductId, ProductStock>,
) {
  const now = Date.now();
  if (now - meta.lastPhantomAt < randomPhantomDelay()) return { meta, inventory };

  const candidates = (Object.keys(inventory) as ProductId[]).filter(
    (id) => inventory[id].stock > 2,
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
    /* ignore */
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
    /* ignore */
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

  const db = getDb();
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

  ensureFirebaseStore().catch(fallbackLocal);

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

export async function purchaseFromStore(
  items: CartItem[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const qtyByProduct = items.reduce(
    (acc, item) => {
      acc[item.productId] = (acc[item.productId] ?? 0) + item.qty;
      return acc;
    },
    {} as Record<ProductId, number>,
  );

  if (!useFirebaseStore()) {
    const snap = loadLocal();
    let { meta, inventory } = snap;

    for (const [productId, qty] of Object.entries(qtyByProduct) as [ProductId, number][]) {
      if (inventory[productId].stock < qty) {
        return { ok: false, reason: `${getProduct(productId).title} is sold out for today.` };
      }
    }

    for (const [productId, qty] of Object.entries(qtyByProduct) as [ProductId, number][]) {
      inventory[productId] = {
        ...inventory[productId],
        stock: inventory[productId].stock - qty,
      };
    }

    meta = { ...meta, totalSoldThisCycle: meta.totalSoldThisCycle + items.length };
    saveLocal({ ...snap, meta, inventory });
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

      const refreshed = maybeRefreshCycle(meta, inventory);
      meta = refreshed.meta;
      Object.assign(inventory, refreshed.inventory);

      for (const [productId, qty] of Object.entries(qtyByProduct) as [ProductId, number][]) {
        if (inventory[productId].stock < qty) {
          throw new Error(`${getProduct(productId).title} is sold out for today.`);
        }
      }

      for (const [productId, qty] of Object.entries(qtyByProduct) as [ProductId, number][]) {
        inventory[productId] = {
          ...inventory[productId],
          stock: inventory[productId].stock - qty,
        };
      }

      meta = {
        ...meta,
        totalSoldThisCycle: meta.totalSoldThisCycle + items.length,
      };

      tx.set(metaRef, meta);
      for (const id of Object.keys(PRODUCTS) as ProductId[]) {
        tx.set(doc(db, 'inventory', id), inventory[id]);
      }
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Purchase failed.';
    return { ok: false, reason: message };
  }
}

export function getCycleTimeRemaining(meta: StoreMeta): number {
  const elapsed = Date.now() - meta.cycleStartedAt;
  return Math.max(0, CYCLE_MS - elapsed);
}

export function formatTimeRemaining(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getTotalStock(inventory: Record<ProductId, ProductStock>): number {
  return Object.values(inventory).reduce((sum, p) => sum + p.stock, 0);
}

export function getTotalMaxStock(inventory: Record<ProductId, ProductStock>): number {
  return Object.values(inventory).reduce((sum, p) => sum + p.maxStock, 0);
}
