import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { HeroScroll } from '../components/HeroScroll';
import { CloseSection } from '../components/PageSections';
import { HomeMiddleSections } from '../components/HomeSections';
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

      <HomeMiddleSections repeatedLine={REPEATED_LINE} onOpenDistiller={openDistiller} />

      <CloseSection
        line={REPEATED_LINE}
        onOpenDistiller={openDistiller}
        onOpenProduct={openProduct}
        bottleSourceRef={closeBottleSourceRef}
      />

      <div className="h-[52vh] md:h-[68vh] lg:h-[76vh] bg-cream" aria-hidden />

      <SiteFooter bottleLandingRef={footerBottleLandingRef} />

      <FooterBottleDescent
        sourceRef={closeBottleSourceRef}
        landingRef={footerBottleLandingRef}
      />
    </div>
  );
}
