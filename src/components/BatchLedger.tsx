import { useStore } from '../context/StoreContext';
import {
  formatTimeRemaining,
  getCycleTimeRemaining,
  getTotalMaxStock,
  getTotalStock,
} from '../services/storeSync';

interface BatchLedgerProps {
  className?: string;
}

export function BatchLedger({ className = '' }: BatchLedgerProps) {
  const { inventory, meta, storeReady } = useStore();

  if (!storeReady || !inventory || !meta) {
    return (
      <p
        className={`batch-ledger font-mono text-[8px] md:text-[9px] tracking-[0.14em] text-taupe-muted/75 uppercase tabular-nums ${className}`}
      >
        Batch 07 // loading live stock…
      </p>
    );
  }

  const remaining = getTotalStock(inventory);
  const total = getTotalMaxStock(inventory);
  const sold = total - remaining;
  const restockIn = formatTimeRemaining(getCycleTimeRemaining(meta));

  return (
    <p
      className={`batch-ledger font-mono text-[8px] md:text-[9px] tracking-[0.14em] text-taupe-muted/75 uppercase tabular-nums ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      Batch 07 // {remaining} left · {sold} sold today · restock in {restockIn}
    </p>
  );
}
