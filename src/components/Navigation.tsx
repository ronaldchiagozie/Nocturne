interface NavigationProps {
  onCheckout: () => void;
}

export function Navigation({ onCheckout }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-baseline pointer-events-none">
      <div className="pointer-events-auto">
        <p className="font-serif text-[13px] md:text-[15px] tracking-[0.3em] uppercase text-canvas font-normal">
          Nocturne
        </p>
      </div>

      <div className="pointer-events-auto flex items-baseline gap-8 md:gap-12">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-taupe-muted">
          No. 07
        </span>
        <button
          onClick={onCheckout}
          className="font-sans text-[10px] uppercase tracking-[0.2em] text-canvas hover:text-canvas/70 transition-colors duration-300 cursor-pointer"
        >
          Secure a bottle
        </button>
      </div>
    </nav>
  );
}
