import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NavDrawer } from './NavDrawer';
import { useSoundscape } from '../context/SoundscapeContext';
import { useStore } from '../context/StoreContext';
import { scrollToTop } from '../hooks/useLenis';

interface NavigationProps {
  onOpenCart: () => void;
  onOpenDistiller: () => void;
  onOpenShop?: () => void;
  onMenuChange?: (open: boolean) => void;
}

export function Navigation({
  onOpenCart,
  onOpenDistiller,
  onOpenShop,
  onMenuChange,
}: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isActive, isAudible, toggleMute } = useSoundscape();
  const { cartCount } = useStore();

  const setOpen = (open: boolean) => {
    setMenuOpen(open);
    onMenuChange?.(open);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4 sm:px-6 sm:py-5 md:px-12 md:py-6 flex justify-between items-center pointer-events-none bg-cream-plate border-b border-canvas/[0.06] safe-pt">
        <div className="pointer-events-auto flex items-center">
          <button
            type="button"
            onClick={() => scrollToTop()}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group leading-none min-h-[44px]"
            aria-label="Nocturne. Scroll to top"
          >
            <img
              src="/logo-mark.svg"
              alt=""
              className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 rounded-[8px] group-hover:opacity-85 transition-opacity"
              aria-hidden
            />
            <span className="font-serif text-[11px] sm:text-[13px] md:text-[15px] tracking-[0.22em] sm:tracking-[0.3em] uppercase text-canvas font-normal leading-none group-hover:text-canvas/70 transition-colors">
              Nocturne
            </span>
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-5 sm:gap-7">
          {isActive && (
            <button
              type="button"
              onClick={toggleMute}
              className="font-mono text-[9px] uppercase tracking-[0.22em] leading-none text-canvas/45 hover:text-canvas/80 transition-colors duration-300 cursor-pointer min-h-[44px] inline-flex items-center"
              aria-label={isAudible ? 'Mute soundscape' : 'Unmute soundscape'}
            >
              {isAudible ? 'Sound' : 'Muted'}
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenShop?.()}
            className="font-sans text-[10px] uppercase tracking-[0.28em] leading-none text-canvas hover:text-canvas/70 transition-colors duration-300 cursor-pointer min-h-[44px] inline-flex items-center"
          >
            Shop
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative font-sans text-[10px] uppercase tracking-[0.28em] leading-none text-canvas hover:text-canvas/70 transition-colors duration-300 cursor-pointer"
            aria-label={`Cart, ${cartCount} items`}
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 font-mono text-[8px] tabular-nums text-taupe-muted">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-sans text-[10px] uppercase tracking-[0.28em] leading-none text-canvas hover:text-canvas/70 transition-colors duration-300 cursor-pointer min-h-[44px] inline-flex items-center"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </nav>

      <NavDrawer
        isOpen={menuOpen}
        cartCount={cartCount}
        onClose={() => setOpen(false)}
        onOpenCart={onOpenCart}
        onOpenDistiller={onOpenDistiller}
        onOpenShop={onOpenShop}
      />
    </>
  );
}
