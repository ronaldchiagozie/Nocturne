import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { prefersReducedMotion } from '../hooks/useMotionPreference';

/**
 * Add-to-cart flight: a copy of the bottle arcs from wherever it was added
 * into whichever cart affordance is currently on screen, which then pulses to
 * acknowledge it.
 *
 * Landing sites opt in with the `data-cart-target` attribute rather than
 * registering through a ref, because the app has three different ones —
 * Navigation's "Cart", StoreLayout's "Bag" (shop/about) and its "Cart"
 * (cart/legal) — and which is mounted depends on the route. Querying at
 * launch time picks the visible one without any registration lifecycle.
 */

export const CART_TARGET_ATTR = 'data-cart-target';

/** Spread onto a cart affordance to make it a landing site. */
export const cartTargetProps = { [CART_TARGET_ATTR]: '' } as const;

interface FlyRequest {
  /** Element the bottle appears to leave. No element, no flight. */
  from: HTMLElement | null;
  image: string;
}

interface Flight {
  id: number;
  image: string;
  left: number;
  top: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  midX: number;
  midY: number;
  midScale: number;
  endScale: number;
}

interface CartFlightValue {
  /** Returns true if a bottle actually took off, false if it fell back to a
   *  bare acknowledgement (no source, no visible cart, reduced motion). */
  flyToCart: (req: FlyRequest) => boolean;
  /** Bumped every time a bottle lands. Cart affordances watch this to pulse. */
  arrivals: number;
}

const CartFlightContext = createContext<CartFlightValue | null>(null);

/** Size the bottle shrinks to on its longest edge, in px. */
const LANDING_SIZE = 26;
const FLIGHT_SECONDS = 0.78;
const PULSE_MS = 560;
/** How early the cart reacts, so the pulse overlaps the bottle's last frames. */
const PULSE_LEAD_MS = 130;

function isOnScreen(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

function findCartTarget(): HTMLElement | null {
  // A cart inside an open dialog wins. The page header is behind the modal
  // backdrop, and because the modal locks scrolling — which disables
  // `position: sticky` — it can be scrolled off-screen entirely.
  const inDialog = Array.from(
    document.querySelectorAll<HTMLElement>(`[role="dialog"] [${CART_TARGET_ATTR}]`),
  );
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[${CART_TARGET_ATTR}]`));
  return inDialog.find(isOnScreen) ?? all.find(isOnScreen) ?? null;
}

export function CartFlightProvider({ children }: { children: ReactNode }) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [arrivals, setArrivals] = useState(0);
  const nextId = useRef(0);
  const pulseTimers = useRef<Set<number>>(new Set());

  useEffect(
    () => () => {
      pulseTimers.current.forEach(window.clearTimeout);
      pulseTimers.current.clear();
    },
    [],
  );

  const flyToCart = useCallback(({ from, image }: FlyRequest): boolean => {
    // Every early return still bumps `arrivals` — the cart should acknowledge
    // the item even when we can't draw the journey.
    const acknowledge = () => {
      setArrivals((n) => n + 1);
      return false;
    };

    if (!image || !from || prefersReducedMotion()) return acknowledge();

    const target = findCartTarget();
    if (!target) return acknowledge();

    const src = from.getBoundingClientRect();
    if (src.width === 0 || src.height === 0) return acknowledge();

    const dst = target.getBoundingClientRect();
    const srcCx = src.left + src.width / 2;
    const srcCy = src.top + src.height / 2;
    const dx = dst.left + dst.width / 2 - srcCx;
    const dy = dst.top + dst.height / 2 - srcCy;

    const endScale = LANDING_SIZE / Math.max(src.width, src.height);

    // A shallow lift so the path reads as an arc rather than a straight slide.
    // Kept low on purpose: a tall arc sends the bottle up through the header
    // before it lands, which reads as hitting the ceiling.
    const lift = Math.min(Math.hypot(dx, dy) * 0.12, 56);
    // Hard ceiling at the higher of the two endpoints — the bottle must never
    // climb above the cart it is heading for.
    const midY = Math.max(dy * 0.5 - lift, Math.min(0, dy));

    const id = nextId.current++;
    setFlights((prev) => [
      ...prev,
      {
        id,
        image,
        left: src.left,
        top: src.top,
        width: src.width,
        height: src.height,
        dx,
        dy,
        midX: dx * 0.5,
        midY,
        // Four fifths of the shrink is done by the apex, so the bottle is
        // visibly getting smaller while it is still large enough to track.
        midScale: 1 + (endScale - 1) * 0.8,
        endScale,
      },
    ]);

    const timer = window.setTimeout(
      () => {
        pulseTimers.current.delete(timer);
        setArrivals((n) => n + 1);
      },
      Math.max(0, FLIGHT_SECONDS * 1000 - PULSE_LEAD_MS),
    );
    pulseTimers.current.add(timer);
    return true;
  }, []);

  /** Arrival is announced on a lead timer, so this only clears the clone. */
  const land = useCallback((id: number) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const value = useMemo(() => ({ flyToCart, arrivals }), [flyToCart, arrivals]);

  return (
    <CartFlightContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          // Above the product modal (z-222), below toasts (z-300).
          <div
            data-cart-flight
            className="pointer-events-none fixed inset-0 z-[250] overflow-hidden"
            aria-hidden
          >
            {flights.map((f) => (
              <motion.img
                key={f.id}
                src={f.image}
                alt=""
                className="absolute object-contain"
                style={{ left: f.left, top: f.top, width: f.width, height: f.height }}
                initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
                animate={{
                  x: [0, f.midX, f.dx],
                  y: [0, f.midY, f.dy],
                  scale: [1, f.midScale, f.endScale],
                  rotate: [0, -7, 4],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: FLIGHT_SECONDS,
                  ease: [0.32, 0.06, 0.24, 1],
                  opacity: { duration: FLIGHT_SECONDS, times: [0, 0.88, 1], ease: 'easeIn' },
                }}
                onAnimationComplete={() => land(f.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </CartFlightContext.Provider>
  );
}

export function useCartFlight() {
  const ctx = useContext(CartFlightContext);
  if (!ctx) throw new Error('useCartFlight must be used within CartFlightProvider');
  return ctx;
}

/**
 * True for one beat after a bottle lands. Cart affordances spread
 * `{...cartTargetProps}` to mark themselves as a landing site, and use this to
 * play the receive pulse.
 */
export function useCartArrival(): boolean {
  const { arrivals } = useCartFlight();
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (arrivals === 0) return;
    setPulsing(true);
    const t = window.setTimeout(() => setPulsing(false), PULSE_MS);
    return () => window.clearTimeout(t);
  }, [arrivals]);

  return pulsing;
}
