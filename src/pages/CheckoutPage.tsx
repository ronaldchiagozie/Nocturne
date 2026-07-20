import { CheckoutFlow } from '../components/checkout/CheckoutFlow';
import { normalizeOrder } from '../data/orders';
import type { SimulatedOrder } from '../types';

export function CheckoutPage() {
  const handleOrderCreated = (orders: SimulatedOrder[]) => {
    try {
      const stored = localStorage.getItem('nocturne_batches');
      const existing = stored
        ? (JSON.parse(stored) as Record<string, unknown>[])
            .map((item) => normalizeOrder(item))
            .filter((o): o is SimulatedOrder => o !== null)
        : [];
      localStorage.setItem('nocturne_batches', JSON.stringify([...orders, ...existing]));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="bg-cream text-canvas min-h-screen">
      <CheckoutFlow onOrderCreated={handleOrderCreated} />
    </div>
  );
}
