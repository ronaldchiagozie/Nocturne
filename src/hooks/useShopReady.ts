import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

const MIN_SKELETON_MS = 420;

/** Shop content waits for store sync + a brief minimum so skeleton reads intentional. */
export function useShopReady() {
  const { storeReady } = useStore();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_SKELETON_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return storeReady && minElapsed;
}
