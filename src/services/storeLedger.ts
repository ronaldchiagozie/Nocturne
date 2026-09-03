import type { ProductId } from '../data/products';

export interface ProductStock {
  productId: ProductId;
  stock: number;
  maxStock: number;
}

export interface StoreMeta {
  cycleStartedAt: number;
  lastPhantomAt: number;
  totalSoldThisCycle: number;
}

const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getLagosDayStart(now: number = Date.now()): number {
  const lagosNow = now + LAGOS_OFFSET_MS;
  const lagosMidnightUtc = Math.floor(lagosNow / MS_PER_DAY) * MS_PER_DAY;
  return lagosMidnightUtc - LAGOS_OFFSET_MS;
}

export function getNextLagosMidnight(now: number = Date.now()): number {
  return getLagosDayStart(now) + MS_PER_DAY;
}

export function getCycleTimeRemaining(meta: StoreMeta, now: number = Date.now()): number {
  const todayStart = getLagosDayStart(now);
  if (meta.cycleStartedAt < todayStart) return 0;
  return Math.max(0, getNextLagosMidnight(now) - now);
}

export function formatTimeRemaining(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getTotalStock(inventory: Record<ProductId, ProductStock>): number {
  return Object.values(inventory).reduce((sum, item) => sum + item.stock, 0);
}

export function getTotalMaxStock(inventory: Record<ProductId, ProductStock>): number {
  return Object.values(inventory).reduce((sum, item) => sum + item.maxStock, 0);
}
