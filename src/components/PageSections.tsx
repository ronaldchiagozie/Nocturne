import { useEffect, useRef, useState, type RefObject, type TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images, type ImageKey } from '../assets/images';
import { COLLECTION_ITEMS, type CollectionItem } from '../data/collection';
import type { ProductId } from '../data/products';
import { prefersReducedMotion } from '../hooks/useMotionPreference';

gsap.registerPlugin(ScrollTrigger);

const SLIDES: { image: ImageKey; alt: string }[] = [
  { image: 'oud', alt: 'Oud resin' },
  { image: 'citrus', alt: 'Bitter orange peel' },
  { image: 'pepper', alt: 'Black pepper' },
];

interface RepeatedLinesScrollProps {
  line: string;
}

export function RepeatedLinesScroll({ line }: RepeatedLinesScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!trackRef.current || !pinRef.current || !frameRef.current) return;

      const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[];
      if (layers.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(layers, { clearProps: 'all' });
        gsap.set(layers[0], { opacity: 1 });
        return;
      }

      const buildTimeline = () => {
        gsap.set(layers, { opacity: 0, yPercent: 0, scale: 1 });
        gsap.set(layers[0], { opacity: 1, yPercent: 0, scale: 1, zIndex: 3 });
        gsap.set(layers[1], { opacity: 0, yPercent: 10, scale: 1.04, zIndex: 2 });
        gsap.set(layers[2], { opacity: 0, yPercent: 18, scale: 1.08, zIndex: 1 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: trackRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          layers[0],
          { yPercent: -14, scale: 1.05, opacity: 0, ease: 'none', duration: 0.34 },
          0,
        );

        tl.fromTo(
          layers[1],
          { yPercent: 12, scale: 1.06, opacity: 0, zIndex: 2 },
          { yPercent: -6, scale: 1.02, opacity: 1, zIndex: 4, ease: 'none', duration: 0.34 },
          0.18,
        );
        tl.to(
          layers[1],
          { yPercent: -16, scale: 1.04, opacity: 0, zIndex: 2, ease: 'none', duration: 0.32 },
          0.52,
        );

        tl.fromTo(
          layers[2],
          { yPercent: 20, scale: 1.1, opacity: 0, zIndex: 1 },
          { yPercent: 0, scale: 1, opacity: 1, zIndex: 5, ease: 'none', duration: 0.38 },
          0.48,
        );
        tl.to(layers[2], { yPercent: -4, scale: 1.02, ease: 'none', duration: 0.14 }, 0.86);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      };

      return buildTimeline();
    },
    { scope: trackRef },
  );

  return (
    <section
      ref={trackRef}
      className="ingredient-parallax-track relative h-[360vh] w-full bg-cream border-t border-canvas/[0.06]"
    >
      <div
        ref={pinRef}
        className="sticky top-0 flex h-[100dvh] w-full items-center justify-center px-4 sm:px-6 md:px-10 lg:px-12"
      >
        <div
          ref={frameRef}
          className="ingredient-parallax-frame relative w-full max-w-[1770px] aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-[1.125rem] md:rounded-[1.375rem] lg:rounded-[1.5rem] shadow-[0_32px_80px_rgba(13,11,10,0.12)]"
        >
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.image}
              ref={(el) => {
                layerRefs.current[idx] = el;
              }}
              className="ingredient-parallax-layer absolute inset-0 overflow-hidden rounded-[inherit]"
              style={{ opacity: idx === 0 ? 1 : 0 }}
            >
              <img
                src={images[slide.image]}
                alt={slide.alt}
                className="ingredient-parallax-img h-[118%] w-full object-cover object-center will-change-transform"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          ))}

          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-[6]"
            style={{
              background:
                'linear-gradient(to top, rgba(13,11,10,0.62) 0%, rgba(13,11,10,0.08) 42%, transparent 68%)',
            }}
          />

          <div className="absolute inset-x-0 bottom-0 z-[7] px-6 sm:px-10 md:px-14 pb-8 sm:pb-10 md:pb-12 pointer-events-none">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-cream/55 mb-3 md:mb-4">
              Raw material · {SLIDES.length} notes
            </p>
            <p className="font-serif text-lg sm:text-xl md:text-2xl text-cream tracking-tight leading-snug max-w-md">
              {line}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const CLOSE_CAROUSEL_COUNT = 5;
const CLOSE_CAROUSEL_INTERVAL_MS = 4800;
const CLOSE_CAROUSEL_FADE_MS = 900;

function shuffleCollectionItems(items: CollectionItem[], count: number): CollectionItem[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function CloseCarouselCard({
  item,
  index,
  isActive,
  onOpenProduct,
  bottleClassName,
}: {
  item: CollectionItem;
  index: number;
  isActive: boolean;
  onOpenProduct?: (id: ProductId) => void;
  bottleClassName: string;
}) {
  return (
    <div
      aria-hidden={!isActive}
      className="absolute inset-0 flex flex-col items-center justify-end transition-[opacity,transform] ease-in-out"
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateY(0)' : 'translateY(10px)',
        transitionDuration: `${CLOSE_CAROUSEL_FADE_MS}ms`,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div
        className="relative w-full flex items-end justify-center min-h-[200px] sm:min-h-[240px] md:min-h-[280px] lg:min-h-[320px]"
        data-close-active-bottle={isActive ? 'true' : undefined}
      >
        <img
          src={item.image}
          alt={`Nocturne No. ${item.formulationNumber} ${item.name}`}
          className={bottleClassName}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
      <div className="w-full mt-5 md:mt-6 pt-5 md:pt-6 border-t border-canvas/10 space-y-2 text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-taupe-muted">
          No. {item.formulationNumber} · {item.name}
        </p>
        <p className="font-body-italic italic text-sm text-taupe-muted font-light leading-relaxed">
          Extrait de parfum · 50ml · compounded to order
        </p>
        {onOpenProduct ? (
          <button
            type="button"
            onClick={() => onOpenProduct(item.productId)}
            className="inline-block mt-3 font-sans text-[10px] uppercase tracking-[0.22em] text-canvas hover:text-canvas/70 transition-colors cursor-pointer min-h-[44px]"
          >
            View No. {item.formulationNumber} →
          </button>
        ) : (
          <Link
            to="/shop"
            className="inline-flex items-center justify-center mt-3 font-sans text-[10px] uppercase tracking-[0.22em] text-canvas hover:text-canvas/70 transition-colors min-h-[44px]"
          >
            View No. {item.formulationNumber} →
          </Link>
        )}
      </div>
    </div>
  );
}

function CloseSectionCarousel({
  className = '',
  onOpenProduct,
  bottleSourceRef,
}: {
  className?: string;
  onOpenProduct?: (id: ProductId) => void;
  bottleSourceRef?: RefObject<HTMLDivElement | null>;
}) {
  const [slides] = useState(() => shuffleCollectionItems(COLLECTION_ITEMS, CLOSE_CAROUSEL_COUNT));
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || slides.length <= 1) return;

    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setActiveIndex((current) => (current + 1) % slides.length);
    }, CLOSE_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [slides.length]);

  const goTo = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    pausedRef.current = true;
  };

  const onTouchEnd = (event: TouchEvent) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    pausedRef.current = false;
    if (startX == null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const delta = endX - startX;
    if (Math.abs(delta) < 36) return;

    if (delta < 0) goTo(activeIndex + 1);
    else goTo(activeIndex - 1);
  };

  const bottleClassName =
    'h-[min(220px,34dvh)] sm:h-[min(260px,38dvh)] md:h-[min(300px,36vh)] lg:h-[min(340px,40vh)] w-auto object-contain product-detail-bottle';

  return (
    <aside
      className={`mt-10 md:mt-0 flex flex-col items-center justify-end bg-cream-plate/70 border border-canvas/[0.06] px-6 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12 ${className}`}
      aria-label="Featured formulations"
      aria-live="polite"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          pausedRef.current = false;
        }
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={bottleSourceRef}
        className="relative w-full min-h-[19rem] sm:min-h-[21rem] md:min-h-[22rem] lg:min-h-[24rem]"
      >
        {slides.map((item, index) => (
          <CloseCarouselCard
            key={item.variantId}
            item={item}
            index={index}
            isActive={index === activeIndex}
            onOpenProduct={onOpenProduct}
            bottleClassName={bottleClassName}
          />
        ))}
      </div>
    </aside>
  );
}

export function CloseSection({
  line,
  onOpenDistiller,
  onOpenProduct,
  bottleSourceRef,
}: {
  line: string;
  onOpenDistiller?: () => void;
  onOpenProduct?: (id: ProductId) => void;
  bottleSourceRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="w-full bg-cream px-5 sm:px-6 md:px-12 lg:px-14 xl:px-16 pt-16 pb-16 sm:pt-24 sm:pb-20 md:pt-40 md:pb-28 lg:pt-52 lg:pb-32 xl:pt-60">
      <div className="mx-auto max-w-6xl md:grid md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] md:items-end md:gap-12 lg:gap-16 xl:gap-20">

        <div className="md:col-start-1 md:row-start-1 md:pb-2 lg:pb-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-taupe-muted mb-4 md:mb-5">
            Flagship extrait
          </p>
          <p className="font-serif text-[clamp(1.5rem,3.5vw,2.5rem)] text-canvas tracking-tight leading-snug max-w-lg">
            Nocturne No. 07. Limited batch.
          </p>
          <p className="font-serif text-base md:text-xl text-canvas tracking-tight leading-snug max-w-md mt-6 md:mt-10">
            {line}
          </p>
          <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              to="/shop"
              className="font-sans text-[10px] uppercase tracking-[0.22em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
            >
              Shop the collection →
            </Link>
            {onOpenDistiller && (
              <button
                type="button"
                onClick={onOpenDistiller}
                className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
              >
                Find your formulation →
              </button>
            )}
          </div>
        </div>

        <CloseSectionCarousel
          onOpenProduct={onOpenProduct}
          bottleSourceRef={bottleSourceRef}
          className="md:col-start-2 md:row-start-1"
        />
      </div>
    </section>
  );
}
