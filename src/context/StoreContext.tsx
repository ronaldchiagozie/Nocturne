import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getBottleVariant } from '../data/bottleVariants';
import { getProduct, ProductId } from '../data/products';
import { UNIT_PRICE_NGN } from '../data/pricing';
import type { ProductStock, StoreMeta } from '../services/storeLedger';
import type {
  CartItem,
  CheckoutOverride,
  SimulatedOrder,
} from '../types';

const CART_KEY = 'nocturne_cart';

interface AddToCartInput {
  productId: ProductId;
  override?: CheckoutOverride;
  qty?: number;
}

interface StoreContextValue {
  cart: CartItem[];
  cartCount: number;
  cartTotalNgn: number;
  inventory: Record<ProductId, ProductStock> | null;
  meta: StoreMeta | null;
  storeReady: boolean;
  getStock: (productId: ProductId) => ProductStock | null;
  isInStock: (productId: ProductId, qty?: number) => boolean;
  addToCart: (input: AddToCartInput) => { ok: true } | { ok: false; reason: string };
  updateCartQty: (cartKey: string, qty: number) => void;
  removeFromCart: (cartKey: string) => void;
  clearCart: () => void;
  purchaseCart: () => Promise<{ ok: true } | { ok: false; reason: string }>;
  buildCartKey: (
    productId: ProductId,
    variantId: string,
    formulationLabel?: string,
  ) => string;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function buildCartKey(
  productId: ProductId,
  variantId: string,
  formulationLabel?: string,
) {
  return [productId, variantId, formulationLabel ?? ''].join('::');
}

function buildCartItem(input: AddToCartInput): CartItem {
  const product = getProduct(input.productId);
  const variantId = input.override?.variantId ?? product.variantId;
  const variant = getBottleVariant(variantId);

  const productLabel = input.override?.productLabel ?? product.label;
  const productTitle = input.override?.productTitle ?? product.title;
  const formulationLabel = input.override?.formulationLabel;

  return {
    cartKey: buildCartKey(input.productId, variantId, formulationLabel),
    productId: input.productId,
    variantId,
    productLabel,
    productTitle,
    formulationLabel,
    priceNgn: UNIT_PRICE_NGN,
    qty: input.qty ?? 1,
    image: input.override?.image ?? variant.image,
  };
}

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* ignore */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [inventory, setInventory] = useState<Record<ProductId, ProductStock> | null>(null);
  const [meta, setMeta] = useState<StoreMeta | null>(null);
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const connect = () => {
      import('../services/storeSync').then(({ subscribeStore }) => {
        if (cancelled) return;
        unsubscribe = subscribeStore((snap) => {
          setInventory(snap.inventory);
          setMeta(snap.meta);
          setStoreReady(true);
        });
      });
    };

    const w = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };

    if (w.requestIdleCallback) {
      const idleId = w.requestIdleCallback(connect, { timeout: 2500 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(idleId);
        unsubscribe?.();
      };
    }

    const timerId = window.setTimeout(connect, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      unsubscribe?.();
    };
  }, []);

  const getStock = useCallback(
    (productId: ProductId) => inventory?.[productId] ?? null,
    [inventory],
  );

  const isInStock = useCallback(
    (productId: ProductId, qty = 1) => {
      const stock = getStock(productId);
      return stock ? stock.stock >= qty : false;
    },
    [getStock],
  );

  const addToCart = useCallback(
    (input: AddToCartInput): { ok: true } | { ok: false; reason: string } => {
      const needed =
        (input.qty ?? 1) +
        (cart.find((c) => c.productId === input.productId)?.qty ?? 0);

      if (inventory && !isInStock(input.productId, needed)) {
        const product = getProduct(input.productId);
        const left = getStock(input.productId)?.stock ?? 0;
        return {
          ok: false,
          reason:
            left === 0
              ? `${product.title} sold out today. Restocks in 24h.`
              : `Only ${left} left for ${product.title} today.`,
        };
      }

      const item = buildCartItem(input);
      setCart((prev) => {
        const existing = prev.find((c) => c.cartKey === item.cartKey);
        if (existing) {
          return prev.map((c) =>
            c.cartKey === item.cartKey ? { ...c, qty: c.qty + (input.qty ?? 1) } : c,
          );
        }
        return [...prev, item];
      });
      return { ok: true };
    },
    [cart, inventory, isInStock, getStock],
  );

  const updateCartQty = useCallback(
    (cartKey: string, qty: number) => {
      if (qty < 1) {
        setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
        return;
      }
      const item = cart.find((c) => c.cartKey === cartKey);
      if (item && inventory) {
        const max = getStock(item.productId)?.stock ?? qty;
        qty = Math.min(qty, max);
      }
      setCart((prev) => prev.map((c) => (c.cartKey === cartKey ? { ...c, qty } : c)));
    },
    [cart, inventory, getStock],
  );

  const removeFromCart = useCallback((cartKey: string) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const purchaseCart = useCallback(async () => {
    const { purchaseFromStore } = await import('../services/storeSync');
    return purchaseFromStore(cart);
  }, [cart]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartTotalNgn = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceNgn * item.qty, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotalNgn,
      inventory,
      meta,
      storeReady,
      getStock,
      isInStock,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      purchaseCart,
      buildCartKey,
    }),
    [
      cart,
      cartCount,
      cartTotalNgn,
      inventory,
      meta,
      storeReady,
      getStock,
      isInStock,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      purchaseCart,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function cartItemsToOrders(
  items: CartItem[],
  shipping: { fullName: string; address: string },
): SimulatedOrder[] {
  const location = shipping.address.trim() || 'Lagos';
  const name = shipping.fullName.trim() || 'You';

  return items.flatMap((item) => {
    const orders: SimulatedOrder[] = [];
    for (let i = 0; i < item.qty; i++) {
      orders.push({
        id: `N7-${Math.floor(1000 + Math.random() * 9000)}`,
        productId: item.productId,
        productLabel: item.productLabel,
        productTitle: item.productTitle,
        variantId: item.variantId,
        formulationLabel: item.formulationLabel,
        personalization: {
          name,
          location,
          date: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
          message: 'Worn after dark.',
        },
        qty: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Received',
      });
    }
    return orders;
  });
}
