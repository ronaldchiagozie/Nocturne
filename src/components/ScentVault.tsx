import { motion, AnimatePresence } from 'motion/react';
import { getBottleVariant, resolveVariantForOrder } from '../data/bottleVariants';
import { SimulatedOrder } from '../types';

interface ScentVaultProps {
  isOpen: boolean;
  orders: SimulatedOrder[];
  onClose: () => void;
}

function VaultBottle({ order, index }: { order: SimulatedOrder; index: number }) {
  const variantId = order.variantId ?? resolveVariantForOrder(order.id, order.productId);
  const variant = getBottleVariant(variantId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 + index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="vault-bottle-slot relative flex flex-col items-center"
    >
      <div
        className="vault-bottle-glow absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[72%] h-10 rounded-full blur-2xl"
        style={{ background: variant.glow }}
      />
      <div className="relative z-10 h-[min(140px,22vw)] w-full flex items-end justify-center">
        <img
          src={variant.image}
          alt={`${order.productLabel} ${order.productTitle}`}
          className="vault-bottle-image h-full w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
        />
      </div>
      <div className="mt-4 text-center space-y-1">
        <p className="font-sans text-[8px] uppercase tracking-[0.22em] text-cream/50">
          {order.formulationLabel ? 'Distilled' : order.productLabel}
        </p>
        <p className="font-serif text-sm text-cream/90 tracking-tight">
          {order.formulationLabel ?? order.productTitle}
        </p>
        <p className="font-body-italic italic text-[11px] text-cream/40 font-light">
          For {order.personalization.name} · {order.personalization.location}
        </p>
      </div>
    </motion.div>
  );
}

export function ScentVault({ isOpen, orders, onClose }: ScentVaultProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close vault"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[180] bg-canvas/60 backdrop-blur-[2px] cursor-pointer"
          />

          <motion.aside
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-[190] vault-panel text-cream"
            data-lenis-prevent
            role="dialog"
            aria-label="My Vault"
          >
            <div className="vault-panel-inner relative max-h-[min(78vh,640px)] flex flex-col overflow-hidden">
              <div className="flex items-baseline justify-between px-6 md:px-12 pt-6 md:pt-8 pb-4">
                <div>
                  <p className="font-serif text-[13px] tracking-[0.3em] uppercase text-cream/90">
                    My Vault
                  </p>
                  <p className="font-mono text-[9px] tracking-[0.18em] text-cream/40 mt-2 uppercase">
                    Vault Allocation: BATCH // 001-NG. Securely aging.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-sans text-[10px] uppercase tracking-[0.25em] text-cream/45 hover:text-cream/80 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-8">
                {orders.length === 0 ? (
                  <p className="font-body-italic italic text-sm text-cream/45 font-light py-12">
                    No allocations yet. Secure a bottle to begin your vault.
                  </p>
                ) : (
                  <div className="relative mt-4">
                    <div className="vault-shelf-glass absolute inset-x-0 bottom-[52px] h-3 rounded-sm" />
                    <div className="vault-shelf-edge absolute inset-x-0 bottom-[48px] h-px bg-cream/10" />
                    <div
                      className="vault-shelf-surface absolute inset-x-[-8%] bottom-0 h-14 rounded-t-sm"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)',
                      }}
                    />

                    <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 pb-16">
                      {orders.map((order, index) => (
                        <VaultBottle key={order.id} order={order} index={index} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

interface VaultTabProps {
  count: number;
  isHidden?: boolean;
  onOpen: () => void;
}

/** Quiet bottom tab — only visible when the user has secured bottles */
export function VaultTab({ count, isHidden, onOpen }: VaultTabProps) {
  if (count === 0 || isHidden) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="vault-tab fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto cursor-pointer"
      aria-label={`Open My Vault, ${count} bottle${count === 1 ? '' : 's'}`}
    >
      <span className="font-sans text-[9px] uppercase tracking-[0.28em] text-cream/70">
        My Vault
      </span>
      <span className="font-mono text-[9px] tabular-nums text-cream/40 ml-3">{count}</span>
    </button>
  );
}
