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

const CYCLE_MS = 24 * 60 * 60 * 1000;

export function getCycleTimeRemaining(meta: StoreMeta): number {
  const elapsed = Date.now() - meta.cycleStartedAt;
  return Math.max(0, CYCLE_MS - elapsed);
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
