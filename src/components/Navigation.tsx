import { useState } from 'react';
import { NavDrawer } from './NavDrawer';

interface NavigationProps {
  orderCount: number;
  onCheckout: () => void;
  onOpenVault: () => void;
  onOpenDistiller: () => void;
  onMenuChange?: (open: boolean) => void;
}

export function Navigation({
  orderCount,
  onCheckout,
  onOpenVault,
  onOpenDistiller,
  onMenuChange,
}: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const setOpen = (open: boolean) => {
    setMenuOpen(open);
    onMenuChange?.(open);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-baseline pointer-events-none bg-cream-plate border-b border-canvas/[0.06]">
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
            aria-label="Nocturne — scroll to top"
          >
            <img
              src="/logo-mark.svg"
              alt=""
              className="h-7 w-7 shrink-0 rounded-[8px] group-hover:opacity-85 transition-opacity"
              aria-hidden
            />
            <p className="font-serif text-[13px] md:text-[15px] tracking-[0.3em] uppercase text-canvas font-normal group-hover:text-canvas/70 transition-colors">
              Nocturne
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto font-sans text-[10px] uppercase tracking-[0.28em] text-canvas hover:text-canvas/70 transition-colors duration-300 cursor-pointer"
          aria-label="Open menu"
        >
          Menu
        </button>
      </nav>

      <NavDrawer
        isOpen={menuOpen}
        orderCount={orderCount}
        onClose={() => setOpen(false)}
        onCheckout={onCheckout}
        onOpenVault={onOpenVault}
        onOpenDistiller={onOpenDistiller}
      />
    </>
  );
}
