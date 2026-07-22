import { useCallback, useEffect, useState } from 'react';

export type ShopLayoutMode = 'grid' | 'ledger';

const STORAGE_KEY = 'nocturne_shop_layout_v2';
const CHANGE_EVENT = 'nocturne-shop-layout-change';
const DEFAULT_MODE: ShopLayoutMode = 'grid';

function readMode(): ShopLayoutMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'grid' || stored === 'ledger') return stored;
  return DEFAULT_MODE;
}

export function useShopLayoutMode() {
  const [mode, setModeState] = useState<ShopLayoutMode>(DEFAULT_MODE);

  useEffect(() => {
    setModeState(readMode());
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
