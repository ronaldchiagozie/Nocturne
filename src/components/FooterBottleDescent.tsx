import { type RefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '../assets/images';
import { prefersReducedMotion, shouldDisableScrollPinning } from '../hooks/useMotionPreference';

gsap.registerPlugin(ScrollTrigger);

interface FooterBottleDescentProps {
  sourceRef: RefObject<HTMLDivElement | null>;
  landingRef: RefObject<HTMLDivElement | null>;
}

type Point = { x: number; y: number; scale: number; rotation: number };

const BASE_BOTTLE_HEIGHT = 380;
/** Scaling pivots on the bottle's base, not its middle, so it stands rather
 *  than swells in place. Keep it in sync with transformOrigin below. */
const BOTTLE_ORIGIN_Y = 0.92;

function getActiveBottleImg(source: HTMLElement): HTMLImageElement | null {
  const activeWrap = source.querySelector('[data-close-active-bottle="true"]');
  if (activeWrap) {
    return activeWrap.querySelector('img');
  }
  const imgs = source.querySelectorAll('img');
  for (const img of imgs) {
    const card = img.closest('[aria-hidden]');
    if (!card || card.getAttribute('aria-hidden') === 'false') return img;
  }
  return imgs[0] ?? null;
}

function measureViewport(el: HTMLElement): Point {
  const img = getActiveBottleImg(el) ?? el.querySelector('img') ?? el;
  const rect = img.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) {
    const box = el.getBoundingClientRect();
    return {
      x: box.left + box.width / 2,
      y: box.top + box.height * 0.38,
      scale: 0.72,
      rotation: 0,
    };
  }
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    scale: Math.max(0.45, rect.height / BASE_BOTTLE_HEIGHT),
    rotation: 0,
  };
}

function applyFixedBottle(
  el: HTMLElement,
  point: Point,
  opacity: number,
  rotateY = 0,
) {
  // The element is anchored by its centre but scaled about its base, which
  // drags the visual centre off the anchor by this much. Without the
  // correction the bottle never quite reaches the landing, and the handoff
  // crossfades two copies a few dozen pixels apart.
  const originShift = (BOTTLE_ORIGIN_Y - 0.5) * BASE_BOTTLE_HEIGHT * (point.scale - 1);

  gsap.set(el, {
    position: 'fixed',
    left: 0,
    top: 0,
    x: point.x,
    y: point.y + originShift,
    xPercent: -50,
    yPercent: -50,
    scale: point.scale,
    rotation: point.rotation,
    rotateY,
    opacity,
    visibility: opacity > 0.02 ? 'visible' : 'hidden',
    zIndex: 35,
    transformOrigin: `50% ${BOTTLE_ORIGIN_Y * 100}%`,
    force3D: true,
  });
}

function hideFly(fly: HTMLElement, shadow: HTMLElement | null) {
  gsap.set(fly, { opacity: 0, visibility: 'hidden' });
  if (shadow) gsap.set(shadow, { opacity: 0 });
}

function pointAtProgress(
  start: Point,
  mid: Point,
  end: Point,
  progress: number,
): { point: Point; rotateY: number } {
  if (progress < 0.1) {
    const t = progress / 0.1;
    return {
      point: {
        x: start.x,
        y: start.y,
        scale: gsap.utils.interpolate(start.scale, start.scale * 0.94, t),
        rotation: gsap.utils.interpolate(0, -3, t),
      },
      rotateY: gsap.utils.interpolate(0, -6, t),
    };
  }

  if (progress < 0.75) {
    const t = gsap.parseEase('power1.inOut')((progress - 0.1) / 0.65);
    return {
      point: {
        x: gsap.utils.interpolate(start.x, mid.x, t),
        y: gsap.utils.interpolate(start.y, mid.y, t),
        scale: gsap.utils.interpolate(start.scale * 0.94, mid.scale, t),
        rotation: gsap.utils.interpolate(-3, mid.rotation, t),
      },
      rotateY: gsap.utils.interpolate(-6, 8, t),
    };
  }

  const t = gsap.parseEase('power2.out')(Math.min(1, (progress - 0.75) / 0.17));
  return {
    point: {
      x: gsap.utils.interpolate(mid.x, end.x, t),
      y: gsap.utils.interpolate(mid.y, end.y, t),
      scale: gsap.utils.interpolate(mid.scale, end.scale, t),
      rotation: gsap.utils.interpolate(mid.rotation, 0, t),
    },
    rotateY: gsap.utils.interpolate(8, 0, t),
  };
}

export function FooterBottleDescent({ sourceRef, landingRef }: FooterBottleDescentProps) {
  const flyRef = useRef<HTMLDivElement>(null);
  const flyImgRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const copyARef = useRef<HTMLParagraphElement>(null);
  const copyBRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const fly = flyRef.current;
      const source = sourceRef.current;
      const landing = landingRef.current;
      if (!fly || !source || !landing) return;

      hideFly(fly, shadowRef.current);

      if (prefersReducedMotion()) {
        landing.classList.add('footer-bottle-landing--settled');
        return;
      }

      if (shouldDisableScrollPinning()) {
        // Mobile has no scrubbed descent — pinning and scrubbing fight touch
        // scrolling. The bottle rises into the wordmark as the footer comes
        // into view instead: one observer, no scroll hijacking, and the footer
        // stops being a dead end on small screens.
        const arrival = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              landing.classList.add('footer-bottle-landing--settled');
              arrival.disconnect();
            }
          },
          { rootMargin: '0px 0px -15% 0px' },
        );
        arrival.observe(landing);
        return () => arrival.disconnect();
      }

      const closeSection = source.closest('section');
      if (!closeSection) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 769px)', () => {
        let lockedStart: Point | null = null;

        const syncFlyImage = () => {
          const sourceImg = getActiveBottleImg(source);
          if (sourceImg && flyImgRef.current && sourceImg.src) {
            flyImgRef.current.src = sourceImg.src;
          }
        };

        const reset = () => {
          lockedStart = null;
          hideFly(fly, shadowRef.current);
          source.style.opacity = '';
          landing.classList.remove('footer-bottle-landing--settled');
        };

        const st = ScrollTrigger.create({
          trigger: closeSection,
          start: 'bottom 72%',
          end: 'max',
          scrub: 1.15,
          invalidateOnRefresh: true,
          onRefresh: () => {
            lockedStart = null;
          },
          onLeave: () => {
            hideFly(fly, shadowRef.current);
            source.style.opacity = '0';
            landing.classList.add('footer-bottle-landing--settled');
            // Inherit the bottle that actually flew, not whichever one the
            // carousel happens to be showing by now.
            const landingImg = landing.querySelector('img');
            if (landingImg && flyImgRef.current) landingImg.src = flyImgRef.current.src;
          },
          onEnterBack: () => {
            landing.classList.remove('footer-bottle-landing--settled');
            source.style.opacity = '1';
          },
          onLeaveBack: reset,
          onUpdate: (self) => {
            if (!self.isActive) {
              hideFly(fly, shadowRef.current);
              return;
            }

            const p = self.progress;

            // Lock the bottle's identity at launch alongside its geometry. The
            // carousel keeps rotating underneath, and re-reading it every frame
            // made the bottle change variant mid-descent.
            if (lockedStart === null || p < 0.02) {
              lockedStart = measureViewport(source);
              syncFlyImage();
            }

            const end = measureViewport(landing);
            const start = lockedStart;
            const mid: Point = {
              x: (start.x + end.x) / 2,
              y: start.y + (end.y - start.y) * 0.48,
              scale: (start.scale + end.scale) * 0.58,
              rotation: 5,
            };

            const { point, rotateY } = pointAtProgress(start, mid, end, p);
            const opacity =
              p < 0.03 ? p / 0.03 : p > 0.95 ? Math.max(0, 1 - (p - 0.95) / 0.035) : 1;

            applyFixedBottle(fly, point, opacity, rotateY);
            source.style.opacity = p < 0.08 ? String(Math.max(0, 1 - p / 0.08)) : '0';

            if (shadowRef.current) {
              gsap.set(shadowRef.current, {
                position: 'fixed',
                left: 0,
                top: 0,
                x: point.x,
                y: point.y + 16 * point.scale,
                xPercent: -50,
                yPercent: -50,
                opacity: opacity * 0.32,
                scale: point.scale * 0.9,
                visibility: opacity > 0.02 ? 'visible' : 'hidden',
              });
            }

            if (copyARef.current) {
              const aIn = gsap.utils.clamp(0, 1, (p - 0.15) / 0.12);
              const aOut = gsap.utils.clamp(0, 1, 1 - (p - 0.38) / 0.1);
              gsap.set(copyARef.current, { opacity: aIn * aOut, y: (1 - aIn) * 14 });
            }
            if (copyBRef.current) {
              const bIn = gsap.utils.clamp(0, 1, (p - 0.42) / 0.12);
              const bOut = gsap.utils.clamp(0, 1, 1 - (p - 0.68) / 0.1);
              gsap.set(copyBRef.current, { opacity: bIn * bOut, y: (1 - bIn) * 14 });
            }
            if (lineRef.current) {
              gsap.set(lineRef.current, {
                transform: `translate(0, -50%) scaleX(${gsap.utils.clamp(0, 1, (p - 0.08) / 0.75)})`,
                opacity:
                  gsap.utils.clamp(0, 1, (p - 0.08) / 0.2) *
                  gsap.utils.clamp(0, 1, 1 - (p - 0.88) / 0.08),
              });
            }

            landing.classList.toggle('footer-bottle-landing--settled', p > 0.95);
            if (p > 0.95 && flyImgRef.current) {
              const landingImg = landing.querySelector('img');
              if (landingImg && landingImg.src !== flyImgRef.current.src) {
                landingImg.src = flyImgRef.current.src;
              }
            }
          },
        });

        return () => {
          st.kill();
          reset();
        };
      });

      return () => mm.revert();
    },
    { scope: scopeRef, dependencies: [sourceRef, landingRef] },
  );

  return (
    <div ref={scopeRef} className="footer-bottle-descent-scope hidden md:contents">
      <div ref={flyRef} className="footer-bottle-fly" aria-hidden>
        <img
          ref={flyImgRef}
          src={images.no07}
          alt=""
          width={671}
          height={1200}
          className="footer-bottle-fly-img h-[380px] w-auto object-contain object-bottom"
          decoding="async"
        />
      </div>
      <div ref={shadowRef} className="footer-bottle-fly-shadow" aria-hidden />

      {/* Ambient copy — fixed, driven by the same scroll scrub */}
      <div className="footer-bottle-descent-copy pointer-events-none hidden md:block fixed inset-0 z-[30]">
        <div
          ref={lineRef}
          className="absolute left-[9%] lg:left-[12%] top-[47%] h-px w-[min(20rem,26vw)] origin-left bg-canvas/[0.09]"
          style={{ opacity: 0, transform: 'translate(0, -50%) scaleX(0)' }}
        />
        <p
          ref={copyARef}
          className="absolute left-[9%] lg:left-[12%] top-[38%] font-serif text-[clamp(1.25rem,2.2vw,1.85rem)] text-canvas/80 tracking-tight text-left max-w-[20rem]"
          style={{ opacity: 0 }}
        >
          Every batch has a last pour.
        </p>
        <p
          ref={copyBRef}
          className="absolute left-[9%] lg:left-[12%] top-[53%] font-body-italic italic text-base text-taupe-muted text-left max-w-[18rem]"
          style={{ opacity: 0 }}
        >
          Restock at Lagos midnight.
        </p>
      </div>
    </div>
  );
}
