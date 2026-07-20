import { AnimatePresence, motion } from 'motion/react';
import { glowRgb, type LedgerBottleItem } from './shopLedgerUtils';

interface ShopLedgerStageProps {
  items: LedgerBottleItem[];
  activeIndex: number;
}

export function ShopLedgerStage({ items, activeIndex }: ShopLedgerStageProps) {
  const active = items[activeIndex] ?? items[0];
  if (!active) return null;

  const accent = glowRgb(active.glow);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0 top-[5.5rem] z-10 hidden lg:flex w-[min(46vw,640px)] items-center justify-center"
    >
      {/* Hairline divider — tint only, no fill */}
      <motion.div
        className="absolute left-0 top-[18%] bottom-[18%] w-px bg-canvas/10"
        aria-hidden
      />
      <motion.div
        className="absolute left-0 w-px origin-top"
        animate={{
          height: '22%',
          top: '39%',
          backgroundColor: `rgba(${accent}, 0.55)`,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative flex h-full w-full max-w-[320px] flex-col items-center justify-center px-6">
        <div className="relative h-[min(520px,68vh)] w-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={active.key}
              src={active.image}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 h-full w-full object-contain object-center"
            />
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`meta-${active.key}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-10 w-full text-center"
          >
            <motion.div
              className="mx-auto mb-4 h-px w-8 rounded-full"
              animate={{ backgroundColor: `rgba(${accent}, 0.65)` }}
              transition={{ duration: 0.45 }}
            />
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-taupe-muted">
              {active.label}
            </p>
            <p className="font-serif text-xl text-canvas tracking-tight mt-2">{active.title}</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-taupe-muted/60 mt-3">
              Extrait · 50ml
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress rail — neutral track, one color tick */}
      <div className="absolute right-6 xl:right-10 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5">
        {items.map((item, index) => {
          const rgb = glowRgb(item.glow);
          const isActive = index === activeIndex;
          return (
            <div
              key={`rail-${item.key}`}
              className="flex items-center justify-center"
              style={{ height: isActive ? 14 : 6 }}
            >
              <motion.div
                animate={{
                  width: isActive ? 2 : 1,
                  height: isActive ? 14 : 6,
                  backgroundColor: isActive ? `rgb(${rgb})` : 'rgba(13,11,10,0.12)',
                  opacity: isActive ? 0.85 : 0.35,
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
