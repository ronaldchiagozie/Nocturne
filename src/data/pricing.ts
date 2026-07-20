export const UNIT_PRICE_NGN = 180_000;
export const UNIT_PRICE_USD = 120;
export const SHIPPING_NGN = 3_500;

export function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatUsd(amount: number): string {
  return `$${amount}`;
}

export function parsePriceString(price: string): number {
  const digits = price.replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : UNIT_PRICE_NGN;
}
