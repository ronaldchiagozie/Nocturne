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
import { useLocation, useNavigate } from 'react-router-dom';
import { useProductDetail } from './ProductDetailContext';
import { setScrollLocked } from '../hooks/useLenis';
import type { CollectionItem } from '../data/collection';

const CollectionsPanel = lazy(() =>
  import('../components/CollectionsPanel').then((m) => ({ default: m.CollectionsPanel })),
);
const Distiller = lazy(() =>
  import('../components/Distiller').then((m) => ({ default: m.Distiller })),
);

interface SiteModalsContextValue {
  distillerOpen: boolean;
  collectionsOpen: boolean;
  openDistiller: () => void;
  openCollections: () => void;
  closeDistiller: () => void;
  closeCollections: () => void;
}

const SiteModalsContext = createContext<SiteModalsContextValue | null>(null);

export function SiteModalsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openProduct } = useProductDetail();
  const [distillerOpen, setDistillerOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const openDistiller = useCallback(() => {
    if (location.pathname !== '/') {
      navigate('/', { state: { open: 'distill' } });
      return;
    }
    setDistillerOpen(true);
  }, [location.pathname, navigate]);

  const openCollections = useCallback(() => {
    if (location.pathname !== '/') {
      navigate('/', { state: { open: 'collections' } });
      return;
    }
    setCollectionsOpen(true);
  }, [location.pathname, navigate]);

  const closeDistiller = useCallback(() => setDistillerOpen(false), []);
  const closeCollections = useCallback(() => setCollectionsOpen(false), []);

  useEffect(() => {
    const open = (location.state as { open?: string } | null)?.open;
    if (!open) return;

    if (open === 'distill') setDistillerOpen(true);
    else if (open === 'collections') setCollectionsOpen(true);

    navigate('.', { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    setScrollLocked(distillerOpen || collectionsOpen);
    return () => setScrollLocked(false);
  }, [distillerOpen, collectionsOpen]);

  const value = useMemo(
    () => ({
      distillerOpen,
      collectionsOpen,
      openDistiller,
      openCollections,
      closeDistiller,
      closeCollections,
    }),
    [
      distillerOpen,
      collectionsOpen,
      openDistiller,
      openCollections,
      closeDistiller,
      closeCollections,
    ],
  );

  return (
    <SiteModalsContext.Provider value={value}>
      {children}

      <Suspense fallback={null}>
        <CollectionsPanel
          isOpen={collectionsOpen}
          onClose={closeCollections}
          onSelectProduct={(item: CollectionItem) => {
            openProduct(item.productId, {
              variantId: item.variantId,
              productLabel: item.label,
              productTitle: item.name,
            });
            closeCollections();
          }}
          onOpenDistiller={openDistiller}
        />

        <Distiller
          isOpen={distillerOpen}
          onClose={closeDistiller}
          onViewSpec={(result) => {
            openProduct(result.productId, {
              variantId: result.variantId,
              formulationLabel: result.formulationLabel,
              productLabel: `No. ${result.formulationNumber}`,
              productTitle: result.formulationName,
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
