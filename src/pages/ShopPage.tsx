import { AnimatePresence, motion } from 'motion/react';
import { useShopLayoutMode } from '../hooks/useShopLayoutMode';
import { useShopReady } from '../hooks/useShopReady';
import { ShopGridLayout } from '../components/shop/ShopGridLayout';
import { ShopLedgerLayout } from '../components/shop/ShopLedgerLayout';
import { ShopGridSkeleton, ShopLedgerSkeleton } from '../components/shop/ShopSkeleton';

export function ShopPage() {
  const [mode] = useShopLayoutMode();
  const ready = useShopReady();

  return (
    <div className="bg-cream text-canvas min-h-screen">
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div
            key="shop-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === 'ledger' ? <ShopLedgerSkeleton /> : <ShopGridSkeleton />}
          </motion.div>
        ) : (
          <motion.div
            key="shop-content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === 'ledger' ? <ShopLedgerLayout /> : <ShopGridLayout />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
