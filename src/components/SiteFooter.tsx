import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { useSiteModals } from '../context/SiteModalsContext';
import { LEGAL_LINKS, legalPath, ROUTES, type LegalSlug } from '../data/routes';

const INSTAGRAM_URL = 'https://instagram.com';

interface SiteFooterProps {}

type FooterAction =
  | { type: 'route'; to: string; label: string }
  | { type: 'legal'; slug: LegalSlug; label: string }
  | { type: 'external'; href: string; label: string }
  | { type: 'home'; action: 'distill' | 'top'; label: string };

/** OSSOU-style: About leads col 1; legal middle; meta right */
const LINK_COLUMNS: { links: FooterAction[] }[] = [
  {
    links: [
      { type: 'route', to: ROUTES.about, label: 'About' },
      { type: 'route', to: ROUTES.shop, label: 'Shop' },
      { type: 'route', to: ROUTES.cart, label: 'Cart' },
      { type: 'home', action: 'distill', label: 'The Distiller' },
      { type: 'legal', slug: 'shipping', label: 'Shipping Policy' },
    ],
  },
  {
    links: LEGAL_LINKS.filter(({ slug }) => slug !== 'shipping').map(({ slug, label }) => ({
      type: 'legal' as const,
      slug,
      label,
    })),
  },
  {
    links: [
      { type: 'external', href: INSTAGRAM_URL, label: 'Follow Nocturne' },
    ],
  },
];

function FooterLink({
  link,
  onOpenDistiller,
  onNavigateHome,
  active,
}: {
  link: FooterAction;
  onOpenDistiller: () => void;
  onNavigateHome: () => void;
  active?: boolean;
}) {
  const baseClass = `font-sans text-[13px] sm:text-[14px] text-canvas hover:text-canvas/70 transition-colors text-left ${
    active ? 'underline underline-offset-[5px] decoration-canvas/35' : ''
  }`;

  if (link.type === 'route') {
    return (
      <Link to={link.to} className={baseClass}>
        {link.label}
      </Link>
    );
  }

  if (link.type === 'legal') {
    return (
      <Link to={legalPath(link.slug)} className={baseClass}>
        {link.label}
      </Link>
    );
  }

  if (link.type === 'external') {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
      >
        {link.label}
      </a>
    );
  }

  const runHomeAction = () => {
    if (link.action === 'distill') {
      onOpenDistiller();
      return;
    }
    onNavigateHome();
  };

  return (
    <button type="button" onClick={runHomeAction} className={`${baseClass} cursor-pointer`}>
      {link.label}
    </button>
  );
}

export function SiteFooter(_props: SiteFooterProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openDistiller } = useSiteModals();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      setSubscribed(true);
      setEmail('');
      setIsSubmitting(false);
    }, 600);
  };

  const onNavigateHome = () => {
    navigate(ROUTES.home);
  };

  const year = new Date().getFullYear();

  const isLinkActive = (link: FooterAction) =>
    link.type === 'route' && link.to === location.pathname;

  return (
    <footer
      className={`site-footer w-full bg-cream mt-auto border-t border-canvas/[0.08] ${
        location.pathname.startsWith('/cart')
          ? 'pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0'
          : ''
      }`}
    >
      {/* Tier 1 — subscribe + link columns */}
      <div className="px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pt-10 sm:pt-16 md:pt-24 lg:pt-28 pb-10 sm:pb-16 md:pb-24 lg:pb-28">
        <div className="flex flex-col gap-10 sm:gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16 xl:gap-24">
          <div className="w-full lg:max-w-[22rem] xl:max-w-[24rem] shrink-0">
            <p className="font-sans text-[13px] sm:text-[14px] text-canvas">
              Subscribe for updates
            </p>

            <form onSubmit={onSubscribe} className="mt-4 sm:mt-5 border-b border-canvas/25 pb-2">
              <div className="flex items-baseline justify-between gap-4">
                <input
                  type="email"
                  value={email}
                  placeholder="name@domain.com"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed || isSubmitting}
                  className="min-w-0 flex-1 bg-transparent font-sans text-[13px] sm:text-[14px] text-canvas placeholder:text-taupe-muted/50 outline-none disabled:opacity-50"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={subscribed || isSubmitting}
                  className="shrink-0 font-sans text-[13px] sm:text-[14px] text-canvas hover:opacity-50 transition-opacity cursor-pointer disabled:opacity-40 min-h-[44px] inline-flex items-center"
                >
                  {subscribed ? 'Done' : isSubmitting ? 'Sending…' : 'Submit →'}
                </button>
              </div>
            </form>

            <p className="font-sans text-[10px] sm:text-[11px] text-taupe-muted leading-[1.55] mt-3 sm:mt-4 max-w-[20rem]">
              {subscribed ? (
                'You are on the ledger. Batch drops and restocks only.'
              ) : (
                <>
                  By subscribing you agree to receive updates from Nocturne. See our{' '}
                  <Link
                    to={legalPath('privacy')}
                    className="underline underline-offset-2 hover:text-canvas"
                  >
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link
                    to={legalPath('terms')}
                    className="underline underline-offset-2 hover:text-canvas"
                  >
                    Terms & Conditions
                  </Link>
                  .
                </>
              )}
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-8 sm:gap-x-12 sm:gap-y-10 md:gap-x-14 lg:gap-x-16 xl:gap-x-20 min-w-0">
            {LINK_COLUMNS.map((col, colIndex) => (
              <ul
                key={colIndex}
                className={`space-y-2.5 sm:space-y-3.5 min-w-0 ${
                  colIndex === 2 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink
                      link={link}
                      onOpenDistiller={openDistiller}
                      onNavigateHome={onNavigateHome}
                      active={isLinkActive(link)}
                    />
                  </li>
                ))}
                {colIndex === 2 && (
                  <li className="pt-1">
                    <span className="font-sans text-[13px] sm:text-[14px] text-canvas">
                      © {year} Nocturne
                    </span>
                  </li>
                )}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* Tier 2 — full wordmark */}
      <div className="site-footer-wordmark w-full bg-cream border-t border-canvas/[0.06]">
        <div className="site-footer-wordmark-clip">
          <p className="site-footer-wordmark-text" aria-hidden>
            NOCTURNE
          </p>
        </div>
      </div>
    </footer>
  );
}
