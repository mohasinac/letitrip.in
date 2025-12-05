/**
 * @fileoverview TypeScript Module
 * @module src/constants/comparison
 * @description This file contains functionality related to comparison
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Product Comparison Configuration
 */

/**
 * Comparison Config
 * @constant
 */
export const COMPARISON_CONFIG = {
  MAX_PRODUCTS: 4,
  MIN_PRODUCTS: 2,
  STORAGE_KEY: "product_comparison",
} as const;

/**
 * ComparisonField interface
 * 
 * @interface
 * @description Defines the structure and contract for ComparisonField
 */
export interface ComparisonField {
  /** Key */
  key: string;
  /** Label */
  label: string;
  /** Type */
  type: "text" | "price" | "rating" | "boolean" | "badge";
}

/**
 * Comparison Fields
 * @constant
 */
export const COMPARISON_FIELDS: ComparisonField[] = [
  { key: "price", label: "Price", type: "price" },
  { key: "originalPrice", label: "Original Price", type: "price" },
  { key: "condition", label: "Condition", type: "badge" },
  { key: "rating", label: "Rating", type: "rating" },
  { key: "reviewCount", label: "Reviews", type: "text" },
  { key: "shopName", label: "Seller", type: "text" },
  { key: "inStock", label: "In Stock", type: "boolean" },
];
