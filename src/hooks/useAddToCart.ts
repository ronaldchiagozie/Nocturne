import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';
import { useCartFlight } from '../context/CartFlightContext';
import { resolveProductImage } from '../utils/productDisplay';
import { getProduct, ProductId } from '../data/products';
import type { CheckoutOverride } from '../types';

interface AddOptions {
  override?: CheckoutOverride;
  qty?: number;

  silent?: boolean;

  from?: HTMLElement | null;
}

export function useAddToCart() {
  const { addToCart } = useStore();
  const { showToast } = useToast();
  const { flyToCart } = useCartFlight();
  const navigate = useNavigate();

  const add = useCallback(
    (
      productId: ProductId,
      options?: AddOptions,
    ): { ok: true } | { ok: false; reason: string } => {
      const result = addToCart({
        productId,
        override: options?.override,
        qty: options?.qty,
      });

      if (result.ok && !options?.silent) {
        const flew = flyToCart({
          from: options?.from ?? null,
          image: resolveProductImage(productId, options?.override),
        });

        if (!flew) {
          const product = getProduct(productId);
          const title =
            options?.override?.formulationLabel ??
            options?.override?.productTitle ??
            product.title;

          showToast({
            title,
            variant: 'added',
            action: { label: 'Cart', href: '/cart' },
          });
        }
      }

      if (result.ok === false && !options?.silent) {
        showToast({
          title: result.reason,
          variant: 'error',
        });
      }

      return result;
    },
    [addToCart, showToast, flyToCart],
  );

  const buyNow = useCallback(
    (productId: ProductId, options?: Omit<AddOptions, 'silent'>) => {
      const result = add(productId, { ...options, silent: true });
      if (result.ok) navigate('/checkout');
      else if (result.ok === false) showToast({ title: result.reason, variant: 'error' });
    },
    [add, navigate, showToast],
  );

  return { add, buyNow };
}
