import { scrollToTop } from '../hooks/useLenis';

interface SiteFooterProps {
  orderCount?: number;
  onCheckout?: () => void;
  onOpenDistiller?: () => void;
  onOpenVault?: () => void;
  onOpenCollections?: () => void;
}

type FooterAction = 'collections' | 'distill' | 'secure' | 'vault' | 'top';

const COLUMNS: {
  title: string;
  links: { id: FooterAction; label: string; vault?: boolean }[];
}[] = [
  {
    title: 'Shop',
    links: [
      { id: 'collections', label: 'Collections' },
      { id: 'secure', label: 'Secure a bottle' },
      { id: 'vault', label: 'My Vault', vault: true },
    ],
  },
  {
    title: 'Discover',
    links: [
      { id: 'distill', label: 'The Distiller' },
      { id: 'top', label: 'The extrait' },
      { id: 'collections', label: 'Nine formulations' },
    ],
  },
];

const ATELIER_LINES = ['Lagos · NG', 'Batch 001-NG', '6.4281° N, 3.4219° E'] as const;

export function SiteFooter({
  orderCount = 0,
  onCheckout,
  onOpenDistiller,
  onOpenVault,
  onOpenCollections,
}: SiteFooterProps) {
  const handle = (id: FooterAction) => {
    if (id === 'collections') onOpenCollections?.();
    else if (id === 'distill') onOpenDistiller?.();
    else if (id === 'secure') onCheckout?.();
    else if (id === 'vault') onOpenVault?.();
    else scrollToTop();
  };

  return (
    <footer className="site-footer relative w-full overflow-hidden bg-cream-plate border-t border-neutral-300/70 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="relative z-10 w-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 pt-12 sm:pt-14 md:pt-20 pb-8 sm:pb-10 md:pb-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 sm:gap-12 lg:gap-16 xl:gap-24">
          {/* Brand */}
          <div className="w-full lg:max-w-md xl:max-w-lg shrink-0">
            <button
              type="button"
              onClick={() => scrollToTop()}
              className="inline-flex items-center gap-2.5 sm:gap-3 group cursor-pointer min-h-[44px]"
              aria-label="Nocturne. Scroll to top"
            >
              <img
                src="/logo-mark.svg"
                alt=""
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-[8px] group-hover:opacity-85 transition-opacity"
                aria-hidden
              />
              <span className="font-serif text-[15px] sm:text-base tracking-[0.26em] uppercase text-canvas group-hover:text-canvas/70 transition-colors">
                Nocturne
              </span>
            </button>

            <p className="font-body-italic italic text-sm md:text-[15px] text-taupe-muted leading-[1.7] font-light mt-4 sm:mt-5 md:mt-6 max-w-md">
              Extrait de parfum for the hours no one else sees. Nine formulations. One worn
              differently by everyone.
            </p>

            <p className="font-mono text-[9px] tracking-[0.16em] text-taupe-muted/75 uppercase mt-5 sm:mt-6">
              Extrait · 50ml · Compounded to order
            </p>
          </div>

          {/* Columns: 2-up on phone, 3-up from sm, flex right on desktop */}
          <div className="w-full lg:flex-1 lg:min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-10 md:gap-12 lg:gap-10 xl:gap-16">
              {COLUMNS.map((col) => (
                <div key={col.title} className="min-w-0">
                  <p className="font-sans text-[11px] sm:text-xs font-medium tracking-tight text-canvas mb-3.5 sm:mb-5">
                    {col.title}
                  </p>
                  <ul className="space-y-3 sm:space-y-3.5">
                    {col.links.map((link) => (
                      <li key={`${col.title}-${link.label}`}>
                        <button
                          type="button"
                          onClick={() => handle(link.id)}
                          className="group inline-flex items-center min-h-[40px] sm:min-h-0 py-0.5 text-left font-sans text-[13px] sm:text-sm text-taupe-muted hover:text-canvas transition-colors cursor-pointer"
                        >
                          <span className="inline-flex items-baseline gap-1.5">
                            {link.label}
                            {link.vault && orderCount > 0 && (
                              <span className="font-mono text-[10px] tabular-nums text-taupe-muted/70 group-hover:text-canvas/50">
                                {orderCount}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="col-span-2 md:col-span-1 min-w-0 pt-2 md:pt-0 border-t border-neutral-300/50 md:border-t-0">
                <p className="font-sans text-[11px] sm:text-xs font-medium tracking-tight text-canvas mb-3.5 sm:mb-5">
                  Atelier
                </p>
                <ul className="space-y-2.5 sm:space-y-3">
                  {ATELIER_LINES.map((line) => (
                    <li key={line} className="font-sans text-[13px] sm:text-sm text-taupe-muted">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom rail */}
      <div className="relative z-10 w-full border-t border-neutral-300/60">
        <div className="w-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 py-5 sm:py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[11px] sm:text-[12px] text-taupe-muted">
            &copy; {new Date().getFullYear()} Nocturne. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 font-sans text-[11px] sm:text-[12px] text-taupe-muted sm:justify-end">
            <span>No. 03 · 05 · 07</span>
            <span className="hidden sm:inline text-canvas/15" aria-hidden>
              ·
            </span>
            <span className="tabular-nums">₦180,000</span>
            <span className="hidden sm:inline text-canvas/15" aria-hidden>
              ·
            </span>
            <span>Lekki, Lagos</span>
          </div>
        </div>
      </div>

      {/* Watermark. Quieter on small screens */}
      <div className="relative z-0 flex items-end justify-center overflow-hidden pt-4 sm:pt-6 pb-0 min-h-[4.5rem] sm:min-h-[7rem] md:min-h-[9rem]">
        <p
          aria-hidden
          className="pointer-events-none select-none font-serif text-[20vw] sm:text-[18vw] md:text-[14vw] lg:text-[12vw] uppercase tracking-[0.14em] text-canvas/[0.06] sm:text-canvas/[0.07] leading-none whitespace-nowrap translate-y-[0.28em]"
        >
          Nocturne
        </p>
      </div>
    </footer>
  );
}
