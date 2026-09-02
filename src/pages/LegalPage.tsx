import { Link, useParams } from 'react-router-dom';
import { isLegalSlug, LEGAL_LINKS, legalPath, ROUTES } from '../data/routes';

const LEGAL: Record<
  string,
  { title: string; body: string[] }
> = {
  shipping: {
    title: 'Shipping Policy',
    body: [
      'All Nocturne extrait orders ship from our Lekki atelier within 3–5 business days of confirmation.',
      'We deliver nationwide across Nigeria via insured courier. You will receive tracking once your batch leaves the atelier.',
      'Shipping is complimentary on all orders and returns.',
    ],
  },
  returns: {
    title: 'Returns',
    body: [
      'Because each extrait is compounded to order, we accept returns only when a bottle arrives damaged or incorrect.',
      'Contact us within 48 hours of delivery with your order reference and photographs. We will arrange a replacement or refund.',
      'Opened bottles cannot be returned for change of mind.',
    ],
  },
  faq: {
    title: 'FAQ',
    body: [
      'How long does compounding take? Most orders ship within 3–5 days. Limited batches may restock on a rolling schedule.',
      'What concentration is Nocturne? Our formulations are extrait de parfum, typically 28–30% concentration in 50ml.',
      'Can I visit the atelier? The Lagos atelier is by appointment. Write to us through Instagram for private consultations.',
    ],
  },
  privacy: {
    title: 'Privacy',
    body: [
      'We collect only what is needed to fulfil your order: name, contact details, and delivery address.',
      'We use privacy-friendly analytics (Vercel Analytics and, when enabled, Google Analytics) to understand site traffic, such as pages visited, approximate location, and device type. No personal profiles are sold.',
      'Email subscribers receive batch and restock updates. You may unsubscribe at any time.',
      'We do not sell your data. Order details are stored to fulfil your purchase. Online card payment will be added soon; until then, payment is arranged by email after you place an order.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    body: [
      'By placing an order with Nocturne you agree to these terms and our shipping and returns policies.',
      'All fragrances are sold as compounded extrait de parfum. Payment is confirmed separately after your order is received unless otherwise stated at checkout.',
      'Prices are listed in Nigerian Naira. Nocturne reserves the right to refuse or cancel orders at its discretion.',
    ],
  },
};

export function LegalPage() {
  const { topic } = useParams<{ topic: string }>();
  const page = topic && isLegalSlug(topic) ? LEGAL[topic] : undefined;

  if (!page) {
    return (
      <div className="bg-cream text-canvas min-h-screen px-5 sm:px-6 md:px-12 py-10 max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl tracking-tight">Page not found</h1>
        <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-3 leading-relaxed">
          This policy does not exist. Explore the collection or return home.
        </p>
        <Link
          to={ROUTES.shop}
          className="inline-flex items-center mt-6 min-h-[44px] font-sans text-[10px] uppercase tracking-[0.26em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
        >
          Shop the collection →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream text-canvas min-h-screen">
      <div className="px-5 sm:px-6 md:px-12 pt-7 sm:pt-10 pb-6 border-b border-canvas/10 max-w-2xl mx-auto">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-taupe-muted mb-3">
          Legal
        </p>
        <h1 className="font-serif text-[clamp(1.65rem,5vw,2.35rem)] tracking-tight leading-tight">
          {page.title}
        </h1>
      </div>

      <div className="px-5 sm:px-6 md:px-12 py-8 sm:py-10 max-w-2xl mx-auto space-y-5">
        {page.body.map((paragraph) => (
          <p
            key={paragraph.slice(0, 24)}
            className="font-body-italic italic text-[0.9375rem] md:text-base text-taupe-muted font-light leading-[1.75]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="px-5 sm:px-6 md:px-12 pb-12 sm:pb-16 max-w-2xl mx-auto border-t border-canvas/10 pt-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-taupe-muted mb-4">
          More policies
        </p>
        <ul className="flex flex-col gap-1">
          {LEGAL_LINKS.map(({ slug, label }) => {
            const active = slug === topic;
            return (
              <li key={slug}>
                <Link
                  to={legalPath(slug)}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center min-h-[44px] font-sans text-[13px] transition-colors ${
                    active
                      ? 'text-canvas underline underline-offset-[5px] decoration-canvas/35'
                      : 'text-taupe-muted hover:text-canvas'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
