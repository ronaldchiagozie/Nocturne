export interface PersonalizationConfig {
  name: string;      // The custom name, defaults gracefully to "You"
  location: string;  // Custom location, e.g. "Paris", "New York", defaults to "Here"
  date: string;      // Batch custom date
  message: string;   // A short message or dedication
}

export interface Ingredient {
  id: string;
  name: string;
  weight: string;
  category: string;
  description: string;
  imageUrl: string;
}

export interface NoteItem {
  id: string;
  name: string;
  intensity: number; // 1-10 scale
  character: string; // e.g. "Smoky", "Citric", "Mineral"
  percentage: string;
  description: string;
}

export interface SimulatedOrder {
  id: string;
  personalization: PersonalizationConfig;
  qty: number;
  timestamp: string;
  status: 'Received' | 'Compounding' | 'Dispatched';
}
