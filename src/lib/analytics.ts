import { getApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { getFirebaseInitError, isFirebaseConfigured } from './firebase';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? '';

let firebaseAnalytics: Analytics | null = null;
let firebaseAnalyticsReady: Promise<Analytics | null> | null = null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isGaConfigured(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  initGoogleAnalytics();
  firebaseAnalyticsReady = initFirebaseAnalytics();
}

function initGoogleAnalytics(): void {
  if (!isGaConfigured() || window.gtag) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (!isFirebaseConfigured || getFirebaseInitError()) return null;
  if (!(await isSupported())) return null;

  try {
    firebaseAnalytics = getAnalytics(getApp());
    return firebaseAnalytics;
  } catch {
    return null;
  }
}

async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (firebaseAnalytics) return firebaseAnalytics;
  if (!firebaseAnalyticsReady) return null;
  return firebaseAnalyticsReady;
}

export function trackPageView(path: string, title?: string): void {
  const pageTitle = title ?? document.title;

  if (isGaConfigured() && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: pageTitle,
    });
  }

  void getFirebaseAnalytics().then((analytics) => {
    if (!analytics) return;
    logEvent(analytics, 'page_view', {
      page_path: path,
      page_title: pageTitle,
    });
  });
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (isGaConfigured() && window.gtag) {
    window.gtag('event', name, params);
  }

  void getFirebaseAnalytics().then((analytics) => {
    if (!analytics) return;
    logEvent(analytics, name, params);
  });
}

/** Fired when an order is successfully placed. */
export function trackPurchase(input: {
  orderId: string;
  valueNgn: number;
  itemCount: number;
}): void {
  trackEvent('purchase', {
    transaction_id: input.orderId,
    value: input.valueNgn,
    currency: 'NGN',
    items: input.itemCount,
  });
}
