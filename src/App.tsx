import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HeroScroll } from './components/HeroScroll';
import { FusionScroll } from './components/FusionScroll';
import { CloseSection, SiteFooter } from './components/PageSections';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { useLenis } from './hooks/useLenis';
import { SimulatedOrder } from './types';

const REPEATED_LINE = 'One scent. Worn differently by everyone who wears it.';

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<SimulatedOrder[]>([]);

  useLenis();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nocturne_batches');
      if (stored) setOrders(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

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
      <Navigation onCheckout={() => setDrawerOpen(true)} />

      <HeroScroll onCheckout={() => setDrawerOpen(true)} />

      {/* <FusionScroll onCheckout={() => setDrawerOpen(true)} /> */}

      <CloseSection line={REPEATED_LINE} />

      <SiteFooter />

      <CheckoutDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}
