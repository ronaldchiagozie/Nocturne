import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  where,
  documentId,
  type Unsubscribe,
} from 'firebase/firestore';
import { PRODUCTS, ProductId } from '../data/products';
import { getDb, getFirebaseInitError, isFirebaseConfigured } from '../lib/firebase';
import type { ProductStock, StoreMeta } from './storeLedger';
import { applyPurchase, freshInventory } from './storeSync';
import type { CartItem, OrderLineItem, ShippingInfo, SimulatedOrder, StoreOrder } from '../types';

const SESSION_ORDER_IDS_KEY = 'nocturne_order_ids';
const LOCAL_ORDERS_KEY = 'nocturne_orders';

export interface CheckoutSubmitInput {
  items: CartItem[];
  shipping: ShippingInfo;
  subtotalNgn: number;
  shippingNgn: number;
  totalNgn: number;
  totalUsd: number;
  couponCode?: string;
  couponDiscountNgn?: number;
}

function useFirebaseOrders(): boolean {
  return isFirebaseConfigured && !getFirebaseInitError();
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)]),
    ) as T;
  }
  return value;
}

function cartToLineItems(items: CartItem[]): OrderLineItem[] {
  return items.map((item) => {
    const line: OrderLineItem = {
      productId: item.productId,
      variantId: item.variantId,
      productLabel: item.productLabel,
      productTitle: item.productTitle,
      priceNgn: item.priceNgn,
      qty: item.qty,
      image: item.image,
    };
    if (item.formulationLabel) {
      line.formulationLabel = item.formulationLabel;
    }
    return line;
  });
}

function buildStoreOrder(input: CheckoutSubmitInput, id: string): StoreOrder {
  return {
    id,
    createdAt: new Date().toISOString(),
    shipping: input.shipping,
    items: cartToLineItems(input.items),
    subtotalNgn: input.subtotalNgn,
    shippingNgn: input.shippingNgn,
    totalNgn: input.totalNgn,
    totalUsd: input.totalUsd,
    couponCode: input.couponCode ?? null,
    couponDiscountNgn: input.couponDiscountNgn ?? 0,
    status: 'received',
    paymentStatus: 'simulated',
  };
}

function generateLocalOrderId(): string {
  return `N7-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function normalizeStoreOrder(id: string, raw: Record<string, unknown>): StoreOrder | null {
  if (!raw.shipping || typeof raw.shipping !== 'object') return null;
  if (!Array.isArray(raw.items)) return null;

  const shipping = raw.shipping as ShippingInfo;
  if (!shipping.fullName || !shipping.email || !shipping.address) return null;

  const items = raw.items
    .filter((item): item is OrderLineItem => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as OrderLineItem).productId === 'string' &&
        (item as OrderLineItem).productId in PRODUCTS
      );
    })
    .map((item) => item);

  if (items.length === 0) return null;

  const status =
    raw.status === 'compounding' || raw.status === 'dispatched' ? raw.status : 'received';

  return {
    id,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    shipping,
    items,
    subtotalNgn: typeof raw.subtotalNgn === 'number' ? raw.subtotalNgn : 0,
    shippingNgn: typeof raw.shippingNgn === 'number' ? raw.shippingNgn : 0,
    totalNgn: typeof raw.totalNgn === 'number' ? raw.totalNgn : 0,
    totalUsd: typeof raw.totalUsd === 'number' ? raw.totalUsd : 0,
    couponCode: typeof raw.couponCode === 'string' ? raw.couponCode : null,
    couponDiscountNgn:
      typeof raw.couponDiscountNgn === 'number' ? raw.couponDiscountNgn : undefined,
    status,
    paymentStatus: 'simulated',
  };
}

export function storeOrderToSimulatedOrders(order: StoreOrder): SimulatedOrder[] {
  const location = order.shipping.address.trim() || 'Lagos';
  const name = order.shipping.fullName.trim() || 'You';
  const date = new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.');
  const time = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const statusMap: Record<StoreOrder['status'], SimulatedOrder['status']> = {
    received: 'Received',
    compounding: 'Compounding',
    dispatched: 'Dispatched',
  };

  return order.items.flatMap((item) => {
    const simulated: SimulatedOrder[] = [];
    for (let i = 0; i < item.qty; i++) {
      simulated.push({
        id: `${order.id}-${item.productId}-${i}`,
        productId: item.productId,
        productLabel: item.productLabel,
        productTitle: item.productTitle,
        variantId: item.variantId,
        formulationLabel: item.formulationLabel,
        personalization: {
          name,
          location,
          date,
          message: 'Worn after dark.',
        },
        qty: 1,
        timestamp: time,
        status: statusMap[order.status],
      });
    }
    return simulated;
  });
}

export function orderLinesToCartItems(items: OrderLineItem[]): CartItem[] {
  return items.map((item, index) => ({
    cartKey: `${item.productId}::${item.variantId}::${item.formulationLabel ?? ''}::${index}`,
    productId: item.productId,
    variantId: item.variantId,
    productLabel: item.productLabel,
    productTitle: item.productTitle,
    formulationLabel: item.formulationLabel,
    priceNgn: item.priceNgn,
    qty: item.qty,
    image: item.image,
  }));
}

export async function fetchLatestSessionOrder(): Promise<StoreOrder | null> {
  const orders = await fetchSessionOrders();
  return orders[0] ?? null;
}

function getSessionOrderIds(): string[] {
  try {
    const raw = localStorage.getItem(SESSION_ORDER_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function addSessionOrderId(id: string) {
  const ids = getSessionOrderIds();
  if (ids.includes(id)) return;
  try {
    localStorage.setItem(SESSION_ORDER_IDS_KEY, JSON.stringify([id, ...ids]));
  } catch {
    /* ignore */
  }
}

function loadLocalOrders(): StoreOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed
      .map((item, index) =>
        normalizeStoreOrder(
          typeof item.id === 'string' ? item.id : `local-${index}`,
          item,
        ),
      )
      .filter((order): order is StoreOrder => order !== null);
  } catch {
    return [];
  }
}

function saveLocalOrder(order: StoreOrder) {
  const existing = loadLocalOrders().filter((item) => item.id !== order.id);
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([order, ...existing]));
  } catch {
    /* ignore */
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function fetchSessionOrders(): Promise<StoreOrder[]> {
  const ids = getSessionOrderIds();
  if (ids.length === 0) return [];

  if (!useFirebaseOrders()) {
    const orders = loadLocalOrders();
    return orders
      .filter((order) => ids.includes(order.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const db = getDb();
  const orders: StoreOrder[] = [];

  for (const batch of chunk(ids, 30)) {
    const snap = await getDocs(
      query(collection(db, 'orders'), where(documentId(), 'in', batch)),
    );
    snap.forEach((docSnap) => {
      const order = normalizeStoreOrder(docSnap.id, docSnap.data() as Record<string, unknown>);
      if (order) orders.push(order);
    });
  }

  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function subscribeSessionOrders(onData: (orders: StoreOrder[]) => void): Unsubscribe {
  const emitLocal = () => {
    void fetchSessionOrders().then(onData);
  };

  emitLocal();

  if (!useFirebaseOrders()) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_ORDERS_KEY || event.key === SESSION_ORDER_IDS_KEY) {
        emitLocal();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  const ids = getSessionOrderIds();
  if (ids.length === 0) {
    return () => {};
  }

  const db = getDb();
  const unsubs: Unsubscribe[] = [];

  for (const batch of chunk(ids, 30)) {
    unsubs.push(
      onSnapshot(
        query(collection(db, 'orders'), where(documentId(), 'in', batch)),
        () => {
          void fetchSessionOrders().then(onData);
        },
        () => {
          emitLocal();
        },
      ),
    );
  }

  return () => unsubs.forEach((unsub) => unsub());
}

export async function submitCheckout(
  input: CheckoutSubmitInput,
): Promise<{ ok: true; order: StoreOrder } | { ok: false; reason: string }> {
  if (input.items.length === 0) {
    return { ok: false, reason: 'Your cart is empty.' };
  }

  if (!useFirebaseOrders()) {
    const { purchaseFromStore } = await import('./storeSync');
    const purchase = await purchaseFromStore(input.items);
    if (purchase.ok === false) return purchase;

    const order = buildStoreOrder(input, generateLocalOrderId());
    saveLocalOrder(order);
    addSessionOrderId(order.id);
    return { ok: true, order };
  }

  const db = getDb();
  const metaRef = doc(db, 'store', 'meta');
  const orderRef = doc(collection(db, 'orders'));

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

      const result = applyPurchase(meta, inventory, input.items);
      if (result.ok === false) throw new Error(result.reason);

      tx.set(metaRef, result.meta);
      for (const id of Object.keys(PRODUCTS) as ProductId[]) {
        tx.set(doc(db, 'inventory', id), result.inventory[id]);
      }

      tx.set(orderRef, stripUndefined(buildStoreOrder(input, orderRef.id)));
    });

    addSessionOrderId(orderRef.id);
    return { ok: true, order: buildStoreOrder(input, orderRef.id) };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed.';
    return { ok: false, reason: message };
  }
}
