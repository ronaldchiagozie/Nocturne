import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DISTILLER_QUESTIONS,
  DistillerAnswers,
  DistillerResult,
  distillMatch,
} from '../data/distiller';
import { DistillerStep } from '../data/distillerVisuals';
import { FORMULATION_COUNT_WORD } from '../data/brand';
import { useAddToCart } from '../hooks/useAddToCart';
import { DistillerViewport } from './DistillerViewport';

type Step = DistillerStep;

interface DistillerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewSpec?: (result: DistillerResult) => void;
}

const EMPTY_ANSWERS: Partial<DistillerAnswers> = {};

export function Distiller({ isOpen, onClose, onViewSpec }: DistillerProps) {
  const [step, setStep] = useState<Step>('intro');
  const [answers, setAnswers] = useState<Partial<DistillerAnswers>>(EMPTY_ANSWERS);
  const [result, setResult] = useState<DistillerResult | null>(null);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const { add } = useAddToCart();

  const reset = () => {
    setStep('intro');
    setAnswers(EMPTY_ANSWERS);
    setResult(null);
    setHoveredOptionId(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 400);
  };

  const pickAnswer = (questionIndex: number, value: string) => {
    const question = DISTILLER_QUESTIONS[questionIndex];
    const nextAnswers = { ...answers, [question.id]: value } as Partial<DistillerAnswers>;

    setAnswers(nextAnswers);
    setHoveredOptionId(null);

    if (questionIndex < DISTILLER_QUESTIONS.length - 1) {
      setStep((questionIndex + 1) as Step);
      return;
    }

    if (nextAnswers.hour && nextAnswers.environment && nextAnswers.intent) {
      setResult(
        distillMatch({
          hour: nextAnswers.hour,
          environment: nextAnswers.environment,
          intent: nextAnswers.intent,
        }),
      );
      setStep('result');
    }
  };

  const currentQuestion = typeof step === 'number' ? DISTILLER_QUESTIONS[step] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[210] distiller-panel text-canvas flex flex-col bg-cream-plate overflow-hidden"
          data-lenis-prevent
          role="dialog"
          aria-label="The Distiller"
        >
          <div className="flex shrink-0 justify-between items-baseline px-4 sm:px-6 md:px-10 lg:px-12 pt-[max(1.25rem,env(safe-area-inset-top))] md:pt-8 border-b border-neutral-300/60">
            <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-taupe-muted">
              The Distiller
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer py-3"
            >
              Close
            </button>
          </div>

          <div className="flex flex-1 min-h-0 flex-col lg:flex-row w-full max-w-[100vw]">
            <div className="lg:w-[40%] flex flex-col min-h-0 min-w-0 border-b lg:border-b-0 lg:border-r border-neutral-300/60">
              <div
                className="modal-scroll flex-1 min-h-0 px-4 sm:px-6 md:px-10 lg:px-12 py-8 sm:py-10 md:py-12 lg:py-14 flex flex-col justify-center"
                data-modal-scroll
              >
                <AnimatePresence mode="wait">
                  {step === 'intro' && (
                    <motion.div
                      key="intro"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.45 }}
                      className="max-w-md"
                    >
                      <p className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] tracking-tight leading-snug text-canvas">
                        Three parameters.
                        <br />
                        One formulation.
                      </p>
                      <p className="font-body-italic italic text-sm text-taupe-muted leading-relaxed font-light mt-8 max-w-sm">
                        Answer three quiet questions. We&apos;ll match you with one of{' '}
                        {FORMULATION_COUNT_WORD} compounds.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="mt-14 font-sans text-[10px] uppercase tracking-[0.25em] text-canvas hover:text-canvas/70 transition-colors cursor-pointer"
                      >
                        Begin →
                      </button>
                    </motion.div>
                  )}

                  {currentQuestion && (
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.45 }}
                      className="max-w-lg w-full"
                    >
                      <p className="font-mono text-[9px] tracking-[0.22em] text-taupe-muted uppercase mb-4">
                        {String((step as number) + 1).padStart(2, '0')} / 03
                      </p>
                      <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] tracking-tight leading-snug text-canvas">
                        {currentQuestion.title}
                      </h2>
                      <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-3 mb-10 md:mb-12">
                        {currentQuestion.subtitle}
                      </p>

                      <div className="space-y-3">
                        {currentQuestion.options.map((option) => {
                          const isSelected =
                            answers[currentQuestion.id as keyof DistillerAnswers] === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => pickAnswer(step as number, option.id)}
                              onMouseEnter={() => setHoveredOptionId(option.id)}
                              onMouseLeave={() => setHoveredOptionId(null)}
                              onFocus={() => setHoveredOptionId(option.id)}
                              onBlur={() => setHoveredOptionId(null)}
                              className={`distiller-option w-full text-left px-5 py-4 md:py-5 border transition-colors duration-300 cursor-pointer group ${
                                isSelected
                                  ? 'border-canvas/25 bg-cream'
                                  : 'border-neutral-300/80 hover:border-canvas/20 hover:bg-cream/80'
                              }`}
                            >
                              <p
                                className={`font-sans text-[10px] uppercase tracking-[0.2em] ${
                                  isSelected ? 'text-canvas' : 'text-canvas/80 group-hover:text-canvas'
                                }`}
                              >
                                {option.label}
                              </p>
                              <p className="font-body-italic italic text-xs text-taupe-muted font-light mt-1.5">
                                {option.detail}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {step === 'result' && result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-md w-full"
                    >
                      <p className="font-mono text-[9px] tracking-[0.22em] text-taupe-muted uppercase">
                        Your match
                      </p>
                      <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] tracking-tight leading-snug mt-4 text-canvas">
                        {result.formulationLabel}
                      </h2>
                      <p className="font-body-italic italic text-sm text-taupe-muted leading-relaxed font-light mt-5">
                        {result.summary}
                      </p>

                      <ul className="mt-8 space-y-2 font-mono text-[9px] tracking-[0.06em] text-taupe-muted uppercase">
                        {result.log.slice(0, 3).map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start gap-4 mt-10">
                        <button
                          type="button"
                          onClick={() => onViewSpec?.(result)}
                          className="font-sans text-[10px] uppercase tracking-[0.22em] border border-canvas/20 text-canvas px-6 py-3 rounded-full hover:bg-cream transition-colors cursor-pointer"
                        >
                          View spec sheet
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const added = add(result.productId, {
                              override: {
                                variantId: result.variantId,
                                formulationLabel: result.formulationLabel,
                                productLabel: `No. ${result.formulationNumber}`,
                                productTitle: result.formulationName,
                              },
                            });
                            if (added.ok) handleClose();
                          }}
                          className="font-sans text-[10px] uppercase tracking-[0.22em] bg-canvas text-cream px-6 py-3 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          Add to cart
                        </button>
                        <button
                          type="button"
                          onClick={reset}
                          className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
                        >
                          Retake
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:w-[60%] min-h-[220px] lg:min-h-0 flex flex-col flex-1 lg:flex-none">
              <DistillerViewport
                step={step}
                answers={answers}
                hoveredOptionId={hoveredOptionId}
                result={result}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
