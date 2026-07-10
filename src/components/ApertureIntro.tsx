import { useEffect, useRef, useState } from 'react';

const INTRO_MS = 2000;
const SHUTTER_MS = 1200;
const FLASH_MS = 400;
const EASE_SHUTTER = 'cubic-bezier(0.85, 0, 0.15, 1)';

interface ApertureIntroProps {
  onRevealed?: () => void;
}

function Crosshair() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center mix-blend-overlay"
      aria-hidden
    >
      <span className="absolute h-px w-2 bg-[#D4A373]/30" />
      <span className="absolute w-px h-2 bg-[#D4A373]/30" />
    </div>
  );
}

export function ApertureIntro({ onRevealed }: ApertureIntroProps) {
  const [progress, setProgress] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShutterOpen, setIsShutterOpen] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const enteringRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadedRef = useRef(false);

  // ~3.5s intro. Video plays alongside, counter finishes before it gets boring
  useEffect(() => {
    const video = videoRef.current;
    let raf = 0;
    loadedRef.current = false;
    const start = performance.now();

    const finish = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      setProgress(100);
      setIsLoaded(true);
      cancelAnimationFrame(raf);
    };

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / INTRO_MS);
      const next = Math.min(100, Math.max(1, Math.round(t * 100)));
      setProgress(next);

      if (t >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    if (video) {
      video.loop = true;
      video.playbackRate = 1;
      video.play().catch(() => {
        /* muted autoplay usually allowed */
      });
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!isLoaded || enteringRef.current || isRevealed) return;

    const hold = window.setTimeout(() => {
      if (enteringRef.current) return;
      enteringRef.current = true;
      setIsShutterOpen(true);
      setShowFlash(true);
      window.setTimeout(() => setShowFlash(false), FLASH_MS);
      window.setTimeout(() => {
        setIsRevealed(true);
        onRevealed?.();
      }, SHUTTER_MS + 80);
    }, 320);

    return () => clearTimeout(hold);
  }, [isLoaded, isRevealed, onRevealed]);

  if (isRevealed) return null;

  const label = progress >= 100 ? '100' : String(progress).padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden border border-stone-900/30"
      style={{ backgroundColor: isShutterOpen ? 'transparent' : '#0D0B0A' }}
      role="dialog"
      aria-modal="true"
      aria-label="Nocturne gateway"
      data-loaded={isLoaded}
      data-revealed={isRevealed}
    >
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500 ${
          isShutterOpen ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Load timer: top right, Canela header weight */}
        <p
          className="pointer-events-none absolute top-6 right-6 sm:top-8 sm:right-8 md:top-10 md:right-12 z-30 font-serif text-[clamp(3.5rem,9vw,6.5rem)] font-bold tracking-[0.06em] tabular-nums text-[#ECE6D8]/90 leading-none"
          aria-live="polite"
        >
          {label}%
        </p>

        {/* Hero lens. Bottle sharp; only left/right frame edges dissolve */}
        <div
          className="relative overflow-hidden"
          style={{
            width: 'min(40vw, 440px)',
            height: 'min(68vh, 600px)',
            // Horizontal feather only. Keeps full bottle height
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)',
          }}
        >
          <video
            ref={videoRef}
            src="/clip5.mp4"
            className="absolute inset-0 h-full w-full scale-x-[1.06] object-contain object-center brightness-[1.1] contrast-[1.05]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          {/* Side curtains. Kill the sharp vertical clip frame */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-[18%]"
            style={{
              background:
                'linear-gradient(to right, #0D0B0A 0%, #0D0B0A 45%, rgba(13,11,10,0.65) 70%, transparent 100%)',
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[18%]"
            style={{
              background:
                'linear-gradient(to left, #0D0B0A 0%, #0D0B0A 45%, rgba(13,11,10,0.65) 70%, transparent 100%)',
            }}
            aria-hidden
          />
          {/* Tiny top kiss */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[5%]"
            style={{ background: 'linear-gradient(to bottom, #0D0B0A, transparent)' }}
            aria-hidden
          />
          {/* Bottom veil. Softens base + covers Kling AI watermark */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%]"
            style={{
              background:
                'linear-gradient(to top, #0D0B0A 0%, #0D0B0A 35%, rgba(13,11,10,0.75) 60%, transparent 100%)',
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-[8%] bottom-0 h-[14%] backdrop-blur-[6px]"
            style={{
              maskImage: 'linear-gradient(to top, #000 0%, #000 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 40%, transparent 100%)',
            }}
            aria-hidden
          />
          <Crosshair />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/2"
        style={{
          backgroundColor: '#0D0B0A',
          transition: `transform ${SHUTTER_MS}ms ${EASE_SHUTTER}`,
          transform: isShutterOpen ? 'translateY(-100%)' : 'translateY(0)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2"
        style={{
          backgroundColor: '#0D0B0A',
          transition: `transform ${SHUTTER_MS}ms ${EASE_SHUTTER}`,
          transform: isShutterOpen ? 'translateY(100%)' : 'translateY(0)',
        }}
        aria-hidden
      />

      <div
        className={`pointer-events-none absolute inset-0 z-40 bg-[#D4A373]/20 blur-2xl mix-blend-screen transition-opacity duration-400 ${
          showFlash ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden
      />
    </div>
  );
}
