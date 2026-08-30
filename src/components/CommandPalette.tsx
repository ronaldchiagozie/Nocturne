import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { useSiteModals } from '../context/SiteModalsContext';
import { COLLECTION_ITEMS } from '../data/collection';
import { ROUTES } from '../data/routes';
import { useProductDetail } from '../context/ProductDetailContext';

type CommandAction =
  | { type: 'route'; id: string; label: string; hint?: string; to: string }
  | { type: 'modal'; id: string; label: string; hint?: string; run: () => void }
  | { type: 'product'; id: string; label: string; hint?: string; run: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useStore();
  const { openDistiller } = useSiteModals();
  const { openProduct } = useProductDetail();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const actions: CommandAction[] = useMemo(() => {
    const nav: CommandAction[] = [
      { type: 'route', id: 'home', label: 'Home', hint: 'Landing', to: ROUTES.home },
      { type: 'route', id: 'shop', label: 'Shop', hint: 'All formulations', to: ROUTES.shop },
      {
        type: 'modal',
        id: 'distill',
        label: 'The Distiller',
        hint: 'Scent-matching ritual',
        run: openDistiller,
      },
      {
        type: 'route',
        id: 'cart',
        label: 'Cart',
        hint: cartCount > 0 ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Bag',
        to: ROUTES.cart,
      },
      { type: 'route', id: 'checkout', label: 'Checkout', to: ROUTES.checkout },
    ];

    const products: CommandAction[] = COLLECTION_ITEMS.map((item) => ({
      type: 'product' as const,
      id: `product-${item.variantId}`,
      label: `${item.label} · ${item.name}`,
      hint: 'View extrait',
      run: () =>
        openProduct(item.productId, {
          variantId: item.variantId,
          productLabel: item.label,
          productTitle: item.name,
          image: item.image,
        }),
    }));

    return [...nav, ...products];
  }, [cartCount, openDistiller, openProduct]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.hint?.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q),
    );
  }, [actions, query]);

  const runAction = useCallback(
    (action: CommandAction) => {
      close();
      if (action.type === 'route') {
        if (action.to !== location.pathname) navigate(action.to);
        return;
      }
      if (action.type === 'modal' || action.type === 'product') {
        if (location.pathname !== '/' && action.type === 'product') {
          navigate(ROUTES.shop);
        }
        action.run();
      }
    },
    [close, location.pathname, navigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close command palette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[240] bg-canvas/30 backdrop-blur-[4px] cursor-pointer"
          />

          <motion.div
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[max(5rem,env(safe-area-inset-top))] z-[245] w-[min(calc(100vw-2rem),32rem)] -translate-x-1/2 overflow-hidden rounded-lg border border-canvas/10 bg-cream shadow-[0_24px_80px_rgba(13,11,10,0.18)]"
            data-lenis-prevent
          >
            <div className="border-b border-canvas/10 px-4 py-3">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Go anywhere…"
                aria-label="Search commands"
                className="w-full bg-transparent font-sans text-sm text-canvas placeholder:text-taupe-muted/60 outline-none"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <ul
              className="modal-scroll max-h-[min(60dvh,22rem)] overflow-y-auto py-2"
              data-modal-scroll
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-6 text-center font-body-italic italic text-sm text-taupe-muted font-light">
                  No matches.
                </li>
              ) : (
                filtered.map((action) => (
                  <li key={action.id}>
                    <button
                      type="button"
                      onClick={() => runAction(action)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left hover:bg-cream-plate transition-colors cursor-pointer"
                    >
                      <span className="font-sans text-[13px] text-canvas">{action.label}</span>
                      {action.hint && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-taupe-muted shrink-0">
                          {action.hint}
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="border-t border-canvas/10 px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-taupe-muted">
                Navigate · Search · Jump to formulation
              </span>
              <kbd className="font-mono text-[9px] text-taupe-muted/80 tracking-wide">⌘K</kbd>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
