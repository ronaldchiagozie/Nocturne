import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { COLLECTION_ITEMS, COLLECTION_TAGLINE } from '../../data/collection';
import { formatNgn, UNIT_PRICE_NGN } from '../../data/pricing';
import { useStore } from '../../context/StoreContext';
import { useProductDetail } from '../../context/ProductDetailContext';
import { BatchLedger } from '../BatchLedger';

export function ShopGridLayout() {
  const { openProduct } = useProductDetail();
  const { getStock } = useStore();

  return (
    <div className="mx-auto max-w-6xl">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-4 sm:px-6 md:px-12 pt-10 sm:pt-12 pb-8 sm:pb-10 border-b border-canvas/10"
      >
        <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-taupe-muted">Shop</p>
        <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] text-canvas tracking-tight leading-tight mt-2">
          The extrait collection
        </h1>
        <p className="font-body-italic italic text-sm md:text-base text-taupe-muted font-light mt-3 max-w-lg leading-relaxed">
          {COLLECTION_TAGLINE} Compounded to order from our Lagos atelier.
        </p>
        <div className="mt-5">
          <BatchLedger />
        </div>
      </motion.header>

      <section className="px-4 sm:px-6 md:px-12 py-10 sm:py-12">
        <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-taupe-muted mb-8 sm:mb-10">
          All formulations
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-12">
          {COLLECTION_ITEMS.map((item, index) => {
            const soldOut = (getStock(item.productId)?.stock ?? 0) === 0;

            return (
              <motion.button
                key={item.variantId}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + index * 0.03, duration: 0.4 }}
                disabled={soldOut}
                onClick={() =>
                  openProduct(item.productId, {
                    variantId: item.variantId,
                    productLabel: item.label,
                    productTitle: item.name,
                  })
                }
                className="group text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-taupe-muted">
                  {item.label}
                </p>
                <div className="aspect-[3/4] my-3 flex items-end justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[82%] w-auto max-w-full object-contain transition-opacity duration-300 group-hover:opacity-80"
                    loading={index < 4 ? 'eager' : 'lazy'}
                  />
                </div>
                <h3 className="font-serif text-sm sm:text-base text-canvas tracking-tight leading-snug">
                  {item.name}
                </h3>
                <p className="font-mono text-[8px] text-taupe-muted mt-2 uppercase tracking-[0.1em]">
                  {soldOut ? 'Sold out' : formatNgn(UNIT_PRICE_NGN)}
                </p>
              </motion.button>
            );
          })}
        </div>
      </section>

      <div className="px-4 sm:px-6 md:px-12 pt-2 pb-4">
        <Link
          to="/"
          className="font-sans text-[9px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors"
        >
          ← Back to Nocturne
        </Link>
      </div>
    </div>
  );
}
