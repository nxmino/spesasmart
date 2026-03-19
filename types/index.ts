export interface Offer {
  shop: string;
  title: string;
  price: number;
  url: string;
  affiliateUrl: string;
}

export interface ProductResult {
  product: string;
  offers: Offer[];
  loading: boolean;
  error?: string;
}

export interface ShopRow {
  shop: string;
  shopKey: string;           // dominio normalizzato per identificare il negozio
  foundCount: number;
  totalProducts: number;
  subtotal: number;          // somma prezzi prodotti trovati
  items: {
    product: string;
    found: boolean;
    title?: string;
    price?: number;
    affiliateUrl?: string;
  }[];
}

export type AggregatedResults = ShopRow[];

export interface CartItem {
  product: string;
  title: string;
  shop: string;
  shopKey: string;
  price: number;
  affiliateUrl: string;
}

export interface Session {
  id: string;
  label: string;
  createdAt: string;
  products: string[];
  results: AggregatedResults;
}
