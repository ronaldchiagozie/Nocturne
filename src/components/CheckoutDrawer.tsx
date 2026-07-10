import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulatedOrder } from '../types';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: SimulatedOrder) => void;
}

export function CheckoutDrawer({ isOpen, onClose, onOrderCreated }: CheckoutDrawerProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const displayName = name.trim() || 'You';
  const displayLocation = location.trim() || 'London';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onOrderCreated({
        id: `N7-${Math.floor(1000 + Math.random() * 9000)}`,
        personalization: {
          name: displayName,
          location: displayLocation,
          date: '09.07.26',
          message: 'Worn after dark.',
        },
        qty: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Received',
      });
      setIsSubmitting(false);
      setConfirmed(true);
    }, 900);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setConfirmed(false);
      setName('');
      setLocation('');
    }, 400);
  };

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
          {/* Header */}
          <div className="flex justify-between items-baseline px-6 md:px-12 pt-8 md:pt-10">
            <p className="font-serif text-[13px] tracking-[0.3em] uppercase text-canvas">
              Nocturne
            </p>
            <button
              onClick={handleClose}
              className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Content — upper-left, not centered (matches screenshot) */}
          <div className="flex-1 px-6 md:px-12 pt-16 md:pt-20">
            {confirmed ? (
              <div className="max-w-sm space-y-16">
                <p className="font-serif text-[clamp(1.75rem,3vw,2.25rem)] text-canvas tracking-tight leading-snug">
                  Secured.
                </p>
                <p className="font-body-italic italic text-sm text-taupe-muted leading-relaxed font-light">
                  For {displayName}. Compounded in {displayLocation}.
                </p>
                <button
                  onClick={handleClose}
                  className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
                >
                  Return
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-sm">
                <p className="font-serif text-[clamp(1.75rem,3vw,2.25rem)] text-canvas tracking-tight leading-snug">
                  Secure a bottle.
                </p>
                <p className="font-mono text-[11px] tabular-nums text-taupe-muted mt-5">
                  ₦180,000 / $120 — 50ml
                </p>

                <div className="mt-20 space-y-16">
                  <div>
                    <label className="block font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-4">
                      For
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="You"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full max-w-[280px] bg-transparent border-b border-canvas/25 pb-3 text-canvas font-body-italic italic text-base font-light focus:outline-none focus:border-canvas/50 transition-colors placeholder:text-canvas placeholder:italic"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-4">
                      In
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="London"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full max-w-[280px] bg-transparent border-b border-canvas/25 pb-3 text-canvas font-body-italic italic text-base font-light focus:outline-none focus:border-canvas/50 transition-colors placeholder:text-canvas placeholder:italic"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-20 font-sans text-[10px] uppercase tracking-[0.25em] text-canvas disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing…' : 'Confirm order →'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
