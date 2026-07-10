import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getBottleVariant } from '../data/bottleVariants';
import { getProduct, ProductId } from '../data/products';
import { CheckoutOverride, SimulatedOrder } from '../types';
import {
  createBatchReference,
  createSessionHash,
  formatDestination,
  formatHolder,
  resolveCoordinates,
} from '../utils/cityCoordinates';

interface CheckoutDrawerProps {
  isOpen: boolean;
  productId: ProductId;
  override?: CheckoutOverride;
  onClose: () => void;
  onOrderCreated: (order: SimulatedOrder) => void;
  onSecuredClose?: () => void;
}

function extractBatchNumber(label: string) {
  const match = label.match(/(\d+)/);
  return match?.[1] ?? '07';
}

export function CheckoutDrawer({
  isOpen,
  productId,
  override,
  onClose,
  onOrderCreated,
  onSecuredClose,
}: CheckoutDrawerProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [focusedField, setFocusedField] = useState<'name' | 'location' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [stampVisible, setStampVisible] = useState(false);
  const [sessionHash, setSessionHash] = useState('');
  const [batchRef, setBatchRef] = useState('');

  const product = getProduct(productId);
  const displayLabel = override?.productLabel ?? product.label;
  const displayTitle = override?.productTitle ?? product.title;
  const batchNumber = extractBatchNumber(displayLabel);
  const variantId = override?.variantId ?? product.variantId;
  const bottleImage = getBottleVariant(variantId).image;

  const displayName = name.trim() || 'You';
  const displayLocation = location.trim() || 'Lekki, Lagos';
  const holder = formatHolder(name);
  const destination = formatDestination(location);
  const coordinates = resolveCoordinates(location);
  const allocationDate = '09.07.26';

  useEffect(() => {
    if (!isOpen) return;
    setSessionHash(createSessionHash());
    setBatchRef(createBatchReference(batchNumber));
    setStampVisible(false);
    setConfirmed(false);
    setIsSubmitting(false);
  }, [isOpen, batchNumber]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setStampVisible(true);
    }, 400);

    setTimeout(() => {
      onOrderCreated({
        id: `N7-${Math.floor(1000 + Math.random() * 9000)}`,
        productId: product.id,
        productLabel: displayLabel,
        productTitle: displayTitle,
        variantId,
        formulationLabel: override?.formulationLabel,
        personalization: {
          name: displayName,
          location: displayLocation,
          date: allocationDate,
          message: 'Worn after dark.',
        },
        qty: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Received',
      });
      setIsSubmitting(false);
      setConfirmed(true);
    }, 1400);
  };

  const handleClose = () => {
    const wasSecured = confirmed;
    onClose();
    if (wasSecured) onSecuredClose?.();
    setTimeout(() => {
      setConfirmed(false);
      setStampVisible(false);
      setName('');
      setLocation('');
      setFocusedField(null);
    }, 400);
  };

  const ledgerStatus = confirmed
    ? 'STATUS: ALLOCATED // BATCH SECURED'
    : isSubmitting
      ? 'STATUS: PROCESSING ALLOCATION...'
      : 'STATUS: WAITING DEPOSIT COIN...';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'tween', duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] bg-cream text-canvas flex flex-col"
          data-lenis-prevent
        >
          <div className="flex justify-end items-baseline px-6 md:px-10 lg:px-12 pt-7 md:pt-8 border-b border-canvas/15">
            <button
              type="button"
              onClick={handleClose}
              className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="checkout-ledger-frame h-full min-h-[calc(100vh-4rem)] max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-[45fr_55fr] min-h-[calc(100vh-4rem)]">
                {/* Left — personalization log */}
                <div className="px-6 md:px-10 lg:px-12 py-10 md:py-12 lg:border-r border-canvas/15 flex flex-col">
                  {confirmed ? (
                    <div className="flex-1 flex flex-col justify-center max-w-md">
                      <p className="font-serif text-[clamp(2rem,4vw,2.75rem)] italic text-canvas tracking-tight leading-snug">
                        Secured.
                      </p>
                      <p className="font-body-italic italic text-sm text-taupe-muted leading-relaxed font-light mt-6">
                        {override?.formulationLabel ?? `${displayLabel} ${displayTitle}`} — allocated
                        to {displayName} in {displayLocation}.
                      </p>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="mt-14 font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer text-left"
                      >
                        Return
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-w-md">
                      <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted">
                        Personalization log
                      </p>
                      <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] text-canvas tracking-tight leading-snug mt-4">
                        Secure {displayTitle}.
                      </h2>
                      {override?.formulationLabel && (
                        <p className="font-mono text-[10px] tracking-[0.14em] text-taupe-muted mt-3 uppercase">
                          {override.formulationLabel}
                        </p>
                      )}

                      <div className="mt-12 md:mt-16 space-y-12 md:space-y-14 flex-1">
                        <div>
                          <label className="block font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted mb-5">
                            For
                          </label>
                          <input
                            type="text"
                            maxLength={18}
                            placeholder="You"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            className={`checkout-signature-input w-full bg-transparent border-b pb-3 text-3xl md:text-4xl font-serif italic text-canvas focus:outline-none transition-colors duration-300 placeholder:text-taupe-muted/60 placeholder:italic ${
                              focusedField === 'name'
                                ? 'border-amber-500/60'
                                : 'border-canvas/25'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted mb-5">
                            In
                          </label>
                          <input
                            type="text"
                            maxLength={24}
                            placeholder="Lekki, Lagos"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onFocus={() => setFocusedField('location')}
                            onBlur={() => setFocusedField(null)}
                            className={`checkout-signature-input w-full bg-transparent border-b pb-3 text-3xl md:text-4xl font-serif italic text-canvas focus:outline-none transition-colors duration-300 placeholder:text-taupe-muted/60 placeholder:italic ${
                              focusedField === 'location'
                                ? 'border-amber-500/60'
                                : 'border-canvas/25'
                            }`}
                          />
                        </div>
                      </div>

                      <p className="font-mono text-[11px] tabular-nums text-canvas mt-10">
                        Price: {product.price} / $120 — 50ml
                      </p>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-8 font-sans text-[10px] uppercase tracking-[0.28em] bg-canvas text-cream px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Processing allocation…' : 'Confirm order →'}
                      </button>

                      <div className="mt-auto pt-10 font-mono text-[9px] tracking-[0.14em] text-taupe-muted uppercase flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1">
                        <span>Vault status: online</span>
                        <span className="hidden sm:inline text-canvas/20">|</span>
                        <span>Session hash: {sessionHash}</span>
                      </div>
                    </form>
                  )}
                </div>

                {/* Right — live batch ledger certificate */}
                <div className="px-6 md:px-10 lg:px-12 py-10 md:py-12 bg-canvas/[0.03] flex flex-col min-h-[420px] lg:min-h-0">
                  <div className="checkout-certificate relative h-full min-h-[420px] lg:min-h-0 flex-1 border border-dashed border-canvas/20 bg-cream px-5 md:px-8 py-7 md:py-8 flex flex-col">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-taupe-muted">
                      Allocation statement // Batch {batchNumber}
                    </p>

                    <p className="font-mono text-[11px] tracking-[0.16em] text-canvas mt-5 uppercase">
                      Batch secured no: {batchRef}
                    </p>

                    <dl className="mt-8 space-y-4 font-mono text-[11px] md:text-[12px] tracking-[0.08em] uppercase">
                      <div className="flex flex-col sm:flex-row sm:gap-3">
                        <dt className="text-taupe-muted shrink-0">Holder:</dt>
                        <dd className="text-canvas font-medium">{holder}</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-3">
                        <dt className="text-taupe-muted shrink-0">Destination:</dt>
                        <dd className="text-canvas font-medium">{destination}</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-3">
                        <dt className="text-taupe-muted shrink-0">Coordinates:</dt>
                        <dd className="text-canvas font-medium tabular-nums">{coordinates}</dd>
                      </div>
                    </dl>

                    <div className="flex-1 flex items-center justify-center py-6 md:py-8">
                      <img
                        src={bottleImage}
                        alt={`${displayTitle} bottle`}
                        className="checkout-bottle-hero h-[min(320px,42vh)] w-auto object-contain"
                      />
                    </div>

                    <p className="font-mono text-[10px] tracking-[0.18em] text-canvas mt-auto uppercase">
                      {ledgerStatus}
                    </p>

                    <AnimatePresence>
                      {stampVisible && (
                        <motion.div
                          initial={{ scale: 2.8, opacity: 0, rotate: -6 }}
                          animate={{ scale: 1, opacity: 0.85, rotate: -12 }}
                          transition={{
                            type: 'spring',
                            stiffness: 520,
                            damping: 26,
                            mass: 0.9,
                          }}
                          className="checkout-stamp absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <div className="checkout-stamp-mark border-[3px] border-red-800/65 px-6 md:px-10 py-4 md:py-5 text-center">
                            <p className="font-mono text-[11px] md:text-sm uppercase tracking-[0.22em] text-red-800/70 leading-relaxed">
                              Batch {batchNumber} // Allocated
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-800/55 mt-1">
                              {allocationDate}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
