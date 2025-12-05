/**
 * @fileoverview Type Definitions
 * @module src/components/admin/category-wizard/types
 * @description This file contains TypeScript type definitions for types
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Category Form Data interface
 * @interface CategoryFormData
 */
export interface CategoryFormData {
  /** Name */
  name: string;
  /** Parent Category */
  parentCategory: string;
  /** Description */
  description: string;
  /** Image Url */
  imageUrl: string;
  /** Icon */
  icon: string;
  /** Slug */
  slug: string;
  /** Meta Title */
  metaTitle: string;
  /** Meta Description */
  metaDescription: string;
  /** Display Order */
  displayOrder: string;
  /** Featured */
  featured: boolean;
  /** Is Active */
  isActive: boolean;
}

/**
 * OnChange type
 * 
 * @typedef {Object} OnChange
 * @description Type definition for OnChange
 */
export type OnChange = (field: keyof CategoryFormData, value: any) => void;
