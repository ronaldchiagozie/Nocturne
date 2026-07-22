import { motion, AnimatePresence } from 'motion/react';
import { DistillerAnswers, DistillerResult, getDistillerBottleImage } from '../data/distiller';
import { DistillerStep, resolveActiveAura } from '../data/distillerVisuals';
import { prefersReducedMotion } from '../hooks/useMotionPreference';

interface DistillerViewportProps {
  step: DistillerStep;
  answers: Partial<DistillerAnswers>;
  hoveredOptionId: string | null;
  result: DistillerResult | null;
}

export function DistillerViewport({ step, answers, hoveredOptionId, result }: DistillerViewportProps) {
  const isResult = step === 'result' && !!result;
  const aura = resolveActiveAura(answers, hoveredOptionId, isResult ? result?.variantId : undefined);
  const answerCount = [answers.hour, answers.environment, answers.intent].filter(Boolean).length;
  const reducedMotion = prefersReducedMotion();

  return (
    <div className="distiller-viewport relative flex h-full min-h-[240px] flex-col bg-cream-plate">
      <div className="relative flex flex-1 items-center justify-center px-8 md:px-12 py-10">
        {!reducedMotion && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            animate={{
              width: aura.sizePx * (isResult ? 2 : 1.5),
              height: aura.sizePx * (isResult ? 2 : 1.5),
              backgroundColor: aura.hex,
              opacity: isResult ? 0.22 : 0.12,
              filter: 'blur(40px)',
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            aria-hidden
          />
        )}
        {reducedMotion && (
          <div
            className="absolute rounded-full pointer-events-none blur-[40px]"
            style={{
              width: aura.sizePx * (isResult ? 2 : 1.5),
              height: aura.sizePx * (isResult ? 2 : 1.5),
              backgroundColor: aura.hex,
              opacity: isResult ? 0.22 : 0.12,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden
          />
        )}

        <AnimatePresence mode="wait">
          {isResult ? (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <img
                src={getDistillerBottleImage(result!.variantId)}
                alt={result!.formulationLabel}
                className="distiller-bottle-reveal h-[min(300px,42dvh)] w-auto object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 flex flex-col items-center gap-6 text-center max-w-xs"
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`block h-px w-10 transition-colors duration-500 ${
                      i < answerCount ? 'bg-canvas/50' : 'bg-canvas/15'
                    }`}
                  />
                ))}
              </div>
              <p className="font-body-italic italic text-sm text-taupe-muted font-light leading-relaxed">
                {step === 'intro'
                  ? 'Your formulation takes shape as you answer.'
                  : 'Each choice shifts the compound toward your match.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
