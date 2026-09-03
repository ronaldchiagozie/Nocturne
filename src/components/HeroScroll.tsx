import { useEffect, useRef, useState, type Ref } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '../assets/images';
import { FORMULATION_COUNT_WORD, ADDITIONAL_FORMULATION_COUNT_WORD } from '../data/brand';
import { PRODUCTS, ProductId } from '../data/products';
import type { CheckoutOverride } from '../types';
import { preloadImages } from '../utils/preloadImages';
import { buildCheckoutOverride } from '../utils/productDisplay';
import { useStore } from '../context/StoreContext';
import { useAddToCart } from '../hooks/useAddToCart';
import {
  isHomeScrollRestorePending,
  readScrollY,
  restoreHomeScrollPosition,
} from '../hooks/useLenis';
import { prefersReducedMotion, shouldDisableScrollPinning } from '../hooks/useMotionPreference';

gsap.registerPlugin(ScrollTrigger);

interface HeroScrollProps {
  onOpenDistiller?: () => void;
  onOpenProductDetail?: (productId: ProductId, override?: CheckoutOverride) => void;

  scrollReady?: boolean;
}

const CARD_ORDER: ProductId[] = ['no03', 'no07', 'no05'];

const CARDS = CARD_ORDER.map((id) => {
  const product = PRODUCTS[id];
  return {
    productId: id,
    variantId: product.variantId,
    label: product.label,
    title: product.title,
    detail: product.detail,
    image: images[id === 'no03' ? 'no03' : id === 'no05' ? 'no05' : 'no07'],
    imageAlt: `Nocturne ${product.label} ${product.title} extrait de parfum bottle`,
    price: product.price,
  };
});

function cardOverride(card: (typeof CARDS)[number]): CheckoutOverride {
  return buildCheckoutOverride({
    productId: card.productId,
    label: card.label,
    title: card.title,
    image: card.image,
    variantId: card.variantId,
  });
}

type HeroCard = (typeof CARDS)[number];

const HERO_APPROACH_LIFT = 165;

const MOBILE_ORBIT_RX_VW = 38;

const MOBILE_ORBIT_RY_VH = 30;

function orbitOffset(thetaRad: number) {
  const sin = Math.sin(thetaRad);
  const cos = Math.cos(thetaRad);
  return { x: cos * MOBILE_ORBIT_RX_VW, y: sin * MOBILE_ORBIT_RY_VH, sin };
}

function focusWeights(cardCount: number, angleDeg: number, stepDeg: number) {
  const raw = Array.from({ length: cardCount }, (_, i) => {
    const { x, y } = orbitOffset(((angleDeg + i * stepDeg) * Math.PI) / 180);
    return Math.exp(-Math.hypot(x, y) / 16);
  });
  const sum = raw.reduce((total, value) => total + value, 0) || 1;
  return raw.map((value) => value / sum);
}

function heroCrossfadeOpacities(weights: number[]): number[] {
  const ranked = weights
    .map((weight, index) => ({ weight, index }))
    .sort((a, b) => b.weight - a.weight);
  const primary = ranked[0];
  const secondary = ranked[1];
  if (!primary) return weights.map(() => 0);
  if (!secondary || primary.weight > 0.9) {
    return weights.map((_, index) => (index === primary.index ? 1 : 0));
  }
  const blendTotal = primary.weight + secondary.weight;
  return weights.map((_, index) => {
    if (index === primary.index) return primary.weight / blendTotal;
    if (index === secondary.index) return secondary.weight / blendTotal;
    return 0;
  });
}

function MobileHeroOrbit({
  cards,
  onOpenProduct,
}: {
  cards: HeroCard[];
  onOpenProduct?: (productId: ProductId, override?: CheckoutOverride) => void;
}) {
  const stepDeg = 360 / cards.length;
  const initialWeights = cards.map((_, i) => (i === 1 ? 1 : 0));

  const angleRef = useRef(0);
  const weightsRef = useRef<number[]>(initialWeights);
  const heroRefs = useRef<(HTMLImageElement | null)[]>([]);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbLabelRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const [featuredIndex, setFeaturedIndex] = useState(1);
  const featuredIndexRef = useRef(1);
  const reduced = prefersReducedMotion();

  const thumbTransform = (i: number, angle: number, focus: number) => {
    const { x, y } = orbitOffset(((angle + i * stepDeg) * Math.PI) / 180);
    const scale = Math.max(0.72, 1 - focus * 0.28);
    return `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) scale(${scale})`;
  };

  useEffect(() => {
    if (reduced) return;

    let raf = 0;
    const step = () => {
      angleRef.current += 0.34;
      const angle = angleRef.current;

      const target = focusWeights(cards.length, angle, stepDeg);
      const smooth = target.map(
        (weight, i) => weightsRef.current[i] + (weight - weightsRef.current[i]) * 0.07,
      );
      weightsRef.current = smooth;

      const opacities = heroCrossfadeOpacities(smooth);

      for (let i = 0; i < cards.length; i += 1) {
        const hero = heroRefs.current[i];
        if (hero) hero.style.opacity = String(opacities[i]);

        const focus = smooth[i];
        const thumb = thumbRefs.current[i];
        if (thumb) {
          const { sin } = orbitOffset(((angle + i * stepDeg) * Math.PI) / 180);
          thumb.style.transform = thumbTransform(i, angle, focus);
          thumb.style.opacity = String(Math.max(0.28, 0.92 - focus * 0.72));
          thumb.style.zIndex = sin > 0.15 ? '1' : '12';
        }

        const label = thumbLabelRefs.current[i];
        if (label) label.style.opacity = String(Math.max(0.35, 1 - focus * 0.55));
      }

      let leader = 0;
      for (let i = 1; i < opacities.length; i += 1) {
        if (opacities[i] > opacities[leader]) leader = i;
      }
      if (leader !== featuredIndexRef.current) {
        featuredIndexRef.current = leader;
        setFeaturedIndex(leader);
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced, cards, stepDeg]);

  const featured = cards[featuredIndex];

  return (
    <div
      data-mobile-hero-bottle
      className="md:hidden absolute inset-x-0 z-[20]"
      style={{
        top: 'max(4.5rem, calc(env(safe-area-inset-top) + 3.25rem))',
        bottom: 'max(4.5rem, calc(env(safe-area-inset-bottom) + 3.25rem))',
      }}
    >
      <div
        className="absolute left-1/2 top-[51%] h-0 w-0 pointer-events-none z-[10]"
        aria-hidden
      >
        {cards.map((card, i) => (
          <button
            key={card.label}
            ref={(el) => {
              thumbRefs.current[i] = el;
            }}
            type="button"
            onClick={() => onOpenProduct?.(card.productId, cardOverride(card))}
            className="absolute left-0 top-0 pointer-events-auto flex flex-col items-center cursor-pointer active:scale-95 will-change-transform"
            style={{
              transform: thumbTransform(i, 0, initialWeights[i]),
              opacity: Math.max(0.28, 0.92 - initialWeights[i] * 0.72),
              zIndex: 12,
            }}
            aria-label={`${card.label} ${card.title}`}
          >
            <span className="flex h-[3.25rem] w-[2.75rem] items-end justify-center rounded-sm border border-canvas/[0.08] bg-cream/60 shadow-[0_8px_24px_rgba(13,11,10,0.06)]">
              <img
                src={card.image}
                alt=""
                className="h-[2.85rem] w-auto max-w-[2.35rem] object-contain object-bottom"
                loading="lazy"
                decoding="async"
              />
            </span>
            <p
              ref={(el) => {
                thumbLabelRefs.current[i] = el;
              }}
              className="font-mono text-[7px] uppercase tracking-[0.14em] text-taupe-muted mt-1.5 whitespace-nowrap"
              style={{ opacity: Math.max(0.35, 1 - initialWeights[i] * 0.55) }}
            >
              {card.label}
            </p>
          </button>
        ))}
      </div>

      <div className="absolute inset-0 z-[20] flex flex-col items-center justify-center pointer-events-none px-6">
        <div className="relative h-[min(320px,46dvh)] w-full max-w-[72vw] flex items-end justify-center">
          {cards.map((card, i) => (
            <img
              key={card.label}
              ref={(el) => {
                heroRefs.current[i] = el;
              }}
              src={card.image}
              alt={i === featuredIndex ? card.imageAlt : ''}
              aria-hidden={i !== featuredIndex}
              width={671}
              height={1200}
              className="mobile-hero-bottle-img absolute bottom-0 h-[min(320px,46dvh)] w-auto max-w-[72vw] object-contain object-bottom will-change-[opacity]"
              style={{ opacity: initialWeights[i] }}
              loading="eager"
              decoding="async"
              fetchPriority={i === 1 ? 'high' : 'low'}
            />
          ))}
        </div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-taupe-muted mt-3 transition-opacity duration-500">
          {featured.label} · {featured.title}
        </p>
      </div>
    </div>
  );
}

function MobileLedgerRow({
  card,
  onOpen,
}: {
  card: (typeof CARDS)[number];
  onOpen: () => void;
}) {
  const { add } = useAddToCart();
  const { getStock, getAvailable } = useStore();
  const bottleRef = useRef<HTMLImageElement>(null);
  const stock = getStock(card.productId);
  const left = getAvailable(card.productId) ?? 0;
  const soldOut = left === 0;
  const override = cardOverride(card);

  return (
    <article
      onClick={onOpen}
      className="mobile-ledger-row group flex items-center gap-3.5 sm:gap-4 py-5 cursor-pointer active:opacity-80 transition-opacity duration-200"
    >
      <div className="relative h-[5.75rem] w-[4.5rem] shrink-0 flex items-end justify-center">
        <img
          ref={bottleRef}
          src={card.image}
          alt={card.imageAlt}
          className="h-[5.25rem] w-auto max-w-full object-contain object-bottom"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-sans text-[9px] uppercase tracking-[0.22em] text-taupe-muted">
          {card.label}
        </p>
        <h3 className="font-serif text-[1.2rem] text-canvas tracking-tight leading-snug mt-1">
          {card.title}
        </h3>
        <p className="font-body-italic italic text-[12px] text-taupe-muted leading-relaxed font-light mt-1.5 line-clamp-2">
          {card.detail}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] tabular-nums text-canvas">{card.price}</p>
          {stock && (
            <p className="font-mono text-[8px] tracking-[0.12em] text-taupe-muted/75 uppercase">
              {soldOut ? 'Sold out' : `${left} left`}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={soldOut}
        onClick={(e) => {
          e.stopPropagation();
          add(card.productId, { override, from: bottleRef.current });
        }}
        className="pointer-events-auto shrink-0 font-sans text-[9px] uppercase tracking-[0.18em] bg-canvas text-cream px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-full hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {soldOut ? 'Sold out' : 'Add'}
      </button>
    </article>
  );
}

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
  checkoutOverride,
}: {
  price: string;
  productId: ProductId;
  checkoutOverride?: CheckoutOverride;
}) {
  const { add } = useAddToCart();
  const { getStock, getAvailable } = useStore();
  const stock = getStock(productId);
  const left = getAvailable(productId) ?? 0;
  const soldOut = left === 0;

  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] tabular-nums text-canvas">{price}</p>
        {stock && (
          <p className="font-mono text-[8px] tracking-[0.1em] text-taupe-muted/80 mt-1 uppercase">
            {soldOut ? 'Sold out today' : `${left} left`}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={soldOut}
        onClick={(e) => {
          e.stopPropagation();
          add(productId, { override: checkoutOverride, from: e.currentTarget });
        }}
        className="pointer-events-auto font-sans text-[9px] uppercase tracking-[0.2em] bg-canvas text-cream px-5 py-2.5 min-h-[44px] inline-flex items-center rounded-full hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {soldOut ? 'Sold out' : 'Add to cart'}
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
  body?: string;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <div
      className={`max-w-sm md:max-w-md pointer-events-none select-none ${
        align === 'right' ? 'text-right ml-auto' : 'text-left'
      } ${className}`}
    >
      <h2 className="font-serif text-[clamp(1.5rem,5.5vw,2rem)] text-canvas tracking-tight leading-snug">
        {title}
      </h2>
      {body ? (
        <p className="font-body-italic italic text-[0.9375rem] md:text-base text-taupe-muted leading-relaxed font-light mt-4 md:mt-8">
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function HeroScroll({
  onOpenDistiller,
  onOpenProductDetail,
  scrollReady = true,
}: HeroScrollProps) {
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
      if (!scrollReady || !containerRef.current || !bottleRef.current || !bottleAnimRef.current) {
        return;
      }

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
      let syncDesktopHero: (() => void) | null = null;
      let syncMobileHero: (() => void) | null = null;

      const refreshMetrics = () => {
        landing = measureLanding();
        driftX = measureDriftRight();
      };
      refreshMetrics();

      const mobileMq = window.matchMedia('(max-width: 768px)');

      const ensurePinVisible = () => {
        if (bottleRef.current) bottleRef.current.style.visibility = 'visible';
      };

      const getHeroScrollProgress = () => {
        const container = containerRef.current;
        if (!container) return 0;
        let scrollY = readScrollY();
        if (isHomeScrollRestorePending()) {
          scrollY = Math.max(scrollY, restoreHomeScrollPosition());
        }
        const range = Math.max(1, container.offsetHeight - window.innerHeight);
        return (scrollY - container.offsetTop) / range;
      };

      const savedRestoreY = isHomeScrollRestorePending() ? restoreHomeScrollPosition() : 0;
      const deepRestore = savedRestoreY > window.innerHeight * 1.5;
      const initialProgress = getHeroScrollProgress();
      const startLanded = !mobileMq.matches && (initialProgress > 0.55 || deepRestore);

      ensurePinVisible();
      gsap.set(bottleAnimRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: startLanded ? 0 : 1,
        rotation: 0,
        rotateY: 0,
        transformOrigin: '50% 50%',
        force3D: !mobileMq.matches,
        autoRound: false,
        transformPerspective: mobileMq.matches ? 0 : 1200,
      });

      if (!mobileMq.matches) {
        if (startLanded) {
          refreshMetrics();
          gsap.set(bottleAnimRef.current, {
            opacity: 0,
            x: landing.x,
            y: landing.y,
            scale: landing.scale,
            rotation: 0,
            rotateY: 0,
          });
          gsap.set(centerBottleImgRef.current, { opacity: 1 });
          gsap.set(leftCardRef.current, { xPercent: 0, opacity: 1 });
          gsap.set(rightCardRef.current, { xPercent: 0, opacity: 1 });
          gsap.set(centerCardRef.current, { opacity: 1 });
        } else {
          ensurePinVisible();
          gsap.set([leftCardRef.current, rightCardRef.current], { xPercent: 0, opacity: 0 });
          gsap.set(centerCardRef.current, { opacity: 0 });
          gsap.set(centerBottleImgRef.current, { opacity: 0 });
        }
      } else {
        gsap.set([leftCardRef.current, rightCardRef.current, centerCardRef.current], {
          opacity: 1,
          clearProps: 'xPercent',
        });
        gsap.set(centerBottleImgRef.current, { opacity: 1 });
      }

      if (mobileMq.matches && deepRestore) {
        gsap.set(bottleAnimRef.current, { opacity: 0 });
      }

      if (prefersReducedMotion()) {
        gsap.set([leftCardRef.current, rightCardRef.current, centerCardRef.current], { opacity: 1 });
        gsap.set(centerBottleImgRef.current, { opacity: 1 });
        if (!shouldDisableScrollPinning()) {
          gsap.set(bottleAnimRef.current, { opacity: 0 });
        }
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
            pinType: 'transform',
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefresh: refreshMetrics,
          },
        });

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

        tl.to(bottleAnimRef.current, {
          x: driftX,
          y: 0,
          scale: 0.9,
          rotation: 9,
          rotateY: -12,
          ease: 'none',
          duration: 1,
        });

        tl.call(refreshMetrics, [], 1.95);

        tl.to(
          bottleAnimRef.current,
          {
            x: () => landing.x,
            y: () => landing.y - HERO_APPROACH_LIFT,
            scale: () => landing.scale * 1.16,
            rotation: 0,
            rotateY: 0,
            ease: 'power2.inOut',
            duration: 0.46,
          },
          2.0,
        );

        tl.to(
          bottleAnimRef.current,
          {
            y: () => landing.y,
            scale: () => landing.scale,
            ease: 'power2.out',
            duration: 0.62,
          },
          2.46,
        );

        tl.to(centerCardRef.current, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 2.36);
        tl.fromTo(
          leftCardRef.current,
          { xPercent: -115, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
          2.42,
        );
        tl.fromTo(
          rightCardRef.current,
          { xPercent: 115, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
          2.42,
        );

        tl.to(bottleAnimRef.current, { ease: 'none', duration: 0.45 });
        tl.to(bottleAnimRef.current, { opacity: 0, ease: 'none', duration: 0.08 }, 3.42);
        tl.to(centerBottleImgRef.current, { opacity: 1, ease: 'none', duration: 0.08 }, 3.42);
        tl.to(bottleAnimRef.current, { ease: 'none', duration: 0.18 });

        const forceDesktopLandedState = () => {
          refreshMetrics();
          gsap.set(bottleAnimRef.current, {
            opacity: 0,
            x: landing.x,
            y: landing.y,
            scale: landing.scale,
            rotation: 0,
            rotateY: 0,
          });
          gsap.set(centerBottleImgRef.current, { opacity: 1 });
          gsap.set(leftCardRef.current, { xPercent: 0, opacity: 1 });
          gsap.set(rightCardRef.current, { xPercent: 0, opacity: 1 });
          gsap.set(centerCardRef.current, { opacity: 1 });
        };

        const syncHeroToScroll = () => {
          refreshMetrics();
          ScrollTrigger.refresh(true);

          if (tl.scrollTrigger) {
            tl.scrollTrigger.refresh();
            tl.scrollTrigger.update();
          }
          ScrollTrigger.getAll().forEach((trigger) => trigger.update());

          const progress = getHeroScrollProgress();
          if (progress > 0.55) {
            forceDesktopLandedState();
            return;
          }

          ensurePinVisible();
          gsap.set(centerBottleImgRef.current, { opacity: 0 });
          tl.scrollTrigger?.update();
        };

        syncDesktopHero = syncHeroToScroll;

        if (!isHomeScrollRestorePending()) {
          requestAnimationFrame(() => syncHeroToScroll());
        }
      });

      const syncMobileHeroToScroll = () => {
        ensurePinVisible();
        document.documentElement.classList.remove('hero-ledger-visible');
        syncMobileHero?.();
      };

      const finishHeroRestore = () => {
        if (window.matchMedia('(min-width: 769px)').matches) {
          syncDesktopHero?.();
        } else {
          syncMobileHeroToScroll();
        }
        document.documentElement.classList.remove('hero-restore-pending');
      };

      const onScrollRestored = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(finishHeroRestore);
        });
      };

      const onHeroReady = () => {
        if (isHomeScrollRestorePending()) return;
        finishHeroRestore();
      };

      window.addEventListener('nocturne-scroll-restored', onScrollRestored);
      window.addEventListener('nocturne-hero-ready', onHeroReady);

      mm.add('(max-width: 768px)', () => {
        gsap.set([leftCardRef.current, rightCardRef.current, centerCardRef.current], {
          opacity: 1,
          clearProps: 'xPercent',
        });
        gsap.set(centerBottleImgRef.current, { opacity: 1 });

        const chapter1 = containerRef.current?.querySelector('[data-hero-chapter="1"]');
        const mobileBottle = containerRef.current?.querySelector('[data-mobile-hero-bottle]');

        if (chapter1 && mobileBottle) {
          const mobileTl = gsap.timeline({
            scrollTrigger: {
              trigger: chapter1,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          mobileTl
            .to(mobileBottle, { opacity: 1, y: 0, ease: 'none', duration: 0.55 })
            .to(mobileBottle, {
              opacity: 0,
              y: -14,
              ease: 'none',
              duration: 0.35,
            });

          syncMobileHero = () => {
            mobileTl.scrollTrigger?.refresh();
            mobileTl.scrollTrigger?.update();
          };

          requestAnimationFrame(() => syncMobileHero?.());
        }
      });

      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          refreshMetrics();
          ScrollTrigger.refresh();
        }, 200);
      };

      window.addEventListener('resize', onResize);

      const heroImages = [images.hero, ...CARDS.map((card) => card.image)];
      preloadImages(heroImages).then(() => {
        refreshMetrics();
        ScrollTrigger.refresh();
        window.dispatchEvent(new CustomEvent('nocturne-hero-ready'));
      });

      requestAnimationFrame(() => {
        refreshMetrics();
        ScrollTrigger.refresh();
        window.dispatchEvent(new CustomEvent('nocturne-hero-ready'));
      });

      const onLoad = () => {
        refreshMetrics();
        ScrollTrigger.refresh();
      };
      window.addEventListener('load', onLoad);

      return () => {
        window.removeEventListener('load', onLoad);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('nocturne-scroll-restored', onScrollRestored);
        window.removeEventListener('nocturne-hero-ready', onHeroReady);
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        document.documentElement.classList.remove('hero-ledger-visible');
        document.documentElement.classList.remove('hero-restore-pending');
        syncDesktopHero = null;
        syncMobileHero = null;
        mm.revert();
      };
    },
    { scope: containerRef, dependencies: [scrollReady], revertOnUpdate: true },
  );

  return (
    <div ref={containerRef} data-hero-track className="relative w-full">
      <div
        ref={bottleRef}
        data-hero-object
        className="absolute top-0 left-0 z-30 hidden md:flex h-[100dvh] w-full items-center justify-center pointer-events-none hero-bottle-pin md:[perspective:1200px]"
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
            className="hero-bottle-image relative z-30 block h-[min(320px,44dvh)] sm:h-[min(460px,58dvh)] md:h-[min(520px,62vh)] w-auto object-contain"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>

      <section
        data-hero-chapter="1"
        className="relative min-h-[100dvh] md:min-h-[100dvh] w-full bg-cream-plate"
      >
        <div className="absolute inset-0 z-0 overflow-hidden bg-cream-plate" />

        <MobileHeroOrbit cards={CARDS} onOpenProduct={onOpenProductDetail} />

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
            BATCH · 001-NG
          </p>
          <p className="absolute right-4 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 font-mono text-[9px] sm:text-[10px] tracking-widest text-neutral-400 [writing-mode:vertical-rl] hidden sm:block">
            EXTRAIT DE PARFUM · 50ML
          </p>

          <HeroEditorial
            title="After dark."
            body="Cracked pepper up front, smoked cedar through the heart, aged oud in the dry-down. Built for presence, not compliments."
            align="right"
            className="absolute right-6 md:right-12 top-[20%] md:top-[24%] lg:top-[28%] hidden md:block"
          />

          <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 px-4">
          </div>
        </div>
      </section>

      <section
        data-hero-chapter="2"
        className="relative w-full bg-cream-plate flex flex-col justify-end px-5 sm:px-6 md:px-12 pt-12 pb-14 sm:pb-20 md:min-h-[100dvh] md:pt-0 md:pb-36"
      >
        <p className="pointer-events-none select-none absolute right-5 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 font-mono text-[9px] sm:text-[10px] tracking-widest text-neutral-400 [writing-mode:vertical-rl] z-[20] hidden sm:block">
          EXTRAIT DE PARFUM · 50ML
        </p>

        <HeroEditorial
          title="Compounded to order."
          body={`No. 03, 05, and 07, plus ${ADDITIONAL_FORMULATION_COUNT_WORD} more on the ledger. Each extrait distilled for a different hour, a different intent.`}
          align="right"
          className="absolute right-6 md:right-12 top-[18%] md:top-[22%] lg:top-[26%] z-[20] hidden md:block"
        />

        <div className="relative z-[20] max-w-xl">
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-canvas tracking-tight leading-snug">
            Worn after dark.
          </h1>
          <p className="font-body-italic italic text-sm md:text-base text-taupe-muted leading-relaxed font-light max-w-md mt-6 md:mt-10">
            A fragrance for the hours no one else sees. Dark, textured, quietly dangerous.
          </p>
        </div>
      </section>

      <section
        data-hero-chapter="3"
        className="relative w-full bg-cream-plate md:min-h-[200vh]"
      >

        <div className="max-md:hidden sticky top-0 flex h-screen w-full flex-col items-center justify-center px-8 lg:px-12">
          <div
            ref={cardsGridRef}
            className="hero-cards-grid relative w-full max-w-6xl grid grid-cols-3 border border-neutral-300/80 bg-cream-plate z-20 overflow-hidden"
          >
            <article
              ref={leftCardRef}
              onClick={() => onOpenProductDetail?.(CARDS[0].productId, cardOverride(CARDS[0]))}
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
              <CardFooter
                price={CARDS[0].price}
                productId={CARDS[0].productId}
                checkoutOverride={cardOverride(CARDS[0])}
              />
            </article>

            <article
              ref={centerCardRef}
              onClick={() => onOpenProductDetail?.(CARDS[1].productId, cardOverride(CARDS[1]))}
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
              <CardFooter
                price={CARDS[1].price}
                productId={CARDS[1].productId}
                checkoutOverride={cardOverride(CARDS[1])}
              />
            </article>

            <article
              ref={rightCardRef}
              onClick={() => onOpenProductDetail?.(CARDS[2].productId, cardOverride(CARDS[2]))}
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
              <CardFooter
                price={CARDS[2].price}
                productId={CARDS[2].productId}
                checkoutOverride={cardOverride(CARDS[2])}
              />
            </article>
          </div>

          {onOpenDistiller && (
            <div className="pointer-events-auto mt-12 w-full max-w-6xl text-center z-20">
              <button
                type="button"
                onClick={onOpenDistiller}
                className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors duration-300 cursor-pointer"
              >
                {`${FORMULATION_COUNT_WORD.charAt(0).toUpperCase()}${FORMULATION_COUNT_WORD.slice(1)} formulations exist. Discover yours →`}
              </button>
            </div>
          )}
        </div>

        <div className="md:hidden relative z-20 w-full px-5 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
          <div className="mb-6">
            <p className="font-sans text-[9px] uppercase tracking-[0.28em] text-taupe-muted">
              The collection
            </p>
            <h2 className="font-serif text-[1.65rem] text-canvas tracking-tight leading-snug mt-2">
              Three extrait de parfums.
            </h2>
          </div>

          <div className="divide-y divide-neutral-300/70 border-y border-neutral-300/70">
            {CARDS.map((card) => (
              <MobileLedgerRow
                key={card.label}
                card={card}
                onOpen={() => onOpenProductDetail?.(card.productId, cardOverride(card))}
              />
            ))}
          </div>

          {onOpenDistiller && (
            <div className="pointer-events-auto mt-8 pt-6 w-full text-center">
              <button
                type="button"
                onClick={onOpenDistiller}
                className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors duration-300 cursor-pointer"
              >
                {`${FORMULATION_COUNT_WORD.charAt(0).toUpperCase()}${FORMULATION_COUNT_WORD.slice(1)} formulations exist. Discover yours →`}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
