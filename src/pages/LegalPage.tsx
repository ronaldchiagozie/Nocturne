import { Link, useParams } from 'react-router-dom';
import { isLegalSlug, ROUTES } from '../data/routes';

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
      'Email subscribers receive batch and restock updates. You may unsubscribe at any time.',
      'We do not sell your data. Payment processing is handled by our payment partners under their own privacy terms.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    body: [
      'By placing an order with Nocturne you agree to these terms and our shipping and returns policies.',
      'All fragrances are sold as compounded extrait de parfum. Descriptions and batch availability may change without notice.',
      'Prices are listed in Nigerian Naira. Nocturne reserves the right to refuse or cancel orders at its discretion.',
    ],
  },
};

export function LegalPage() {
  const { topic } = useParams<{ topic: string }>();
  const page = topic && isLegalSlug(topic) ? LEGAL[topic] : undefined;

  if (!page) {
    return (
      <div className="bg-cream text-canvas min-h-screen px-6 md:px-12 py-16 max-w-2xl mx-auto">
        <Link
          to={ROUTES.home}
          className="font-sans text-[9px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors"
        >
          ← Back
        </Link>
        <h1 className="font-serif text-2xl mt-8">Page not found</h1>
        <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-4 leading-relaxed">
          This policy does not exist. Explore the collection or return home.
        </p>
        <Link
          to={ROUTES.shop}
          className="inline-block mt-8 font-sans text-[9px] uppercase tracking-[0.26em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
        >
          Shop the collection →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream text-canvas min-h-screen">
      <div className="px-6 md:px-12 pt-12 pb-8 border-b border-canvas/10 max-w-2xl mx-auto">
        <Link
          to={ROUTES.home}
          className="font-sans text-[9px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors"
        >
          ← Nocturne
        </Link>
        <h1 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] tracking-tight mt-6">{page.title}</h1>
      </div>
      <div className="px-6 md:px-12 py-10 max-w-2xl mx-auto space-y-6">
        {page.body.map((paragraph) => (
          <p
            key={paragraph.slice(0, 24)}
            className="font-body-italic italic text-sm md:text-base text-taupe-muted font-light leading-relaxed"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
