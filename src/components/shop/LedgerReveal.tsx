import { useEffect, useRef, useState, type ReactElement } from 'react';
import { prefersReducedMotion } from '../../hooks/useMotionPreference';

export function useInViewOnce<T extends HTMLElement>(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen, rootMargin]);

  return { ref, seen };
}

const COUNT_MS = 760;

interface TickingNumberProps {
  value: number;
  active: boolean;

  delay?: number;
  format?: (n: number) => string;
}

export function TickingNumber({
  value,
  active,
  delay = 0,
  format,
}: TickingNumberProps): ReactElement {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }

    let frame = 0;
    let startedAt = 0;

    const step = (now: number) => {
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt - delay;

      if (elapsed < 0) {
        frame = requestAnimationFrame(step);
        return;
      }

      const p = Math.min(1, elapsed / COUNT_MS);

      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, value, delay]);

  return <>{format ? format(shown) : shown}</>;
}
