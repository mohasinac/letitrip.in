/**
 * Product Comparison Configuration
 */

export const COMPARISON_CONFIG = {
  MAX_PRODUCTS: 4,
  MIN_PRODUCTS: 2,
  STORAGE_KEY: "product_comparison",
} as const;

export interface ComparisonField {
  key: string;
  label: string;
  type: "text" | "price" | "rating" | "boolean" | "badge";
}

export const COMPARISON_FIELDS: ComparisonField[] = [
  { key: "price", label: "Price", type: "price" },
  { key: "originalPrice", label: "Original Price", type: "price" },
  { key: "condition", label: "Condition", type: "badge" },
  { key: "rating", label: "Rating", type: "rating" },
  { key: "reviewCount", label: "Reviews", type: "text" },
  { key: "shopName", label: "Seller", type: "text" },
  { key: "inStock", label: "In Stock", type: "boolean" },
];
