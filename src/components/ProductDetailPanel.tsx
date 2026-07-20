import { motion, AnimatePresence } from 'motion/react';
import { getProduct, ProductId } from '../data/products';
import { getBottleVariant } from '../data/bottleVariants';
import { useStore } from '../context/StoreContext';
import { useAddToCart } from '../hooks/useAddToCart';
import type { CheckoutOverride } from '../types';

interface ProductDetailPanelProps {
  productId: ProductId | null;
  override?: CheckoutOverride;
  onClose: () => void;
}

export function ProductDetailPanel({ productId, override, onClose }: ProductDetailPanelProps) {
  const product = productId ? getProduct(productId) : null;
  const { getStock } = useStore();
  const { add, buyNow } = useAddToCart();
  const stock = productId ? getStock(productId) : null;
  const soldOut = stock ? stock.stock === 0 : false;

  const label = override?.productLabel ?? product?.label ?? '';
  const title = override?.formulationLabel ?? override?.productTitle ?? product?.title ?? '';
  const image =
    (override?.variantId ? getBottleVariant(override.variantId)?.image : undefined) ??
    product?.image ??
    '';

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[215]" data-lenis-prevent role="dialog" aria-label={`${label} ${title}`}>
          {/* Page overlay — see content behind, no solid gray block */}
          <motion.button
            type="button"
            aria-label="Close product details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            className="absolute inset-0 bg-canvas/20 backdrop-blur-[3px] cursor-pointer"
          />

          {/* Hero bottle */}
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.88, rotate: -3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.94, rotate: -1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.9 }}
            className="pointer-events-none absolute inset-x-0 top-[max(3rem,env(safe-area-inset-top))] bottom-[min(50dvh,440px)] flex items-end justify-center px-6 pb-2"
          >
            <motion.img
              src={image}
              alt={title}
              initial={{ y: 12 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.06 }}
              className="h-full w-auto max-w-[min(88vw,360px)] object-contain object-bottom"
              fetchPriority="high"
            />
          </motion.div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 sm:right-6 z-[222] font-mono text-xl text-canvas/60 hover:text-canvas transition-colors cursor-pointer leading-none"
            aria-label="Close"
          >
            ×
          </button>

          {/* Detail sheet — taller cream panel */}
          <motion.aside
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 z-[220] bg-cream text-canvas pb-[env(safe-area-inset-bottom)] min-h-[min(50dvh,480px)]"
          >
            <div className="modal-scroll h-full px-5 sm:px-8 md:px-12 py-7 sm:py-8 md:py-9 flex flex-col justify-center" data-modal-scroll>
              <div className="max-w-2xl mx-auto w-full">
                <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-taupe-muted">
                  {label}
                </p>

                <h2 className="font-serif text-[clamp(1.65rem,5vw,2.35rem)] tracking-tight leading-tight mt-2">
                  {title}
                </h2>

                <p className="font-body-italic italic text-sm sm:text-[15px] text-taupe-muted font-light mt-3 sm:mt-4 leading-relaxed max-w-lg">
                  {product.character}
                </p>

                <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-taupe-muted mt-5 sm:mt-6 leading-relaxed">
                  {product.notes.top} · {product.notes.heart} · {product.notes.base}
                </p>

                <div className="mt-6 sm:mt-8 pt-6 border-t border-canvas/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div>
                    <p className="font-mono text-[11px] tabular-nums text-canvas">
                      {product.price}
                      <span className="text-taupe-muted ml-2">· 50ml extrait</span>
                    </p>
                    {stock && (
                      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-taupe-muted mt-1.5">
                        {soldOut ? 'Sold out today' : `${stock.stock} left today`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-5 sm:gap-6">
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => add(product.id, { override })}
                      className="font-sans text-[9px] uppercase tracking-[0.24em] text-canvas hover:text-taupe-muted transition-colors cursor-pointer disabled:opacity-40"
                    >
                      Add to cart
                    </button>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => {
                        buyNow(product.id, { override });
                        onClose();
                      }}
                      className="checkout-btn px-6 py-2.5 disabled:opacity-40"
                    >
                      Buy now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
