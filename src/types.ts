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
  image?: string;
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

export interface CheckoutSubmitInput {
  items: CartItem[];
  shipping: ShippingInfo;
  subtotalNgn: number;
  shippingNgn: number;
  totalNgn: number;
  totalUsd: number;
  couponCode?: string;
  couponDiscountNgn?: number;
}

export interface OrderLineItem {
  productId: ProductId;
  variantId: BottleVariantId;
  productLabel: string;
  productTitle: string;
  formulationLabel?: string;
  priceNgn: number;
  qty: number;
  image: string;
}

export type StoreOrderStatus = 'received' | 'compounding' | 'dispatched';

export interface StoreOrder {
  id: string;
  createdAt: string;
  shipping: ShippingInfo;
  items: OrderLineItem[];
  subtotalNgn: number;
  shippingNgn: number;
  totalNgn: number;
  totalUsd: number;
  couponCode?: string | null;
  couponDiscountNgn?: number;
  status: StoreOrderStatus;
  paymentStatus: 'simulated';
}
