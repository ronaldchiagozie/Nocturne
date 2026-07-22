import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useToast, type ToastVariant } from '../context/ToastContext';

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'error') {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas/[0.06]" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" className="text-canvas/50" />
          <path d="M7 4.2v3.2M7 9.4h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="text-canvas" />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas/[0.06]" aria-hidden>
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
        <path
          d="M6 1.2c1.8 0 3.2 1.5 3.2 3.4v1.1c1 .3 1.7 1.2 1.7 2.3v4.4c0 1.4-1.1 2.6-2.5 2.6H3.6c-1.4 0-2.5-1.2-2.5-2.6V8c0-1.1.7-2 1.7-2.3V4.6C2.8 2.7 4.2 1.2 6 1.2Z"
          stroke="currentColor"
          strokeWidth="1.1"
          className="text-canvas/70"
        />
        <path d="M4.6 1.5h2.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className="text-canvas/45" />
        <path d="M6 12.1v.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-amber-accent" />
      </svg>
    </span>
  );
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[300] flex flex-col items-center gap-2 px-4 pt-[max(0.875rem,env(safe-area-inset-top))]"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const variant = toast.variant ?? 'added';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex items-center gap-3 rounded-full border border-canvas/10 bg-cream-plate/95 backdrop-blur-md pl-2 pr-2.5 py-1.5 shadow-[0_10px_40px_rgba(13,11,10,0.1)] max-w-[min(100%,20rem)]"
            >
              <ToastIcon variant={variant} />

              <div className="min-w-0 flex-1 pr-1">
                <p className="font-serif text-[13px] leading-snug tracking-tight text-canvas truncate">
                  {toast.title}
                </p>
                {variant === 'added' && (
                  <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-taupe-muted mt-0.5">
                    Added to cart
                  </p>
                )}
              </div>

              {toast.action &&
                (toast.action.href ? (
                  <Link
                    to={toast.action.href}
                    onClick={() => dismissToast(toast.id)}
                    className="shrink-0 font-sans text-[8px] uppercase tracking-[0.22em] text-canvas hover:text-taupe-muted transition-colors pr-1"
                  >
                    {toast.action.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick?.();
                      dismissToast(toast.id);
                    }}
                    className="shrink-0 font-sans text-[8px] uppercase tracking-[0.22em] text-canvas hover:text-taupe-muted transition-colors cursor-pointer pr-1"
                  >
                    {toast.action.label}
                  </button>
                ))}

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 flex h-7 w-7 items-center justify-center font-mono text-sm text-taupe-muted hover:text-canvas transition-colors cursor-pointer leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
