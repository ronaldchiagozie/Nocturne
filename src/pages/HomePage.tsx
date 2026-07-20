import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { HeroScroll } from '../components/HeroScroll';
import { CloseSection } from '../components/PageSections';
import { SiteFooter } from '../components/SiteFooter';
import { ScentVault, VaultTab } from '../components/ScentVault';
import { Distiller } from '../components/Distiller';
import { CollectionsPanel } from '../components/CollectionsPanel';
import { ApertureIntro } from '../components/ApertureIntro';
import { useLenis, setScrollLocked } from '../hooks/useLenis';
import { useProductDetail } from '../context/ProductDetailContext';
import { normalizeOrder } from '../data/orders';
import { SimulatedOrder } from '../types';

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

export function HomePage() {
  const navigate = useNavigate();
  const { productId: detailProductId, openProduct } = useProductDetail();
  const [menuOpen, setMenuOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [distillerOpen, setDistillerOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [orders, setOrders] = useState<SimulatedOrder[]>([]);
  const [introRevealed, setIntroRevealed] = useState(hasSeenIntro);

  useLenis();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nocturne_batches');
      if (!stored) return;
      const parsed = JSON.parse(stored) as Record<string, unknown>[];
      const normalized = parsed
        .map((item) => normalizeOrder(item))
        .filter((order): order is SimulatedOrder => order !== null);
      setOrders(normalized);
    } catch {
      /* ignore */
    }
  }, []);

  const scrollLocked =
    !introRevealed || menuOpen || vaultOpen || distillerOpen || collectionsOpen;

  useEffect(() => {
    setScrollLocked(scrollLocked);
  }, [scrollLocked]);

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
        orderCount={orders.length}
        onOpenCart={() => navigate('/cart')}
        onOpenVault={() => setVaultOpen(true)}
        onOpenDistiller={() => setDistillerOpen(true)}
        onOpenCollections={() => setCollectionsOpen(true)}
        onOpenShop={() => navigate('/shop')}
        onMenuChange={setMenuOpen}
      />

      <HeroScroll
        onOpenDistiller={() => setDistillerOpen(true)}
        onOpenProductDetail={openProduct}
      />

      <CloseSection line={REPEATED_LINE} />

      <SiteFooter
        orderCount={orders.length}
        onOpenCart={() => navigate('/cart')}
        onOpenDistiller={() => setDistillerOpen(true)}
        onOpenVault={() => setVaultOpen(true)}
        onOpenCollections={() => setCollectionsOpen(true)}
        onOpenShop={() => navigate('/shop')}
      />

      <VaultTab
        count={orders.length}
        isHidden={
          !introRevealed ||
          vaultOpen ||
          distillerOpen ||
          collectionsOpen ||
          menuOpen ||
          detailProductId !== null
        }
        onOpen={() => setVaultOpen(true)}
      />

      <CollectionsPanel
        isOpen={collectionsOpen}
        onClose={() => setCollectionsOpen(false)}
        onSelectProduct={(item) => {
          openProduct(item.productId, {
            variantId: item.variantId,
            productLabel: item.label,
            productTitle: item.name,
          });
          setCollectionsOpen(false);
        }}
        onOpenDistiller={() => setDistillerOpen(true)}
      />

      <Distiller
        isOpen={distillerOpen}
        onClose={() => setDistillerOpen(false)}
        onViewSpec={(result) => {
          openProduct(result.productId, {
            variantId: result.variantId,
            formulationLabel: result.formulationLabel,
            productLabel: `No. ${result.formulationNumber}`,
            productTitle: result.formulationName,
          });
        }}
      />

      <ScentVault isOpen={vaultOpen} orders={orders} onClose={() => setVaultOpen(false)} />
    </div>
  );
}
