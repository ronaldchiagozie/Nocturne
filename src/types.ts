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
  personalization: PersonalizationConfig;
  qty: number;
  timestamp: string;
  status: 'Received' | 'Compounding' | 'Dispatched';
}
