/** Eight color-shift bottles. Image paths match formulation number + name */
export const BOTTLE_VARIANTS = [
  {
    id: 'v01',
    image: '/bottle-07-nocturne.png',
    formulationNumber: '07',
    name: 'Nocturne',
    glow: 'rgba(212, 163, 115, 0.55)',
    productId: 'no07',
  },
  {
    id: 'v03',
    image: '/bottle-05-pepper-cedar.png',
    formulationNumber: '05',
    name: 'Pepper & Cedar',
    glow: 'rgba(160, 80, 70, 0.52)',
    productId: 'no05',
  },
  {
    id: 'v04',
    image: '/bottle-03-oud-resin.png',
    formulationNumber: '03',
    name: 'Oud Resin',
    glow: 'rgba(140, 120, 150, 0.48)',
    productId: 'no03',
  },
  {
    id: 'v05',
    image: '/bottle-11-golden-hour.png',
    formulationNumber: '11',
    name: 'Golden Hour',
    glow: 'rgba(190, 150, 110, 0.5)',
    productId: 'no07',
  },
  {
    id: 'v06',
    image: '/bottle-17-violet-noir.png',
    formulationNumber: '17',
    name: 'Violet Noir',
    glow: 'rgba(100, 70, 120, 0.48)',
    productId: 'no07',
  },
  {
    id: 'v07',
    image: '/bottle-19-emerald-night.png',
    formulationNumber: '19',
    name: 'Emerald Night',
    glow: 'rgba(80, 120, 90, 0.5)',
    productId: 'no05',
  },
  {
    id: 'v08',
    image: '/bottle-22-rose-dusk.png',
    formulationNumber: '22',
    name: 'Rose Dusk',
    glow: 'rgba(170, 120, 110, 0.48)',
    productId: 'no07',
  },
  {
    id: 'v09',
    image: '/bottle-08-pale-dawn.png',
    formulationNumber: '08',
    name: 'Pale Dawn',
    glow: 'rgba(200, 180, 130, 0.52)',
    productId: 'no07',
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
