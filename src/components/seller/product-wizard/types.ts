/**
 * @fileoverview Type Definitions
 * @module src/components/seller/product-wizard/types
 * @description This file contains TypeScript type definitions for types
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

// Product wizard shared types

/**
 * ProductFormData interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductFormData
 */
export interface ProductFormData {
  // Basic Info
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Category Id */
  categoryId: string;
  /** Brand */
  brand: string;
  /** Sku */
  sku: string;

  // Pricing & Stock
  /** Price */
  price: number;
  /** Compare At Price */
  compareAtPrice: number;
  /** Stock Count */
  stockCount: number;
  /** Low Stock Threshold */
  lowStockThreshold: number;
  /** Weight */
  weight: number;

  // Product Details
  /** Description */
  description: string;
  /** Condition */
  condition: "new" | "like-new" | "used" | "refurbished";
  /** Features */
  features: string[];
  /** Specifications */
  specifications: Record<string, string>;

  // Media
  /** Images */
  images: string[];
  /** Videos */
  videos: string[];

  // Shipping & Policies
  /** Pickup Address Id */
  pickupAddressId?: string;
  /** Shipping Class */
  shippingClass: "standard" | "express" | "free" | "fragile";
  /** Return Policy */
  returnPolicy: string;
  /** Warranty Info */
  warrantyInfo: string;

  // SEO & Publishing
  /** Meta Title */
  metaTitle: string;
  /** Meta Description */
  metaDescription: string;
  /** Featured */
  featured: boolean;
  /** Status */
  status: "draft" | "published";

  // System fields
  /** Shop Id */
  shopId: string;
}

/**
 * StepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for StepProps
 */
export interface StepProps {
  /** Form Data */
  formData: ProductFormData;
  /** Set Form Data */
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

/**
 * RequiredStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for RequiredStepProps
 */
export interface RequiredStepProps extends StepProps {
  /** Uploading Images */
  uploadingImages: boolean;
  /** Set Uploading Images */
  setUploadingImages: React.Dispatch<React.SetStateAction<boolean>>;
  /** Upload Progress */
  uploadProgress: Record<string, number>;
  /** Set Upload Progress */
  setUploadProgress: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

/**
 * OptionalStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for OptionalStepProps
 */
export interface OptionalStepProps extends StepProps {
  /** Expanded Sections */
  expandedSections: Record<string, boolean>;
  /** Toggle Section */
  toggleSection: (section: string) => void;
}
