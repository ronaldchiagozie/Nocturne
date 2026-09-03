import { useEffect, useMemo, useState } from 'react';
import { TickingNumber, useInViewOnce } from './LedgerReveal';
import { prefersReducedMotion } from '../../hooks/useMotionPreference';
import { COLLECTION_ITEMS } from '../../data/collection';
import { BOTTLE_VARIANTS, getBottleVariant, type BottleVariantId } from '../../data/bottleVariants';
import { formatNgn, UNIT_PRICE_NGN } from '../../data/pricing';
import { useStore } from '../../context/StoreContext';
import { useProductDetail } from '../../context/ProductDetailContext';
import { glowRgb } from './shopLedgerUtils';
import { formulationsCopy } from '../../data/brand';
import type { CollectionItem } from '../../data/collection';
import type { ProductId } from '../../data/products';

type SortKey = 'featured' | 'name' | 'number';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'number', label: 'No.' },
  { key: 'name', label: 'Name' },
];

function variantsForProduct(productId: ProductId) {
  return BOTTLE_VARIANTS.filter((v) => v.productId === productId);
}

function CollectionCard({
  item,
  index,
  onOpen,
}: {
  item: CollectionItem;
  index: number;
  onOpen: (variantId: BottleVariantId) => void;
}) {
  const { getAvailable } = useStore();

  const siblings = useMemo(() => variantsForProduct(item.productId), [item.productId]);
  const { ref, seen } = useInViewOnce<HTMLDivElement>();

  const [activeId, setActiveId] = useState<BottleVariantId>(item.variantId);
  const [claimed, setClaimed] = useState(false);
  const active = getBottleVariant(activeId);

  const available = getAvailable(item.productId) ?? 0;
  const soldOut = available === 0;
  const tickDelay = (index % 6) * 70;

  useEffect(() => {
    if (!seen || claimed || siblings.length < 2 || prefersReducedMotion()) return;
    const other = siblings.find((s) => s.id !== item.variantId);
    if (!other) return;

    const offset = (index % 3) * 170;
    const out = window.setTimeout(() => setActiveId(other.id), 460 + offset);
    const back = window.setTimeout(() => setActiveId(item.variantId), 1420 + offset);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(back);
    };
  }, [seen, claimed, siblings, item.variantId, index]);

  return (
    <div ref={ref} className="group">
      <button
        type="button"
        disabled={soldOut}
        onClick={() => onOpen(activeId)}
        className="w-full text-left cursor-pointer disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-200"
      >
        <div className="relative aspect-[3/4] bg-[#ebe7df] overflow-hidden">

          <div
            aria-hidden
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
              seen ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: `radial-gradient(ellipse 64% 54% at 50% 64%, rgba(${glowRgb(
                active.glow,
              )}, 0.28) 0%, transparent 72%)`,
            }}
          />

          <div
            className={`absolute inset-0 flex items-end justify-center pb-[5%] transition-transform duration-[900ms] ease-out ${
              seen ? 'translate-y-0' : 'translate-y-[22px]'
            }`}
          >
            {siblings.map((sibling) => (

              <img
                key={sibling.id}
                src={sibling.image}
                alt={sibling.id === activeId ? active.name : ''}
                aria-hidden={sibling.id !== activeId}
                loading={index < 8 ? 'eager' : 'lazy'}
                className={`absolute bottom-[5%] h-[88%] w-auto max-w-[92%] object-contain object-bottom transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.03] group-disabled:opacity-50 ${
                  sibling.id === activeId ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between gap-3">
          <p className="font-sans text-[12px] sm:text-xs text-canvas tracking-tight leading-snug min-w-0">
            <span className="line-clamp-2">{active.name}</span>
            <span className="text-taupe-muted"> · No. {active.formulationNumber}</span>
          </p>
          <p className="font-sans text-[11px] sm:text-xs text-canvas tabular-nums shrink-0 pt-0.5">
            {soldOut ? (
              'Sold out'
            ) : (
              <TickingNumber
                value={UNIT_PRICE_NGN}
                active={seen}
                delay={tickDelay}
                format={formatNgn}
              />
            )}
          </p>
        </div>

        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-taupe-muted tabular-nums mt-1.5">
          {soldOut ? (
            'Sold out today'
          ) : (
            <>
              <TickingNumber value={available} active={seen} delay={tickDelay + 90} /> left today
            </>
          )}
        </p>
      </button>

      {siblings.length > 1 ? (
        <div
          className="flex items-center gap-0.5 mt-1.5 -ml-1.5"
          role="group"
          aria-label={`Formulations in this bottle`}
        >
          {siblings.map((sibling) => {
            const isActive = sibling.id === activeId;
            return (
              <button
                key={sibling.id}
                type="button"
                onClick={() => {
                  setClaimed(true);
                  setActiveId(sibling.id);
                }}
                aria-pressed={isActive}
                aria-label={`Show No. ${sibling.formulationNumber} ${sibling.name}`}
                title={sibling.name}
                className="h-7 w-7 inline-flex items-center justify-center cursor-pointer"
              >
                <span
                  className={`h-2 w-2 rounded-full shrink-0 transition-all duration-300 ${
                    isActive ? 'ring-1 ring-canvas/30 scale-110' : 'opacity-40 hover:opacity-75'
                  }`}
                  style={{ backgroundColor: `rgb(${glowRgb(sibling.glow)})` }}
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-2.5">
          <span
            className="inline-block h-2 w-2 rounded-full ring-1 ring-canvas/20"
            style={{ backgroundColor: `rgb(${glowRgb(active.glow)})` }}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}

export function ShopGridLayout() {
  const { openProduct } = useProductDetail();
  const [sort, setSort] = useState<SortKey>('featured');

  const items = useMemo(() => {
    const list = [...COLLECTION_ITEMS];
    if (sort === 'name') return list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'number') {
      return list.sort(
        (a, b) =>
          Number(a.formulationNumber) - Number(b.formulationNumber) ||
          a.name.localeCompare(b.name),
      );
    }
    return list;
  }, [sort]);

  const openVariant = (variantId: BottleVariantId) => {
    const variant = getBottleVariant(variantId);
    openProduct(variant.productId as ProductId, {
      variantId,
      productLabel: `No. ${variant.formulationNumber}`,
      productTitle: variant.name,
      image: variant.image,
    });
  };

  return (
    <div className="w-full">

      <div className="px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pt-6 sm:pt-10 pb-5 md:pb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-sans text-[15px] sm:text-[15px] font-normal text-canvas tracking-tight">
              The Collection
            </h1>
            <p className="font-sans text-[12px] text-taupe-muted mt-1.5 leading-snug">
              {formulationsCopy(true)}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[11px] sm:text-xs text-taupe-muted">
              <span className="hidden md:inline">{items.length} Formulations</span>
            </div>

            <div className="shop-sort-pills" role="group" aria-label="Sort collection">
              {SORT_OPTIONS.map((opt) => {
                const active = sort === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSort(opt.key)}
                    className={`shop-sort-pill ${active ? 'shop-sort-pill-active' : ''}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <section className="px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pb-14 md:pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3.5 sm:gap-x-5 md:gap-x-6 gap-y-8 sm:gap-y-12 md:gap-y-14">
          {items.map((item, index) => (
            <CollectionCard key={item.variantId} item={item} index={index} onOpen={openVariant} />
          ))}
        </div>
      </section>
    </div>
  );
}
