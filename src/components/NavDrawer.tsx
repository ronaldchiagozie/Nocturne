import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavDrawerProps {
  isOpen: boolean;
  cartCount: number;
  onClose: () => void;
  onOpenCart: () => void;
  onOpenDistiller: () => void;
  onOpenShop?: () => void;
}

const LINKS = [
  { id: 'shop', label: 'Shop', action: 'shop' as const },
  { id: 'cart', label: 'Cart', action: 'cart' as const },
  { id: 'distill', label: 'The Distiller', action: 'distill' as const },
];

export function NavDrawer({
  isOpen,
  cartCount,
  onClose,
  onOpenCart,
  onOpenDistiller,
  onOpenShop,
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
      if (action === 'shop') onOpenShop?.();
      if (action === 'cart') onOpenCart();
      if (action === 'distill') onOpenDistiller();
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
            className="nav-drawer fixed top-0 right-0 z-[195] h-full w-[min(100vw,340px)] bg-cream text-canvas border-l border-canvas/10 flex flex-col overflow-hidden"
            data-lenis-prevent
            data-modal-scroll
            role="dialog"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-canvas/10 shrink-0">
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

            <nav className="modal-scroll flex-1 min-h-0 px-8 py-12 flex flex-col" data-modal-scroll>
              <ul className="space-y-10">
                {LINKS.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => handleAction(link.action)}
                      className="nav-drawer-link group text-left w-full cursor-pointer"
                    >
                      <span className="font-serif text-[clamp(1.25rem,3vw,1.5rem)] text-canvas tracking-tight group-hover:opacity-70 transition-opacity">
                        {link.label}
                      </span>
                      {link.action === 'cart' && cartCount > 0 && (
                        <span className="block font-mono text-[10px] tabular-nums text-taupe-muted mt-2">
                          {cartCount} item{cartCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="px-8 py-8 border-t border-canvas/10">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-taupe-muted">
                Nocturne Atelier
              </p>
              <p className="font-body-italic italic text-xs text-taupe-muted font-light mt-3 leading-relaxed">
                Extrait de parfum, compounded to order. Ships from Lagos.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
