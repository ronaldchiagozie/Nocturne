/** Viewport height that respects mobile browser chrome (iOS Safari). */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 800;
  return window.visualViewport?.height ?? window.innerHeight;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
}

export function shouldDisableScrollPinning(): boolean {
  return isMobileViewport() || prefersReducedMotion();
}
