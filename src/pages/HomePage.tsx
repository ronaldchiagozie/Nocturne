import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { HeroScroll } from '../components/HeroScroll';
import { CloseSection } from '../components/PageSections';
import { SiteFooter } from '../components/SiteFooter';
import { ApertureIntro } from '../components/ApertureIntro';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis, setScrollLocked } from '../hooks/useLenis';
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
  const { openDistiller, openCollections } = useSiteModals();
  const [menuOpen, setMenuOpen] = useState(false);
  const [introRevealed, setIntroRevealed] = useState(shouldSkipIntro);

  useLenis();

  const scrollLocked = !introRevealed || menuOpen;

  useEffect(() => {
    setScrollLocked(scrollLocked);
  }, [scrollLocked]);

  useEffect(() => {
    if (!introRevealed) return;
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
    return () => cancelAnimationFrame(id);
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
        onOpenCollections={openCollections}
        onOpenShop={() => navigate('/shop')}
        onMenuChange={setMenuOpen}
      />

      <HeroScroll
        scrollReady={introRevealed}
        onOpenDistiller={openDistiller}
        onOpenProductDetail={openProduct}
      />

      <CloseSection line={REPEATED_LINE} onOpenDistiller={openDistiller} />

      <SiteFooter
        homeActions={{
          onOpenDistiller: openDistiller,
          onOpenCollections: openCollections,
        }}
      />
    </div>
  );
}
