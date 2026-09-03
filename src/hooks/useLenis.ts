import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;
let onLoad: (() => void) | null = null;
let onRefresh: (() => void) | null = null;
let nativeScroll = false;
let bodyLocked = false;
let lockedScrollY = 0;
let touchMoveBlock: ((e: TouchEvent) => void) | null = null;

export const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches);

function allowModalTouch(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[data-modal-scroll]'));
}

let scrollLockCount = 0;

function getScrollY(): number {
  if (bodyLocked) return lockedScrollY;
  if (lenis) return lenis.scroll;
  return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
}

export function readScrollY(): number {
  return getScrollY();
}

function restoreScrollY(y: number) {
  if (lenis) {
    lenis.scrollTo(y, { immediate: true });
    return;
  }
  window.scrollTo(0, y);
}

function lockBodyScroll() {
  if (bodyLocked) return;
  bodyLocked = true;
  lockedScrollY = getScrollY();

  const html = document.documentElement;
  const { body } = document;

  html.classList.add('scroll-locked');
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${lockedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overscrollBehavior = 'none';

  touchMoveBlock = (e: TouchEvent) => {
    if (allowModalTouch(e.target)) return;
    e.preventDefault();
  };
  document.addEventListener('touchmove', touchMoveBlock, { passive: false });
}

function unlockBodyScroll() {
  if (!bodyLocked) return;
  bodyLocked = false;

  if (touchMoveBlock) {
    document.removeEventListener('touchmove', touchMoveBlock);
    touchMoveBlock = null;
  }

  const html = document.documentElement;
  const { body } = document;

  html.classList.remove('scroll-locked');
  html.style.overflow = '';
  body.style.overflow = '';
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  body.style.overscrollBehavior = '';

  restoreScrollY(lockedScrollY);
}

function applyScrollLock() {
  lockedScrollY = getScrollY();
  if (lenis) {
    lenis.stop();
    return;
  }
  lockBodyScroll();
}

function releaseScrollLock() {
  const savedY = bodyLocked ? lockedScrollY : lockedScrollY || getScrollY();

  if (lenis) {
    lenis.start();
  }
  if (bodyLocked) {
    unlockBodyScroll();
  }

  requestAnimationFrame(() => {
    if (savedY > 0) restoreScrollY(savedY);
    ScrollTrigger.refresh(true);
    requestAnimationFrame(() => {
      if (savedY > 0) restoreScrollY(savedY);
      ScrollTrigger.getAll().forEach((trigger) => trigger.update());
      window.dispatchEvent(new CustomEvent('nocturne-scroll-restored'));
    });
  });
}

function initNativeScroll() {
  nativeScroll = true;
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });

  ScrollTrigger.normalizeScroll(false);
  ScrollTrigger.defaults({ pinType: 'fixed' });
  ScrollTrigger.refresh();
}

function teardownNativeScroll() {
  if (!nativeScroll) return;
  ScrollTrigger.normalizeScroll(false);
  unlockBodyScroll();
  nativeScroll = false;
}

export function initLenisScroll() {
  if (lenis || nativeScroll) return lenis;

  if (isTouchDevice()) {
    initNativeScroll();
    return null;
  }

  const root = document.documentElement;

  ScrollTrigger.config({ ignoreMobileResize: true });
  ScrollTrigger.defaults({ pinType: 'transform' });

  lenis = new Lenis({
    autoRaf: false,
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.1,
    syncTouch: false,
    lerp: 0.085,
  });

  lenis.on('scroll', ScrollTrigger.update);

  tickerFn = (time: number) => {
    lenis!.raf(time * 1000);
  };
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(root, {
    scrollTop(value) {
      if (arguments.length) {
        lenis!.scrollTo(value, { immediate: true });
      }
      return lenis!.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: 'transform',
  });

  onRefresh = () => lenis!.resize();
  ScrollTrigger.addEventListener('refresh', onRefresh);

  onLoad = () => ScrollTrigger.refresh();
  window.addEventListener('load', onLoad);

  ScrollTrigger.refresh();

  return lenis;
}

export function setScrollLocked(locked: boolean) {
  if (locked) {
    scrollLockCount += 1;
    if (scrollLockCount === 1) applyScrollLock();
    return;
  }

  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) releaseScrollLock();
}

export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.1 });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToTopImmediate() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
    return;
  }
  window.scrollTo(0, 0);
}

const HOME_SCROLL_KEY = 'nocturne_home_scroll';
let homeRestorePending = false;
let lastHomeScrollY = 0;

try {
  const bootRaw = sessionStorage.getItem(HOME_SCROLL_KEY);
  if (bootRaw != null) {
    const bootY = Number(bootRaw);
    if (Number.isFinite(bootY) && bootY > 0) lastHomeScrollY = bootY;
  }
} catch {
}

function persistHomeScrollY(y: number) {
  if (!Number.isFinite(y) || y <= 0) return;
  lastHomeScrollY = y;
  try {
    sessionStorage.setItem(HOME_SCROLL_KEY, String(Math.round(y)));
  } catch {
  }
}

export function saveHomeScrollPosition() {
  const y = getScrollY();
  if (y > 0) {
    persistHomeScrollY(y);
    return y;
  }
  return lastHomeScrollY;
}

export function captureHomeScrollBeforeLeave() {
  const y = getScrollY();
  if (y > 0) {
    persistHomeScrollY(y);
    return y;
  }
  return lastHomeScrollY;
}

export function restoreHomeScrollPosition(): number {
  try {
    const raw = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (raw != null) {
      const y = Number(raw);
      if (Number.isFinite(y) && y > 0) {
        lastHomeScrollY = Math.max(lastHomeScrollY, y);
      }
    }
  } catch {
  }
  return lastHomeScrollY;
}

export function markHomeScrollRestore() {
  homeRestorePending = true;
}

export function isHomeScrollRestorePending(): boolean {
  return homeRestorePending;
}

export function clearHomeScrollRestorePending() {
  homeRestorePending = false;
}

export function applyPendingHomeScrollRestore(onSettled?: () => void): () => void {
  if (!homeRestorePending) return () => {};

  const targetY = restoreHomeScrollPosition();
  if (targetY <= 0) {
    clearHomeScrollRestorePending();
    onSettled?.();
    return () => {};
  }

  let cancelled = false;
  let attempts = 0;
  const maxAttempts = 24;

  const finish = () => {
    clearHomeScrollRestorePending();
    window.dispatchEvent(new CustomEvent('nocturne-scroll-restored'));
    onSettled?.();
  };

  const attempt = () => {
    if (cancelled || !homeRestorePending) return;

    scrollToYImmediate(targetY);
    ScrollTrigger.refresh(true);

    attempts += 1;
    const current = getScrollY();
    const settled = Math.abs(current - targetY) <= 32;

    if (settled || attempts >= maxAttempts) {
      if (!settled && attempts >= maxAttempts) {
        scrollToYImmediate(targetY);
      }
      finish();
      return;
    }

    window.setTimeout(() => requestAnimationFrame(attempt), 80 + attempts * 40);
  };

  window.setTimeout(() => requestAnimationFrame(attempt), 100);

  return () => {
    cancelled = true;
  };
}

export function subscribeScroll(handler: () => void): () => void {
  initLenisScroll();
  if (lenis) {
    lenis.on('scroll', handler);
    return () => lenis?.off('scroll', handler);
  }
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}

export function scrollToYImmediate(y: number) {
  restoreScrollY(Math.max(0, y));
}

export function destroyLenisScroll() {
  if (onLoad) {
    window.removeEventListener('load', onLoad);
    onLoad = null;
  }
  if (onRefresh) {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    onRefresh = null;
  }
  if (tickerFn) {
    gsap.ticker.remove(tickerFn);
    tickerFn = null;
  }
  if (lenis) {
    lenis.destroy();
    lenis = null;
    ScrollTrigger.scrollerProxy(document.documentElement, {});
  }
  teardownNativeScroll();
  ScrollTrigger.clearScrollMemory();
}

export function useLenis() {
  useEffect(() => {
    initLenisScroll();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);
}

export function seekVideo(video: HTMLVideoElement, time: number) {
  const duration = video.duration;
  if (!duration || !Number.isFinite(duration)) return;

  const target = Math.max(0, Math.min(time, duration - 0.04));
  if (Math.abs(video.currentTime - target) < 0.045) return;

  if ('fastSeek' in video && typeof video.fastSeek === 'function') {
    try {
      video.fastSeek(target);
      return;
    } catch {
    }
  }
  video.currentTime = target;
}
