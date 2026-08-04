import { useEffect, useRef } from 'react';
import { getProduct, PRODUCTS, type ProductId } from '../data/products';
import { formatTimeRemaining, getCycleTimeRemaining } from '../services/storeLedger';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';

function stockSnapshot(inventory: Record<ProductId, { stock: number }>) {
  return (Object.keys(PRODUCTS) as ProductId[]).reduce(
    (acc, id) => {
      acc[id] = inventory[id].stock;
      return acc;
    },
    {} as Record<ProductId, number>,
  );
}

/** Fires subtle scarcity toasts when live batch stock drops — replaces inline ledger on mobile. */
export function BatchLedgerToasts() {
  const { inventory, meta, storeReady } = useStore();
  const { showToast } = useToast();
  const prevStockRef = useRef<Record<ProductId, number> | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!storeReady || !inventory || !meta) return;

    const next = stockSnapshot(inventory);

    if (!readyRef.current) {
      prevStockRef.current = next;
      readyRef.current = true;
      return;
    }

    const prev = prevStockRef.current;
    if (!prev) return;

    const restockIn = formatTimeRemaining(getCycleTimeRemaining(meta));

    for (const id of Object.keys(PRODUCTS) as ProductId[]) {
      const was = prev[id];
      const now = next[id];
      if (now >= was) continue;

      const product = getProduct(id);

      if (now === 0) {
        showToast({
          variant: 'scarcity',
          title: `${product.title} sold out`,
          message: `Batch 07 · restock in ${restockIn}`,
        });
        continue;
      }

      showToast({
        variant: 'scarcity',
        title: `${product.label} claimed`,
        message: `${now} left in Batch 07 today`,
      });
    }

    prevStockRef.current = next;
  }, [inventory, meta, storeReady, showToast]);

  return null;
}
