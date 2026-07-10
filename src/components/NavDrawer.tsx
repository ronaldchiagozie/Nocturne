import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavDrawerProps {
  isOpen: boolean;
  orderCount: number;
  onClose: () => void;
  onCheckout: () => void;
  onOpenVault: () => void;
  onOpenDistiller: () => void;
}

const LINKS = [
  { id: 'secure', label: 'Secure a bottle', action: 'checkout' as const },
  { id: 'distill', label: 'The Distiller', action: 'distill' as const },
  { id: 'vault', label: 'My Vault', action: 'vault' as const },
];

export function NavDrawer({
  isOpen,
  orderCount,
  onClose,
  onCheckout,
  onOpenVault,
  onOpenDistiller,
}: NavDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleAction = (action: (typeof LINKS)[number]['action']) => {
    onClose();
    setTimeout(() => {
      if (action === 'checkout') onCheckout();
      if (action === 'distill') onOpenDistiller();
      if (action === 'vault') onOpenVault();
    }, 280);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[190] bg-canvas/25 backdrop-blur-[3px] cursor-pointer"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="nav-drawer fixed top-0 right-0 z-[195] h-full w-[min(100vw,340px)] bg-cream text-canvas border-l border-canvas/10 flex flex-col"
            data-lenis-prevent
            role="dialog"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-canvas/10">
              <span className="font-serif text-[11px] tracking-[0.3em] uppercase text-canvas/90">
                Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <nav className="flex-1 px-8 py-12 flex flex-col">
              <ul className="space-y-10">
                {LINKS.map((link) => {
                  if (link.action === 'vault' && orderCount === 0) return null;

                  return (
                    <li key={link.id}>
                      <button
                        type="button"
                        onClick={() => handleAction(link.action)}
                        className="nav-drawer-link group text-left w-full cursor-pointer"
                      >
                        <span className="font-serif text-[clamp(1.25rem,3vw,1.5rem)] text-canvas tracking-tight group-hover:opacity-70 transition-opacity">
                          {link.label}
                        </span>
                        {link.action === 'vault' && orderCount > 0 && (
                          <span className="block font-mono text-[10px] tabular-nums text-taupe-muted mt-2">
                            {orderCount} allocation{orderCount === 1 ? '' : 's'}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="px-8 py-8 border-t border-canvas/10">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-taupe-muted">
                Batch 07 // Extrait de parfum
              </p>
              <p className="font-body-italic italic text-xs text-taupe-muted font-light mt-3 leading-relaxed">
                Compounded to order. Worn after dark.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
