import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { useProductDetail } from '../context/ProductDetailContext';
import { formatNgn, formatUsd, SHIPPING_NGN, UNIT_PRICE_USD } from '../data/pricing';

export function CartPage() {
  const { cart, cartTotalNgn, updateCartQty, removeFromCart } = useStore();
  const { openProduct } = useProductDetail();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const bottleCount = cart.reduce((n, i) => n + i.qty, 0);
  const totalWithShipping = cartTotalNgn + (cart.length > 0 ? SHIPPING_NGN : 0);
  const totalUsd = Math.round((totalWithShipping / 180_000) * UNIT_PRICE_USD);

  const openItem = (item: (typeof cart)[number]) =>
    openProduct(item.productId, {
      variantId: item.variantId,
      productLabel: item.productLabel,
      productTitle: item.productTitle,
      formulationLabel: item.formulationLabel,
      image: item.image,
    });

  return (
    <div
      className={`bg-cream text-canvas min-h-screen lg:pb-16 ${
        cart.length > 0
          ? summaryOpen
            ? 'pb-[calc(11.5rem+env(safe-area-inset-bottom))]'
            : 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
          : ''
      }`}
    >
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="text-center px-5 sm:px-6 md:px-12 pt-6 sm:pt-10 md:pt-12 pb-6 sm:pb-9 border-b border-canvas/10"
      >
        <nav
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[9px] uppercase tracking-[0.18em] text-taupe-muted mb-3 sm:mb-5"
          aria-label="Breadcrumb"
        >
          <Link to="/shop" className="hover:text-canvas transition-colors min-h-[44px] inline-flex items-center">
            Shop
          </Link>
          <span aria-hidden className="text-canvas/20">
            ›
          </span>
          <span className="text-canvas">Cart</span>
        </nav>
        <h1 className="font-serif text-[clamp(1.65rem,5vw,2.75rem)] tracking-tight leading-tight">
          Shopping cart
        </h1>
        {cart.length > 0 && (
          <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-2 sm:mt-3">
            {bottleCount} item{bottleCount === 1 ? '' : 's'} · compounded to order
          </p>
        )}
      </motion.header>

      <div className="px-5 sm:px-6 md:px-12 py-6 sm:py-10 w-full max-w-6xl mx-auto">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-14 sm:py-16 max-w-md mx-auto"
          >
            <p className="font-body-italic italic text-[0.9375rem] sm:text-sm text-taupe-muted font-light leading-relaxed">
              Your cart is empty. Explore the collection and find the formulation that reads like
              you.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center mt-8 min-h-[44px] font-sans text-[10px] uppercase tracking-[0.26em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
            >
              Continue shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] gap-6 lg:gap-12 xl:gap-14 items-start">
            <div className="min-w-0">
              <ul className="divide-y divide-canvas/10">
                {cart.map((item, index) => (
                  <motion.li
                    key={item.cartKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                    className="py-5 sm:py-6 md:py-7"
                  >
                    <div className="flex gap-3 sm:gap-4 md:gap-5 min-w-0">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartKey)}
                        className="shrink-0 w-10 h-10 -ml-1 flex items-center justify-center font-mono text-lg text-taupe-muted hover:text-canvas transition-colors cursor-pointer leading-none"
                        aria-label={`Remove ${item.productTitle}`}
                      >
                        ×
                      </button>

                      <button
                        type="button"
                        onClick={() => openItem(item)}
                        className="w-[68px] sm:w-20 md:w-[88px] shrink-0 aspect-[4/5] flex items-end justify-center cursor-pointer rounded-sm bg-[#ebe7df]/60"
                      >
                        <img
                          src={item.image}
                          alt={item.productTitle}
                          className="h-[88%] w-auto max-w-full object-contain pointer-events-none"
                        />
                      </button>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => openItem(item)}
                            className="min-w-0 text-left cursor-pointer group"
                          >
                            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-taupe-muted">
                              {item.productLabel}
                            </p>
                            <p className="font-serif text-[15px] sm:text-base md:text-lg text-canvas tracking-tight mt-0.5 break-words group-hover:opacity-75 transition-opacity">
                              {item.formulationLabel ?? item.productTitle}
                            </p>
                            <p className="font-mono text-[9px] text-taupe-muted mt-1 uppercase tracking-[0.08em]">
                              Extrait · 50ml
                            </p>
                          </button>
                          <p className="font-mono text-[10px] sm:text-[11px] tabular-nums text-canvas shrink-0 text-right leading-snug">
                            <span className="block text-taupe-muted text-[9px]">
                              {item.qty} ×
                            </span>
                            {formatNgn(item.priceNgn)}
                          </p>
                        </div>

                        <div className="cart-qty mt-3 sm:mt-4 inline-flex items-stretch w-fit">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.cartKey, item.qty - 1)}
                            className="cart-qty-btn"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="cart-qty-value">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.cartKey, item.qty + 1)}
                            className="cart-qty-btn"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <Link
                to="/shop"
                className="inline-flex items-center mt-5 sm:mt-8 min-h-[44px] font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors"
              >
                ← Continue shopping
              </Link>
            </div>

            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="cart-summary hidden lg:block lg:sticky lg:top-24 xl:top-28 w-full"
            >
              <h2 className="font-serif text-lg text-canvas tracking-tight">Summary</h2>

              <dl className="mt-5 sm:mt-6 space-y-3 font-mono text-[11px]">
                <div className="flex justify-between gap-4 text-taupe-muted">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums text-canvas">{formatNgn(cartTotalNgn)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-taupe-muted">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums text-canvas">{formatNgn(SHIPPING_NGN)}</dd>
                </div>
                <div className="flex justify-between items-baseline gap-4 pt-4 mt-1 border-t border-canvas/10">
                  <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-canvas">
                    Total
                  </dt>
                  <dd className="font-serif text-xl tabular-nums text-canvas text-right">
                    {formatNgn(totalWithShipping)}
                    <span className="block font-mono text-[9px] text-taupe-muted mt-0.5">
                      {formatUsd(totalUsd)}
                    </span>
                  </dd>
                </div>
              </dl>

              <Link to="/checkout" className="checkout-btn w-full text-center mt-6 sm:mt-7 block">
                Check out
              </Link>

              <p className="font-body-italic italic text-[11px] text-taupe-muted font-light mt-5 leading-relaxed text-center">
                Dispatched within 3–5 days from our Lekki atelier.
              </p>
            </motion.aside>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-mobile-bar lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-canvas/10 bg-cream/95 backdrop-blur-md px-5 sm:px-6 py-3.5 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${summaryOpen ? 'max-h-36 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}
            aria-hidden={!summaryOpen}
          >
            <dl className="space-y-2 font-mono text-[10px] border-b border-canvas/10 pb-3">
              <div className="flex justify-between gap-4 text-taupe-muted">
                <dt>Subtotal</dt>
                <dd className="tabular-nums text-canvas">{formatNgn(cartTotalNgn)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-taupe-muted">
                <dt>Shipping</dt>
                <dd className="tabular-nums text-canvas">{formatNgn(SHIPPING_NGN)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-taupe-muted">
                <dt>USD approx.</dt>
                <dd className="tabular-nums text-canvas">{formatUsd(totalUsd)}</dd>
              </div>
            </dl>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setSummaryOpen((open) => !open)}
              className="min-w-0 text-left min-h-[44px] flex flex-col justify-center cursor-pointer"
              aria-expanded={summaryOpen}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-taupe-muted">
                Total · {summaryOpen ? 'Hide' : 'Details'}
              </p>
              <p className="font-serif text-lg tabular-nums text-canvas truncate leading-tight mt-0.5">
                {formatNgn(totalWithShipping)}
              </p>
            </button>
            <Link to="/checkout" className="checkout-btn shrink-0 px-7 sm:px-8 min-h-[48px]">
              Check out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
