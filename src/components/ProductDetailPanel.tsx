import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getProduct, ProductId } from '../data/products';
import { useStore } from '../context/StoreContext';
import { useAddToCart } from '../hooks/useAddToCart';
import { cartTargetProps, useCartArrival } from '../context/CartFlightContext';
import { resolveProductImage } from '../utils/productDisplay';
import { getBottleVariant } from '../data/bottleVariants';
import { glowRgb } from './shop/shopLedgerUtils';
import type { CheckoutOverride } from '../types';

interface ProductDetailPanelProps {
  productId: ProductId | null;
  override?: CheckoutOverride;
  onClose: () => void;
}

export function ProductDetailPanel({ productId, override, onClose }: ProductDetailPanelProps) {
  const product = productId ? getProduct(productId) : null;
  const { getStock, getAvailable, cartCount } = useStore();
  const { add, buyNow } = useAddToCart();
  const bottleRef = useRef<HTMLImageElement>(null);
  const cartPulsing = useCartArrival();
  const stock = productId ? getStock(productId) : null;
  const available = productId ? getAvailable(productId) : null;
  const soldOut = available === 0;

  const label = override?.productLabel ?? product?.label ?? '';
  const title =
    override?.formulationLabel ??
    override?.productTitle ??
    product?.title ??
    '';
  const image = override?.image ?? (productId ? resolveProductImage(productId, override) : '');
  const variant = getBottleVariant(override?.variantId ?? product?.variantId ?? 'v01');
  const imageKey = `${productId ?? 'none'}-${override?.variantId ?? 'default'}-${image}`;

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[215]" data-lenis-prevent role="dialog" aria-label={`${label} ${title}`}>

          <motion.button
            type="button"
            aria-label="Close product details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            className="absolute inset-0 bg-canvas/30 backdrop-blur-[6px] cursor-pointer"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 bottom-[min(52dvh,460px)] sm:bottom-[min(50dvh,440px)]"
            style={{
              background: `radial-gradient(ellipse 46% 46% at 50% 62%, rgba(${glowRgb(
                variant.glow,
              )}, 0.24) 0%, transparent 70%)`,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'tween', duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 top-[max(2.5rem,env(safe-area-inset-top))] bottom-[min(52dvh,460px)] sm:bottom-[min(50dvh,440px)] flex items-end justify-center px-4 sm:px-6 pb-0"
          >
            <motion.img
              key={imageKey}
              ref={bottleRef}
              src={image}
              alt={title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.34, ease: 'easeOut' }}
              className="product-detail-bottle h-full w-auto max-w-[min(92vw,340px)] sm:max-w-[min(88vw,360px)] object-contain object-bottom drop-shadow-[0_24px_48px_rgba(13,11,10,0.22)]"
              fetchPriority="high"
            />
          </motion.div>

          <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 sm:right-6 z-[222] flex items-center gap-6 sm:gap-7">
            <Link
              to="/cart"
              onClick={onClose}
              {...cartTargetProps}
              className={`relative font-sans text-[10px] uppercase tracking-[0.24em] leading-none text-canvas hover:text-taupe-muted transition-colors min-h-[44px] inline-flex items-center${
                cartPulsing ? ' cart-receive' : ''
              }`}
              aria-label={`Cart, ${cartCount} items`}
            >
              Cart
              {cartCount > 0 && (
                <span className="cart-count absolute top-2 -right-3 font-mono text-[8px] tabular-nums text-taupe-muted">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xl text-canvas/60 hover:text-canvas transition-colors cursor-pointer leading-none min-h-[44px] inline-flex items-center"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <motion.aside
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 z-[220] bg-cream text-canvas pb-[env(safe-area-inset-bottom)] min-h-[min(52dvh,480px)] sm:min-h-[min(50dvh,480px)] rounded-t-[1.25rem] shadow-[0_-20px_60px_rgba(13,11,10,0.12)]"
          >
            <div
              className="modal-scroll h-full px-5 sm:px-8 md:px-12 pt-3 pb-7 sm:py-8 md:py-9 flex flex-col justify-center"
              data-modal-scroll
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-canvas/15 sm:hidden" aria-hidden />

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

                <dl className="mt-6 sm:mt-7 border-t border-canvas/10">
                  {(
                    [
                      ['Top', product.notes.top],
                      ['Heart', product.notes.heart],
                      ['Base', product.notes.base],
                    ] as const
                  ).map(([tier, note]) => (
                    <div
                      key={tier}
                      className="flex items-baseline gap-4 sm:gap-6 py-2.5 border-b border-canvas/[0.07]"
                    >
                      <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-taupe-muted/70 w-14 shrink-0">
                        {tier}
                      </dt>
                      <dd className="font-sans text-[12px] sm:text-[13px] text-canvas leading-snug">
                        {note}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 sm:mt-8 pt-6 border-t border-canvas/10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] tabular-nums text-canvas">
                      {product.price}
                      <span className="text-taupe-muted ml-2">· 50ml extrait</span>
                    </p>
                    {stock && (
                      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-taupe-muted mt-1.5">
                        {soldOut ? 'Sold out today' : `${available} left today`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => add(product.id, { override, from: bottleRef.current })}
                      className="font-sans text-[9px] uppercase tracking-[0.24em] text-canvas border border-canvas/25 hover:border-canvas transition-colors cursor-pointer disabled:opacity-40 min-h-[44px] px-6 py-3 rounded-full inline-flex items-center justify-center w-full sm:w-auto"
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
                      className="checkout-btn min-h-[44px] w-full sm:w-auto px-6 py-3 disabled:opacity-40"
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
