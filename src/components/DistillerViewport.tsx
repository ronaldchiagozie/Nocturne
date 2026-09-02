import { motion, AnimatePresence } from 'motion/react';
import {
  DISTILLER_QUESTIONS,
  DistillerAnswers,
  DistillerResult,
  getDistillerBottleImage,
} from '../data/distiller';
import {
  DistillerStep,
  getAuraForOption,
  getCompilationLevel,
  getStationStatus,
  resolveActiveAura,
} from '../data/distillerVisuals';
import { prefersReducedMotion } from '../hooks/useMotionPreference';

interface DistillerViewportProps {
  step: DistillerStep;
  answers: Partial<DistillerAnswers>;
  hoveredOptionId: string | null;
  result: DistillerResult | null;
}

const QUESTION_KEYS: (keyof DistillerAnswers)[] = ['hour', 'environment', 'intent'];

function DistillerRings({
  progress,
  accentHex,
  reducedMotion,
}: {
  progress: number;
  accentHex: string;
  reducedMotion: boolean;
}) {
  const circumference = 2 * Math.PI * 88;
  const dash = circumference * Math.min(1, Math.max(0.08, progress));

  return (
    <svg
      viewBox="0 0 200 200"
      className="distiller-rings absolute left-1/2 top-[46%] h-[min(72vw,320px)] w-[min(72vw,320px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      aria-hidden
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="rgba(13,11,10,0.06)"
        strokeWidth="0.75"
      />
      <motion.circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke={accentHex}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{
          strokeDashoffset: circumference - dash,
          opacity: 0.15 + progress * 0.45,
        }}
        transition={{ duration: reducedMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        transform="rotate(-90 100 100)"
      />
      <circle
        cx="100"
        cy="100"
        r="62"
        fill="none"
        stroke="rgba(13,11,10,0.05)"
        strokeWidth="0.5"
        strokeDasharray="3 7"
      />
      <circle
        cx="100"
        cy="100"
        r="36"
        fill="none"
        stroke="rgba(13,11,10,0.04)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export function DistillerViewport({
  step,
  answers,
  hoveredOptionId,
  result,
}: DistillerViewportProps) {
  const isResult = step === 'result' && !!result;
  const primaryAura = resolveActiveAura(
    answers,
    hoveredOptionId,
    isResult ? result?.variantId : undefined,
  );
  const answerCount = QUESTION_KEYS.filter((k) => answers[k]).length;
  const progress = isResult ? 1 : answerCount / 3;
  const reducedMotion = prefersReducedMotion();
  const currentStepIndex = typeof step === 'number' ? step : -1;

  const answeredOrbs = QUESTION_KEYS.flatMap((key, index) => {
    const value = answers[key];
    if (!value) return [];
    const aura = getAuraForOption(value);
    const angle = (index / 3) * Math.PI * 2 - Math.PI / 2;
    const radius = 28 + index * 6;
    return [
      {
        id: key,
        hex: aura.hex,
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        size: 0.55 + index * 0.12,
        opacity: 0.16 + index * 0.04,
      },
    ];
  });

  const hoverOrb =
    hoveredOptionId && getAuraForOption(hoveredOptionId)
      ? getAuraForOption(hoveredOptionId)
      : null;

  return (
    <div className="distiller-chamber relative flex h-full min-h-[280px] flex-col overflow-hidden bg-[#ebe7df]">
      <div className="distiller-chamber-vignette pointer-events-none" aria-hidden />
      <div className="distiller-chamber-grid pointer-events-none" aria-hidden />

      {/* Status rail */}
      <div className="relative z-20 flex items-center justify-between gap-4 px-5 sm:px-8 md:px-10 pt-5 sm:pt-6">
        <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-taupe-muted/90 truncate">
          {getStationStatus(step, isResult)}
        </p>
        <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.16em] text-taupe-muted tabular-nums shrink-0">
          {getCompilationLevel(answers, isResult)}
        </p>
      </div>

      {/* Visual core */}
      <div className="relative flex flex-1 items-center justify-center px-6 sm:px-10 py-6 sm:py-8">
        {!isResult && (
          <DistillerRings
            progress={progress}
            accentHex={primaryAura.hex}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Answered parameter orbs */}
        {!reducedMotion &&
          answeredOrbs.map((orb) => (
            <motion.div
              key={orb.id}
              className="distiller-orb pointer-events-none absolute rounded-full"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: orb.opacity,
                scale: orb.size,
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                backgroundColor: orb.hex,
              }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ transform: 'translate(-50%, -50%)' }}
              aria-hidden
            />
          ))}

        {/* Hover / primary aura */}
        {!reducedMotion && (
          <motion.div
            className="distiller-orb distiller-orb-primary pointer-events-none absolute rounded-full"
            animate={{
              width: primaryAura.sizePx * (isResult ? 2.4 : hoverOrb ? 2 : 1.75),
              height: primaryAura.sizePx * (isResult ? 2.4 : hoverOrb ? 2 : 1.75),
              backgroundColor: hoverOrb?.hex ?? primaryAura.hex,
              opacity: isResult ? 0.28 : hoverOrb ? 0.2 : 0.12,
              filter: 'blur(48px)',
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ left: '50%', top: '46%', transform: 'translate(-50%, -50%)' }}
            aria-hidden
          />
        )}

        {reducedMotion && (
          <div
            className="distiller-orb distiller-orb-primary pointer-events-none absolute rounded-full blur-[48px]"
            style={{
              width: primaryAura.sizePx * 1.75,
              height: primaryAura.sizePx * 1.75,
              backgroundColor: primaryAura.hex,
              opacity: isResult ? 0.28 : 0.12,
              left: '50%',
              top: '46%',
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden
          />
        )}

        <AnimatePresence mode="wait">
          {isResult ? (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-taupe-muted mb-3">
                No. {result!.formulationNumber}
              </p>
              <img
                src={getDistillerBottleImage(result!.variantId)}
                alt={result!.formulationLabel}
                className="distiller-bottle-reveal h-[min(280px,38dvh)] sm:h-[min(320px,42dvh)] w-auto object-contain"
              />
              <p className="font-serif text-lg sm:text-xl tracking-tight text-canvas mt-4">
                {result!.formulationName}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 flex flex-col items-center gap-5 text-center max-w-[16rem] sm:max-w-xs px-2"
            >
              {step === 'intro' ? (
                <>
                  <div className="distiller-intro-glyph" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                  <p className="font-body-italic italic text-sm text-taupe-muted font-light leading-relaxed">
                    Three answers name one extrait.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-taupe-muted">
                    {hoverOrb ? hoverOrb.label : primaryAura.label}
                  </p>
                  <p className="font-body-italic italic text-sm text-taupe-muted font-light leading-relaxed">
                    {hoverOrb
                      ? 'Previewing this answer.'
                      : 'Each answer narrows the eight.'}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Parameter ledger */}
      <div className="relative z-20 border-t border-canvas/[0.08] px-5 sm:px-8 md:px-10 py-4 sm:py-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {DISTILLER_QUESTIONS.map((question, index) => {
            const value = answers[question.id];
            const isActive = currentStepIndex === index;
            const isFilled = Boolean(value);
            const label = value
              ? question.options.find((o) => o.id === value)?.label ?? '—'
              : '—';

            return (
              <div
                key={question.id}
                className={`distiller-param-chip ${isActive ? 'distiller-param-chip-active' : ''} ${
                  isFilled ? 'distiller-param-chip-filled' : ''
                }`}
              >
                <p className="font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.14em] text-taupe-muted/80 truncate">
                  {question.title.replace('The ', '')}
                </p>
                <p
                  className={`font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.12em] mt-1 truncate ${
                    isFilled ? 'text-canvas' : 'text-taupe-muted/45'
                  }`}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
