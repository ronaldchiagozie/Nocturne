import { useShopLayoutMode } from '../hooks/useShopLayoutMode';
import { ShopGridLayout } from '../components/shop/ShopGridLayout';
import { ShopLedgerLayout } from '../components/shop/ShopLedgerLayout';

export function ShopPage() {
  const [mode] = useShopLayoutMode();

  return (
    <div className="bg-cream text-canvas min-h-screen pb-20">
      {mode === 'ledger' ? <ShopLedgerLayout /> : <ShopGridLayout />}
    </div>
  );
}
