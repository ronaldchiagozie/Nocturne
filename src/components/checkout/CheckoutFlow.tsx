import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cartItemsToOrders, useStore } from '../../context/StoreContext';
import { formatNgn, formatUsd, SHIPPING_NGN, UNIT_PRICE_USD } from '../../data/pricing';
import type { CartItem, ShippingInfo, SimulatedOrder } from '../../types';

interface CheckoutFlowProps {
  onOrderCreated: (orders: SimulatedOrder[]) => void;
  onComplete?: () => void;
}

type Step = 'delivery' | 'payment' | 'done';

const EMPTY: ShippingInfo = { fullName: '', email: '', address: '' };

const STEPS: { id: Step | 'cart'; label: string }[] = [
  { id: 'cart', label: 'Cart' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
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
      <ul className="mt-8 lg:mt-6 space-y-5 flex-1">
        {items.map((item, i) => (
          <motion.li
            key={item.cartKey}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="flex gap-4 items-end"
          >
            <div className="w-14 h-[72px] shrink-0 flex items-end justify-center border border-canvas/10">
              <img src={item.image} alt="" className="h-[64px] w-auto object-contain" />
            </div>
            <div className="flex-1 min-w-0 pb-0.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-taupe-muted">
                {item.productLabel}
              </p>
              <p className="font-serif text-base sm:text-lg text-canvas tracking-tight mt-1 truncate">
                {item.formulationLabel ?? item.productTitle}
              </p>
              <p className="font-sans text-xs tabular-nums text-taupe-muted mt-2">
                Qty {item.qty} · {formatNgn(item.priceNgn * item.qty)}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="mt-auto pt-8 border-t border-canvas/10 space-y-3 font-sans text-xs sm:text-sm">
        <div className="flex justify-between text-taupe-muted">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatNgn(cartTotalNgn)}</span>
        </div>
        <div className="flex justify-between text-taupe-muted">
          <span>Shipping</span>
          <span className="tabular-nums">{formatNgn(shippingCost)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t border-canvas/10">
          <span className="font-sans text-xs uppercase tracking-[0.12em] text-canvas/80">
            Total
          </span>
          <span className="font-serif text-xl sm:text-2xl tabular-nums text-canvas">
            {formatNgn(totalNgn)}
            <span className="font-mono text-[10px] text-taupe-muted ml-2">
              / {formatUsd(totalUsd)}
            </span>
          </span>
        </div>
      </div>
    </>
  );
}

export function CheckoutFlow({ onOrderCreated, onComplete }: CheckoutFlowProps) {
  const { cart, cartTotalNgn, clearCart, purchaseCart } = useStore();
  const [step, setStep] = useState<Step>('delivery');
  const [shipping, setShipping] = useState<ShippingInfo>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderSnapshot, setOrderSnapshot] = useState<CartItem[]>([]);

  const displayItems = step === 'done' ? orderSnapshot : cart;
  const displaySubtotal =
    step === 'done'
      ? orderSnapshot.reduce((sum, item) => sum + item.priceNgn * item.qty, 0)
      : cartTotalNgn;

  const shippingCost = displayItems.length > 0 ? SHIPPING_NGN : 0;
  const totalNgn = displaySubtotal + shippingCost;
  const totalUsd = Math.round((totalNgn / 180_000) * UNIT_PRICE_USD);
  const isEmpty = cart.length === 0 && step !== 'done';

  useEffect(() => {
    setStep('delivery');
    setShipping(EMPTY);
    setIsSubmitting(false);
    setError('');
    setOrderSnapshot([]);
  }, []);

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
    const purchase = await purchaseCart();
    if (purchase.ok === false) {
      setIsSubmitting(false);
      setError(purchase.reason);
      return;
    }

    window.setTimeout(() => {
      onOrderCreated(cartItemsToOrders(snapshot, shipping));
      setOrderSnapshot(snapshot);
      clearCart();
      setIsSubmitting(false);
      setStep('done');
      onComplete?.();
    }, 900);
  };

  return (
    <div className="checkout-split min-h-[100dvh] grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]">
      <div className="checkout-form-side relative flex flex-col bg-cream text-canvas min-h-[50dvh] lg:min-h-[100dvh]">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pt-[max(1.25rem,env(safe-area-inset-top))] lg:pt-8 pb-6 border-b border-canvas/[0.08]">
          <Link
            to={step === 'done' ? '/' : '/cart'}
            className="font-sans text-[11px] sm:text-xs text-taupe-muted hover:text-canvas transition-colors justify-self-start"
          >
            {step === 'done' ? '← Home' : '← Cart'}
          </Link>
          <Link
            to="/"
            className="font-serif text-lg sm:text-xl tracking-[0.12em] text-canvas hover:text-canvas/75 transition-colors justify-self-center"
            aria-label="Nocturne home"
          >
            NOCTURNE
          </Link>
          <span className="justify-self-end" aria-hidden />
        </header>

        {!isEmpty && (
          <div className="checkout-stepper-bar px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 py-7 sm:py-8 lg:py-9 border-b border-canvas/[0.08] bg-cream">
            <CheckoutProgress step={step} />
          </div>
        )}

        <div className="flex-1 flex flex-col px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pt-10 sm:pt-12 lg:pt-14 pb-14 lg:pb-20 max-w-2xl xl:max-w-3xl w-full">
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
            ) : step === 'done' ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center lg:text-left"
              >
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-mono text-[9px] uppercase tracking-[0.28em] text-amber-accent mt-8"
                >
                  Order confirmed
                </motion.p>
                <h1 className="font-serif text-[clamp(2rem,6vw,3rem)] italic tracking-tight leading-[1.05] mt-4">
                  It&apos;s yours.
                </h1>
                <p className="font-body-italic italic text-base text-taupe-muted font-light mt-5 leading-relaxed max-w-sm mx-auto lg:mx-0">
                  A receipt is on its way to {shipping.email}. Your extrait leaves our Lekki
                  atelier within 3–5 business days.
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-taupe-muted mt-6 leading-relaxed">
                  {shipping.fullName}
                  <br />
                  {shipping.address}
                </p>
                <Link
                  to="/"
                  className="inline-block mt-10 font-sans text-[9px] uppercase tracking-[0.24em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
                >
                  Return to Nocturne
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
                  Continue to payment
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="payment"
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
                  Secure payment via Paystack — card, bank transfer, or USSD.
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

                <div className="mt-10 lg:hidden">
                  <p className="font-sans text-xs uppercase tracking-[0.12em] text-taupe-muted">
                    Order total
                  </p>
                  <p className="font-serif text-3xl tabular-nums text-canvas mt-2">
                    {formatNgn(totalNgn)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="checkout-btn mt-10 sm:mt-12 w-full sm:w-auto min-w-[14rem] disabled:opacity-40"
                >
                  {isSubmitting ? 'Processing…' : `Pay ${formatNgn(totalNgn)}`}
                </button>

                <p className="font-sans text-[11px] sm:text-xs text-taupe-muted mt-6 leading-relaxed">
                  Encrypted checkout · No card details stored on our servers
                </p>

                {error && (
                  <p className="mt-4 font-mono text-[10px] text-red-800/80">{error}</p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <aside className="checkout-ledger relative bg-cream-plate text-canvas lg:min-h-[100dvh] flex flex-col border-t lg:border-t-0 lg:border-l border-canvas/10">
        <div className="flex-1 flex flex-col px-5 sm:px-8 lg:px-10 xl:px-12 py-10 lg:py-12 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="font-sans text-xs sm:text-sm text-canvas tracking-tight">
            {step === 'done' ? 'Your order' : 'Order summary'}
          </p>
          {step !== 'done' && (
            <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-2 leading-relaxed hidden lg:block">
              {cart.reduce((n, i) => n + i.qty, 0)} bottle
              {cart.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'} · compounded to order
            </p>
          )}

          <OrderLines
            items={displayItems}
            cartTotalNgn={displaySubtotal}
            shippingCost={shippingCost}
            totalNgn={totalNgn}
            totalUsd={totalUsd}
          />
        </div>
      </aside>
    </div>
  );
}
