import { getProduct, DEFAULT_PRODUCT_ID, ProductId, PRODUCTS } from './products';
import { resolveVariantForOrder, BottleVariantId } from './bottleVariants';
import { SimulatedOrder } from '../types';

export function normalizeOrder(raw: Record<string, unknown>): SimulatedOrder | null {
  if (typeof raw.id !== 'string') return null;

  const productId = (raw.productId as ProductId) ?? DEFAULT_PRODUCT_ID;
  const safeProductId = productId in PRODUCTS ? productId : DEFAULT_PRODUCT_ID;
  const product = getProduct(safeProductId);

  const personalization =
    raw.personalization && typeof raw.personalization === 'object'
      ? (raw.personalization as SimulatedOrder['personalization'])
      : {
          name: 'You',
          location: 'London',
          date: '09.07.26',
          message: 'Worn after dark.',
        };

  const variantId =
    (raw.variantId as BottleVariantId) ?? resolveVariantForOrder(raw.id, product.id);

  return {
    id: raw.id,
    productId: product.id,
    productLabel: typeof raw.productLabel === 'string' ? raw.productLabel : product.label,
    productTitle: typeof raw.productTitle === 'string' ? raw.productTitle : product.title,
    variantId,
    formulationLabel:
      typeof raw.formulationLabel === 'string' ? raw.formulationLabel : undefined,
    personalization,
    qty: typeof raw.qty === 'number' ? raw.qty : 1,
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : '',
    status:
      raw.status === 'Compounding' || raw.status === 'Dispatched' ? raw.status : 'Received',
  };
}
