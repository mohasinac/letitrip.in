/**
 * @fileoverview Type Definitions
 * @module src/components/seller/product-edit-wizard/types
 * @description This file contains TypeScript type definitions for types
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import type {
  ProductStatus,
  ProductCondition,
} from "@/types/shared/common.types";

/**
 * ProductEditFormData interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductEditFormData
 */
export interface ProductEditFormData {
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Price */
  price: number;
  /** Category Id */
  categoryId: string;
  /** Description */
  description: string;
  /** Stock Count */
  stockCount: number;
  /** Sku */
  sku: string;
  /** Condition */
  condition: ProductCondition;
  /** Status */
  status: ProductStatus;
}

/**
 * StepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for StepProps
 */
export interface StepProps {
  /** Form Data */
  formData: ProductEditFormData;
  /** Set Form Data */
  setFormData: React.Dispatch<React.SetStateAction<ProductEditFormData>>;
}
