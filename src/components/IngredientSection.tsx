import { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Ingredient } from '../types';
import { prefersReducedMotion, shouldDisableScrollPinning } from '../hooks/useMotionPreference';

gsap.registerPlugin(ScrollTrigger);

const INGREDIENTS: Ingredient[] = [
  {
    id: 'oud',
    index: '01',
    name: 'OUD',
    weight: '250g',
    category: 'aged resinous',
    percentage: '40%',
    glow: 'rgba(138, 90, 46, 0.18)',
  },
  {
    id: 'bitter-orange',
    index: '02',
    name: 'BITTER ORANGE',
    weight: '120g',
    category: 'cold-pressed rind',
    percentage: '25%',
    glow: 'rgba(180, 110, 50, 0.16)',
  },
  {
    id: 'black-pepper',
    index: '03',
    name: 'BLACK PEPPER',
    weight: '85g',
    category: 'cracked spice',
    percentage: '15%',
    glow: 'rgba(120, 70, 45, 0.14)',
  },
  {
    id: 'cedarwood',
    index: '04',
    name: 'CEDARWOOD',
    weight: '60g',
    category: 'dry timber',
    percentage: '12%',
    glow: 'rgba(90, 80, 60, 0.14)',
  },
  {
    id: 'ambergris',
    index: '05',
    name: 'AMBERGRIS',
    weight: '35g',
    category: 'mineral salt',
    percentage: '8%',
    glow: 'rgba(160, 130, 80, 0.15)',
  },
];

const CREAM = '#EFE9DF';
const TAUPE = '#6B655C';

const PHASE_ENDS = [0.2, 0.5, 0.675, 0.825, 1.0];

function progressToIndex(progress: number): number {
  if (progress < PHASE_ENDS[0]) return 0;
  if (progress < PHASE_ENDS[1]) return 1;
  if (progress < PHASE_ENDS[2]) return 2;
  if (progress < PHASE_ENDS[3]) return 3;
  return 4;
}

interface IngredientSectionProps {
  onCheckout?: () => void;
}

export function IngredientSection({ onCheckout }: IngredientSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bottleRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const hoverLockRef = useRef(false);
  const scrollActiveRef = useRef(0);

  const setActiveLine = useCallback((idx: number) => {
    lineRefs.current.forEach((line, i) => {
      if (!line) return;
      gsap.to(line, {
        color: i === idx ? CREAM : TAUPE,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  }, []);

  const scrollListToIndex = useCallback((idx: number) => {
    if (!listRef.current) return;
    const item = lineRefs.current[idx];
    if (!item) return;

    const list = listRef.current;
    const offset = item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2;

    gsap.to(list, {
      y: -Math.max(0, offset),
      duration: 0.55,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  }, []);

  const applyScrollState = useCallback(
    (idx: number) => {
      if (hoverLockRef.current) return;
      if (scrollActiveRef.current === idx) return;
      scrollActiveRef.current = idx;
      setActiveLine(idx);
      scrollListToIndex(idx);
    },
    [setActiveLine, scrollListToIndex],
  );

  useGSAP(
    () => {
      if (
        !trackRef.current ||
        !pinRef.current ||
        !bottleRef.current ||
        !glowRef.current
      ) {
        return;
      }

      gsap.set(bottleRef.current, { scale: 1, force3D: true, transformOrigin: '50% 50%' });
      gsap.set(glowRef.current, {
        background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${INGREDIENTS[0].glow} 0%, transparent 72%)`,
      });
      setActiveLine(0);

      if (prefersReducedMotion() || shouldDisableScrollPinning()) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          pin: pinRef.current,
          anticipatePin: 1,
          onUpdate: (self) => {
            applyScrollState(progressToIndex(self.progress));
          },
        },
      });

      tl.to(bottleRef.current, { scale: 1.05, ease: 'none', duration: 0.2 }, 0);
      tl.to(
        glowRef.current,
        {
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${INGREDIENTS[0].glow} 0%, transparent 72%)`,
          ease: 'none',
          duration: 0.2,
        },
        0,
      );

      tl.to(
        glowRef.current,
        {
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${INGREDIENTS[1].glow} 0%, transparent 72%)`,
          ease: 'none',
          duration: 0.3,
        },
        0.2,
      );

      tl.to(
        glowRef.current,
        {
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${INGREDIENTS[2].glow} 0%, transparent 72%)`,
          ease: 'none',
          duration: 0.175,
        },
        0.5,
      );
      tl.to(
        glowRef.current,
        {
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${INGREDIENTS[3].glow} 0%, transparent 72%)`,
          ease: 'none',
          duration: 0.175,
        },
        0.675,
      );
      tl.to(bottleRef.current, { scale: 1.03, ease: 'none', duration: 0.15 }, 0.825);
      tl.to(
        glowRef.current,
        {
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${INGREDIENTS[4].glow} 0%, transparent 72%)`,
          ease: 'none',
          duration: 0.175,
        },
        0.825,
      );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: trackRef, dependencies: [setActiveLine, applyScrollState] },
  );

  const handleHover = (idx: number) => {
    hoverLockRef.current = true;
    setActiveLine(idx);
    scrollListToIndex(idx);

    gsap.to(glowRef.current, {
      background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${INGREDIENTS[idx].glow} 0%, transparent 72%)`,
      duration: 0.35,
      ease: 'power2.out',
    });

    gsap.to(bottleRef.current, {
      scale: idx <= 1 ? 1.05 : idx === 4 ? 1.03 : 1.04,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  const handleHoverEnd = () => {
    hoverLockRef.current = false;
    const idx = scrollActiveRef.current;
    setActiveLine(idx);
    scrollListToIndex(idx);

    gsap.to(glowRef.current, {
      background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${INGREDIENTS[idx].glow} 0%, transparent 72%)`,
      duration: 0.35,
      ease: 'power2.out',
    });

    gsap.to(bottleRef.current, {
      scale: idx <= 1 ? 1.05 : idx === 4 ? 1.03 : 1.04,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  return (
    <section ref={trackRef} className="relative h-[300vh] w-full bg-canvas">
      <div
        ref={pinRef}
        className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-canvas"
      >
        <div className="absolute inset-0 flex flex-row">

          <div className="relative w-1/2 h-full flex flex-col justify-center px-8 md:px-12 lg:px-16 overflow-hidden">
            <div className="shrink-0 mb-8 md:mb-12">
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-3">
                Batch analysis sheet
              </p>
              <p className="font-serif text-lg md:text-xl text-cream tracking-tight leading-snug">
                Nocturne formula no. 07
              </p>
              <p className="font-body-italic italic text-xs text-taupe-muted mt-2 font-light leading-relaxed">
                Five notes. One shape you&rsquo;ll recognize on yourself before anyone else does.
              </p>
            </div>

            <div className="relative flex-1 overflow-hidden mask-fade">
              <div ref={listRef} className="relative will-change-transform">
                {INGREDIENTS.map((item, idx) => (
                  <button
                    key={item.id}
                    ref={(el) => {
                      lineRefs.current[idx] = el;
                    }}
                    type="button"
                    onMouseEnter={() => handleHover(idx)}
                    onMouseLeave={handleHoverEnd}
                    className="block w-full text-left py-4 md:py-5 cursor-default focus:outline-none"
                    style={{ color: idx === 0 ? CREAM : TAUPE }}
                  >
                    <div className="flex items-baseline gap-3 md:gap-5">
                      <span className="font-mono text-[10px] tabular-nums shrink-0">
                        {item.index}.
                      </span>
                      <span className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.2em]">
                        {item.name}
                      </span>
                    </div>
                    <p className="font-body-italic italic text-xs md:text-sm font-light mt-2 pl-7 md:pl-9 leading-relaxed">
                      {item.weight}, {item.category}.
                    </p>
                    <p className="font-mono text-[10px] tabular-nums mt-1 pl-7 md:pl-9">
                      <span className="text-amber-accent">{item.percentage}</span>
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {onCheckout && (
              <button
                type="button"
                onClick={onCheckout}
                className="shrink-0 mt-6 text-left group cursor-pointer focus:outline-none"
              >
                <span className="block font-sans text-[10px] uppercase tracking-[0.25em] text-cream group-hover:text-cream/80 transition-colors">
                  [ add to cart · batch no. 07 ]
                </span>
                <span className="block font-mono text-[11px] tabular-nums text-cream mt-3 group-hover:text-cream/80 transition-colors">
                  ₦180,000 / $120 →
                </span>
              </button>
            )}
          </div>

          <div className="relative w-1/2 h-full flex items-center justify-center overflow-hidden">
            <div
              ref={glowRef}
              className="absolute inset-0 pointer-events-none will-change-[background]"
              aria-hidden
            />
            <div
              ref={bottleRef}
              className="relative will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src="/bottle-07-nocturne.png"
                alt="Nocturne No. 07"
                className="w-[min(240px,30vw)] h-auto object-contain select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
