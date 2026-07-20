import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'motion/react';
import { COLLECTION_ITEMS, COLLECTION_TAGLINE } from '../../data/collection';
import { getBottleVariant } from '../../data/bottleVariants';
import { VARIANT_SUMMARIES } from '../../data/distiller';
import { PRODUCTS } from '../../data/products';
import { formatNgn, UNIT_PRICE_NGN } from '../../data/pricing';
import { useStore } from '../../context/StoreContext';
import { useProductDetail } from '../../context/ProductDetailContext';
import { BatchLedger } from '../BatchLedger';
import { ShopLedgerStage } from './ShopLedgerStage';
import { glowRgb, type LedgerBottleItem } from './shopLedgerUtils';

gsap.registerPlugin(ScrollTrigger);

function StockLine({ productId }: { productId: keyof typeof PRODUCTS }) {
  const { getStock } = useStore();
  const stock = getStock(productId);
  if (!stock) return null;

  const soldOut = stock.stock === 0;
  return (
    <span
      className={`font-mono text-[8px] uppercase tracking-[0.14em] tabular-nums ${
        soldOut ? 'text-red-800/70' : 'text-taupe-muted'
      }`}
    >
      {soldOut ? 'Sold out' : `${stock.stock} left`}
    </span>
  );
}

export function ShopLedgerLayout() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { openProduct } = useProductDetail();
  const { getStock } = useStore();

  const ledgerItems = useMemo<LedgerBottleItem[]>(
    () =>
      COLLECTION_ITEMS.map((item) => {
        const variant = getBottleVariant(item.variantId);
        return {
          key: item.variantId,
          image: item.image,
          label: item.label,
          title: item.name,
          glow: variant.glow,
          formulationNumber: item.formulationNumber,
        };
      }),
    [],
  );

  useGSAP(
    () => {
      if (!trackRef.current) return;

      const triggers: ScrollTrigger[] = [];

      sectionRefs.current.forEach((section, index) => {
        if (!section) return;

        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'top 55%',
            end: 'bottom 45%',
            onEnter: () => setActiveIndex(index),
            onEnterBack: () => setActiveIndex(index),
          }),
        );
      });

      return () => {
        triggers.forEach((trigger) => trigger.kill());
      };
    },
    { scope: trackRef, dependencies: [ledgerItems.length] },
  );

  const setSectionRef = (index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  };

  return (
    <div ref={trackRef} className="relative">
      <div className="relative mx-auto max-w-3xl lg:max-w-[42rem]">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="px-4 sm:px-6 md:px-12 pt-10 sm:pt-12 pb-10 sm:pb-12 border-b border-canvas/10"
        >
          <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-taupe-muted">Shop</p>
          <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] text-canvas tracking-tight leading-tight mt-2">
            The extrait ledger
          </h1>
          <p className="font-body-italic italic text-sm md:text-base text-taupe-muted font-light mt-3 max-w-lg leading-relaxed">
            {COLLECTION_TAGLINE} One formulation per scroll. The bottle follows.
          </p>
          <div className="mt-5">
            <BatchLedger />
          </div>
        </motion.header>

        <div>
          {COLLECTION_ITEMS.map((item, index) => {
            const product = PRODUCTS[item.productId];
            const variant = getBottleVariant(item.variantId);
            const soldOut = (getStock(item.productId)?.stock ?? 0) === 0;
            const blurb = VARIANT_SUMMARIES[item.variantId];
            const accent = glowRgb(variant.glow);
            const isActive = index === activeIndex;

            return (
              <section
                key={item.variantId}
                ref={setSectionRef(index)}
                data-shop-ledger-section={index}
                className="relative min-h-[88dvh] flex flex-col justify-center border-b border-canvas/10 px-4 sm:px-6 md:px-12 py-16 lg:py-20"
              >
                <div className="flex items-start gap-5 max-w-md">
                  <motion.div
                    aria-hidden
                    className="mt-1 w-[2px] shrink-0 rounded-full"
                    animate={{
                      height: isActive ? 52 : 18,
                      backgroundColor: `rgba(${accent}, ${isActive ? 0.7 : 0.2})`,
                    }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-taupe-muted">
                  {String(index + 1).padStart(2, '0')} · {item.label}
                </p>
                <h2 className="font-serif text-[clamp(2rem,4.5vw,2.85rem)] text-canvas tracking-tight leading-tight mt-4">
                  {item.name}
                </h2>
                <p className="font-body-italic italic text-sm md:text-base text-taupe-muted font-light mt-5 max-w-md leading-relaxed">
                  {blurb}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-taupe-muted/80 mt-6 max-w-md leading-relaxed">
                  {product.notes.top} · {product.notes.heart} · {product.notes.base}
                </p>

                <div className="flex items-center gap-4 mt-8">
                  <p className="font-mono text-[11px] tabular-nums text-canvas">
                    {formatNgn(UNIT_PRICE_NGN)}
                  </p>
                  <StockLine productId={item.productId} />
                </div>

                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() =>
                    openProduct(item.productId, {
                      variantId: item.variantId,
                      productLabel: item.label,
                      productTitle: item.name,
                    })
                  }
                  className="mt-8 w-fit font-sans text-[9px] uppercase tracking-[0.22em] text-canvas border border-canvas/15 px-5 py-2.5 rounded-full hover:bg-canvas hover:text-cream transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {soldOut ? 'Sold out' : 'View extrait'}
                </button>
                  </div>
                </div>

                <div className="lg:hidden mt-12 flex flex-col items-center">
                  <div
                    className="mb-5 h-px w-8 rounded-full"
                    style={{ backgroundColor: `rgba(${accent}, 0.5)` }}
                  />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[min(320px,44vh)] w-auto object-contain"
                  />
                </div>
              </section>
            );
          })}
        </div>

        <div className="px-4 sm:px-6 md:px-12 py-10">
          <Link
            to="/"
            className="font-sans text-[9px] uppercase tracking-[0.22em] text-taupe-muted hover:text-canvas transition-colors"
          >
            ← Back to Nocturne
          </Link>
        </div>
      </div>

      <ShopLedgerStage items={ledgerItems} activeIndex={activeIndex} />
    </div>
  );
}
