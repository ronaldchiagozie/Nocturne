const CITY_COORDINATES: Record<string, string> = {
  lagos: '6.4281° N, 3.4219° E',
  lekki: '6.4281° N, 3.4219° E',
  london: '51.5074° N, 0.1278° W',
  'new york': '40.7128° N, 74.0060° W',
  nyc: '40.7128° N, 74.0060° W',
  paris: '48.8566° N, 2.3522° E',
  tokyo: '35.6762° N, 139.6503° E',
};

const DEFAULT_COORDINATES = '6.4281° N, 3.4219° E';
const DEFAULT_DESTINATION = 'LEKKI, LAGOS';

/** Match typed city against known global coordinates */
export function resolveCoordinates(cityInput: string): string {
  const normalized = cityInput.trim().toLowerCase();
  if (!normalized) return DEFAULT_COORDINATES;

  for (const [city, coordinates] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(city)) return coordinates;
  }

  return DEFAULT_COORDINATES;
}

export function formatDestination(cityInput: string): string {
  const trimmed = cityInput.trim();
  if (!trimmed) return DEFAULT_DESTINATION;
  return trimmed.toUpperCase();
}

export function formatHolder(nameInput: string): string {
  const trimmed = nameInput.trim();
  if (!trimmed) return 'YOU';
  return trimmed.toUpperCase();
}

export function createSessionHash(): string {
  const a = Math.random().toString(16).slice(2, 6);
  const b = Math.random().toString(16).slice(2, 6);
  return `0x${a}...${b}`;
}

export function createBatchReference(batchNumber: string): string {
  return `#${batchNumber}-${Math.floor(1000 + Math.random() * 9000)}`;
}
