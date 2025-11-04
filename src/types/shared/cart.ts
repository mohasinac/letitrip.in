/**
 * Cart Types
 * Shared between UI and Backend
 */

export interface CartItem {
  id: string; // Unique item ID (productId + variant)
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  sku?: string;
  slug?: string;
  seller?: {
    id: string;
    name: string;
    storeName?: string;
  };
  variant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
  createdAt: Date;
}
