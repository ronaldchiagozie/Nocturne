import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { formatNgn, formatUsd, SHIPPING_NGN, UNIT_PRICE_USD } from '../../data/pricing';
import {
  CheckoutConfirmation,
} from './CheckoutConfirmation';
import type { CartItem, ShippingInfo, StoreOrder } from '../../types';

interface CheckoutFlowProps {
  onOrderCreated?: (order: StoreOrder) => void;
  onComplete?: () => void;
}

type Step = 'delivery' | 'payment' | 'done';

const EMPTY: ShippingInfo = { fullName: '', email: '', address: '' };

const STEPS: { id: Step | 'cart'; label: string }[] = [
  { id: 'cart', label: 'Cart' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Confirm' },
  { id: 'done', label: 'Confirmation' },
];

function CheckoutProgress({ step }: { step: Step }) {
  const activeIndex =
    step === 'delivery' ? 1 : step === 'payment' ? 2 : step === 'done' ? 3 : 0;

  const progressPct = (activeIndex / (STEPS.length - 1)) * 100;

  return (
    <nav className="checkout-stepper w-full" aria-label="Checkout progress">
      <div className="checkout-stepper-rail" aria-hidden>
        <div className="checkout-stepper-rail-track" />
        <div
          className="checkout-stepper-rail-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ol className="checkout-stepper-list">
        {STEPS.map((item, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <li
              key={item.id}
              className="checkout-stepper-step"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={`checkout-stepper-node${
                  isComplete ? ' is-complete' : isCurrent ? ' is-current' : ''
                }`}
              >
                {isComplete ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2.5 7.25L5.75 10.5L11.5 3.75"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`checkout-stepper-label${
                  isComplete ? ' is-complete' : isCurrent ? ' is-current' : ''
                }`}
              >
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function OrderLines({
  items,
  cartTotalNgn,
  shippingCost,
  totalNgn,
  totalUsd,
}: {
  items: CartItem[];
  cartTotalNgn: number;
  shippingCost: number;
  totalNgn: number;
  totalUsd: number;
}) {
  if (items.length === 0) {
    return (
      <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-8">
        No items
      </p>
    );
  }

  return (
    <>
      <ul className="mt-6 sm:mt-8 lg:mt-8 xl:mt-10 space-y-5 lg:space-y-6 flex-1">
        {items.map((item, i) => (
          <motion.li
            key={item.cartKey}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="flex gap-4 lg:gap-5 items-end"
          >
            <div className="w-14 h-[72px] lg:w-16 lg:h-[84px] xl:w-[4.5rem] xl:h-[88px] shrink-0 flex items-end justify-center border border-canvas/10 bg-cream/30">
              <img
                src={item.image}
                alt=""
                className="h-[64px] lg:h-[76px] xl:h-[80px] w-auto object-contain"
              />
            </div>
            <div className="flex-1 min-w-0 pb-0.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-taupe-muted">
                {item.productLabel}
              </p>
              <p className="font-serif text-base sm:text-lg lg:text-xl text-canvas tracking-tight mt-1 truncate">
                {item.formulationLabel ?? item.productTitle}
              </p>
              <p className="font-sans text-xs lg:text-sm tabular-nums text-taupe-muted mt-2">
                Qty {item.qty} · {formatNgn(item.priceNgn * item.qty)}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="mt-auto pt-8 lg:pt-10 border-t border-canvas/10 space-y-3 lg:space-y-3.5 font-sans text-xs sm:text-sm lg:text-base">
        <div className="flex justify-between text-taupe-muted">
          <span>Subtotal</span>
          <span className="font-mono tabular-nums">{formatNgn(cartTotalNgn)}</span>
        </div>
        <div className="flex justify-between text-taupe-muted">
          <span>Shipping</span>
          <span className="font-mono tabular-nums">{formatNgn(shippingCost)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-3 lg:pt-4 border-t border-canvas/10">
          <span className="font-sans text-xs lg:text-sm uppercase tracking-[0.12em] text-canvas/80">
            Total
          </span>
          <span className="font-serif text-xl sm:text-2xl lg:text-[1.75rem] xl:text-[2rem] tabular-nums text-canvas text-right">
            {formatNgn(totalNgn)}
            <span className="block lg:inline font-mono text-[10px] lg:text-[11px] text-taupe-muted lg:ml-2 mt-0.5 lg:mt-0">
              {formatUsd(totalUsd)}
            </span>
          </span>
        </div>
      </div>
    </>
  );
}

export function CheckoutFlow({ onOrderCreated, onComplete }: CheckoutFlowProps) {
  const { cart, cartTotalNgn, clearCart, completeCheckout } = useStore();
  const [step, setStep] = useState<Step>('delivery');
  const [shipping, setShipping] = useState<ShippingInfo>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderSnapshot, setOrderSnapshot] = useState<CartItem[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<StoreOrder | null>(null);
  const [restoreChecked, setRestoreChecked] = useState(false);

  const displayItems = step === 'done' ? orderSnapshot : cart;
  const displaySubtotal =
    step === 'done'
      ? orderSnapshot.reduce((sum, item) => sum + item.priceNgn * item.qty, 0)
      : cartTotalNgn;

  const shippingCost = displayItems.length > 0 ? SHIPPING_NGN : 0;
  const totalNgn = displaySubtotal + shippingCost;
  const totalUsd = Math.round((totalNgn / 180_000) * UNIT_PRICE_USD);
  const isEmpty = restoreChecked && cart.length === 0 && step !== 'done';

  useEffect(() => {
    if (step === 'done' && confirmedOrder) {
      setRestoreChecked(true);
      return;
    }

    if (cart.length > 0) {
      setRestoreChecked(true);
      return;
    }

    let cancelled = false;
    void import('../../services/orderSync').then(({ fetchLatestSessionOrder, orderLinesToCartItems }) => {
      void fetchLatestSessionOrder().then((order) => {
        if (cancelled) return;
        if (order) {
          setConfirmedOrder(order);
          setShipping(order.shipping);
          setOrderSnapshot(orderLinesToCartItems(order.items));
          setStep('done');
        }
        setRestoreChecked(true);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [cart.length, step, confirmedOrder]);

  const handleDelivery = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('payment');
  };

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const snapshot = [...cart];
    const result = await completeCheckout({
      shipping,
      subtotalNgn: cartTotalNgn,
      shippingNgn: snapshot.length > 0 ? SHIPPING_NGN : 0,
      totalNgn: cartTotalNgn + (snapshot.length > 0 ? SHIPPING_NGN : 0),
      totalUsd: Math.round(
        ((cartTotalNgn + (snapshot.length > 0 ? SHIPPING_NGN : 0)) / 180_000) * UNIT_PRICE_USD,
      ),
    });

    if (result.ok === false) {
      setIsSubmitting(false);
      setError(result.reason);
      return;
    }

    onOrderCreated?.(result.order);
    setConfirmedOrder(result.order);
    setOrderSnapshot(snapshot);
    clearCart();
    setIsSubmitting(false);
    setStep('done');
    onComplete?.();
  };

  if (step === 'done' && confirmedOrder) {
    return (
      <CheckoutConfirmation
        order={confirmedOrder}
        shipping={shipping}
        items={orderSnapshot}
        subtotalNgn={displaySubtotal}
        shippingNgn={shippingCost}
        totalNgn={totalNgn}
        totalUsd={totalUsd}
      />
    );
  }

  if (!restoreChecked && cart.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-cream text-canvas flex items-center justify-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-taupe-muted">
          Loading order…
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-split checkout-split--wide min-h-[100dvh] grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_500px]">
      <div className="checkout-form-side relative flex flex-col bg-cream text-canvas min-h-[50dvh] lg:min-h-[100dvh] pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20 pt-[max(1.25rem,env(safe-area-inset-top))] lg:pt-8 pb-6 border-b border-canvas/[0.08] shrink-0">
          <Link
            to="/cart"
            className="font-sans text-[11px] sm:text-xs text-taupe-muted hover:text-canvas transition-colors justify-self-start"
          >
            ← Cart
          </Link>
          <Link
            to="/"
            className="font-serif text-lg sm:text-xl lg:text-2xl tracking-[0.12em] text-canvas hover:text-canvas/75 transition-colors justify-self-center"
            aria-label="Nocturne home"
          >
            NOCTURNE
          </Link>
          <span className="justify-self-end font-mono text-[8px] lg:text-[9px] uppercase tracking-[0.2em] text-taupe-muted/60 hidden lg:block">
            Checkout
          </span>
        </header>

        {!isEmpty && (
          <div className="checkout-stepper-bar px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20 py-7 sm:py-8 lg:py-9 border-b border-canvas/[0.08] bg-cream shrink-0">
            <CheckoutProgress step={step} />
          </div>
        )}

        <div className="checkout-form-body flex-1 flex flex-col lg:justify-center px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20 pt-8 sm:pt-10 lg:pt-12 xl:pt-14 pb-8 lg:pb-16 xl:pb-20 w-full">
          <div className="w-full max-w-2xl xl:max-w-3xl">
          <AnimatePresence mode="wait">
            {isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="font-serif text-[clamp(1.75rem,5vw,2.5rem)] tracking-tight leading-tight">
                  Nothing to settle
                </h1>
                <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-4 leading-relaxed">
                  Your cart is empty. Return to the collection when you are ready.
                </p>
                <Link
                  to="/shop"
                  className="inline-block mt-8 font-sans text-[9px] uppercase tracking-[0.26em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
                >
                  Browse the collection
                </Link>
              </motion.div>
            ) : step === 'delivery' ? (
              <motion.form
                key="delivery"
                onSubmit={handleDelivery}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-sans text-xs sm:text-sm text-taupe-muted tracking-wide">
                  Step 1 of 2
                </p>
                <h1 className="font-serif text-[clamp(2.25rem,6vw,3.25rem)] tracking-tight leading-[1.06] mt-4">
                  Where shall we send it?
                </h1>
                <p className="font-body-italic italic text-base sm:text-lg text-taupe-muted font-light mt-4 leading-relaxed max-w-xl">
                  Compounded to order, then dispatched nationwide from our Lagos atelier.
                </p>

                <div className="mt-12 sm:mt-14 space-y-9 sm:space-y-10">
                  <div className="grid sm:grid-cols-2 gap-9 sm:gap-8">
                    <div>
                      <label className="checkout-label" htmlFor="checkout-name">
                        Full name
                      </label>
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Ada Okonkwo"
                        value={shipping.fullName}
                        onChange={(e) =>
                          setShipping((s) => ({ ...s, fullName: e.target.value }))
                        }
                        className="checkout-line"
                      />
                    </div>
                    <div>
                      <label className="checkout-label" htmlFor="checkout-email">
                        Email
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="ada@email.com"
                        value={shipping.email}
                        onChange={(e) =>
                          setShipping((s) => ({ ...s, email: e.target.value }))
                        }
                        className="checkout-line"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="checkout-label" htmlFor="checkout-address">
                      Delivery address
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      autoComplete="street-address"
                      placeholder="12 Admiralty Way, Lekki, Lagos"
                      value={shipping.address}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, address: e.target.value }))
                      }
                      className="checkout-line"
                    />
                  </div>
                </div>

                <button type="submit" className="checkout-btn mt-12 sm:mt-14">
                  Continue to review
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="payment"
                id="checkout-payment-form"
                onSubmit={handlePay}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-sans text-xs sm:text-sm text-taupe-muted tracking-wide">
                  Step 2 of 2
                </p>
                <h1 className="font-serif text-[clamp(2.25rem,6vw,3.25rem)] tracking-tight leading-[1.06] mt-4">
                  Complete your order
                </h1>
                <p className="font-body-italic italic text-base sm:text-lg text-taupe-muted font-light mt-4 leading-relaxed max-w-xl">
                  Review your details and place the order. Payment is arranged separately — we&apos;ll
                  email you with next steps from the atelier.
                </p>

                <div className="mt-10 sm:mt-12 py-6 sm:py-7 border-y border-canvas/10">
                  <p className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.14em] text-taupe-muted mb-3">
                    Delivering to
                  </p>
                  <p className="font-serif text-xl sm:text-2xl text-canvas">{shipping.fullName}</p>
                  <p className="font-sans text-sm text-taupe-muted mt-1.5">{shipping.email}</p>
                  <p className="font-body-italic italic text-base text-taupe-muted font-light mt-2 leading-relaxed">
                    {shipping.address}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('delivery')}
                    className="font-sans text-xs text-taupe-muted hover:text-canvas transition-colors cursor-pointer mt-5 underline underline-offset-[4px] decoration-canvas/25"
                  >
                    Edit delivery
                  </button>
                </div>

                <div className="mt-8 lg:hidden">
                  <p className="font-sans text-xs uppercase tracking-[0.12em] text-taupe-muted">
                    Order total
                  </p>
                  <p className="font-serif text-2xl sm:text-3xl tabular-nums text-canvas mt-2">
                    {formatNgn(totalNgn)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="checkout-btn mt-8 sm:mt-10 lg:mt-12 w-full sm:w-auto min-w-[14rem] disabled:opacity-40 hidden lg:inline-flex"
                >
                  {isSubmitting ? 'Saving order…' : `Place order · ${formatNgn(totalNgn)}`}
                </button>

                <p className="font-sans text-[11px] sm:text-xs text-taupe-muted mt-6 leading-relaxed">
                  No card charged at checkout · Payment instructions sent by email
                </p>

                {error && (
                  <p className="mt-4 font-mono text-[10px] text-red-800/80">{error}</p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>

      <aside className="checkout-ledger relative bg-cream-plate text-canvas lg:min-h-[100dvh] lg:sticky lg:top-0 lg:self-start flex flex-col border-t lg:border-t-0 lg:border-l border-canvas/10">
        <div className="flex-1 flex flex-col justify-start lg:justify-center px-5 sm:px-8 lg:px-10 xl:px-12 2xl:px-14 py-6 sm:py-8 lg:py-12 xl:py-16 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.14em] text-taupe-muted lg:text-canvas lg:normal-case lg:tracking-tight lg:text-sm xl:text-base">
            Order summary
          </p>
          <p className="font-body-italic italic text-xs lg:text-sm text-taupe-muted font-light mt-1.5 leading-relaxed lg:block hidden">
            {cart.reduce((n, i) => n + i.qty, 0)} bottle
            {cart.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'} · compounded to order
          </p>
          <p className="font-body-italic italic text-xs text-taupe-muted font-light mt-1.5 leading-relaxed lg:hidden">
            {cart.reduce((n, i) => n + i.qty, 0)} bottle
            {cart.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'}
          </p>

          <div className="checkout-ledger-inner w-full max-w-md lg:max-w-none">
            <OrderLines
            items={displayItems}
            cartTotalNgn={displaySubtotal}
            shippingCost={shippingCost}
            totalNgn={totalNgn}
            totalUsd={totalUsd}
          />
          </div>
        </div>
      </aside>

      {step === 'payment' && !isEmpty && (
        <div className="checkout-mobile-pay-bar lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-canvas/10 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[9px] uppercase tracking-[0.16em] text-taupe-muted truncate">
                Total
              </p>
              <p className="font-serif text-lg tabular-nums text-canvas leading-tight">
                {formatNgn(totalNgn)}
              </p>
            </div>
            <button
              type="submit"
              form="checkout-payment-form"
              disabled={isSubmitting}
              className="checkout-btn shrink-0 !mt-0 !w-auto min-w-[9.5rem] px-5 py-3 min-h-[44px] disabled:opacity-40"
            >
              {isSubmitting ? 'Saving…' : 'Place order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
