import { motion, AnimatePresence } from 'motion/react';
import { getProduct, ProductId, ScentMetric, getMetricDisplayLabel } from '../data/products';

interface ProductDetailPanelProps {
  productId: ProductId | null;
  onClose: () => void;
  onCheckout: (productId: ProductId) => void;
}

function ScentMetricBar({
  name,
  metric,
}: {
  name: string;
  metric: ScentMetric;
}) {
  const position = Math.min(10, Math.max(0, metric.value)) / 10;
  const displayLabel = getMetricDisplayLabel(metric);

  return (
    <div className="spec-metric">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-taupe-muted">
          {name}
        </span>
        <span className="font-mono text-[10px] tabular-nums tracking-[0.12em] text-canvas">
          {displayLabel}
        </span>
      </div>
      <div className="flex justify-between font-mono text-[9px] tracking-[0.1em] text-taupe-muted mb-2">
        <span>{metric.min}</span>
        <span>{metric.max}</span>
      </div>
      <div className="relative h-px w-full bg-canvas/20">
        <div
          className="spec-metric-indicator absolute top-1/2 -translate-y-1/2 h-[3px] w-7 bg-canvas"
          style={{ left: `calc(${position * 100}% - 14px)` }}
        />
      </div>
    </div>
  );
}

export function ProductDetailPanel({ productId, onClose, onCheckout }: ProductDetailPanelProps) {
  const product = productId ? getProduct(productId) : null;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.button
            type="button"
            aria-label="Close product details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[215] bg-canvas/40 backdrop-blur-[2px] cursor-pointer"
          />

          <motion.aside
            initial={{ y: '100%', opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.95 }}
            transition={{ type: 'tween', duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-[220] h-[min(94dvh,880px)] bg-cream text-canvas shadow-[0_-24px_80px_rgba(13,11,10,0.14)] flex flex-col pb-[env(safe-area-inset-bottom)]"
            data-lenis-prevent
            role="dialog"
            aria-label={`${product.label} ${product.title} spec sheet`}
          >
            <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 md:py-8 min-h-0">
              <div className="spec-sheet-frame mx-auto max-w-5xl h-full min-h-0 md:min-h-[calc(94dvh-3rem)] border border-canvas/15 bg-cream flex flex-col">
                {/* Top bar */}
                <div className="flex items-baseline justify-between px-5 md:px-8 py-5 border-b border-canvas/15">
                  <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe-muted">
                    {product.label}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Split grid */}
                <div className="grid md:grid-cols-[2fr_3fr] flex-1 min-h-0">
                  {/* Left: bottle & tech log */}
                  <div className="flex flex-col items-center justify-center px-6 md:px-8 py-8 md:py-12 border-b md:border-b-0 md:border-r border-canvas/15">
                    <div className="relative w-full max-w-[260px] md:max-w-[300px] flex items-center justify-center flex-1">
                      <img
                        src={product.image}
                        alt={`${product.label} ${product.title}`}
                        className="w-full h-auto max-h-[min(420px,50vh)] object-contain spec-sheet-bottle"
                      />
                    </div>

                    <div className="w-full mt-8 pt-6 border-t border-canvas/15">
                      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-center gap-2 md:gap-x-4 text-center font-mono text-[10px] tracking-[0.16em] text-canvas lowercase">
                        <span>formula no: {product.specs.formulaNo}</span>
                        <span className="hidden md:inline text-canvas/25" aria-hidden>
                          |
                        </span>
                        <span>concentration: {product.specs.concentration}</span>
                        <span className="hidden md:inline text-canvas/25" aria-hidden>
                          |
                        </span>
                        <span>projection limit: {product.specs.projectionLimit}</span>
                      </div>
                      <p className="text-center font-mono text-[10px] tracking-[0.14em] text-taupe-muted lowercase mt-3">
                        mist volume: {product.specs.mistVolume}
                      </p>
                    </div>
                  </div>

                  {/* Right: spec sheet */}
                  <div className="flex flex-col px-5 md:px-8 py-6 md:py-8">
                    <div className="flex items-baseline justify-between gap-4 md:hidden mb-6">
                      <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted">
                        {product.label}
                      </p>
                    </div>

                    <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.25rem)] tracking-wide text-canvas leading-tight">
                      {product.title}
                    </h2>

                    <p className="font-body-italic italic text-sm text-taupe-muted leading-relaxed font-light mt-5 max-w-lg">
                      {product.detail}
                    </p>

                    <p className="font-body-italic italic text-sm text-canvas leading-relaxed font-light mt-4 max-w-lg">
                      {product.character}
                    </p>

                    {/* 3-column notes */}
                    <div className="grid grid-cols-3 mt-10 border-y border-canvas/15">
                      {(
                        [
                          ['Top', product.notes.top],
                          ['Heart', product.notes.heart],
                          ['Base', product.notes.base],
                        ] as const
                      ).map(([heading, value], index) => (
                        <div
                          key={heading}
                          className={`px-3 md:px-5 py-5 md:py-6 ${
                            index < 2 ? 'border-r border-canvas/15' : ''
                          }`}
                        >
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-taupe-muted mb-3">
                            {heading}
                          </p>
                          <p className="font-serif text-xs text-canvas leading-relaxed">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Scent metrics */}
                    <div className="mt-8 pt-2">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-taupe-muted mb-6">
                        Scent metrics
                      </p>
                      <div className="space-y-6 max-w-md">
                        <ScentMetricBar name="Sillage" metric={product.metrics.sillage} />
                        <ScentMetricBar name="Longevity" metric={product.metrics.longevity} />
                        <ScentMetricBar name="Intensity" metric={product.metrics.intensity} />
                      </div>
                    </div>

                    <p className="font-mono text-[10px] text-taupe-muted mt-8 leading-relaxed tracking-[0.06em]">
                      {product.wear}
                    </p>
                  </div>
                </div>

                {/* Bottom action bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 px-5 md:px-8 py-5 md:py-6 border-t border-canvas/15 bg-cream">
                  <p className="font-mono text-[11px] tabular-nums tracking-[0.08em] text-canvas">
                    {product.price} / $120, 50ml
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onCheckout(product.id);
                      onClose();
                    }}
                    className="font-sans text-[9px] uppercase tracking-[0.28em] bg-canvas text-cream px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto text-center"
                  >
                    Secure this bottle
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
