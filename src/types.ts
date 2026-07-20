import type { BottleVariantId } from './data/bottleVariants';
import type { ProductId } from './data/products';

export interface PersonalizationConfig {
  name: string;
  location: string;
  date: string;
  message: string;
}

export interface NoteItem {
  id: string;
  name: string;
  weight: string;
  category: string;
  percentage: string;
  description: string;
}

export interface Ingredient {
  id: string;
  index: string;
  name: string;
  weight: string;
  category: string;
  percentage: string;
  glow: string;
}

export interface SimulatedOrder {
  id: string;
  productId: ProductId;
  productLabel: string;
  productTitle: string;
  variantId: BottleVariantId;
  /** Set when matched via The Distiller, e.g. "No. 17 Violet Noir" */
  formulationLabel?: string;
  personalization: PersonalizationConfig;
  qty: number;
  timestamp: string;
  status: 'Received' | 'Compounding' | 'Dispatched';
}

export interface CheckoutOverride {
  variantId?: BottleVariantId;
  formulationLabel?: string;
  productLabel?: string;
  productTitle?: string;
}

export interface CartItem {
  cartKey: string;
  productId: ProductId;
  variantId: BottleVariantId;
  productLabel: string;
  productTitle: string;
  formulationLabel?: string;
  priceNgn: number;
  qty: number;
  image: string;
}

export interface ShippingInfo {
  fullName: string;
  email: string;
  address: string;
}
