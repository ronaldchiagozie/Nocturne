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

/** S_profile = w1·Hour + w2·Environment + w3·Intent → maps to 1 of 8 variants */
export const VARIANT_SUMMARIES: Record<BottleVariantId, string> = {
  v01: 'Flagship amber extrait. Warm, dark, worn after hours.',
  v03: 'Ruby spice and cedar. Heat up front, timber underneath.',
  v04: 'Pale violet oud. Quiet resin, slow to unfold.',
  v05: 'Straw-gold amber. Sunset warmth in a bottle.',
  v06: 'Deep violet extrait. Midnight, mineral, close to the skin.',
  v07: 'Emerald depth. Cool forest air after dark.',
  v08: 'Rose-amber twilight. Elusive, warm, hard to place.',
  v09: 'Pale gold dawn. Light resin, clean first light.',
};

export function distillMatch(answers: DistillerAnswers): DistillerResult {
  const w1 = 3;
  const w2 = 2;
  const w3 = 4;

  const hour = ANSWER_INDEX[answers.hour] ?? 0;
  const environment = ANSWER_INDEX[answers.environment] ?? 0;
  const intent = ANSWER_INDEX[answers.intent] ?? 0;

  const score = hour * w1 + environment * w2 + intent * w3;
  const variant = BOTTLE_VARIANTS[score % BOTTLE_VARIANTS.length];
  const formulationNumber = variant.formulationNumber;
  const formulationName = variant.name;
  const formulationLabel = `No. ${formulationNumber} ${formulationName}`;

  const log = [
    `Parameter 01. Hour: ${HOUR_LABELS[answers.hour]}`,
    `Parameter 02. Environment: ${ENV_LABELS[answers.environment]}`,
    `Parameter 03. Intent: ${INTENT_LABELS[answers.intent]}`,
    `Matched: ${formulationLabel}`,
    'Batch compound: extrait · 50ml · compounded to order',
  ];

  return {
    variantId: variant.id,
    formulationNumber,
    formulationName,
    formulationLabel,
    productId: variant.productId,
    log,
    summary: VARIANT_SUMMARIES[variant.id],
  };
}

export function getDistillerBottleImage(variantId: BottleVariantId) {
  return getBottleVariant(variantId).image;
}
