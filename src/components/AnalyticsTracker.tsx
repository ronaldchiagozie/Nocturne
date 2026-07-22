import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../lib/analytics';

/** Sends a page view on first load and every client-side route change. */
export function AnalyticsTracker() {
  const location = useLocation();
  const bootedRef = useRef(false);

  useEffect(() => {
    if (!bootedRef.current) {
      initAnalytics();
      bootedRef.current = true;
    }
    trackPageView(`${location.pathname}${location.search}`, document.title);
  }, [location.pathname, location.search]);

  return null;
}
