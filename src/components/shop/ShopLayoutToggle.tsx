import { useShopLayoutMode, type ShopLayoutMode } from '../../hooks/useShopLayoutMode';

const MODES: { id: ShopLayoutMode; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'ledger', label: 'Ledger' },
];

export function ShopLayoutToggle() {
  const [mode, setMode] = useShopLayoutMode();

  return (
    <div
      className="flex items-center gap-1 font-sans text-[10px] sm:text-xs text-taupe-muted"
      role="group"
      aria-label="Shop layout"
    >
      <span className="mr-0.5 sm:mr-1 hidden sm:inline">View:</span>
      {MODES.map(({ id, label }, index) => {
        const active = mode === id;
        return (
          <span key={id} className="inline-flex items-center">
            {index > 0 && <span className="mx-1 sm:mx-1.5 text-canvas/20">·</span>}
            <button
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={active}
              className={`min-h-[44px] inline-flex items-center transition-colors cursor-pointer ${
                active ? 'text-canvas' : 'hover:text-canvas'
              }`}
            >
              {label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
