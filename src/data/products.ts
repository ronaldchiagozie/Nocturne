import type { BottleVariantId } from './bottleVariants';

export interface ScentMetric {
  value: number;
  label: string;
  min: string;
  max: string;
}

/** Bold readout aligned to indicator position on the min→max scale */
export function getMetricDisplayLabel(metric: ScentMetric): string {
  const value = Math.min(10, Math.max(0, metric.value));
  const t = value / 10;

  const minHour = metric.min.match(/(\d+)\s*Hours?/i);
  const maxHour = metric.max.match(/(\d+)\s*Hours?/i);

  if (minHour && maxHour && /Hours?/i.test(metric.max)) {
    const minH = parseInt(minHour[1], 10);
    const maxH = parseInt(maxHour[1], 10);

    if (value >= 10) return metric.max;
    if (value <= 0) return metric.min;

    const hours = minH + t * (maxH - minH);
    const rounded = Math.round(hours);

    if (rounded >= maxH) return metric.max;
    if (rounded <= minH) return metric.min;
    return `${rounded} Hours`;
  }

  if (t >= 0.95) return metric.max;
  if (t <= 0.05) return metric.min;
  return metric.label;
}

export const PRODUCTS = {
  no03: {
    id: 'no03',
    label: 'No. 03',
    title: 'Oud Resin',
    detail: 'Nocturne No. 03. Extrait de parfum. 50ml. Compounded to order.',
    price: '₦180,000',
    variantId: 'v04' satisfies BottleVariantId,
    image: '/bottle-03-oud-resin.png',
    notes: {
      top: 'Cracked black pepper, bitter orange rind',
      heart: 'Smoked cedarwood, dry timber',
      base: 'Aged oud resin, mineral ambergris',
    },
    character: 'Deep and resinous. Built for the hours when the city goes quiet.',
    wear: 'Two sprays. Wrists and collarbone. Lasts past dawn.',
    specs: {
      formulaNo: 'n-03',
      concentration: '30% extrait',
      mistVolume: '1.2ml',
      projectionLimit: 'rs-2.8m',
    },
    metrics: {
      sillage: { value: 7, label: 'Radiant', min: 'Intimate', max: 'Radiant' },
      longevity: { value: 9, label: '10 Hours', min: '6 Hours', max: '12 Hours+' },
      intensity: { value: 7, label: 'Bold', min: 'Quiet', max: 'Dominant' },
    },
  },
  no07: {
    id: 'no07',
    label: 'No. 07',
    title: 'Nocturne',
    detail: 'Nocturne No. 07. Extrait de parfum. 50ml. Compounded to order.',
    price: '₦180,000',
    variantId: 'v01' satisfies BottleVariantId,
    image: '/bottle-07-nocturne.png',
    notes: {
      top: 'Cracked black pepper',
      heart: 'Smoked cedarwood',
      base: 'Aged oud resin, warm amber',
    },
    character: 'Dark, textured, quietly dangerous. The flagship formulation.',
    wear: 'Worn after dark. No florals, no compliments — just presence.',
    specs: {
      formulaNo: 'n-07',
      concentration: '28% extrait',
      mistVolume: '1.2ml',
      projectionLimit: 'rs-3.0m',
    },
    metrics: {
      sillage: { value: 9, label: 'Radiant', min: 'Intimate', max: 'Radiant' },
      longevity: { value: 9, label: '11 Hours', min: '6 Hours', max: '12 Hours+' },
      intensity: { value: 8, label: 'Dominant', min: 'Quiet', max: 'Dominant' },
    },
  },
  no05: {
    id: 'no05',
    label: 'No. 05',
    title: 'Pepper & Cedar',
    detail: 'Nocturne No. 05. Extrait de parfum. 50ml. Cracked spice, cedarwood bark.',
    price: '₦180,000',
    variantId: 'v03' satisfies BottleVariantId,
    image: '/bottle-05-pepper-cedar.png',
    notes: {
      top: 'Cracked black pepper, pink peppercorn',
      heart: 'Cedarwood bark, dry vetiver',
      base: 'Smoked timber, soft musk',
    },
    character: 'Heat and structure. Spice up front, wood underneath.',
    wear: 'Closer to the skin. Intimate projection. Best for enclosed rooms.',
    specs: {
      formulaNo: 'n-05',
      concentration: '28% extrait',
      mistVolume: '1.2ml',
      projectionLimit: 'rs-1.8m',
    },
    metrics: {
      sillage: { value: 4, label: 'Intimate', min: 'Intimate', max: 'Radiant' },
      longevity: { value: 8, label: '8 Hours', min: '6 Hours', max: '12 Hours+' },
      intensity: { value: 6, label: 'Moderate', min: 'Quiet', max: 'Dominant' },
    },
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;

export const DEFAULT_PRODUCT_ID: ProductId = 'no07';

export function getProduct(id: ProductId) {
  return PRODUCTS[id];
}
