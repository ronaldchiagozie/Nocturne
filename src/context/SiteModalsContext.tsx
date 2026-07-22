import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useProductDetail } from './ProductDetailContext';
import { setScrollLocked } from '../hooks/useLenis';
import { getDistillerBottleImage } from '../data/distiller';

const Distiller = lazy(() =>
  import('../components/Distiller').then((m) => ({ default: m.Distiller })),
);

interface SiteModalsContextValue {
  distillerOpen: boolean;
  openDistiller: () => void;
  closeDistiller: () => void;
}

const SiteModalsContext = createContext<SiteModalsContextValue | null>(null);

export function SiteModalsProvider({ children }: { children: ReactNode }) {
  const { openProduct } = useProductDetail();
  const [distillerOpen, setDistillerOpen] = useState(false);

  const openDistiller = useCallback(() => {
    setDistillerOpen(true);
  }, []);

  const closeDistiller = useCallback(() => setDistillerOpen(false), []);

  useEffect(() => {
    setScrollLocked(distillerOpen);
  }, [distillerOpen]);

  const value = useMemo(
    () => ({
      distillerOpen,
      openDistiller,
      closeDistiller,
    }),
    [distillerOpen, openDistiller, closeDistiller],
  );

  return (
    <SiteModalsContext.Provider value={value}>
      {children}

      <Suspense fallback={null}>
        <Distiller
          isOpen={distillerOpen}
          onClose={closeDistiller}
          onViewSpec={(result) => {
            openProduct(result.productId, {
              variantId: result.variantId,
              formulationLabel: result.formulationLabel,
              productLabel: `No. ${result.formulationNumber}`,
              productTitle: result.formulationName,
              image: getDistillerBottleImage(result.variantId),
            });
          }}
        />
      </Suspense>
    </SiteModalsContext.Provider>
  );
}

export function useSiteModals() {
  const ctx = useContext(SiteModalsContext);
  if (!ctx) throw new Error('useSiteModals must be used within SiteModalsProvider');
  return ctx;
}
