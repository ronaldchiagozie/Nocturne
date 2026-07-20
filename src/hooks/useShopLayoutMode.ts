import { useCallback, useEffect, useState } from 'react';

export type ShopLayoutMode = 'grid' | 'ledger';

const STORAGE_KEY = 'nocturne_shop_layout';
const CHANGE_EVENT = 'nocturne-shop-layout-change';

function readMode(): ShopLayoutMode {
  if (typeof window === 'undefined') return 'grid';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'ledger' ? 'ledger' : 'grid';
}

export function useShopLayoutMode() {
  const [mode, setModeState] = useState<ShopLayoutMode>(readMode);

  useEffect(() => {
    const sync = () => setModeState(readMode());
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  const setMode = useCallback((next: ShopLayoutMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return [mode, setMode] as const;
}
