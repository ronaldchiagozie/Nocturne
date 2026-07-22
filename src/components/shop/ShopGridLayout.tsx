import { useMemo, useState } from 'react';
import { COLLECTION_ITEMS } from '../../data/collection';
import { BOTTLE_VARIANTS, getBottleVariant } from '../../data/bottleVariants';
import { formatNgn, UNIT_PRICE_NGN } from '../../data/pricing';
import { useStore } from '../../context/StoreContext';
import { useProductDetail } from '../../context/ProductDetailContext';
import { BatchLedger } from '../BatchLedger';
import { glowRgb } from './shopLedgerUtils';
import { formulationsCopy } from '../../data/brand';
import type { CollectionItem } from '../../data/collection';
import type { ProductId } from '../../data/products';

type SortKey = 'featured' | 'name' | 'number';

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
  onOpen: (item: CollectionItem, variantId?: string) => void;
}) {
  const { getStock } = useStore();
  const soldOut = (getStock(item.productId)?.stock ?? 0) === 0;
  const variant = getBottleVariant(item.variantId);
  const siblings = variantsForProduct(item.productId);

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onOpen(item)}
      className="group w-full text-left cursor-pointer disabled:cursor-not-allowed"
    >
      <div className="aspect-[4/5] bg-[#ebe7df] flex items-center justify-center overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading={index < 8 ? 'eager' : 'lazy'}
          className="h-[76%] w-auto max-w-[88%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] group-disabled:opacity-50"
        />
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="font-sans text-[11px] sm:text-xs text-canvas tracking-tight truncate min-w-0">
          {item.name}
          <span className="text-taupe-muted"> · {item.label}</span>
        </p>
        <p className="font-sans text-[11px] sm:text-xs text-canvas tabular-nums shrink-0">
          {soldOut ? 'Sold out' : formatNgn(UNIT_PRICE_NGN)}
        </p>
      </div>

      {siblings.length > 1 && (
        <div className="flex items-center gap-1.5 mt-2.5">
          {siblings.map((sibling) => {
            const active = sibling.id === item.variantId;
            return (
              <span
                key={sibling.id}
                role="presentation"
                className={`h-2 w-2 rounded-full shrink-0 transition-all ${
                  active ? 'ring-1 ring-canvas/30 scale-110' : 'opacity-40'
                }`}
                style={{ backgroundColor: `rgb(${glowRgb(sibling.glow)})` }}
                title={sibling.name}
              />
            );
          })}
        </div>
      )}

      {siblings.length <= 1 && (
        <div className="mt-2.5">
          <span
            className="inline-block h-2 w-2 rounded-full ring-1 ring-canvas/20"
            style={{ backgroundColor: `rgb(${glowRgb(variant.glow)})` }}
            aria-hidden
          />
        </div>
      )}
    </button>
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

  const openItem = (item: CollectionItem) => {
    openProduct(item.productId, {
      variantId: item.variantId,
      productLabel: item.label,
      productTitle: item.name,
    });
  };

  return (
    <div className="w-full">
      {/* Toolbar — OSSOU: title left, meta right */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pt-8 sm:pt-10 pb-6 md:pb-8">
        <div>
          <h1 className="font-sans text-sm sm:text-[15px] font-normal text-canvas tracking-tight">
            The Collection
          </h1>
          <p className="font-sans text-[11px] text-taupe-muted mt-1.5 hidden sm:block">
            {formulationsCopy(true)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[11px] sm:text-xs text-taupe-muted">
          <span className="hidden md:inline">{items.length} Formulations</span>
          <BatchLedger className="!font-sans !normal-case !tracking-normal !text-[11px]" />
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-transparent text-canvas outline-none cursor-pointer appearance-none pr-1"
            >
              <option value="featured">Featured</option>
              <option value="number">Formulation No.</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>

      {/* Product grid */}
      <section className="px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pb-16 md:pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-5 md:gap-x-6 gap-y-10 sm:gap-y-12 md:gap-y-14">
          {items.map((item, index) => (
            <CollectionCard key={item.variantId} item={item} index={index} onOpen={openItem} />
          ))}
        </div>
      </section>
    </div>
  );
}
