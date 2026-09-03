
export const ROUTES = {
  home: '/',
  shop: '/shop',
  cart: '/cart',
  checkout: '/checkout',
} as const;

export const LEGAL_SLUGS = ['shipping', 'returns', 'faq', 'privacy', 'terms'] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function legalPath(slug: LegalSlug): `/legal/${LegalSlug}` {
  return `/legal/${slug}`;
}

export function isLegalSlug(topic: string | undefined): topic is LegalSlug {
  return LEGAL_SLUGS.includes(topic as LegalSlug);
}

export const SITEMAP_PATHS: readonly string[] = [
  ROUTES.home,
  ROUTES.shop,
  ROUTES.cart,
  ROUTES.checkout,
  ...LEGAL_SLUGS.map((slug) => legalPath(slug)),
];

export const LEGAL_LINKS: { slug: LegalSlug; label: string }[] = [
  { slug: 'shipping', label: 'Shipping Policy' },
  { slug: 'returns', label: 'Returns' },
  { slug: 'faq', label: 'FAQ' },
  { slug: 'privacy', label: 'Privacy' },
  { slug: 'terms', label: 'Terms & Conditions' },
];
