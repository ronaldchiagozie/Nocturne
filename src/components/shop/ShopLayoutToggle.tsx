import { useShopLayoutMode, type ShopLayoutMode } from '../../hooks/useShopLayoutMode';

const MODES: { id: ShopLayoutMode; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'ledger', label: 'Ledger' },
];

export function ShopLayoutToggle() {
  const [mode, setMode] = useShopLayoutMode();

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-canvas/10 p-0.5 bg-cream/60"
      role="group"
      aria-label="Shop layout"
    >
      {MODES.map(({ id, label }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={active}
            className={`font-sans text-[9px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              active
                ? 'bg-canvas text-cream'
                : 'text-taupe-muted hover:text-canvas'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
