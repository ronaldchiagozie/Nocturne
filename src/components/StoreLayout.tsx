import { Link, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ToastViewport } from './ToastViewport';
import { ShopLayoutToggle } from './shop/ShopLayoutToggle';
import { SiteFooter } from './SiteFooter';

interface StoreLayoutProps {
  children?: React.ReactNode;
}

function EditorialHeader({ cartCount }: { cartCount: number }) {
  const location = useLocation();
  const isShop = location.pathname === '/shop';
  const isAbout = location.pathname === '/about';

  const navLink = (active: boolean) =>
    `font-sans text-[11px] sm:text-xs transition-colors ${
      active
        ? 'text-canvas underline underline-offset-[5px] decoration-canvas/40'
        : 'text-taupe-muted hover:text-canvas'
    }`;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 py-5 md:py-6">
      <nav className="flex items-center gap-5 sm:gap-6 md:gap-8 justify-self-start">
        <Link to="/shop" className={navLink(isShop)}>
          Shop
        </Link>
        <Link to="/about" className={`${navLink(isAbout)} hidden sm:inline`}>
          About
        </Link>
      </nav>

      <Link
        to="/"
        className="font-serif text-lg sm:text-xl md:text-2xl tracking-[0.12em] text-canvas hover:text-canvas/75 transition-colors justify-self-center"
        aria-label="Nocturne home"
      >
        NOCTURNE
      </Link>

      <nav className="flex items-center gap-5 sm:gap-6 md:gap-8 justify-self-end">
        {isShop && <ShopLayoutToggle />}
        <Link
          to="/cart"
          className="font-sans text-[11px] sm:text-xs text-canvas relative"
        >
          Bag
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 font-sans text-[10px] tabular-nums text-taupe-muted">
              {cartCount}
            </span>
          )}
        </Link>
      </nav>
    </div>
  );
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { cartCount } = useStore();
  const location = useLocation();
  const isEditorial = location.pathname === '/shop' || location.pathname === '/about';
  const isStoreRoute =
    (location.pathname.startsWith('/shop') ||
      location.pathname.startsWith('/cart') ||
      location.pathname === '/about') &&
    !location.pathname.startsWith('/checkout');

  return (
    <>
      {isStoreRoute && (
        <header
          className={`sticky top-0 z-50 bg-cream/95 backdrop-blur-md safe-pt ${
            isEditorial ? '' : 'border-b border-canvas/[0.06]'
          }`}
        >
          {isEditorial ? (
            <EditorialHeader cartCount={cartCount} />
          ) : (
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
                  to="/about"
                  className={`font-sans text-[10px] uppercase tracking-[0.24em] transition-colors hidden sm:inline ${
                    location.pathname === '/about'
                      ? 'text-canvas'
                      : 'text-taupe-muted hover:text-canvas'
                  }`}
                >
                  About
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
          )}
        </header>
      )}
      {children ?? <Outlet />}
      {location.pathname !== '/' && <SiteFooter />}
      <ToastViewport />
    </>
  );
}
