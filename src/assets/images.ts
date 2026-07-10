/** Static assets served from /public */
export const images = {
  hero: '/bottle-cream.png',
  oud: '/oudwoodblock.png',
  citrus: '/bergamotcitrus.png',
  pepper: '/blackpepper.png',
  cedar: '/cedarwoodbark.png',
  ambergris: '/golden-brown.png',
  bottle: '/bottle-cream.png',
  bottleCream2: '/bottle-cream2.png',
  bottleCream3: '/bottle-cream3.png',
  bottleCream4: '/bottle-cream4.png',
} as const;

export type ImageKey = keyof typeof images;
