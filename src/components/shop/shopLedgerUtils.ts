
export function glowRgb(glow: string): string {
  const match = glow.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? `${match[1]}, ${match[2]}, ${match[3]}` : '212, 163, 115';
}

export interface LedgerBottleItem {
  key: string;
  image: string;
  label: string;
  title: string;
  glow: string;
  formulationNumber: string;
}
