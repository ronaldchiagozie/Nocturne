/** Nine color-shift bottle renders — each gets a distinct vault glow */
export const BOTTLE_VARIANTS = [
  {
    id: 'v01',
    image: '/bottle-cream.png',
    glow: 'rgba(212, 163, 115, 0.55)',
    name: 'Amber Resin',
  },
  {
    id: 'v02',
    image: '/bottle-cream2.png',
    glow: 'rgba(180, 140, 95, 0.5)',
    name: 'Warm Oud',
  },
  {
    id: 'v03',
    image: '/bottle-cream3.png',
    glow: 'rgba(160, 120, 80, 0.52)',
    name: 'Smoked Cedar',
  },
  {
    id: 'v04',
    image: '/bottle-cream4.png',
    glow: 'rgba(140, 100, 70, 0.48)',
    name: 'Deep Resin',
  },
  {
    id: 'v05',
    image: '/bottle-cream5.png',
    glow: 'rgba(190, 150, 110, 0.5)',
    name: 'Golden Hour',
  },
  {
    id: 'v06',
    image: '/bottle-cream6.png',
    glow: 'rgba(130, 95, 75, 0.48)',
    name: 'Midnight Oud',
  },
  {
    id: 'v07',
    image: '/bottle-cream7.png',
    glow: 'rgba(170, 130, 90, 0.5)',
    name: 'Burnished Spice',
  },
  {
    id: 'v08',
    image: '/bottle-cream8.png',
    glow: 'rgba(150, 110, 85, 0.48)',
    name: 'Violet Noir',
  },
  {
    id: 'v09',
    image: '/bottle-cream9.png',
    glow: 'rgba(200, 160, 120, 0.52)',
    name: 'Pale Ember',
  },
] as const;

export type BottleVariantId = (typeof BOTTLE_VARIANTS)[number]['id'];

export function getBottleVariant(id: BottleVariantId) {
  return BOTTLE_VARIANTS.find((v) => v.id === id) ?? BOTTLE_VARIANTS[0];
}

/** Stable fallback for legacy orders missing variant metadata */
export function resolveVariantForOrder(orderId: string, productId?: string): BottleVariantId {
  if (productId === 'no03') return 'v04';
  if (productId === 'no05') return 'v03';
  if (productId === 'no07') return 'v01';

  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = (hash + orderId.charCodeAt(i) * (i + 1)) % BOTTLE_VARIANTS.length;
  }
  return BOTTLE_VARIANTS[hash].id;
}
