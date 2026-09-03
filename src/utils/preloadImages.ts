
const CRITICAL_IMAGES = [
  '/bottle-07-nocturne.png',
  '/bottle-05-pepper-cedar.png',
  '/bottle-03-oud-resin.png',
] as const;

const deferred = new Set<string>();

export function preloadCriticalImages(): void {
  CRITICAL_IMAGES.forEach((src) => {
    if (deferred.has(src)) return;
    deferred.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });
}

export function preloadImages(urls: string[]): Promise<void> {
  const unique = [...new Set(urls)].filter(Boolean);
  if (unique.length === 0) return Promise.resolve();

  return Promise.all(
    unique.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}
