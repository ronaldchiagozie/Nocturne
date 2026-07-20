import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ProductId } from '../data/products';
import type { CheckoutOverride } from '../types';
import { ProductDetailPanel } from '../components/ProductDetailPanel';
import { setScrollLocked } from '../hooks/useLenis';

interface ProductDetailState {
  productId: ProductId | null;
  override?: CheckoutOverride;
}

interface ProductDetailContextValue extends ProductDetailState {
  openProduct: (productId: ProductId, override?: CheckoutOverride) => void;
  closeProduct: () => void;
}

const ProductDetailContext = createContext<ProductDetailContextValue | null>(null);

export function ProductDetailProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProductDetailState>({ productId: null });

  const openProduct = useCallback((productId: ProductId, override?: CheckoutOverride) => {
    setState({ productId, override });
  }, []);

  const closeProduct = useCallback(() => {
    setState({ productId: null, override: undefined });
  }, []);

  useEffect(() => {
    setScrollLocked(state.productId !== null);
    return () => setScrollLocked(false);
  }, [state.productId]);

  const value = useMemo(
    () => ({
      productId: state.productId,
      override: state.override,
      openProduct,
      closeProduct,
    }),
    [state.productId, state.override, openProduct, closeProduct],
  );

  return (
    <ProductDetailContext.Provider value={value}>
      {children}
      <ProductDetailPanel
        productId={state.productId}
        override={state.override}
        onClose={closeProduct}
      />
    </ProductDetailContext.Provider>
  );
}

export function useProductDetail() {
  const ctx = useContext(ProductDetailContext);
  if (!ctx) throw new Error('useProductDetail must be used within ProductDetailProvider');
  return ctx;
}
