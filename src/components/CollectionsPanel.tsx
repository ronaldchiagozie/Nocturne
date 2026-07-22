import { motion, AnimatePresence } from 'motion/react';
import { COLLECTION_ITEMS, COLLECTION_TAGLINE, type CollectionItem } from '../data/collection';
import { FORMULATION_COUNT_WORD } from '../data/brand';

interface CollectionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (item: CollectionItem) => void;
  onOpenDistiller?: () => void;
}

const SLOT =
  'absolute inset-0 w-full h-full object-contain object-center px-2 pt-2 pb-3 md:px-3 md:pt-3 md:pb-4';

export function CollectionsPanel({
  isOpen,
  onClose,
  onSelectProduct,
  onOpenDistiller,
}: CollectionsPanelProps) {
  const handleSelect = (item: CollectionItem) => {
    onSelectProduct(item);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[205] bg-cream-plate text-canvas flex flex-col overflow-hidden"
          data-lenis-prevent
          role="dialog"
          aria-label="Collections"
        >
          <div className="flex shrink-0 justify-between items-start gap-4 px-4 sm:px-6 md:px-12 pt-[max(1.25rem,env(safe-area-inset-top))] md:pt-8 pb-5 sm:pb-6 border-b border-neutral-300/60">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-taupe-muted">
                Collections
              </p>
              <p className="font-serif text-[clamp(1.15rem,5vw,1.75rem)] text-canvas tracking-tight leading-snug mt-2 sm:mt-3">
                {COLLECTION_TAGLINE}
              </p>
              <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-2 sm:mt-3 max-w-md leading-relaxed">
                {`${FORMULATION_COUNT_WORD.charAt(0).toUpperCase()}${FORMULATION_COUNT_WORD.slice(1)} color-shift extrait compounds on the ledger. Compounded to order.`}
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

          <div
            className="modal-scroll flex-1 min-h-0 px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            data-modal-scroll
          >
            <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-px bg-neutral-300/80 border border-neutral-300/80">
              {COLLECTION_ITEMS.map((item) => (
                <button
                  key={item.variantId}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="group text-left p-3 sm:p-4 md:p-5 flex flex-col cursor-pointer hover:bg-cream/70 transition-colors bg-cream-plate"
                >
                  <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-4">
                    {item.label}
                  </p>
                  <div className="relative aspect-[4/5] max-h-[190px] sm:max-h-[250px] md:max-h-[280px] w-full mb-3 sm:mb-4 overflow-hidden bg-cream">
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
