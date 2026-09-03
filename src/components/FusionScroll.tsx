import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { seekVideo } from '../hooks/useLenis';
import { prefersReducedMotion } from '../hooks/useMotionPreference';
import { images } from '../assets/images';

gsap.registerPlugin(ScrollTrigger);

const CANVAS = '#EFE9DF';

interface ProductCardProps {
  index: string;
  title: string;
  detail: string;
  image: string;
  price?: string;
  onAdd?: () => void;
}

function ProductCard({ index, title, detail, image, price, onAdd }: ProductCardProps) {
  return (
    <article className="w-full">
      <div className="aspect-[4/5] overflow-hidden bg-cream mb-8">
        <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <p className="font-mono text-[10px] tabular-nums text-taupe-muted mb-3">{index}</p>
      <h3 className="font-serif text-xl text-canvas tracking-tight leading-snug mb-3">{title}</h3>
      <p className="font-body-italic italic text-sm text-taupe-muted leading-relaxed font-light mb-8">
        {detail}
      </p>
      {price && (
        <>
          <p className="font-mono text-[11px] tabular-nums text-canvas mb-6">{price}</p>
          <button
            type="button"
            onClick={onAdd}
            className="font-sans text-[10px] uppercase tracking-[0.25em] text-canvas cursor-pointer"
          >
            [ add to cart ]
          </button>
        </>
      )}
    </article>
  );
}

export function FusionScrollMobile({ onCheckout }: { onCheckout?: () => void }) {
  return (
    <section className="block md:hidden bg-cream px-6 py-20 space-y-24">
      <ProductCard
        index="01"
        title="The base oud"
        detail="250g, aged resinous. The heavyweight anchor of No. 07."
        image={images.oud}
      />
      <ProductCard
        index="02"
        title="Cracked pepper & timber"
        detail="85g cracked spice. 60g dry cedar. Heat and structure."
        image={images.pepper}
      />
      <ProductCard
        index="03"
        title="The fusion"
        detail="Nocturne No. 07. Limited batch. Compounded to order."
        image={images.bottle}
        price="₦180,000"
        onAdd={onCheckout}
      />
    </section>
  );
}

export function FusionScrollDesktop({ onCheckout }: { onCheckout?: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const videoStackRef = useRef<HTMLDivElement>(null);
  const label1Ref = useRef<HTMLParagraphElement>(null);
  const label2Ref = useRef<HTMLParagraphElement>(null);
  const label3Ref = useRef<HTMLParagraphElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const [videosReady, setVideosReady] = useState(false);

  useEffect(() => {
    const videos = [video1Ref.current, video2Ref.current, video3Ref.current].filter(
      Boolean,
    ) as HTMLVideoElement[];

    const prepare = () => {
      videos.forEach((v) => {
        v.pause();
        v.currentTime = 0;
      });
      if (videos.every((v) => v.readyState >= 1)) {
        setVideosReady(true);
      }
    };

    videos.forEach((v) => {
      if (v.readyState >= 1) prepare();
      else v.addEventListener('loadedmetadata', prepare, { once: true });
    });
  }, []);

  useGSAP(
    () => {
      if (!trackRef.current || !pinRef.current || !videosReady) return;
      if (prefersReducedMotion()) return;

      const v1 = video1Ref.current;
      const v2 = video2Ref.current;
      const v3 = video3Ref.current;
      if (!v1 || !v2 || !v3) return;

      const d1 = v1.duration || 1;
      const d2 = v2.duration || 1;
      const d3 = v3.duration || 1;

      const scrubState = {
        t1: 0,
        t2: 0,
        t3: 0,
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          pin: pinRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          seekVideo(v1, scrubState.t1);
          seekVideo(v2, scrubState.t2);
          seekVideo(v3, scrubState.t3);
        },
      });

      tl.fromTo(scrubState, { t1: 0 }, { t1: d1, ease: 'none', duration: 0.3 }, 0);
      tl.fromTo(v1, { opacity: 1 }, { opacity: 1, duration: 0.3 }, 0);
      tl.set(v2, { opacity: 0 }, 0);
      tl.set(v3, { opacity: 0 }, 0);
      tl.fromTo(label1Ref.current, { opacity: 1 }, { opacity: 1, duration: 0.28 }, 0);
      tl.to(label1Ref.current, { opacity: 0, duration: 0.04 }, 0.28);

      tl.fromTo(scrubState, { t2: 0 }, { t2: d2, ease: 'none', duration: 0.3 }, 0.3);
      tl.to(v1, { opacity: 0, duration: 0.08, ease: 'power1.inOut' }, 0.3);
      tl.fromTo(v2, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: 'power1.inOut' }, 0.3);
      tl.fromTo(label2Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.32);
      tl.to(label2Ref.current, { opacity: 0, duration: 0.04 }, 0.58);

      tl.fromTo(scrubState, { t3: 0 }, { t3: d3, ease: 'none', duration: 0.25 }, 0.6);
      tl.to(v2, { opacity: 0, duration: 0.08, ease: 'power1.inOut' }, 0.6);
      tl.fromTo(v3, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: 'power1.inOut' }, 0.6);
      tl.fromTo(label3Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.62);
      tl.to(label3Ref.current, { opacity: 0, duration: 0.04 }, 0.82);

      tl.to(videoStackRef.current, { opacity: 0, duration: 0.12, ease: 'power2.inOut' }, 0.85);
      tl.to(finaleRef.current, { opacity: 1, duration: 0.12, ease: 'power2.inOut' }, 0.85);
      tl.fromTo(
        leftCardRef.current,
        { xPercent: -110, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.15, ease: 'power2.out' },
        0.86,
      );
      tl.fromTo(
        rightCardRef.current,
        { xPercent: 110, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.15, ease: 'power2.out' },
        0.86,
      );
      tl.fromTo(
        bottleRef.current,
        { yPercent: -18, scale: 0.88, opacity: 0 },
        { yPercent: 0, scale: 1, opacity: 1, duration: 0.15, ease: 'power2.out' },
        0.86,
      );
      tl.set(finaleRef.current, { pointerEvents: 'auto' }, 0.92);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: trackRef, dependencies: [videosReady] },
  );

  useEffect(() => {
    if (videosReady) ScrollTrigger.refresh();
  }, [videosReady]);

  const videoClass =
    'absolute inset-0 w-full h-full object-cover mix-blend-multiply';

  const videoZoom = {
    transform: 'translateZ(0) scale(1.28)',
    transformOrigin: 'center center',
  } as const;

  return (
    <section ref={trackRef} className="hidden md:block relative h-[400vh] bg-cream">
      <div
        ref={pinRef}
        className="relative h-[100dvh] w-full overflow-hidden"
        style={{ backgroundColor: CANVAS }}
      >
        <div ref={videoStackRef} className="absolute inset-0 z-0 overflow-hidden" style={{ backgroundColor: CANVAS }}>
          <video ref={video1Ref} src="/clip1.mp4" muted playsInline preload="auto" className={videoClass} style={videoZoom} />
          <video ref={video2Ref} src="/clip2.mp4" muted playsInline preload="auto" className={videoClass} style={{ ...videoZoom, opacity: 0 }} />
          <video ref={video3Ref} src="/clip3.mp4" muted playsInline preload="auto" className={videoClass} style={{ ...videoZoom, opacity: 0 }} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 78% 72% at 50% 48%, transparent 52%, ${CANVAS} 100%),
                linear-gradient(to right, ${CANVAS} 0%, transparent 8%, transparent 92%, ${CANVAS} 100%)
              `,
            }}
          />
        </div>

        <div className="absolute inset-0 z-10 flex items-center pointer-events-none pl-10 lg:pl-16">
          <p ref={label1Ref} className="absolute font-sans text-[11px] uppercase tracking-[0.28em] text-canvas">
            01 // THE BASE OUD
          </p>
          <p ref={label2Ref} className="absolute font-sans text-[11px] uppercase tracking-[0.28em] text-canvas opacity-0">
            02 // CRACKED PEPPER & TIMBER
          </p>
          <p ref={label3Ref} className="absolute font-sans text-[11px] uppercase tracking-[0.28em] text-canvas opacity-0">
            03 // THE FUSION
          </p>
        </div>

        <div
          ref={finaleRef}
          className="absolute inset-0 z-20 flex items-center justify-center opacity-0 pointer-events-none"
          style={{ backgroundColor: CANVAS }}
        >
          <div className="w-full max-w-6xl mx-auto px-8 lg:px-12 grid grid-cols-3 gap-6 lg:gap-10 items-end">
            <div ref={leftCardRef} className="opacity-0">
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-4">Collection</p>
              <h3 className="font-serif text-2xl lg:text-3xl text-canvas tracking-tight leading-snug mb-4">
                Nocturne
                <br />
                No. 07
              </h3>
              <p className="font-body-italic italic text-sm text-taupe-muted font-light leading-relaxed mb-10">
                Worn after dark. Compounded to order.
              </p>
              <p className="font-mono text-[12px] tabular-nums text-canvas mb-6">₦180,000</p>
              <button
                type="button"
                onClick={onCheckout}
                className="font-sans text-[10px] uppercase tracking-[0.25em] text-canvas hover:text-canvas/70 transition-colors cursor-pointer"
              >
                [ add to cart ]
              </button>
            </div>

            <div ref={bottleRef} className="flex justify-center items-end opacity-0">
              <img
                src={images.bottle}
                alt="Nocturne No. 07"
                className="h-[min(480px,58vh)] w-auto object-contain select-none"
                draggable={false}
              />
            </div>

            <div ref={rightCardRef} className="opacity-0 text-right">
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-taupe-muted mb-4">Batch</p>
              <h3 className="font-serif text-2xl lg:text-3xl text-canvas tracking-tight leading-snug mb-4">
                Limited
                <br />
                edition
              </h3>
              <p className="font-body-italic italic text-sm text-taupe-muted font-light leading-relaxed mb-10">
                50ml. One scent. Worn differently by everyone who wears it.
              </p>
              <p className="font-mono text-[12px] tabular-nums text-canvas mb-6">₦180,000</p>
              <button
                type="button"
                onClick={onCheckout}
                className="font-sans text-[10px] uppercase tracking-[0.25em] text-canvas hover:text-canvas/70 transition-colors cursor-pointer"
              >
                [ add to cart ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FusionScroll({ onCheckout }: { onCheckout?: () => void }) {
  return (
    <>
      <FusionScrollMobile onCheckout={onCheckout} />
      <FusionScrollDesktop onCheckout={onCheckout} />
    </>
  );
}
