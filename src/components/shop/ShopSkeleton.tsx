import { FORMULATION_COUNT } from '../../data/brand';

const GRID_CARD_COUNT = FORMULATION_COUNT;

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      aria-hidden
    />
  );
}

function GridCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="shop-skeleton-card"
      style={{ animationDelay: `${index * 55}ms` }}
      aria-hidden
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#ebe7df]/80">
        <Shimmer className="absolute inset-0" />
        {/* Bottle silhouette — matches real card image footprint */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="skeleton-bottle-shape w-[28%] max-w-[5.5rem] aspect-[2/5] rounded-full opacity-[0.14]" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <Shimmer className="h-3.5 flex-1 max-w-[72%] rounded-sm" />
        <Shimmer className="h-3.5 w-14 shrink-0 rounded-sm" />
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <Shimmer className="h-2 w-2 rounded-full" />
        <Shimmer className="h-2 w-2 rounded-full opacity-80" />
        <Shimmer className="h-2 w-2 rounded-full opacity-60" />
      </div>
    </div>
  );
}

export function ShopGridSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Loading collection">
      <div className="px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pt-8 sm:pt-10 pb-6 md:pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2.5">
            <Shimmer className="h-4 w-32 rounded-sm" />
            <Shimmer className="h-3 w-48 max-w-full rounded-sm opacity-80" />
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Shimmer className="hidden md:block h-3 w-28 rounded-sm" />
            <div className="flex gap-2">
              <Shimmer className="h-8 w-16 rounded-full" />
              <Shimmer className="h-8 w-12 rounded-full opacity-90" />
              <Shimmer className="h-8 w-14 rounded-full opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <section className="px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 pb-16 md:pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-5 md:gap-x-6 gap-y-10 sm:gap-y-12 md:gap-y-14">
          {Array.from({ length: GRID_CARD_COUNT }, (_, i) => (
            <GridCardSkeleton key={i} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function LedgerSectionSkeleton({ index }: { index: number }) {
  return (
    <section
      className="relative min-h-[88dvh] flex flex-col justify-center border-b border-canvas/10 px-4 sm:px-6 md:px-12 py-16 lg:py-20 shop-skeleton-card"
      style={{ animationDelay: `${index * 80}ms` }}
      aria-hidden
    >
      <div className="flex items-start gap-5 max-w-md">
        <Shimmer className="mt-1 w-[2px] h-12 shrink-0 rounded-full" />
        <div className="flex-1 space-y-4">
          <Shimmer className="h-3 w-24 rounded-sm" />
          <Shimmer className="h-10 w-[min(100%,18rem)] rounded-sm" />
          <Shimmer className="h-4 w-full max-w-md rounded-sm opacity-90" />
          <Shimmer className="h-4 w-[88%] max-w-sm rounded-sm opacity-75" />
          <Shimmer className="h-3 w-3/4 max-w-xs rounded-sm opacity-60 mt-2" />
          <div className="flex items-center gap-4 pt-2">
            <Shimmer className="h-3.5 w-20 rounded-sm" />
            <Shimmer className="h-3 w-14 rounded-sm opacity-80" />
          </div>
          <Shimmer className="h-9 w-28 rounded-full mt-2" />
        </div>
      </div>

      <div className="lg:hidden mt-12 flex flex-col items-center">
        <Shimmer className="mb-5 h-px w-8 rounded-full" />
        <div className="relative h-[min(320px,44vh)] w-[min(200px,42vw)] flex items-end justify-center">
          <Shimmer className="absolute inset-0 rounded-sm opacity-40" />
          <div className="skeleton-bottle-shape w-[38%] aspect-[2/5] rounded-full mb-2 opacity-20" />
        </div>
      </div>
    </section>
  );
}

export function ShopLedgerSkeleton() {
  return (
    <div className="relative" aria-busy="true" aria-label="Loading ledger">
      <div className="relative mx-auto max-w-3xl lg:max-w-[42rem]">
        <header className="px-4 sm:px-6 md:px-12 pt-10 sm:pt-12 pb-10 sm:pb-12 border-b border-canvas/10 space-y-3">
          <Shimmer className="h-3 w-12 rounded-sm" />
          <Shimmer className="h-10 w-[min(100%,20rem)] rounded-sm" />
          <Shimmer className="h-4 w-full max-w-lg rounded-sm opacity-85" />
          <Shimmer className="h-4 w-[90%] max-w-md rounded-sm opacity-70" />
          <Shimmer className="h-3 w-36 rounded-sm opacity-60 mt-2" />
        </header>

        <LedgerSectionSkeleton index={0} />
        <LedgerSectionSkeleton index={1} />
      </div>

      {/* Desktop stage bottle placeholder */}
      <div
        className="hidden lg:flex fixed right-[max(1.5rem,calc((100vw-42rem)/2-8rem))] top-1/2 -translate-y-1/2 w-[min(280px,22vw)] h-[min(420px,58vh)] items-end justify-center pointer-events-none"
        aria-hidden
      >
        <div className="relative w-full h-full">
          <Shimmer className="absolute inset-0 rounded-sm opacity-30" />
          <div className="absolute inset-x-0 bottom-8 flex justify-center">
            <div className="skeleton-bottle-shape w-[42%] aspect-[2/5] rounded-full opacity-15" />
          </div>
        </div>
      </div>
    </div>
  );
}
