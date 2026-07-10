import { useEffect, useRef, useState } from 'react';

const LOAD_MS = 2800;
const SHUTTER_MS = 1200;
const FLASH_MS = 400;
const EASE_SHUTTER = 'cubic-bezier(0.85, 0, 0.15, 1)';

interface ApertureIntroProps {
  onRevealed?: () => void;
}

/** Logarithmic ease — quick early ticks, decelerates into 100% */
function logProgress(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return Math.log1p(clamped * 9) / Math.log(10);
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

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / LOAD_MS;
      const next = Math.min(100, Math.max(1, Math.round(logProgress(t) * 99) + 1));
      setProgress(next);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      setProgress(100);
      setIsLoaded(true);
    };

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
    }, 420);

    return () => clearTimeout(hold);
  }, [isLoaded, isRevealed, onRevealed]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      /* muted autoplay is usually allowed */
    });
  }, []);

  if (isRevealed) return null;

  const pad = String(progress).padStart(2, '0');

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
        {/* Balanced hero lens — bottle fully exposed, breathing room around */}
        <div
          className="relative overflow-hidden"
          style={{
            width: 'min(56vw, 780px)',
            height: 'min(58vh, 560px)',
            WebkitMaskImage:
              'radial-gradient(ellipse 88% 84% at 50% 48%, #000 52%, transparent 80%)',
            maskImage: 'radial-gradient(ellipse 88% 84% at 50% 48%, #000 52%, transparent 80%)',
          }}
        >
          <video
            ref={videoRef}
            src="/clip4.mp4"
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center brightness-[1.1] contrast-[1.05]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow:
                'inset 0 0 36px 20px #0D0B0A, inset 0 0 64px 36px rgba(13,11,10,0.75)',
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ backgroundColor: 'rgba(212, 163, 115, 0.05)' }}
            aria-hidden
          />
          <Crosshair />
        </div>

        <p
          className="mt-8 font-mono text-[9px] tracking-[0.25em] text-[#ECE6D8]/55 uppercase"
          aria-live="polite"
        >
          Compiling Profile Matrix // [{pad}]%
        </p>
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
