import { motion, AnimatePresence } from 'motion/react';
import { COLLECTION_ITEMS, COLLECTION_TAGLINE } from '../data/collection';
import { ProductId } from '../data/products';

interface CollectionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: ProductId) => void;
  onOpenDistiller?: () => void;
}

const SLOT =
  'absolute inset-0 w-full h-full object-contain object-center px-3 pt-3 pb-4 md:px-4 md:pt-4 md:pb-5';

export function CollectionsPanel({
  isOpen,
  onClose,
  onSelectProduct,
  onOpenDistiller,
}: CollectionsPanelProps) {
  const handleSelect = (productId: ProductId) => {
    onSelectProduct(productId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[205] bg-cream-plate text-canvas flex flex-col"
          data-lenis-prevent
          role="dialog"
          aria-label="Collections"
        >
          <div className="flex shrink-0 justify-between items-start gap-6 px-6 md:px-12 pt-7 md:pt-8 pb-6 border-b border-neutral-300/60">
            <div>
              <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-taupe-muted">
                Collections
              </p>
              <p className="font-serif text-[clamp(1.25rem,2.5vw,1.75rem)] text-canvas tracking-tight leading-snug mt-3">
                {COLLECTION_TAGLINE}
              </p>
              <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-3 max-w-md leading-relaxed">
                Nine color-shift extrait compounds on the ledger. Compounded to order.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer shrink-0"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-px bg-neutral-300/80 border border-neutral-300/80">
              {COLLECTION_ITEMS.map((item) => (
                <button
                  key={item.variantId}
                  type="button"
                  onClick={() => handleSelect(item.productId)}
                  className="group text-left p-3 sm:p-4 md:p-5 flex flex-col cursor-pointer hover:bg-cream/70 transition-colors bg-cream-plate"
                >
                  <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-4">
                    {item.label}
                  </p>
                  <div className="relative aspect-[4/5] max-h-[150px] sm:max-h-[200px] w-full mb-3 sm:mb-4 overflow-hidden bg-cream">
                    <img src={item.image} alt={item.name} className={SLOT} loading="lazy" />
                  </div>
                  <h3 className="font-serif text-base text-canvas tracking-tight leading-snug group-hover:opacity-80 transition-opacity">
                    {item.name}
                  </h3>
                  <p className="font-mono text-[9px] tracking-[0.12em] text-taupe-muted mt-2 uppercase">
                    Extrait · 50ml
                  </p>
                </button>
              ))}
            </div>

            {onOpenDistiller && (
              <p className="max-w-5xl mx-auto mt-10 md:mt-12 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => onOpenDistiller(), 300);
                  }}
                  className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
                >
                  Not sure which is yours? The Distiller →
                </button>
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
