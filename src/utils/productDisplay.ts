import { getBottleVariant } from '../data/bottleVariants';
import { getProduct, type ProductId } from '../data/products';
import type { CheckoutOverride } from '../types';

/** Bottle art for product detail, cart, and panels — always variant-accurate */
export function resolveProductImage(
  productId: ProductId,
  override?: CheckoutOverride,
): string {
  if (override?.image) return override.image;

  const product = getProduct(productId);
  const variantId = override?.variantId ?? product.variantId;
  return getBottleVariant(variantId).image;
}

export function buildCheckoutOverride(input: {
  productId: ProductId;
  label: string;
  title: string;
  image: string;
  variantId?: string;
}): CheckoutOverride {
  const product = getProduct(input.productId);
  return {
    variantId: (input.variantId ?? product.variantId) as CheckoutOverride['variantId'],
    productLabel: input.label,
    productTitle: input.title,
    image: input.image,
  };
}
