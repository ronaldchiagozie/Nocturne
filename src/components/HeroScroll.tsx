import { useRef, type Ref } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '../assets/images';
import { PRODUCTS, ProductId } from '../data/products';
import { preloadImages } from '../utils/preloadImages';
import { BatchLedger } from './BatchLedger';

gsap.registerPlugin(ScrollTrigger);

interface HeroScrollProps {
  onCheckout?: (productId: ProductId) => void;
  onOpenDistiller?: () => void;
  onOpenProductDetail?: (productId: ProductId) => void;
}

const CARD_ORDER: ProductId[] = ['no03', 'no07', 'no05'];

const CARDS = CARD_ORDER.map((id) => {
  const product = PRODUCTS[id];
  return {
    productId: id,
    label: product.label,
    title: product.title,
    detail: product.detail,
    image: images[id === 'no03' ? 'no03' : id === 'no05' ? 'no05' : 'no07'],
    imageAlt: `Nocturne ${product.label} ${product.title} extrait de parfum bottle`,
    price: product.price,
  };
});

/** Extra formulations. Mobile home shows 5 total (3 flagship + 2) */
const MOBILE_EXTRA_CARDS = [
  {
    productId: 'no07' as ProductId,
    label: 'No. 11',
    title: 'Golden Hour',
    detail: 'Nocturne No. 11. Extrait de parfum. 50ml. Compounded to order.',
    image: images.bottle11GoldenHour,
    imageAlt: 'Nocturne No. 11 Golden Hour extrait de parfum bottle',
    price: PRODUCTS.no07.price,
  },
  {
    productId: 'no07' as ProductId,
    label: 'No. 17',
    title: 'Violet Noir',
    detail: 'Nocturne No. 17. Extrait de parfum. 50ml. Compounded to order.',
    image: images.bottle17VioletNoir,
    imageAlt: 'Nocturne No. 17 Violet Noir extrait de parfum bottle',
    price: PRODUCTS.no07.price,
  },
] as const;

function BottleSlot({
  imageSrc,
  imageAlt,
  imageClassName,
  imgRef,
  slotRef,
  priority = false,
}: {
  imageSrc: string;
  imageAlt: string;
  imageClassName: string;
  imgRef?: Ref<HTMLImageElement>;
  slotRef?: Ref<HTMLDivElement>;
  priority?: boolean;
}) {
  return (
    <div ref={slotRef} className="relative aspect-[4/5] overflow-hidden bg-cream mb-6 md:mb-8">
      <img
        ref={imgRef}
        src={imageSrc}
        alt={imageAlt}
        className={imageClassName}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
}

function CardFooter({
  price,
  productId,
  onCheckout,
}: {
  price: string;
  productId: ProductId;
  onCheckout?: (productId: ProductId) => void;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <p className="font-mono text-[11px] tabular-nums text-canvas">{price}</p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCheckout?.(productId);
        }}
        className="pointer-events-auto font-sans text-[9px] uppercase tracking-[0.2em] bg-canvas text-cream px-5 py-2.5 rounded-full hover:opacity-85 transition-opacity cursor-pointer"
      >
        Add
      </button>
    </div>
  );
}

const BOTTLE_SLOT_CLASS =
  'absolute inset-0 w-full h-full object-contain object-center px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-8';

function HeroEditorial({
  title,
  body,
  align = 'left',
  className = '',
}: {
  title: string;
  body: string;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <div
      className={`max-w-sm md:max-w-md pointer-events-none select-none ${
        align === 'right' ? 'text-right ml-auto' : 'text-left'
      } ${className}`}
    >
      <h2 className="font-serif text-[clamp(1.35rem,3vw,2rem)] text-canvas tracking-tight leading-snug">
        {title}
      </h2>
      <p className="font-body-italic italic text-sm md:text-base text-taupe-muted leading-relaxed font-light mt-6 md:mt-8">
        {body}
      </p>
    </div>
  );
}

export function HeroScroll({ onCheckout, onOpenDistiller, onOpenProductDetail }: HeroScrollProps) {
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
        if (!img) return vw * 0.2;

        const margin = vw >= 768 ? 56 : 28;
        const bottleW = img.offsetWidth;
        const targetCenterX = vw - margin - bottleW * 0.38;
        return targetCenterX - vw / 2;
      };

      const measureLanding = () => {
        const slot = centerSlotRef.current;
        const grid = cardsGridRef.current;
        const sticky = grid?.parentElement;
        const img = bottleImgRef.current;
        if (!slot || !grid || !sticky || !img || grid.offsetWidth === 0) {
          return { x: 0, y: 0, scale: 0.55 };
        }

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const pad = vw >= 768 ? 24 : 16;

        // offsetTop within the sticky flex container, stable, no getBoundingClientRect during scroll
        const slotCenterX = grid.offsetLeft + slot.offsetLeft + slot.offsetWidth / 2;
        const slotCenterY = grid.offsetTop + slot.offsetTop + slot.offsetHeight / 2;

        const innerW = slot.offsetWidth - pad * 2;
        const innerH = slot.offsetHeight - pad * 2;
        const baseW = img.offsetWidth;
        const baseH = img.offsetHeight;

        return {
          x: slotCenterX - vw / 2,
          y: slotCenterY - vh / 2,
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

      const mobileMq = window.matchMedia('(max-width: 768px)');

      gsap.set(bottleAnimRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        rotateY: 0,
        transformOrigin: '50% 90%',
        force3D: !mobileMq.matches,
        autoRound: true,
        transformPerspective: mobileMq.matches ? 0 : 1200,
      });

      if (!mobileMq.matches) {
        gsap.set([leftCardRef.current, rightCardRef.current], { xPercent: 0, opacity: 0 });
        gsap.set(centerCardRef.current, { opacity: 0 });
        gsap.set(centerBottleImgRef.current, { opacity: 0 });
      } else {
        // Mobile: cards always visible. No landing choreography
        gsap.set([leftCardRef.current, rightCardRef.current, centerCardRef.current], {
          opacity: 1,
          clearProps: 'xPercent',
        });
        gsap.set(centerBottleImgRef.current, { opacity: 1 });
      }

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

        // Ch1: hero hold, slight turn at end
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

        // Ch2: dock right lane + rotate
        tl.to(bottleAnimRef.current, {
          x: driftX,
          y: 0,
          scale: 0.9,
          rotation: 9,
          rotateY: -12,
          ease: 'none',
          duration: 1,
        });

        // Ch3: return to center before rising into slot
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

        tl.call(refreshMetrics, [], 2.2);

        tl.to(
          bottleAnimRef.current,
          {
            x: () => landing.x,
            y: () => landing.y,
            scale: () => landing.scale,
            rotation: 0,
            rotateY: 0,
            transformOrigin: '50% 50%',
            ease: 'none',
            duration: 0.55,
            roundProps: 'x,y',
          },
          2.22,
        );

        tl.to(bottleAnimRef.current, { ease: 'none', duration: 0.45 });
        tl.to(bottleAnimRef.current, { opacity: 0, ease: 'none', duration: 0.08 }, 3.42);
        tl.to(centerBottleImgRef.current, { opacity: 1, ease: 'none', duration: 0.08 }, 3.42);
        tl.to(bottleAnimRef.current, { ease: 'none', duration: 0.18 });
      });

      mm.add('(max-width: 768px)', () => {
        // Mobile: pin through hero, fully fade out before "Worn after dark" enters.
        gsap.set(bottleAnimRef.current, {
          rotateY: 0,
          rotation: 0,
          transformPerspective: 0,
          force3D: true,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
        });
        gsap.set([leftCardRef.current, rightCardRef.current, centerCardRef.current], {
          opacity: 1,
          clearProps: 'xPercent',
        });
        gsap.set(centerBottleImgRef.current, { opacity: 1 });

        const chapter1 = containerRef.current?.querySelector('[data-hero-chapter="1"]');
        const chapter2 = containerRef.current?.querySelector('[data-hero-chapter="2"]');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: chapter1 || containerRef.current,
            start: 'top top',
            // End while ch1 bottom is still at viewport bottom — before ch2 text
            end: 'bottom bottom',
            scrub: true,
            pin: bottleRef.current,
            pinSpacing: false,
            pinType: 'fixed',
            anticipatePin: 0,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
          },
        });

        // Hold, fade early, then stay invisible before Worn after dark
        tl.to(bottleAnimRef.current, {
          scale: 1,
          ease: 'none',
          duration: 0.35,
        })
          .to(bottleAnimRef.current, {
            opacity: 0,
            scale: 0.9,
            ease: 'none',
            duration: 0.45,
          })
          .to(bottleAnimRef.current, {
            opacity: 0,
            ease: 'none',
            duration: 0.2,
          });

        // Hard-hide before chapter 2 copy reaches the screen
        ScrollTrigger.create({
          trigger: chapter2 || chapter1 || containerRef.current,
          start: 'top 85%',
          onEnter: () => {
            if (bottleRef.current) bottleRef.current.style.visibility = 'hidden';
            if (bottleAnimRef.current) gsap.set(bottleAnimRef.current, { opacity: 0 });
          },
          onLeaveBack: () => {
            if (bottleRef.current) bottleRef.current.style.visibility = 'visible';
          },
        });
      });

      const onRefreshInit = () => refreshMetrics();
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);

      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          refreshMetrics();
          ScrollTrigger.refresh();
        }, 150);
      };

      window.addEventListener('resize', onResize);

      const heroImages = [
        images.hero,
        ...CARDS.map((card) => card.image),
        ...MOBILE_EXTRA_CARDS.map((card) => card.image),
      ];
      preloadImages(heroImages).then(() => {
        refreshMetrics();
        ScrollTrigger.refresh();
      });

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
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);
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
        className="absolute top-0 left-0 z-30 flex h-[100dvh] w-full items-center justify-center pointer-events-none hero-bottle-pin md:[perspective:1200px]"
      >
        <div ref={bottleAnimRef} className="relative hero-bottle-layer md:will-change-transform">
          <div
            className="hero-bottle-shadow absolute bottom-[6%] left-1/2 -translate-x-1/2 w-56 h-8 rounded-full blur-2xl opacity-35 hidden md:block"
            style={{ background: 'rgba(13,11,10,0.3)' }}
          />
          <img
            ref={bottleImgRef}
            src={images.hero}
            alt={CARDS[1].imageAlt}
            className="hero-bottle-image relative z-30 block h-[min(400px,52dvh)] sm:h-[min(460px,58dvh)] md:h-[min(520px,62vh)] w-auto object-contain"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>

      {/* Chapter 1: hero (taller on mobile for bottle fade runway) */}
      <section
        data-hero-chapter="1"
        className="relative min-h-[180dvh] md:min-h-[100dvh] w-full bg-cream-plate"
      >
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
              fill="#EFE9DF"
              fillRule="evenodd"
              d="M 0 0 H 100 V 100 H 0 Z M 50 50 m -22 0 a 22 22 0 1 0 44 0 a 22 22 0 1 0 -44 0"
            />
          </svg>
        </div>

        <div className="absolute inset-0 z-[25] pointer-events-none select-none">
          <p className="absolute left-4 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 font-mono text-[9px] sm:text-[10px] tracking-widest text-neutral-400 [writing-mode:vertical-rl] rotate-180 hidden sm:block">
            BATCH // 001-NG
          </p>
          <p className="absolute right-4 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 font-mono text-[9px] sm:text-[10px] tracking-widest text-neutral-400 [writing-mode:vertical-rl] hidden sm:block">
            EXTRAIT DE PARFUM // 50ML
          </p>

          <HeroEditorial
            title="After dark."
            body="Cracked pepper up front, smoked cedar through the heart, aged oud in the dry-down. Built for presence, not compliments."
            align="right"
            className="absolute right-6 md:right-12 top-[20%] md:top-[24%] lg:top-[28%] hidden md:block"
          />

          <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 px-4">
            <BatchLedger className="md:hidden text-center" />
          </div>
        </div>
      </section>

      {/* Chapter 2: worn after dark copy */}
      <section
        data-hero-chapter="2"
        className="relative w-full bg-cream-plate flex flex-col justify-end px-5 sm:px-6 md:px-12 pt-16 pb-16 sm:pb-20 md:min-h-[100dvh] md:pt-0 md:pb-36"
      >
        <p className="pointer-events-none select-none absolute right-5 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 font-mono text-[9px] sm:text-[10px] tracking-widest text-neutral-400 [writing-mode:vertical-rl] z-[20] hidden sm:block">
          EXTRAIT DE PARFUM // 50ML
        </p>

        <HeroEditorial
          title="Compounded to order."
          body="No. 03, 05, and 07, plus six more on the ledger. Each extrait distilled for a different hour, a different intent."
          align="right"
          className="absolute right-6 md:right-12 top-[18%] md:top-[22%] lg:top-[26%] z-[20] hidden md:block"
        />

        <div className="relative z-[20]">
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-canvas tracking-tight leading-snug max-w-xl">
            Worn after dark.
          </h1>
          <p className="font-body-italic italic text-sm md:text-base text-taupe-muted leading-relaxed font-light max-w-md mt-8 md:mt-10">
            A fragrance for the hours no one else sees. No florals, no compliments. Dark, textured,
            quietly dangerous.
          </p>
        </div>
      </section>

      {/* Chapter 3: desktop: sticky 3-col landing · mobile: normal scroll (no sticky) */}
      <section
        data-hero-chapter="3"
        className="relative w-full bg-cream-plate md:min-h-[200vh]"
      >
        {/* Desktop sticky choreography. Never paint on mobile */}
        <div className="max-md:hidden sticky top-0 flex h-screen w-full flex-col items-center justify-center px-8 lg:px-12">
          <div
            ref={cardsGridRef}
            className="relative w-full max-w-6xl grid grid-cols-3 border border-neutral-300/80 bg-cream-plate z-20"
          >
            <article
              ref={leftCardRef}
              onClick={() => onOpenProductDetail?.(CARDS[0].productId)}
              className="border-r border-neutral-300/80 p-6 lg:p-8 flex flex-col opacity-0 cursor-pointer hover:bg-cream/60 transition-colors duration-300"
            >
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-6">
                {CARDS[0].label}
              </p>
              <BottleSlot
                imageSrc={CARDS[0].image}
                imageAlt={CARDS[0].imageAlt}
                imageClassName={BOTTLE_SLOT_CLASS}
                priority
              />
              <h3 className="font-serif text-lg md:text-xl text-canvas tracking-tight leading-snug mb-3">
                {CARDS[0].title}
              </h3>
              <p className="font-body-italic italic text-xs md:text-sm text-taupe-muted leading-relaxed font-light flex-1 mb-6">
                {CARDS[0].detail}
              </p>
              <CardFooter price={CARDS[0].price} productId={CARDS[0].productId} onCheckout={onCheckout} />
            </article>

            <article
              ref={centerCardRef}
              onClick={() => onOpenProductDetail?.(CARDS[1].productId)}
              className="border-r border-neutral-300/80 p-6 lg:p-8 flex flex-col opacity-0 cursor-pointer hover:bg-cream/60 transition-colors duration-300"
            >
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-6">
                {CARDS[1].label}
              </p>
              <BottleSlot
                imageSrc={CARDS[1].image}
                imageAlt={CARDS[1].imageAlt}
                imageClassName={`${BOTTLE_SLOT_CLASS} opacity-0`}
                imgRef={centerBottleImgRef}
                slotRef={centerSlotRef}
                priority
              />
              <h3 className="font-serif text-lg md:text-xl text-canvas tracking-tight leading-snug mb-3">
                {CARDS[1].title}
              </h3>
              <p className="font-body-italic italic text-xs md:text-sm text-taupe-muted leading-relaxed font-light flex-1 mb-6">
                {CARDS[1].detail}
              </p>
              <CardFooter price={CARDS[1].price} productId={CARDS[1].productId} onCheckout={onCheckout} />
            </article>

            <article
              ref={rightCardRef}
              onClick={() => onOpenProductDetail?.(CARDS[2].productId)}
              className="p-6 lg:p-8 flex flex-col opacity-0 cursor-pointer hover:bg-cream/60 transition-colors duration-300"
            >
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-6">
                {CARDS[2].label}
              </p>
              <BottleSlot
                imageSrc={CARDS[2].image}
                imageAlt={CARDS[2].imageAlt}
                imageClassName={BOTTLE_SLOT_CLASS}
                priority
              />
              <h3 className="font-serif text-lg md:text-xl text-canvas tracking-tight leading-snug mb-3">
                {CARDS[2].title}
              </h3>
              <p className="font-body-italic italic text-xs md:text-sm text-taupe-muted leading-relaxed font-light flex-1 mb-6">
                {CARDS[2].detail}
              </p>
              <CardFooter price={CARDS[2].price} productId={CARDS[2].productId} onCheckout={onCheckout} />
            </article>
          </div>

          {onOpenDistiller && (
            <div className="pointer-events-auto mt-12 w-full max-w-6xl text-center z-20">
              <button
                type="button"
                onClick={onOpenDistiller}
                className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors duration-300 cursor-pointer"
              >
                Nine formulations exist. Discover yours →
              </button>
            </div>
          )}
        </div>

        {/* Mobile: spaced stack, normal document flow */}
        <div className="md:hidden relative z-20 w-full px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-5 px-1">
            The ledger
          </p>

          <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
            {[...CARDS, ...MOBILE_EXTRA_CARDS].map((card, index) => (
              <article
                key={`${card.label}-${card.title}`}
                onClick={() => onOpenProductDetail?.(card.productId)}
                className="flex flex-col border border-neutral-300/80 bg-cream-plate p-5 cursor-pointer active:bg-cream/60"
              >
                <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-5">
                  {card.label}
                </p>
                <BottleSlot
                  imageSrc={card.image}
                  imageAlt={card.imageAlt}
                  imageClassName={BOTTLE_SLOT_CLASS}
                  priority={index < 2}
                />
                <h3 className="font-serif text-lg text-canvas tracking-tight leading-snug mb-2">
                  {card.title}
                </h3>
                <p className="font-body-italic italic text-xs text-taupe-muted leading-relaxed font-light mb-5">
                  {card.detail}
                </p>
                <CardFooter
                  price={card.price}
                  productId={card.productId}
                  onCheckout={onCheckout}
                />
              </article>
            ))}
          </div>

          {onOpenDistiller && (
            <div className="pointer-events-auto mt-8 border-t border-neutral-300/80 pt-8 pb-2 w-full text-center">
              <button
                type="button"
                onClick={onOpenDistiller}
                className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors duration-300 cursor-pointer"
              >
                Nine formulations exist. Discover yours →
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
