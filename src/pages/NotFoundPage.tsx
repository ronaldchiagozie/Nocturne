import { Link } from 'react-router-dom';
import { useSiteModals } from '../context/SiteModalsContext';

export function NotFoundPage() {
  const { openDistiller } = useSiteModals();

  return (
    <main className="bg-cream text-canvas min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center pb-16">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-taupe-muted">404</p>
      <h1 className="font-serif text-[clamp(2rem,6vw,3rem)] tracking-tight leading-tight mt-4">
        This hour doesn&apos;t exist.
      </h1>
      <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-4 max-w-md leading-relaxed">
        The page you requested isn&apos;t on the ledger. Explore the collection or let The Distiller
        find your formulation.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <Link
          to="/shop"
          className="font-sans text-[10px] uppercase tracking-[0.22em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
        >
          Shop the collection →
        </Link>
        <button
          type="button"
          onClick={openDistiller}
          className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors cursor-pointer min-h-[44px]"
        >
          The Distiller →
        </button>
      </div>
    </main>
  );
}
