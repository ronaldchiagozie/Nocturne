import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images, type ImageKey } from '../assets/images';

gsap.registerPlugin(ScrollTrigger);

const SLIDES: { image: ImageKey; alt: string }[] = [
  { image: 'oud', alt: 'Oud resin' },
  { image: 'citrus', alt: 'Bitter orange peel' },
  { image: 'pepper', alt: 'Black pepper' },
];

interface RepeatedLinesScrollProps {
  line: string;
}

/**
 * Everyday^ device: identical line over three full-bleed photographs.
 * One pinned viewport — image crossfades on scroll, text stays overlaid.
 * Never stacks image above a separate text band.
 */
export function RepeatedLinesScroll({ line }: RepeatedLinesScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!trackRef.current || !pinRef.current) return;

      const layers = imageRefs.current.filter(Boolean) as HTMLDivElement[];
      if (layers.length === 0) return;

      gsap.set(layers, { opacity: 0 });
      gsap.set(layers[0], { opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          pin: pinRef.current,
          anticipatePin: 1,
        },
      });

      // Crossfade through three photographs across the scroll duration
      tl.to(layers[0], { opacity: 1, duration: 0.28, ease: 'none' }, 0);
      tl.to(layers[0], { opacity: 0, duration: 0.12, ease: 'none' }, 0.28);
      tl.to(layers[1], { opacity: 1, duration: 0.12, ease: 'none' }, 0.28);

      tl.to(layers[1], { opacity: 1, duration: 0.28, ease: 'none' }, 0.4);
      tl.to(layers[1], { opacity: 0, duration: 0.12, ease: 'none' }, 0.68);
      tl.to(layers[2], { opacity: 1, duration: 0.12, ease: 'none' }, 0.68);
      tl.to(layers[2], { opacity: 1, duration: 0.32, ease: 'none' }, 0.8);
    },
    { scope: trackRef },
  );

  return (
    <section ref={trackRef} className="relative h-[250vh] w-full">
      <div ref={pinRef} className="sticky top-0 h-screen w-screen overflow-hidden">
        {/* Full-bleed photographs — stacked, crossfade on scroll */}
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.image}
            ref={(el) => {
              imageRefs.current[idx] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: idx === 0 ? 1 : 0 }}
          >
            <img
              src={images[slide.image]}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(13,11,10,0.55) 0%, transparent 45%)',
              }}
            />
          </div>
        ))}

        {/* Same line, quiet, overlaid — never in a separate band */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 md:px-12 pb-20 md:pb-28 pointer-events-none">
          <p className="font-serif text-lg md:text-xl text-cream tracking-tight leading-snug max-w-md">
            {line}
          </p>
        </div>
      </div>
    </section>
  );
}

export function CloseSection({ line }: { line: string }) {
  return (
    <section className="w-full bg-cream px-5 sm:px-6 md:px-12 pt-14 pb-[max(7rem,calc(5rem+env(safe-area-inset-bottom)))] md:min-h-[70vh] md:flex md:flex-col md:justify-end md:pt-24 md:pb-32">
      <p className="font-serif text-[clamp(1.5rem,3.5vw,2.5rem)] text-canvas tracking-tight leading-snug max-w-lg">
        Nocturne No. 07. Limited batch.
      </p>
      <p className="font-serif text-base sm:text-lg md:text-xl text-canvas tracking-tight leading-snug max-w-md mt-8 md:mt-24">
        {line}
      </p>
    </section>
  );
}
