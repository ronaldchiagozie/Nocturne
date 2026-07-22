import { BOTTLE_VARIANTS } from './bottleVariants';

/** Single source of truth for catalogue size — used in copy, meta, and JSON-LD */
export const FORMULATION_COUNT = BOTTLE_VARIANTS.length;

const COUNT_WORDS: Record<number, string> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
};

export const FORMULATION_COUNT_WORD =
  COUNT_WORDS[FORMULATION_COUNT] ?? String(FORMULATION_COUNT);

/** Flagship hero cards (No. 03, 05, 07) */
export const FLAGSHIP_FORMULATION_COUNT = 3;

export const ADDITIONAL_FORMULATION_COUNT =
  FORMULATION_COUNT - FLAGSHIP_FORMULATION_COUNT;

export const ADDITIONAL_FORMULATION_COUNT_WORD =
  COUNT_WORDS[ADDITIONAL_FORMULATION_COUNT] ?? String(ADDITIONAL_FORMULATION_COUNT);

export function formulationsCopy(short = false): string {
  if (short) {
    return `${FORMULATION_COUNT_WORD} extrait formulations · compounded to order`;
  }
  return `${FORMULATION_COUNT_WORD.charAt(0).toUpperCase()}${FORMULATION_COUNT_WORD.slice(1)} formulations, compounded to order.`;
}
