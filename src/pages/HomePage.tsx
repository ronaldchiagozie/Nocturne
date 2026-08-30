import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { HeroScroll } from '../components/HeroScroll';
import { CloseSection } from '../components/PageSections';
import { FooterBottleDescent } from '../components/FooterBottleDescent';
import { SiteFooter } from '../components/SiteFooter';
import { ApertureIntro } from '../components/ApertureIntro';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useLenis,
  setScrollLocked,
  saveHomeScrollPosition,
  applyPendingHomeScrollRestore,
  isHomeScrollRestorePending,
  restoreHomeScrollPosition,
  scrollToYImmediate,
  subscribeScroll,
} from '../hooks/useLenis';
import { isMobileViewport, prefersReducedMotion } from '../hooks/useMotionPreference';
import { useProductDetail } from '../context/ProductDetailContext';
import { useSiteModals } from '../context/SiteModalsContext';

const REPEATED_LINE = 'One scent. Worn differently by everyone who wears it.';
const INTRO_SEEN_KEY = 'nocturne_intro_seen';

function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}

function shouldSkipIntro(): boolean {
  return hasSeenIntro() || isMobileViewport() || prefersReducedMotion();
}

export function HomePage() {
  const navigate = useNavigate();
  const { openProduct } = useProductDetail();
  const { openDistiller } = useSiteModals();
  const [menuOpen, setMenuOpen] = useState(false);
  const [introRevealed, setIntroRevealed] = useState(shouldSkipIntro);
  const closeBottleSourceRef = useRef<HTMLDivElement>(null);
  const footerBottleLandingRef = useRef<HTMLDivElement>(null);

  useLenis();

  const scrollLocked = !introRevealed || menuOpen;

  useEffect(() => {
    setScrollLocked(scrollLocked);
  }, [scrollLocked]);

  useLayoutEffect(() => {
    if (!introRevealed || !isHomeScrollRestorePending()) return;
    const y = restoreHomeScrollPosition();
    if (y > 0) scrollToYImmediate(y);
  }, [introRevealed]);

  useEffect(() => {
    if (!introRevealed) return;

    return applyPendingHomeScrollRestore(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
        requestAnimationFrame(() => ScrollTrigger.refresh(true));
      });
    });
  }, [introRevealed]);

  useEffect(() => {
    if (!introRevealed || menuOpen) return;

    let throttleId: number | null = null;
    const save = () => {
      if (throttleId) return;
      throttleId = window.setTimeout(() => {
        saveHomeScrollPosition();
        throttleId = null;
      }, 120);
    };

    const unsubScroll = subscribeScroll(save);
    window.addEventListener('scroll', save, { passive: true });
    const onPageHide = () => saveHomeScrollPosition();
    window.addEventListener('pagehide', onPageHide);

    return () => {
      unsubScroll();
      window.removeEventListener('scroll', save);
      window.removeEventListener('pagehide', onPageHide);
      if (throttleId) window.clearTimeout(throttleId);
    };
  }, [introRevealed, menuOpen]);

  useEffect(() => {
    if (!introRevealed) return;

    const onHeroReady = () => {
      if (isHomeScrollRestorePending()) {
        applyPendingHomeScrollRestore();
      }
    };
    window.addEventListener('nocturne-hero-ready', onHeroReady);
    return () => window.removeEventListener('nocturne-hero-ready', onHeroReady);
  }, [introRevealed]);

  return (
    <div className="relative bg-cream text-canvas min-h-screen">
      {!introRevealed && (
        <ApertureIntro
          onRevealed={() => {
            markIntroSeen();
            setIntroRevealed(true);
          }}
        />
      )}

      <Navigation
        onOpenCart={() => navigate('/cart')}
        onOpenDistiller={openDistiller}
        onOpenShop={() => navigate('/shop')}
        onMenuChange={setMenuOpen}
      />

      <HeroScroll
        scrollReady={introRevealed}
        onOpenDistiller={openDistiller}
        onOpenProductDetail={openProduct}
      />

      <CloseSection
        line={REPEATED_LINE}
        onOpenDistiller={openDistiller}
        onOpenProduct={openProduct}
        bottleSourceRef={closeBottleSourceRef}
      />

      {/* Runway for the descent. The bottle leaves the flagship card at the top
          of this stretch and is still travelling at the bottom of it, which is
          what gives the two ambient lines room to read. Sits after the section
          rather than inside it so it lengthens the scrub without also pushing
          the trigger's start point down. Desktop only — the descent is too. */}
      <div className="hidden md:block h-[68vh] lg:h-[76vh] bg-cream" aria-hidden />

      <SiteFooter bottleLandingRef={footerBottleLandingRef} />

      {/* After the footer on purpose: React attaches refs and runs layout
          effects in tree order, so mounted before it this never saw
          landingRef.current and silently skipped building its ScrollTrigger.
          It renders only fixed-position layers, so document order is free. */}
      <FooterBottleDescent
        sourceRef={closeBottleSourceRef}
        landingRef={footerBottleLandingRef}
      />
    </div>
  );
}
