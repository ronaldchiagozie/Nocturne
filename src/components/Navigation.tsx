import React from 'react';

interface NavigationProps {
  onPersonalizeClick: () => void;
  onBatchesClick: () => void;
  batchCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  onPersonalizeClick,
  onBatchesClick,
  batchCount,
}) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-5 md:px-12 flex justify-between items-baseline mix-blend-difference">
      {/* Wordmark: wide tracking, uppercase serif */}
      <div className="flex items-baseline space-x-3">
        <span className="font-serif text-[15px] tracking-[0.25em] uppercase text-cream font-semibold">
          Nocturne
        </span>
        <span className="font-mono text-[9px] tracking-widest text-taupe-muted uppercase">
          No. 07
        </span>
      </div>

      {/* Tiny minimal navigation menu */}
      <div className="flex items-center space-x-6 md:space-x-10 text-[10px] uppercase tracking-[0.2em] text-cream">
        <button
          onClick={onPersonalizeClick}
          className="hover:text-amber-accent transition-colors duration-300 font-sans cursor-pointer focus:outline-none"
        >
          Formulate
        </button>
        <button
          onClick={onBatchesClick}
          className="relative group hover:text-amber-accent transition-colors duration-300 font-sans cursor-pointer focus:outline-none flex items-center space-x-1.5"
        >
          <span>Batches</span>
          {batchCount > 0 && (
            <span className="font-mono text-[8px] bg-cream text-canvas px-1.5 py-0.5 rounded-full font-bold">
              {batchCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
