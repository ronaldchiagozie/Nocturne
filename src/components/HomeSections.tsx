import { type ReactNode } from 'react';
import { FORMULATION_COUNT, formulationsCopy } from '../data/brand';
import { useInViewOnce, TickingNumber } from './shop/LedgerReveal';
import { RepeatedLinesScroll } from './PageSections';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Select your hour',
    body: 'Each formulation is built for a specific intent. Dusk, depth, or quiet confidence. Start with the flagship trio or let the Distiller guide you.',
  },
  {
    step: '02',
    title: 'Compound to order',
    body: 'Nocturne is not shelved. Every extrait is compounded after you order. 50ml, high concentration, poured in small batches.',
  },
  {
    step: '03',
    title: 'Batch ledger refresh',
    body: "Inventory resets at Lagos midnight. What you see is what remains for today's pour. No phantom restocks, no backorders.",
  },
] as const;

interface LedgerStat {
  label: string;
  value: number;
  suffix: string;

  text?: string;
}

const LEDGER_STATS: LedgerStat[] = [
  { label: 'Formulations', value: FORMULATION_COUNT, suffix: '' },
  { label: 'Volume', value: 50, suffix: 'ml' },
  { label: 'Batch cap', value: 38, suffix: ' max/day' },
  { label: 'Restock', value: 0, suffix: '', text: 'Lagos midnight' },
];

function RevealBlock({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>('0px 0px -8% 0px');
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        seen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function HomeAtelierIntro() {
  return (
    <section className="w-full bg-cream px-5 sm:px-6 md:px-12 lg:px-14 xl:px-16 py-20 sm:py-28 md:py-36 lg:py-44 border-t border-canvas/[0.06]">
      <div className="mx-auto max-w-6xl">
        <RevealBlock>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-taupe-muted mb-6 md:mb-8">
            Meet the atelier
          </p>
          <h2 className="font-serif text-[clamp(1.75rem,4.5vw,3.25rem)] text-canvas tracking-tight leading-[1.08] max-w-4xl">
            We compound extrait de parfum for the hours no one else sees. Meaning, material, and
            restraint in a single wear.
          </h2>
          <p className="font-body-italic italic text-base md:text-lg text-taupe-muted font-light leading-relaxed max-w-2xl mt-8 md:mt-12">
            {formulationsCopy()}. Nocturne is a small-batch house: dark glass, numbered
            formulations, and a daily ledger that tells the truth about what is left to pour.
          </p>
        </RevealBlock>

        <RevealBlock className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 border-t border-canvas/[0.08] pt-12 md:pt-16">
          {[
            { kicker: 'Philosophy', line: 'Presence, not compliments.' },
            { kicker: 'Process', line: 'Compounded after you order.' },
            { kicker: 'Place', line: 'Lagos · batch ledger · midnight reset.' },
          ].map((item) => (
            <div key={item.kicker}>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-taupe-muted mb-3">
                {item.kicker}
              </p>
              <p className="font-serif text-lg md:text-xl text-canvas tracking-tight leading-snug">
                {item.line}
              </p>
            </div>
          ))}
        </RevealBlock>
      </div>
    </section>
  );
}

export function HomeProcessSection({ onOpenDistiller }: { onOpenDistiller?: () => void }) {
  return (
    <section className="w-full bg-cream-plate px-5 sm:px-6 md:px-12 lg:px-14 xl:px-16 py-20 sm:py-28 md:py-36 border-t border-canvas/[0.06]">
      <div className="mx-auto max-w-6xl">
        <RevealBlock className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-12 mb-14 md:mb-20">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-taupe-muted mb-4">
              Our approach
            </p>
            <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2.5rem)] text-canvas tracking-tight leading-snug max-w-lg">
              From intent to extrait, in three movements.
            </h2>
          </div>
          {onOpenDistiller && (
            <button
              type="button"
              onClick={onOpenDistiller}
              className="font-sans text-[10px] uppercase tracking-[0.22em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors cursor-pointer shrink-0 self-start md:self-auto"
            >
              Open the Distiller →
            </button>
          )}
        </RevealBlock>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-canvas/[0.08] bg-cream/40">
          {PROCESS_STEPS.map((step, index) => (
            <RevealBlock
              key={step.step}
              className={`p-8 md:p-10 lg:p-12 ${
                index < PROCESS_STEPS.length - 1
                  ? 'md:border-r border-b md:border-b-0 border-canvas/[0.08]'
                  : ''
              }`}
            >
              <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-taupe-muted mb-5">
                {step.step}
              </p>
              <h3 className="font-serif text-xl md:text-2xl text-canvas tracking-tight mb-4">
                {step.title}
              </h3>
              <p className="font-body-italic italic text-sm text-taupe-muted font-light leading-relaxed">
                {step.body}
              </p>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeLedgerSection() {
  const { ref, seen } = useInViewOnce<HTMLElement>('0px 0px -12% 0px');

  return (
    <section
      ref={ref}
      className="w-full bg-canvas text-cream px-5 sm:px-6 md:px-12 lg:px-14 xl:px-16 py-20 sm:py-28 md:py-32 border-t border-cream/[0.08]"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-cream/50 mb-10 md:mb-14 text-center">
          Batch ledger · live inventory
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {LEDGER_STATS.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-[clamp(2rem,5vw,3.5rem)] tabular-nums tracking-tight leading-none">
                {stat.text ? (
                  <span className="text-[clamp(1.1rem,2.5vw,1.65rem)] font-mono uppercase tracking-[0.12em]">
                    {stat.text}
                  </span>
                ) : (
                  <>
                    <TickingNumber value={stat.value} active={seen} delay={index * 80} />
                    {stat.suffix && (
                      <span className="text-[0.45em] font-mono tracking-wide ml-1">
                        {stat.suffix}
                      </span>
                    )}
                  </>
                )}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cream/45 mt-3">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <p className="font-body-italic italic text-sm text-cream/55 text-center max-w-lg mx-auto mt-14 md:mt-16 leading-relaxed">
          Phantom demand simulates real pours throughout the day. Stock never drops below seven per
          SKU until Lagos midnight resets the batch.
        </p>
      </div>
    </section>
  );
}

export function HomeMarqueeStrip() {
  const phrase = 'NOCTURNE · EXTRAIT DE PARFUM · COMPOUNDED TO ORDER · LAGOS BATCH LEDGER · ';
  return (
    <div
      className="w-full overflow-hidden border-y border-canvas/[0.06] bg-cream-plate py-4 md:py-5"
      aria-hidden
    >
      <div className="home-marquee-track flex whitespace-nowrap">
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="home-marquee-item font-mono text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-taupe-muted/80 pr-[0.35em]"
          >
            {phrase.repeat(3)}
          </span>
        ))}
      </div>
    </div>
  );
}

interface HomeMiddleSectionsProps {
  repeatedLine: string;
  onOpenDistiller?: () => void;
}

export function HomeMiddleSections({ repeatedLine, onOpenDistiller }: HomeMiddleSectionsProps) {
  return (
    <>
      <HomeAtelierIntro />
      <HomeMarqueeStrip />
      <RepeatedLinesScroll line={repeatedLine} />
      <HomeProcessSection onOpenDistiller={onOpenDistiller} />
      <HomeLedgerSection />
      <HomeMarqueeStrip />
    </>
  );
}
