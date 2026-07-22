import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatNgn, formatUsd } from '../../data/pricing';
import { scrollToTopImmediate } from '../../hooks/useLenis';
import type { CartItem, ShippingInfo, StoreOrder } from '../../types';
import { CheckoutSecuredStamp, CheckoutStreamBanner } from './CheckoutConfirmedBanner';

interface CheckoutConfirmationProps {
  order: StoreOrder;
  shipping: ShippingInfo;
  items: CartItem[];
  subtotalNgn: number;
  shippingNgn: number;
  totalNgn: number;
  totalUsd: number;
}

function ConfirmationDetails({
  shipping,
  items,
  subtotalNgn,
  shippingNgn,
  totalNgn,
  totalUsd,
}: {
  shipping: ShippingInfo;
  items: CartItem[];
  subtotalNgn: number;
  shippingNgn: number;
  totalNgn: number;
  totalUsd: number;
}) {
  return (
    <div className="checkout-confirmation-aside-inner w-full">
      <p className="font-mono text-[9px] sm:text-[10px] lg:text-[11px] uppercase tracking-[0.26em] lg:tracking-[0.3em] text-amber-accent">
        Order confirmed · Status: allocated
      </p>
      <h1 className="font-serif text-[clamp(2.15rem,8vw,3.5rem)] lg:text-[clamp(2.75rem,3.5vw,3.75rem)] italic tracking-tight leading-[1.02] mt-3 sm:mt-4 lg:mt-5">
        It&apos;s yours.
      </h1>
      <p className="font-body-italic italic text-[0.9375rem] sm:text-base lg:text-[1.0625rem] text-taupe-muted font-light mt-4 sm:mt-5 lg:mt-6 leading-relaxed lg:leading-[1.65] lg:max-w-[22rem]">
        Your order is recorded at Nocturne. We&apos;ll reach out at{' '}
        <span className="text-canvas not-italic font-sans break-all">{shipping.email}</span> to
        confirm dispatch from our Lekki atelier within 3–5 business days.
      </p>

      <div className="mt-7 sm:mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-canvas/10">
        <p className="font-sans text-[9px] lg:text-[10px] uppercase tracking-[0.22em] text-taupe-muted">
          Delivering to
        </p>
        <p className="font-serif text-[1.125rem] sm:text-lg lg:text-xl text-canvas tracking-tight mt-2 lg:mt-2.5">
          {shipping.fullName}
        </p>
        <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-taupe-muted mt-2 lg:mt-2.5 leading-relaxed break-words">
          {shipping.address}
        </p>
      </div>

      {items.length > 0 && (
        <div className="mt-7 sm:mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-canvas/10">
          <div className="flex items-baseline justify-between gap-4 mb-4 lg:mb-5">
            <p className="font-sans text-[10px] sm:text-xs lg:text-sm uppercase tracking-[0.12em] text-taupe-muted">
              Order summary
            </p>
            <p className="font-mono text-[8px] lg:text-[9px] uppercase tracking-[0.14em] text-taupe-muted/70">
              {items.reduce((n, i) => n + i.qty, 0)} item
              {items.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'}
            </p>
          </div>
          <ul className="space-y-4 lg:space-y-5">
            {items.map((item) => (
              <li key={item.cartKey} className="flex gap-4 items-end">
                <div className="hidden lg:flex w-14 xl:w-16 h-[72px] xl:h-[80px] shrink-0 items-end justify-center border border-canvas/10 bg-cream/40">
                  <img
                    src={item.image}
                    alt=""
                    className="h-[64px] xl:h-[72px] w-auto object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 flex justify-between gap-4 pb-0.5">
                  <span className="font-serif text-[0.9375rem] sm:text-base lg:text-lg text-canvas min-w-0">
                    <span className="block leading-snug">
                      {item.formulationLabel ?? item.productTitle}
                    </span>
                    <span className="font-mono text-[10px] text-taupe-muted lg:mt-1 inline-block">
                      Qty {item.qty}
                    </span>
                  </span>
                  <span className="font-mono text-xs lg:text-sm tabular-nums text-taupe-muted shrink-0 pt-0.5">
                    {formatNgn(item.priceNgn * item.qty)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 lg:mt-6 pt-5 lg:pt-6 border-t border-canvas/10 space-y-2.5 lg:space-y-3">
            <div className="flex justify-between font-sans text-xs lg:text-sm text-taupe-muted">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatNgn(subtotalNgn)}</span>
            </div>
            <div className="flex justify-between font-sans text-xs lg:text-sm text-taupe-muted">
              <span>Shipping</span>
              <span className="font-mono tabular-nums">{formatNgn(shippingNgn)}</span>
            </div>
            <div className="flex justify-between items-end pt-3 lg:pt-4 border-t border-canvas/10 gap-4">
              <span className="font-sans text-[10px] lg:text-xs uppercase tracking-[0.18em] text-canvas/80">
                Total
              </span>
              <div className="text-right shrink-0">
                <p className="font-serif text-xl sm:text-2xl lg:text-[1.75rem] xl:text-[2rem] tabular-nums text-canvas leading-none">
                  {formatNgn(totalNgn)}
                </p>
                <p className="font-mono text-[9px] lg:text-[10px] text-taupe-muted tabular-nums mt-1 lg:mt-1.5">
                  {formatUsd(totalUsd)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Link
        to="/"
        className="hidden md:inline-flex mt-10 lg:mt-12 font-sans text-[9px] lg:text-[10px] uppercase tracking-[0.24em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
      >
        Return to Nocturne
      </Link>
    </div>
  );
}

export function CheckoutConfirmation({
  order,
  shipping,
  items,
  subtotalNgn,
  shippingNgn,
  totalNgn,
  totalUsd,
}: CheckoutConfirmationProps) {
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const allocationDate = new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.');

  useLayoutEffect(() => {
    scrollToTopImmediate();
    requestAnimationFrame(() => scrollToTopImmediate());
  }, []);

  return (
    <div className="checkout-confirmation min-h-[100dvh] bg-cream text-canvas flex flex-col">
      <CheckoutStreamBanner orderId={order.id} holder={shipping.fullName} />

      <header className="checkout-confirmation-header grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-20 pt-[max(0.85rem,env(safe-area-inset-top))] lg:pt-8 pb-4 sm:pb-5 lg:pb-6 border-b border-canvas/[0.08] shrink-0">
        <Link
          to="/"
          className="font-sans text-[11px] sm:text-xs lg:text-sm text-taupe-muted hover:text-canvas transition-colors justify-self-start min-h-[44px] inline-flex items-center"
        >
          ← Home
        </Link>
        <Link
          to="/"
          className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl tracking-[0.12em] text-canvas hover:text-canvas/75 transition-colors justify-self-center"
          aria-label="Nocturne home"
        >
          NOCTURNE
        </Link>
        <span className="justify-self-end font-mono text-[8px] lg:text-[9px] uppercase tracking-[0.2em] text-taupe-muted/60 hidden lg:block">
          Atelier ledger
        </span>
      </header>

      <main className="checkout-confirmation-stage checkout-confirmation-stage--wide flex-1 w-full min-h-0 mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(300px,42%)] lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,460px)] xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,480px)]">
        <section
          className="checkout-confirmation-stamp relative flex items-center justify-center px-4 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-20 py-8 sm:py-10 md:py-12 lg:py-0"
          aria-label="Order secured"
        >
          <p
            className="checkout-confirmation-watermark pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[clamp(4rem,12vw,11rem)] uppercase tracking-[0.08em] text-black/[0.025] leading-none whitespace-nowrap hidden lg:block"
            aria-hidden
          >
            SECURED
          </p>
          <div className="checkout-confirmation-stamp-glow" aria-hidden />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="checkout-done-stamp-wrap checkout-done-stamp-wrap--stage relative z-[1]"
          >
            <CheckoutSecuredStamp
              orderId={order.id}
              allocationDate={allocationDate}
              itemCount={itemCount}
            />
          </motion.div>
        </section>

        <aside className="checkout-confirmation-aside flex flex-col justify-start lg:justify-center bg-cream-plate border-t md:border-t-0 md:border-l border-canvas/10 px-5 sm:px-8 md:px-8 lg:px-12 xl:px-14 2xl:px-16 pt-8 sm:pt-10 md:pt-12 lg:py-16 xl:py-20 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-[max(2rem,env(safe-area-inset-bottom))]">
          <ConfirmationDetails
            shipping={shipping}
            items={items}
            subtotalNgn={subtotalNgn}
            shippingNgn={shippingNgn}
            totalNgn={totalNgn}
            totalUsd={totalUsd}
          />
        </aside>
      </main>

      <div className="checkout-confirmation-mobile-bar md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-canvas/10 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="min-w-0">
            <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-taupe-muted">
              Order total
            </p>
            <p className="font-serif text-lg tabular-nums text-canvas leading-tight truncate">
              {formatNgn(totalNgn)}
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 font-sans text-[9px] uppercase tracking-[0.2em] bg-canvas text-cream px-5 py-3 min-h-[44px] inline-flex items-center rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
