import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '../assets/images';

gsap.registerPlugin(ScrollTrigger);

interface HeroScrollProps {
  onCheckout?: () => void;
}

const CARDS = [
  {
    label: 'No. 04',
    title: 'The base oud',
    detail: '250g, aged resinous. The heavyweight anchor of No. 07.',
    image: images.bottleCream4,
    price: null,
  },
  {
    label: 'No. 07',
    title: 'Nocturne',
    detail: 'Extrait de parfum. 50ml. Compounded to order.',
    image: images.hero,
    price: '₦180,000',
  },
  {
    label: 'Pepper & Cedar',
    title: 'Cracked pepper & cedar',
    detail: '85g cracked spice, cedarwood bark. Heat and structure in the dry-down.',
    image: images.bottleCream3,
    price: null,
  },
] as const;

const BOTTLE_SLOT_CLASS =
  'absolute inset-0 w-full h-full object-contain object-center px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-8';

export function HeroScroll({ onCheckout }: HeroScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const bottleAnimRef = useRef<HTMLDivElement>(null);
  const bottleImgRef = useRef<HTMLImageElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const centerCardRef = useRef<HTMLDivElement>(null);
  const centerSlotRef = useRef<HTMLDivElement>(null);
  const centerBottleImgRef = useRef<HTMLImageElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !bottleRef.current || !bottleAnimRef.current) return;

      const measureDriftRight = () => {
        const img = bottleImgRef.current;
        const vw = window.innerWidth;
        if (!img) return Math.round(vw * 0.2);

        const margin = vw >= 768 ? 56 : 28;
        const bottleW = img.offsetWidth;
        // Dock in the right lane — fully visible, aligned to the margin
        const targetCenterX = vw - margin - bottleW * 0.38;
        return Math.round(targetCenterX - vw / 2);
      };

      const measureLanding = () => {
        const slot = centerSlotRef.current;
        const grid = cardsGridRef.current;
        const sticky = grid?.parentElement;
        const img = bottleImgRef.current;
        if (!slot || !grid || !sticky || !img) return { x: 0, y: 0, scale: 0.55 };

        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const pad = vw >= 768 ? 24 : 16;
        const gridH = grid.offsetHeight;
        const gridW = grid.offsetWidth;
        const stickyRect = sticky.getBoundingClientRect();

        // Project where the sticky grid sits when chapter 3 is active (vertically centered)
        const gridTop = Math.max(0, (vh - gridH) / 2);
        const gridLeft = stickyRect.left + (stickyRect.width - gridW) / 2;

        const targetX = gridLeft + slot.offsetLeft + slot.offsetWidth / 2;
        const targetY = gridTop + slot.offsetTop + slot.offsetHeight / 2;

        const innerW = slot.offsetWidth - pad * 2;
        const innerH = slot.offsetHeight - pad * 2;
        const baseW = img.offsetWidth;
        const baseH = img.offsetHeight;

        return {
          x: Math.round(targetX - vw / 2),
          y: Math.round(targetY - vh / 2),
          scale: Math.min(innerW / baseW, innerH / baseH, 1),
        };
      };

      let landing = { x: 0, y: 0, scale: 0.55 };
      let driftX = 0;

      const refreshMetrics = () => {
        landing = measureLanding();
        driftX = measureDriftRight();
      };
      refreshMetrics();

      gsap.set(bottleAnimRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        rotateY: 0,
        transformOrigin: '50% 90%',
        force3D: true,
      });
      gsap.set([leftCardRef.current, rightCardRef.current], { xPercent: 0, opacity: 0 });
      gsap.set(centerCardRef.current, { opacity: 0 });
      gsap.set(centerBottleImgRef.current, { opacity: 0 });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set([leftCardRef.current, rightCardRef.current, centerCardRef.current], { opacity: 1 });
        gsap.set(centerBottleImgRef.current, { opacity: 1 });
        gsap.set(bottleAnimRef.current, { opacity: 0 });
        return;
      }

      const mm = gsap.matchMedia();

      mm.add('(min-width: 769px)', () => {
        refreshMetrics();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.1,
            pin: bottleRef.current,
            pinSpacing: false,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefresh: refreshMetrics,
          },
        });

        // Ch1 (25%) — hero hold, slight turn at end
        tl.to(bottleAnimRef.current, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          rotateY: 0,
          ease: 'none',
          duration: 0.8,
        }).to(bottleAnimRef.current, {
          rotation: 4,
          rotateY: -6,
          ease: 'none',
          duration: 0.2,
        });

        // Ch2 (25%) — dock right lane + rotate
        tl.to(bottleAnimRef.current, {
          x: driftX,
          y: 0,
          scale: 0.9,
          rotation: 9,
          rotateY: -12,
          ease: 'none',
          duration: 1,
        });

        // Ch3 — snap back fast
        tl.to(bottleAnimRef.current, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          rotateY: 0,
          transformOrigin: '50% 50%',
          ease: 'none',
          duration: 0.12,
        });

        tl.to(centerCardRef.current, { opacity: 1, duration: 0.22, ease: 'none' }, 2.06);
        tl.fromTo(
          leftCardRef.current,
          { xPercent: -115, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 0.4, ease: 'none' },
          2.1,
        );
        tl.fromTo(
          rightCardRef.current,
          { xPercent: 115, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 0.4, ease: 'none' },
          2.1,
        );

        // Re-measure right before landing so values match the sticky grid
        tl.call(refreshMetrics, [], 2.2);

        // Smooth settle into slot — function values pick up fresh metrics on refresh/scrub
        tl.to(
          bottleAnimRef.current,
          {
            x: () => landing.x,
            y: () => landing.y,
            scale: () => landing.scale,
            rotation: 0,
            rotateY: 0,
            transformOrigin: '50% 50%',
            ease: 'power2.out',
            duration: 0.55,
            roundProps: 'x,y',
          },
          2.22,
        );

        // Hold settled — then instant handoff (no crossfade jitter)
        tl.to(bottleAnimRef.current, { ease: 'none', duration: 0.45 });
        tl.call(
          () => {
            gsap.set(bottleAnimRef.current, { opacity: 0 });
            gsap.set(centerBottleImgRef.current, { opacity: 1 });
          },
          [],
          3.42,
        );
        tl.to(bottleAnimRef.current, { ease: 'none', duration: 0.18 });
      });

      mm.add('(max-width: 768px)', () => {
        refreshMetrics();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.1,
            pin: bottleRef.current,
            pinSpacing: false,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefresh: refreshMetrics,
          },
        });

        tl.to(bottleAnimRef.current, { x: 0, y: 0, scale: 1, rotation: 0, rotateY: 0, ease: 'none', duration: 0.9 })
          .to(bottleAnimRef.current, {
            x: driftX,
            scale: 0.92,
            rotation: 7,
            rotateY: -10,
            ease: 'none',
            duration: 0.5,
          })
          .to(bottleAnimRef.current, {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            rotateY: 0,
            transformOrigin: '50% 50%',
            ease: 'none',
            duration: 0.12,
          })
          .to(centerCardRef.current, { opacity: 1, duration: 0.25 }, 1.35)
          .to([leftCardRef.current, rightCardRef.current], { opacity: 1, duration: 0.25 }, 1.42)
          .call(refreshMetrics, [], 1.48)
          .to(
            bottleAnimRef.current,
            {
              x: () => landing.x,
              y: () => landing.y,
              scale: () => landing.scale,
              rotation: 0,
              rotateY: 0,
              transformOrigin: '50% 50%',
              ease: 'power2.out',
              duration: 0.42,
              roundProps: 'x,y',
            },
            1.5,
          )
          .to(bottleAnimRef.current, { ease: 'none', duration: 0.3 })
          .set(bottleAnimRef.current, { opacity: 0 }, 2.05)
          .set(centerBottleImgRef.current, { opacity: 1 }, 2.05);
      });

      const onRefreshInit = () => refreshMetrics();
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);

      requestAnimationFrame(() => {
        refreshMetrics();
        ScrollTrigger.refresh();
      });

      const onLoad = () => {
        refreshMetrics();
        ScrollTrigger.refresh();
      };
      window.addEventListener('load', onLoad);

      return () => {
        window.removeEventListener('load', onLoad);
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        mm.revert();
      };
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} data-hero-track className="relative w-full">
      <div
        ref={bottleRef}
        data-hero-object
        className="absolute top-0 left-0 z-30 flex h-screen w-full items-center justify-center pointer-events-none"
        style={{ perspective: '1200px' }}
      >
        <div
          ref={bottleAnimRef}
          className="relative will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="hero-bottle-shadow absolute bottom-[6%] left-1/2 -translate-x-1/2 w-56 h-8 rounded-full blur-2xl opacity-35"
            style={{ background: 'rgba(13,11,10,0.3)' }}
          />
          <img
            ref={bottleImgRef}
            src={images.hero}
            alt="Nocturne No. 07"
            className="hero-bottle-image relative z-30 block h-[min(520px,62vh)] w-auto object-contain"
          />
        </div>
      </div>

      {/* Chapter 1 — hero */}
      <section data-hero-chapter="1" className="relative min-h-screen w-full bg-cream-plate">
        <div className="absolute inset-0 z-0 overflow-hidden bg-cream-plate" />

        <p
          aria-hidden
          className="pointer-events-none select-none absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 font-serif text-[14vw] uppercase tracking-widest text-black/[0.03] leading-none whitespace-nowrap"
        >
          NOCTURNE
        </p>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <path
              fill="#ECE6D8"
              fillRule="evenodd"
              d="M 0 0 H 100 V 100 H 0 Z M 50 50 m -22 0 a 22 22 0 1 0 44 0 a 22 22 0 1 0 -44 0"
            />
          </svg>
        </div>

        <div className="absolute inset-0 z-[25] pointer-events-none select-none">
          <p className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-widest text-neutral-400 [writing-mode:vertical-rl] rotate-180">
            BATCH // 001-NG
          </p>
          <p className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-widest text-neutral-400 [writing-mode:vertical-rl]">
            EXTRAIT DE PARFUM // 50ML
          </p>

          <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span className="hero-scroll-line block h-8 w-px bg-neutral-400/70" aria-hidden />
            <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-400">
              [ SCROLL TO DISTIL ]
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 2 — worn after dark copy */}
      <section
        data-hero-chapter="2"
        className="relative min-h-screen w-full bg-cream-plate flex flex-col justify-end px-6 md:px-12 pb-28 md:pb-36"
      >
        <p className="pointer-events-none select-none absolute right-6 md:right-12 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-widest text-neutral-400 [writing-mode:vertical-rl]">
          EXTRAIT DE PARFUM // 50ML
        </p>

        <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-canvas tracking-tight leading-snug max-w-xl">
          Worn after dark.
        </h1>
        <p className="font-body-italic italic text-sm md:text-base text-taupe-muted leading-relaxed font-light max-w-md mt-8 md:mt-10">
          A fragrance for the hours no one else sees. No florals, no compliments — dark, textured,
          quietly dangerous.
        </p>
      </section>

      {/* Chapter 3 — 3-column card landing */}
      <section data-hero-chapter="3" className="relative min-h-[200vh] w-full bg-cream-plate">
        <div className="sticky top-0 flex h-screen w-full items-center justify-center px-4 md:px-8 lg:px-12">
          <div
            ref={cardsGridRef}
            className="relative w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 border border-neutral-300/80 bg-cream-plate z-20"
          >
            <article
              ref={leftCardRef}
              className="border-b md:border-b-0 md:border-r border-neutral-300/80 p-5 md:p-6 lg:p-8 flex flex-col opacity-0"
            >
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-6">
                {CARDS[0].label}
              </p>
              <div className="relative aspect-[4/5] overflow-hidden bg-cream mb-6 md:mb-8">
                <img src={CARDS[0].image} alt={CARDS[0].title} className={BOTTLE_SLOT_CLASS} />
              </div>
              <h3 className="font-serif text-lg md:text-xl text-canvas tracking-tight leading-snug mb-3">
                {CARDS[0].title}
              </h3>
              <p className="font-body-italic italic text-xs md:text-sm text-taupe-muted leading-relaxed font-light flex-1">
                {CARDS[0].detail}
              </p>
            </article>

            <article
              ref={centerCardRef}
              className="border-b md:border-b-0 md:border-r border-neutral-300/80 p-5 md:p-6 lg:p-8 flex flex-col opacity-0"
            >
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-6">
                {CARDS[1].label}
              </p>
              <div
                ref={centerSlotRef}
                className="relative aspect-[4/5] overflow-hidden bg-cream mb-6 md:mb-8"
              >
                <img
                  ref={centerBottleImgRef}
                  src={CARDS[1].image}
                  alt="Nocturne No. 07"
                  className={`${BOTTLE_SLOT_CLASS} opacity-0`}
                />
              </div>
              <h3 className="font-serif text-lg md:text-xl text-canvas tracking-tight leading-snug mb-3">
                {CARDS[1].title}
              </h3>
              <p className="font-body-italic italic text-xs md:text-sm text-taupe-muted leading-relaxed font-light flex-1 mb-6">
                {CARDS[1].detail}
              </p>
              {CARDS[1].price && (
                <div className="flex items-end justify-between gap-4">
                  <p className="font-mono text-[11px] tabular-nums text-canvas">{CARDS[1].price}</p>
                  <button
                    type="button"
                    onClick={onCheckout}
                    className="pointer-events-auto font-sans text-[9px] uppercase tracking-[0.2em] bg-canvas text-cream px-5 py-2.5 rounded-full hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </article>

            <article ref={rightCardRef} className="p-5 md:p-6 lg:p-8 flex flex-col opacity-0">
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-6">
                {CARDS[2].label}
              </p>
              <div className="relative aspect-[4/5] overflow-hidden bg-cream mb-6 md:mb-8">
                <img src={CARDS[2].image} alt={CARDS[2].title} className={BOTTLE_SLOT_CLASS} />
              </div>
              <h3 className="font-serif text-lg md:text-xl text-canvas tracking-tight leading-snug mb-3">
                {CARDS[2].title}
              </h3>
              <p className="font-body-italic italic text-xs md:text-sm text-taupe-muted leading-relaxed font-light flex-1">
                {CARDS[2].detail}
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
