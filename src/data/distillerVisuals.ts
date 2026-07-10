import {
  DistillerAnswers,
  DistillerEnvironment,
  DistillerHour,
  DistillerIntent,
} from './distiller';
import { BottleVariantId, getBottleVariant } from './bottleVariants';

export interface AuraConfig {
  hex: string;
  opacity: number;
  sizePx: number;
  label: string;
}

export type EnvironmentEffect = DistillerEnvironment | null;

const AURA: Record<string, AuraConfig> = {
  sunset: { hex: '#D4A373', opacity: 0.15, sizePx: 120, label: 'SUNSET' },
  midnight: { hex: '#8D7B8E', opacity: 0.12, sizePx: 150, label: 'MIDNIGHT' },
  dawn: { hex: '#A2B9BC', opacity: 0.1, sizePx: 100, label: 'DAWN' },
  'smoked-cedar': { hex: '#C46210', opacity: 0.14, sizePx: 130, label: 'SMOKED CEDAR' },
  'wet-concrete': { hex: '#4A4A4A', opacity: 0.12, sizePx: 110, label: 'WET CONCRETE' },
  'warm-amber': { hex: '#B38B6D', opacity: 0.14, sizePx: 125, label: 'WARM AMBER' },
  'quietly-dangerous': { hex: '#5C4A52', opacity: 0.1, sizePx: 95, label: 'QUIETLY DANGEROUS' },
  radiating: { hex: '#D4A373', opacity: 0.18, sizePx: 165, label: 'RADIATING' },
  elusive: { hex: '#9BA8AB', opacity: 0.09, sizePx: 88, label: 'ELUSIVE' },
};

const DEFAULT_AURA: AuraConfig = {
  hex: '#D4A373',
  opacity: 0.06,
  sizePx: 110,
  label: 'STANDBY',
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

export function getAuraForOption(optionId: string): AuraConfig {
  return AURA[optionId] ?? DEFAULT_AURA;
}

export function resolveEnvironmentEffect(
  answers: Partial<DistillerAnswers>,
  hoveredOptionId: string | null,
): EnvironmentEffect {
  if (
    hoveredOptionId === 'smoked-cedar' ||
    hoveredOptionId === 'wet-concrete' ||
    hoveredOptionId === 'warm-amber'
  ) {
    return hoveredOptionId;
  }
  return answers.environment ?? null;
}

export function resolveActiveAura(
  answers: Partial<DistillerAnswers>,
  hoveredOptionId: string | null,
  variantId?: BottleVariantId,
): AuraConfig {
  if (variantId) {
    const variant = getBottleVariant(variantId);
    const hexMatch = variant.glow.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    const hex = hexMatch
      ? `#${[hexMatch[1], hexMatch[2], hexMatch[3]]
          .map((n) => Number(n).toString(16).padStart(2, '0'))
          .join('')}`
      : '#D4A373';
    return {
      hex,
      opacity: 0.35,
      sizePx: 180,
      label: variant.name.toUpperCase(),
    };
  }

  if (hoveredOptionId && AURA[hoveredOptionId]) {
    return AURA[hoveredOptionId];
  }

  if (answers.intent && AURA[answers.intent]) return AURA[answers.intent];
  if (answers.environment && AURA[answers.environment]) return AURA[answers.environment];
  if (answers.hour && AURA[answers.hour]) return AURA[answers.hour];

  return DEFAULT_AURA;
}

export function getCompilationLevel(answers: Partial<DistillerAnswers>, isResult: boolean): string {
  if (isResult) return '100%';
  const count = [answers.hour, answers.environment, answers.intent].filter(Boolean).length;
  if (count === 0) return 'Calculating...';
  if (count === 1) return '33%';
  if (count === 2) return '66%';
  return '100%';
}

/** S_profile = w_hour·H + w_env·E + w_intent·I */
export function getProfileScore(answers: Partial<DistillerAnswers>): number {
  const wHour = 3;
  const wEnv = 2;
  const wIntent = 4;

  let score = 0;
  if (answers.hour) score += (ANSWER_INDEX[answers.hour] ?? 0) * wHour;
  if (answers.environment) score += (ANSWER_INDEX[answers.environment] ?? 0) * wEnv;
  if (answers.intent) score += (ANSWER_INDEX[answers.intent] ?? 0) * wIntent;
  return score;
}

export function getProfileScoreLabel(answers: Partial<DistillerAnswers>): string {
  const score = getProfileScore(answers);
  const filled = [answers.hour, answers.environment, answers.intent].filter(Boolean).length;
  if (filled === 0) return 'AWAITING INPUT';
  return `S_PROFILE: ${score}`;
}

export type DistillerStep = 'intro' | 0 | 1 | 2 | 'result';

export function getStationStatus(step: DistillerStep, isResult: boolean): string {
  if (isResult) return 'COMPLETE // FORMULATION LOCKED';
  if (step === 'intro') return 'STANDBY // PIPELINE PRIMED';
  return 'ACTIVE // DISTILLATION PIPELINE INITIATED';
}

export function isHourOption(id: string): id is DistillerHour {
  return id === 'sunset' || id === 'midnight' || id === 'dawn';
}

export function isEnvironmentOption(id: string): id is DistillerEnvironment {
  return id === 'smoked-cedar' || id === 'wet-concrete' || id === 'warm-amber';
}

export function isIntentOption(id: string): id is DistillerIntent {
  return id === 'quietly-dangerous' || id === 'radiating' || id === 'elusive';
}
