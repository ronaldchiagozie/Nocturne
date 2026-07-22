import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTopImmediate } from '../hooks/useLenis';

/** Scroll to top whenever the route pathname changes. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTopImmediate();
  }, [pathname]);

  return null;
}
