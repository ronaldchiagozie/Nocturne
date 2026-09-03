import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  markHomeScrollRestore,
  captureHomeScrollBeforeLeave,
  scrollToYImmediate,
  scrollToTopImmediate,
  restoreHomeScrollPosition,
} from '../hooks/useLenis';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;

    if (prev === null) {
      if (pathname !== '/') scrollToTopImmediate();
      return;
    }

    if (prev === pathname) return;

    if (prev === '/' && pathname !== '/') {
      captureHomeScrollBeforeLeave();
      scrollToTopImmediate();
      return;
    }

    if (pathname === '/' && prev !== '/') {
      markHomeScrollRestore();
      const y = restoreHomeScrollPosition();
      if (y > window.innerHeight * 1.5) {
        document.documentElement.classList.add('hero-restore-pending');
      }
      if (y > 0) scrollToYImmediate(y);
      return;
    }

    scrollToTopImmediate();
  }, [pathname]);

  return null;
}
