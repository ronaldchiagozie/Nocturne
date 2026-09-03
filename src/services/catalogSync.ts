import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { BOTTLE_VARIANTS } from '../data/bottleVariants';
import { PRODUCTS, type ProductId } from '../data/products';
import { UNIT_PRICE_NGN } from '../data/pricing';
import { getDb, getFirebaseInitError, isFirebaseConfigured } from '../lib/firebase';

const CATALOG_VERSION = 1;

function canUseFirebase(): boolean {
  return isFirebaseConfigured && !getFirebaseInitError();
}

export async function seedCatalogToFirebase(): Promise<void> {
  if (!canUseFirebase()) return;

  const db = getDb();
  const catalogMetaRef = doc(db, 'store', 'catalog');
  const catalogSnap = await getDoc(catalogMetaRef);

  if (catalogSnap.exists() && catalogSnap.data()?.version === CATALOG_VERSION) {
    return;
  }

  const batch = writeBatch(db);
  const now = new Date().toISOString();

  for (const id of Object.keys(PRODUCTS) as ProductId[]) {
    const product = PRODUCTS[id];

    batch.set(
      doc(db, 'products', id),
      {
        productId: id,
        label: product.label,
        title: product.title,
        detail: product.detail,
        priceNgn: UNIT_PRICE_NGN,
        priceDisplay: product.price,
        defaultVariantId: product.variantId,
        image: product.image,
        notes: product.notes,
        character: product.character,
        wear: product.wear,
        specs: product.specs,
        metrics: product.metrics,
        active: true,
        updatedAt: now,
      },
      { merge: true },
    );

    batch.set(
      doc(db, 'inventory', id),
      {
        productId: id,
        label: product.label,
        title: product.title,
        image: product.image,
        priceNgn: UNIT_PRICE_NGN,
      },
      { merge: true },
    );
  }

  for (const variant of BOTTLE_VARIANTS) {
    const product = PRODUCTS[variant.productId as ProductId];

    batch.set(
      doc(db, 'variants', variant.id),
      {
        variantId: variant.id,
        formulationNumber: variant.formulationNumber,
        name: variant.name,
        displayLabel: `No. ${variant.formulationNumber} · ${variant.name}`,
        productId: variant.productId,
        productTitle: product.title,
        productLabel: product.label,
        image: variant.image,
        glow: variant.glow,
        priceNgn: UNIT_PRICE_NGN,
        active: true,
        sortOrder: Number(variant.formulationNumber),
        updatedAt: now,
      },
      { merge: true },
    );
  }

  batch.set(
    catalogMetaRef,
    {
      version: CATALOG_VERSION,
      productCount: Object.keys(PRODUCTS).length,
      variantCount: BOTTLE_VARIANTS.length,
      lastSeededAt: now,
    },
    { merge: true },
  );

  await batch.commit();

  if (import.meta.env.DEV) {
    console.info(
      `[Nocturne] Catalog synced — ${Object.keys(PRODUCTS).length} products, ${BOTTLE_VARIANTS.length} variants.`,
    );
  }
}
