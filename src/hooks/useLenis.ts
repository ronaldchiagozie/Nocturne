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

function lockBodyScroll() {
  if (bodyLocked) return;
  bodyLocked = true;
  lockedScrollY = window.scrollY || window.pageYOffset || 0;

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

  // iOS: block background rubber-band unless the touch is inside a modal scroller
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

  window.scrollTo(0, lockedScrollY);
}

function initNativeScroll() {
  nativeScroll = true;
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });
  // Avoid normalizeScroll. It fights sticky/pin and causes card jitter on iOS
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

/** Init Lenis + ScrollTrigger sync (desktop). Native scroll on touch. Avoids pin jitter. */
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

/** Pause background scroll while modals are open */
export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) {
      lenis.stop();
      lockBodyScroll();
    } else {
      unlockBodyScroll();
      lenis.start();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
    return;
  }

  if (locked) {
    lockBodyScroll();
  } else {
    unlockBodyScroll();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}

export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.1 });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    return () => destroyLenisScroll();
  }, []);
}

/** Throttled video seek. Avoids frame-by-frame decode jitter */
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
      /* fall through */
    }
  }
  video.currentTime = target;
}
