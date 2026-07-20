import { Link, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ThemeToggle } from './ThemeToggle';
import { ToastViewport } from './ToastViewport';
import { ShopLayoutToggle } from './shop/ShopLayoutToggle';

interface StoreLayoutProps {
  children?: React.ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { cartCount } = useStore();
  const location = useLocation();
  const isStoreRoute =
    (location.pathname.startsWith('/shop') || location.pathname.startsWith('/cart')) &&
    !location.pathname.startsWith('/checkout');

  return (
    <>
      {isStoreRoute && (
        <header className="sticky top-0 z-50 bg-cream-plate/95 backdrop-blur-md border-b border-canvas/[0.06] safe-pt">
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-5">
            <Link
              to="/"
              className="flex items-center gap-2.5 group leading-none"
              aria-label="Nocturne home"
            >
              <img
                src="/logo-mark.svg"
                alt=""
                className="h-6 w-6 shrink-0 rounded-[8px] group-hover:opacity-85 transition-opacity"
              />
              <span className="font-serif text-[11px] sm:text-[13px] tracking-[0.28em] uppercase text-canvas group-hover:text-canvas/70 transition-colors">
                Nocturne
              </span>
            </Link>

            <nav className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <ThemeToggle />
              {location.pathname === '/shop' && <ShopLayoutToggle />}
              <Link
                to="/shop"
                className={`font-sans text-[10px] uppercase tracking-[0.24em] transition-colors ${
                  location.pathname === '/shop'
                    ? 'text-canvas'
                    : 'text-taupe-muted hover:text-canvas'
                }`}
              >
                Shop
              </Link>
              <Link
                to="/cart"
                className={`relative font-sans text-[10px] uppercase tracking-[0.24em] transition-colors ${
                  location.pathname === '/cart'
                    ? 'text-canvas'
                    : 'text-taupe-muted hover:text-canvas'
                }`}
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 font-mono text-[8px] tabular-nums text-[#8a5a2e]">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </header>
      )}
      {children ?? <Outlet />}
      <ToastViewport />
    </>
  );
}
