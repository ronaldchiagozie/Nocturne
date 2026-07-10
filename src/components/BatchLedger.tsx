import { useBatchLedger } from '../hooks/useBatchLedger';

interface BatchLedgerProps {
  className?: string;
}

export function BatchLedger({ className = '' }: BatchLedgerProps) {
  const { allocated, total, batchNumber } = useBatchLedger();

  return (
    <p
      className={`batch-ledger font-mono text-[8px] md:text-[9px] tracking-[0.14em] text-taupe-muted/75 uppercase tabular-nums ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      Batch {batchNumber} // {allocated} of {total} bottles allocated globally
    </p>
  );
}
