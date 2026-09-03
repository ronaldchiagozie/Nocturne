import { useEffect, useState } from 'react';

const STORAGE_KEY = 'nocturne_batch_ledger';
const BATCH_TOTAL = 150;
const BATCH_NUMBER = '07';
const MIN_ALLOCATED = 118;
const TICK_CHECK_MS = 30_000;
const TICK_INTERVAL_MIN_MS = 3 * 60_000;
const TICK_INTERVAL_MAX_MS = 5 * 60_000;

interface LedgerState {
  allocated: number;
  nextTickAt: number;
}

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function nextTickTimestamp(from = Date.now()) {
  return from + randomInt(TICK_INTERVAL_MIN_MS, TICK_INTERVAL_MAX_MS);
}

function loadLedger(): LedgerState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LedgerState;
      if (typeof parsed.allocated === 'number' && typeof parsed.nextTickAt === 'number') {
        return {
          allocated: Math.max(MIN_ALLOCATED, Math.min(BATCH_TOTAL - 1, parsed.allocated)),
          nextTickAt: parsed.nextTickAt,
        };
      }
    }
  } catch {
  }

  return {
    allocated: randomInt(128, 134),
    nextTickAt: nextTickTimestamp(),
  };
}

function saveLedger(state: LedgerState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
  }
}

function applyDueTicks(state: LedgerState): LedgerState {
  let { allocated, nextTickAt } = state;
  const now = Date.now();

  while (now >= nextTickAt && allocated > MIN_ALLOCATED) {
    allocated = Math.max(MIN_ALLOCATED, allocated - randomInt(1, 2));
    nextTickAt = nextTickTimestamp(nextTickAt);
  }

  if (allocated <= MIN_ALLOCATED) {
    nextTickAt = now + TICK_INTERVAL_MAX_MS;
  }

  return { allocated, nextTickAt };
}

export function useBatchLedger() {
  const [allocated, setAllocated] = useState(() => loadLedger().allocated);

  useEffect(() => {
    let state = applyDueTicks(loadLedger());
    setAllocated(state.allocated);
    saveLedger(state);

    const interval = window.setInterval(() => {
      state = applyDueTicks(state);
      setAllocated(state.allocated);
      saveLedger(state);
    }, TICK_CHECK_MS);

    return () => window.clearInterval(interval);
  }, []);

  return { allocated, total: BATCH_TOTAL, batchNumber: BATCH_NUMBER };
}
