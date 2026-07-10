interface SiteFooterProps {
  orderCount?: number;
  onCheckout?: () => void;
  onOpenDistiller?: () => void;
  onOpenVault?: () => void;
}

const FOOTER_LINKS = [
  { id: 'distill', label: 'The Distiller' },
  { id: 'secure', label: 'Secure a bottle' },
  { id: 'vault', label: 'My Vault' },
] as const;

export function SiteFooter({
  orderCount = 0,
  onCheckout,
  onOpenDistiller,
  onOpenVault,
}: SiteFooterProps) {
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLink = (id: (typeof FOOTER_LINKS)[number]['id']) => {
    if (id === 'distill') onOpenDistiller?.();
    if (id === 'secure') onCheckout?.();
    if (id === 'vault') onOpenVault?.();
  };

  return (
    <footer className="site-footer relative w-full bg-cream-plate border-t border-neutral-300/80">
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-24 pt-16 md:pt-20 pb-12 md:pb-16">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.55fr)_minmax(0,0.65fr)] gap-y-14 gap-x-12 md:gap-x-16 xl:gap-x-[clamp(3rem,8vw,9rem)] 2xl:gap-x-[clamp(4rem,10vw,11rem)]">
          {/* Brand */}
          <div className="md:col-span-2 xl:col-span-1 xl:max-w-[440px]">
            <button
              type="button"
              onClick={scrollTop}
              className="font-serif text-[15px] md:text-base tracking-[0.32em] uppercase text-canvas hover:text-canvas/70 transition-colors cursor-pointer text-left"
            >
              Nocturne
            </button>
            <p className="font-body-italic italic text-sm md:text-[15px] text-taupe-muted leading-[1.75] font-light mt-7 md:mt-8 max-w-md">
              Extrait de parfum for the hours no one else sees. Nine formulations. One worn
              differently by everyone.
            </p>
            <p className="font-mono text-[9px] tracking-[0.18em] text-taupe-muted/80 uppercase mt-9 md:mt-10">
              Extrait · 50ml · Compounded to order
            </p>
          </div>

          {/* Navigate */}
          <div className="xl:justify-self-start">
            <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-taupe-muted mb-6">
              Navigate
            </p>
            <ul className="space-y-3.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => handleLink(link.id)}
                    className="group flex items-center gap-2.5 font-sans text-[10px] uppercase tracking-[0.2em] text-canvas/75 hover:text-canvas transition-colors cursor-pointer"
                  >
                    {link.label}
                    {link.id === 'vault' && orderCount > 0 && (
                      <span className="font-mono text-[8px] tabular-nums text-taupe-muted group-hover:text-canvas/60">
                        {orderCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Atelier */}
          <div className="xl:justify-self-end xl:text-right xl:max-w-[300px]">
            <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-taupe-muted mb-6">
              Atelier
            </p>
            <ul className="space-y-3 font-mono text-[9px] leading-[1.95] tracking-[0.1em] text-taupe-muted uppercase">
              <li>Lagos · NG</li>
              <li>03:00 AM // Local batch</li>
              <li className="tabular-nums tracking-[0.06em] normal-case text-taupe-muted/90">
                6.4281° N, 3.4219° E
              </li>
            </ul>
            <p className="font-body-italic italic text-xs md:text-sm text-taupe-muted/90 font-light mt-7 leading-[1.7] xl:ml-auto xl:max-w-[280px]">
              No florals. No compliments. Dark, textured, quietly dangerous.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom rail */}
      <div className="w-full border-t border-neutral-300/60 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-24 py-6 md:py-7">
        <div className="w-full flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[9px] uppercase tracking-[0.22em] text-taupe-muted shrink-0">
            &copy; {new Date().getFullYear()} Nocturne
          </p>

          <div className="flex flex-wrap items-center gap-x-6 md:gap-x-10 xl:gap-x-14 gap-y-2 font-mono text-[9px] tracking-[0.12em] text-taupe-muted uppercase md:justify-end">
            <span>Batch 001-NG</span>
            <span className="hidden sm:inline h-3 w-px bg-neutral-300/80 shrink-0" aria-hidden />
            <span>No. 03 · 05 · 07</span>
            <span className="hidden md:inline h-3 w-px bg-neutral-300/80 shrink-0" aria-hidden />
            <span className="tabular-nums normal-case tracking-[0.06em]">₦180,000</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
