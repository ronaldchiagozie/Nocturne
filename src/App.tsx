import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HeroScroll } from './components/HeroScroll';
import { CloseSection } from './components/PageSections';
import { SiteFooter } from './components/SiteFooter';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { ScentVault, VaultTab } from './components/ScentVault';
import { Distiller } from './components/Distiller';
import { CollectionsPanel } from './components/CollectionsPanel';
import { ProductDetailPanel } from './components/ProductDetailPanel';
import { useLenis, setScrollLocked } from './hooks/useLenis';
import { DistillerResult } from './data/distiller';
import { DEFAULT_PRODUCT_ID, ProductId } from './data/products';
import { normalizeOrder } from './data/orders';
import { CheckoutOverride, SimulatedOrder } from './types';

const REPEATED_LINE = 'One scent. Worn differently by everyone who wears it.';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [distillerOpen, setDistillerOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [checkoutProductId, setCheckoutProductId] = useState<ProductId>(DEFAULT_PRODUCT_ID);
  const [checkoutOverride, setCheckoutOverride] = useState<CheckoutOverride | undefined>();
  const [orders, setOrders] = useState<SimulatedOrder[]>([]);
  const [detailProductId, setDetailProductId] = useState<ProductId | null>(null);

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
    menuOpen ||
    drawerOpen ||
    vaultOpen ||
    distillerOpen ||
    collectionsOpen ||
    detailProductId !== null;

  useEffect(() => {
    setScrollLocked(scrollLocked);
  }, [scrollLocked]);

  const openCheckout = (
    productId: ProductId = DEFAULT_PRODUCT_ID,
    override?: CheckoutOverride,
  ) => {
    setCheckoutProductId(productId);
    setCheckoutOverride(override);
    setDrawerOpen(true);
  };

  const handleDistillerSecure = (result: DistillerResult) => {
    openCheckout(result.productId, {
      variantId: result.variantId,
      formulationLabel: result.formulationLabel,
      productLabel: `No. ${result.formulationNumber}`,
      productTitle: result.formulationName,
    });
  };

  const handleOrderCreated = (order: SimulatedOrder) => {
    const updated = [order, ...orders];
    setOrders(updated);
    try {
      localStorage.setItem('nocturne_batches', JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative bg-cream text-canvas min-h-screen">
      <Navigation
        orderCount={orders.length}
        onCheckout={() => openCheckout()}
        onOpenVault={() => setVaultOpen(true)}
        onOpenDistiller={() => setDistillerOpen(true)}
        onOpenCollections={() => setCollectionsOpen(true)}
        onMenuChange={setMenuOpen}
      />

      <HeroScroll
        onCheckout={openCheckout}
        onOpenDistiller={() => setDistillerOpen(true)}
        onOpenProductDetail={setDetailProductId}
      />

      <CloseSection line={REPEATED_LINE} />

      <SiteFooter
        orderCount={orders.length}
        onCheckout={() => openCheckout()}
        onOpenDistiller={() => setDistillerOpen(true)}
        onOpenVault={() => setVaultOpen(true)}
        onOpenCollections={() => setCollectionsOpen(true)}
      />

      <VaultTab
        count={orders.length}
        isHidden={
          vaultOpen || distillerOpen || collectionsOpen || menuOpen || detailProductId !== null
        }
        onOpen={() => setVaultOpen(true)}
      />

      <CollectionsPanel
        isOpen={collectionsOpen}
        onClose={() => setCollectionsOpen(false)}
        onSelectProduct={setDetailProductId}
        onOpenDistiller={() => setDistillerOpen(true)}
      />

      <Distiller
        isOpen={distillerOpen}
        onClose={() => setDistillerOpen(false)}
        onSecure={handleDistillerSecure}
        onViewSpec={(result) => setDetailProductId(result.productId)}
      />

      <ProductDetailPanel
        productId={detailProductId}
        onClose={() => setDetailProductId(null)}
        onCheckout={(productId) => {
          setDetailProductId(null);
          setCollectionsOpen(false);
          setDistillerOpen(false);
          openCheckout(productId);
        }}
      />

      <CheckoutDrawer
        isOpen={drawerOpen}
        productId={checkoutProductId}
        override={checkoutOverride}
        onClose={() => {
          setDrawerOpen(false);
          setCheckoutOverride(undefined);
        }}
        onOrderCreated={handleOrderCreated}
        onSecuredClose={() => setTimeout(() => setVaultOpen(true), 450)}
      />

      <ScentVault isOpen={vaultOpen} orders={orders} onClose={() => setVaultOpen(false)} />
    </div>
  );
}
