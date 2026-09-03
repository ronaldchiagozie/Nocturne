import { useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DISTILLER_QUESTIONS,
  DistillerAnswers,
  DistillerResult,
  distillMatch,
  getDistillerBottleImage,
} from '../data/distiller';
import { DistillerStep, getAuraForOption } from '../data/distillerVisuals';
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
  const currentStepIndex = typeof step === 'number' ? step : step === 'result' ? 3 : -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[210] distiller-panel text-canvas flex flex-col overflow-hidden"
          data-lenis-prevent
          role="dialog"
          aria-label="The Distiller"
        >
          <div className="flex shrink-0 justify-between items-center px-4 sm:px-6 md:px-10 lg:px-12 pt-[max(1rem,env(safe-area-inset-top))] md:pt-7 pb-4 border-b border-canvas/[0.08]">
            <div className="min-w-0">
              <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-taupe-muted">
                The Distiller
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer min-h-[44px] inline-flex items-center px-2"
            >
              Close
            </button>
          </div>

          <div className="flex flex-1 min-h-0 flex-col lg:flex-row w-full">

            <div className="order-1 lg:order-2 lg:w-[58%] min-h-[min(42dvh,360px)] lg:min-h-0 flex flex-col flex-1 lg:flex-none border-b lg:border-b-0 lg:border-l border-canvas/[0.08]">
              <DistillerViewport
                step={step}
                answers={answers}
                hoveredOptionId={hoveredOptionId}
                result={result}
              />
            </div>

            <div className="order-2 lg:order-1 lg:w-[42%] flex flex-col min-h-0 min-w-0 bg-cream-plate">
              <div
                className="modal-scroll flex-1 min-h-0 px-4 sm:px-6 md:px-10 lg:px-12 py-7 sm:py-9 md:py-11 lg:py-12 flex flex-col justify-center"
                data-modal-scroll
              >
                {currentStepIndex >= 0 && (
                  <nav className="distiller-rail mb-9 sm:mb-11" aria-label="Distiller progress">
                    {DISTILLER_QUESTIONS.map((q, index) => {
                      const done = currentStepIndex > index || step === 'result';
                      const active = currentStepIndex === index;
                      return (
                        <div
                          key={q.id}
                          className={`distiller-rail-step ${done ? 'is-done' : ''} ${
                            active ? 'is-active' : ''
                          }`}
                        >
                          <span className="distiller-rail-index">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="distiller-rail-label">
                            {q.title.replace('The ', '')}
                          </span>
                        </div>
                      );
                    })}
                  </nav>
                )}

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
                      <p className="font-serif text-[clamp(1.85rem,4.5vw,2.65rem)] tracking-tight leading-[1.08] text-canvas">
                        Three questions.
                      </p>
                      <p className="font-body-italic italic text-sm sm:text-[15px] text-taupe-muted leading-relaxed font-light mt-7 max-w-sm">
                        Answer them and we will name the extrait built for it. There are{' '}
                        {FORMULATION_COUNT_WORD}, each compounded for a different hour.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="distiller-cta-primary mt-10 sm:mt-12"
                      >
                        Begin
                      </button>
                    </motion.div>
                  )}

                  {currentQuestion && (
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-lg w-full"
                    >
                      <h2 className="font-serif text-[clamp(1.55rem,3.5vw,2.35rem)] tracking-tight leading-snug text-canvas">
                        {currentQuestion.title}
                      </h2>
                      <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-3 mb-8 sm:mb-10">
                        {currentQuestion.subtitle}
                      </p>

                      <div className="space-y-2.5 sm:space-y-3">
                        {currentQuestion.options.map((option, optionIndex) => {
                          const isSelected =
                            answers[currentQuestion.id as keyof DistillerAnswers] === option.id;
                          const accent = getAuraForOption(option.id).hex;

                          return (
                            <motion.button
                              key={option.id}
                              type="button"
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: 0.1 + optionIndex * 0.07,
                                duration: 0.42,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              onClick={() => pickAnswer(step as number, option.id)}
                              onMouseEnter={() => setHoveredOptionId(option.id)}
                              onMouseLeave={() => setHoveredOptionId(null)}
                              onFocus={() => setHoveredOptionId(option.id)}
                              onBlur={() => setHoveredOptionId(null)}
                              style={{ '--option-accent': accent } as CSSProperties}
                              className={`distiller-option w-full text-left px-5 py-4 sm:py-[1.125rem] cursor-pointer group min-h-[44px] ${
                                isSelected ? 'distiller-option-selected' : ''
                              }`}
                            >
                              <p
                                className={`font-sans text-[10px] uppercase tracking-[0.2em] transition-colors ${
                                  isSelected
                                    ? 'text-canvas'
                                    : 'text-canvas/75 group-hover:text-canvas'
                                }`}
                              >
                                {option.label}
                              </p>
                              <p className="font-body-italic italic text-xs text-taupe-muted font-light mt-1.5 leading-relaxed">
                                {option.detail}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {step === 'result' && result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-md w-full"
                    >
                      <p className="font-mono text-[9px] tracking-[0.22em] text-taupe-muted uppercase">
                        No. {result.formulationNumber}
                      </p>
                      <h2 className="font-serif text-[clamp(1.9rem,4vw,2.9rem)] tracking-tight leading-[1.05] mt-3 text-canvas">
                        {result.formulationName}
                      </h2>
                      <p className="font-body-italic italic text-sm text-taupe-muted leading-relaxed font-light mt-5">
                        {result.summary}
                      </p>

                      <ul className="mt-8 space-y-2.5 border-l border-canvas/10 pl-4">
                        {result.log.slice(0, 3).map((line) => (
                          <li
                            key={line}
                            className="font-mono text-[8px] sm:text-[9px] tracking-[0.06em] text-taupe-muted uppercase leading-relaxed"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-10">
                        <button
                          type="button"
                          onClick={() => {
                            const added = add(result.productId, {
                              override: {
                                variantId: result.variantId,
                                formulationLabel: result.formulationLabel,
                                productLabel: `No. ${result.formulationNumber}`,
                                productTitle: result.formulationName,
                                image: getDistillerBottleImage(result.variantId),
                              },
                            });
                            if (added.ok) handleClose();
                          }}
                          className="distiller-cta-primary w-full sm:w-auto"
                        >
                          Add to cart
                        </button>

                        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 mt-6">
                          <button
                            type="button"
                            onClick={() => onViewSpec?.(result)}
                            className="font-sans text-[10px] uppercase tracking-[0.22em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors cursor-pointer"
                          >
                            Spec sheet
                          </button>
                          <button
                            type="button"
                            onClick={reset}
                            className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
                          >
                            Start again
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
