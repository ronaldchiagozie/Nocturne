import { useEffect, useRef, useState, type ReactElement } from 'react';
import { prefersReducedMotion } from '../../hooks/useMotionPreference';

/**
 * Reveal primitives for the collection grid.
 *
 * The grid deliberately does not fade or slide its cards in. They are already
 * in place; what moves is the ledger — each card's figures count up to their
 * real values as it comes into view, the way a batch sheet gets filled in.
 */

/** True from the first time the element enters the viewport, and stays true. */
export function useInViewOnce<T extends HTMLElement>(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el) return;

    // No observer (older Safari, jsdom) — show the finished state rather than
    // leaving the figures stuck on zero.
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
  /** Stagger, in ms — the ledger fills card by card rather than all at once. */
  delay?: number;
  format?: (n: number) => string;
}

/**
 * Counts up to `value` once `active`. Render it inside `tabular-nums` type so
 * the digits hold their column and nothing reflows while it runs.
 */
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
      // Decelerate into the real figure instead of stopping dead on it.
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, value, delay]);

  return <>{format ? format(shown) : shown}</>;
}
