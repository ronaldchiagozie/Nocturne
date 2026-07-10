import {
  BOTTLE_VARIANTS,
  BottleVariantId,
  getBottleVariant,
} from './bottleVariants';
import { ProductId } from './products';

export type DistillerHour = 'sunset' | 'midnight' | 'dawn';
export type DistillerEnvironment = 'smoked-cedar' | 'wet-concrete' | 'warm-amber';
export type DistillerIntent = 'quietly-dangerous' | 'radiating' | 'elusive';

export interface DistillerAnswers {
  hour: DistillerHour;
  environment: DistillerEnvironment;
  intent: DistillerIntent;
}

export interface DistillerResult {
  variantId: BottleVariantId;
  formulationNumber: string;
  formulationName: string;
  formulationLabel: string;
  productId: ProductId;
  log: string[];
  summary: string;
}

export const DISTILLER_QUESTIONS = [
  {
    id: 'hour' as const,
    title: 'The Hour',
    subtitle: 'When do you reach for a scent?',
    options: [
      { id: 'sunset' as const, label: 'Sunset', detail: 'Golden hour, transition, warmth fading' },
      { id: 'midnight' as const, label: 'Midnight', detail: 'After dark, city quiet, full depth' },
      { id: 'dawn' as const, label: 'Dawn', detail: 'First light, cool air, clean edges' },
    ],
  },
  {
    id: 'environment' as const,
    title: 'The Environment',
    subtitle: 'What surrounds you?',
    options: [
      { id: 'smoked-cedar' as const, label: 'Smoked Cedar', detail: 'Timber, hearth, dry wood resin' },
      { id: 'wet-concrete' as const, label: 'Wet Concrete', detail: 'Mineral, rain, urban cool' },
      { id: 'warm-amber' as const, label: 'Warm Amber', detail: 'Resin, skin, glowing heat' },
    ],
  },
  {
    id: 'intent' as const,
    title: 'The Intent',
    subtitle: 'How should it read on you?',
    options: [
      {
        id: 'quietly-dangerous' as const,
        label: 'Quietly Dangerous',
        detail: 'Close, controlled, unmistakable',
      },
      { id: 'radiating' as const, label: 'Radiating', detail: 'Present, warm, room-filling' },
      { id: 'elusive' as const, label: 'Elusive', detail: 'Near the skin, hard to place' },
    ],
  },
] as const;

const FORMULATION_NUMBERS: Record<BottleVariantId, string> = {
  v01: '07',
  v02: '11',
  v03: '05',
  v04: '03',
  v05: '12',
  v06: '14',
  v07: '09',
  v08: '17',
  v09: '19',
};

const VARIANT_TO_PRODUCT: Record<BottleVariantId, ProductId> = {
  v01: 'no07',
  v02: 'no07',
  v03: 'no05',
  v04: 'no03',
  v05: 'no07',
  v06: 'no03',
  v07: 'no05',
  v08: 'no07',
  v09: 'no07',
};

const ANSWER_INDEX: Record<string, number> = {
  sunset: 0,
  midnight: 1,
  dawn: 2,
  'smoked-cedar': 0,
  'wet-concrete': 1,
  'warm-amber': 2,
  'quietly-dangerous': 0,
  radiating: 1,
  elusive: 2,
};

const HOUR_LABELS: Record<DistillerHour, string> = {
  sunset: 'Sunset',
  midnight: 'Midnight',
  dawn: 'Dawn',
};

const ENV_LABELS: Record<DistillerEnvironment, string> = {
  'smoked-cedar': 'Smoked Cedar',
  'wet-concrete': 'Wet Concrete',
  'warm-amber': 'Warm Amber',
};

const INTENT_LABELS: Record<DistillerIntent, string> = {
  'quietly-dangerous': 'Quietly Dangerous',
  radiating: 'Radiating',
  elusive: 'Elusive',
};

/** S_profile = w1·Hour + w2·Environment + w3·Intent → maps to 1 of 9 variants */
export function distillMatch(answers: DistillerAnswers): DistillerResult {
  const w1 = 3;
  const w2 = 2;
  const w3 = 4;

  const hour = ANSWER_INDEX[answers.hour] ?? 0;
  const environment = ANSWER_INDEX[answers.environment] ?? 0;
  const intent = ANSWER_INDEX[answers.intent] ?? 0;

  const score = hour * w1 + environment * w2 + intent * w3;
  const variant = BOTTLE_VARIANTS[score % BOTTLE_VARIANTS.length];
  const formulationNumber = FORMULATION_NUMBERS[variant.id];
  const formulationName = variant.name;
  const formulationLabel = `No. ${formulationNumber} ${formulationName}`;

  const log = [
    `Parameter 01 — Hour: ${HOUR_LABELS[answers.hour]}`,
    `Parameter 02 — Environment: ${ENV_LABELS[answers.environment]}`,
    `Parameter 03 — Intent: ${INTENT_LABELS[answers.intent]}`,
    `Allocation: ${formulationLabel}`,
    'Batch compound: extrait · 50ml · compounded to order',
  ];

  const summaries: Record<BottleVariantId, string> = {
    v01: 'Flagship amber resin. Warm, dark, worn after hours.',
    v02: 'Oud-forward warmth. Aged resin with golden depth.',
    v03: 'Smoked cedar anchor. Spice and dry timber throughout.',
    v04: 'Deep resinous oud. Quiet, heavy, slow to unfold.',
    v05: 'Golden hour in a bottle. Radiant amber and soft heat.',
    v06: 'Midnight oud. Cool opening, resinous midnight dry-down.',
    v07: 'Burnished spice. Pepper up front, wood underneath.',
    v08: 'Violet noir. Elusive, mineral, dangerously close to the skin.',
    v09: 'Pale ember. Light resin, dawn air, clean projection.',
  };

  return {
    variantId: variant.id,
    formulationNumber,
    formulationName,
    formulationLabel,
    productId: VARIANT_TO_PRODUCT[variant.id],
    log,
    summary: summaries[variant.id],
  };
}

export function getDistillerBottleImage(variantId: BottleVariantId) {
  return getBottleVariant(variantId).image;
}
