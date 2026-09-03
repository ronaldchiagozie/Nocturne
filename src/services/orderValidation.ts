import { PRODUCTS, type ProductId } from '../data/products';
import { SHIPPING_NGN, UNIT_PRICE_NGN } from '../data/pricing';
import type { CartItem, CheckoutSubmitInput, ShippingInfo } from '../types';

const MAX_LINE_QTY = 12;
const MAX_LINES = 20;

export function validateShipping(shipping: ShippingInfo): string | null {
  const fullName = shipping.fullName.trim();
  const email = shipping.email.trim();
  const address = shipping.address.trim();

  if (!fullName || fullName.length < 2) return 'Enter your full name.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (!address || address.length < 8) return 'Enter a complete delivery address.';
  return null;
}

export function computeCheckoutTotals(items: CartItem[], couponDiscountNgn = 0) {
  const subtotalNgn = items.reduce((sum, item) => sum + item.priceNgn * item.qty, 0);
  const shippingNgn = items.length > 0 ? SHIPPING_NGN : 0;
  const totalNgn = subtotalNgn + shippingNgn - couponDiscountNgn;
  return { subtotalNgn, shippingNgn, totalNgn };
}

export function validateCheckoutInput(
  input: CheckoutSubmitInput,
): { ok: true } | { ok: false; reason: string } {
  if (input.items.length === 0) return { ok: false, reason: 'Your cart is empty.' };
  if (input.items.length > MAX_LINES) return { ok: false, reason: 'Too many items in this order.' };

  const shippingError = validateShipping(input.shipping);
  if (shippingError) return { ok: false, reason: shippingError };

  let subtotal = 0;
  for (const item of input.items) {
    if (!(item.productId in PRODUCTS)) {
      return { ok: false, reason: 'A product in your cart is no longer available.' };
    }
    if (item.priceNgn !== UNIT_PRICE_NGN) {
      return { ok: false, reason: 'Cart prices are out of date. Refresh and try again.' };
    }
    if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > MAX_LINE_QTY) {
      return { ok: false, reason: 'Invalid quantity in cart.' };
    }
    subtotal += item.priceNgn * item.qty;
  }

  const discount = Math.max(0, input.couponDiscountNgn ?? 0);
  const expected = computeCheckoutTotals(input.items, discount);

  if (input.subtotalNgn !== expected.subtotalNgn) {
    return { ok: false, reason: 'Order subtotal mismatch. Refresh and try again.' };
  }
  if (input.shippingNgn !== expected.shippingNgn) {
    return { ok: false, reason: 'Shipping amount mismatch. Refresh and try again.' };
  }
  if (input.totalNgn !== expected.totalNgn) {
    return { ok: false, reason: 'Order total mismatch. Refresh and try again.' };
  }

  return { ok: true };
}

export const ORDER_CONSTANTS = {
  unitPriceNgn: UNIT_PRICE_NGN,
  shippingNgn: SHIPPING_NGN,
  maxLineQty: MAX_LINE_QTY,
  validProductIds: Object.keys(PRODUCTS) as ProductId[],
} as const;
