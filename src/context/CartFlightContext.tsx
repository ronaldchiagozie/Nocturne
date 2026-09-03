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

export const CART_TARGET_ATTR = 'data-cart-target';

export const cartTargetProps = { [CART_TARGET_ATTR]: '' } as const;

interface FlyRequest {
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
  flyToCart: (req: FlyRequest) => boolean;

  arrivals: number;
}

const CartFlightContext = createContext<CartFlightValue | null>(null);

const LANDING_SIZE = 26;
const FLIGHT_SECONDS = 0.78;
const PULSE_MS = 560;

const PULSE_LEAD_MS = 130;

function isOnScreen(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

function findBottleOnScreen(image: string): HTMLElement | null {
  const file = image.split('/').pop();
  if (!file) return null;

  const visible = Array.from(document.querySelectorAll<HTMLImageElement>('img')).filter((img) => {
    if (!(img.getAttribute('src') ?? '').endsWith(file)) return false;
    if (!isOnScreen(img)) return false;
    const style = window.getComputedStyle(img);
    return style.visibility !== 'hidden' && Number(style.opacity) > 0.15;
  });

  visible.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height);
  return visible[0] ?? null;
}

function findCartTarget(): HTMLElement | null {
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
    const acknowledge = () => {
      setArrivals((n) => n + 1);
      return false;
    };

    if (!image || prefersReducedMotion()) return acknowledge();

    const source = from ?? findBottleOnScreen(image);
    if (!source) return acknowledge();

    const target = findCartTarget();
    if (!target) return acknowledge();

    const src = source.getBoundingClientRect();
    if (src.width === 0 || src.height === 0) return acknowledge();

    const dst = target.getBoundingClientRect();
    const srcCx = src.left + src.width / 2;
    const srcCy = src.top + src.height / 2;
    const dx = dst.left + dst.width / 2 - srcCx;
    const dy = dst.top + dst.height / 2 - srcCy;

    const endScale = LANDING_SIZE / Math.max(src.width, src.height);

    const lift = Math.min(Math.hypot(dx, dy) * 0.12, 56);

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

  const land = useCallback((id: number) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const value = useMemo(() => ({ flyToCart, arrivals }), [flyToCart, arrivals]);

  return (
    <CartFlightContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(

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
