import { BOTTLE_VARIANTS, BottleVariantId } from './bottleVariants';
import { ProductId } from './products';

export const COLLECTION_TAGLINE = 'Always distilled.';

export interface CollectionItem {
  variantId: BottleVariantId;
  formulationNumber: string;
  name: string;
  image: string;
  productId: ProductId;
  label: string;
}

export const COLLECTION_ITEMS: CollectionItem[] = BOTTLE_VARIANTS.map((variant) => ({
  variantId: variant.id,
  formulationNumber: variant.formulationNumber,
  name: variant.name,
  image: variant.image,
  productId: variant.productId as ProductId,
  label: `No. ${variant.formulationNumber}`,
})).sort(
  (a, b) =>
    Number(a.formulationNumber) - Number(b.formulationNumber) ||
    a.variantId.localeCompare(b.variantId),
);
