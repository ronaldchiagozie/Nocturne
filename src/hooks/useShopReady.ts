import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

const MIN_SKELETON_MS = 420;

export function useShopReady() {
  const { storeReady } = useStore();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_SKELETON_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return storeReady && minElapsed;
}
