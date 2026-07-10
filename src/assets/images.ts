/** Static assets served from /public */
export const images = {
  hero: '/bottle-cream.png',
  oud: '/oudwoodblock.png',
  citrus: '/bergamotcitrus.png',
  pepper: '/blackpepper.png',
  cedar: '/cedarwoodbark.png',
  ambergris: '/golden-brown.png',
  bottle: '/bottle-cream.png',
  /** Nocturne No. 07 — flagship amber bottle */
  no07: '/bottle-cream.png',
  /** Nocturne No. 05 — Pepper & Cedar */
  no05: '/bottle-cream3.png',
  /** Nocturne No. 03 */
  no03: '/bottle-cream4.png',
  bottleCream2: '/bottle-cream2.png',
  bottleCream3: '/bottle-cream3.png',
  bottleCream4: '/bottle-cream4.png',
  bottleCream5: '/bottle-cream5.png',
  bottleCream6: '/bottle-cream6.png',
  bottleCream7: '/bottle-cream7.png',
  bottleCream8: '/bottle-cream8.png',
  bottleCream9: '/bottle-cream9.png',
} as const;

export type ImageKey = keyof typeof images;
