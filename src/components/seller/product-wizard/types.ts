// Product wizard shared types

export interface ProductFormData {
  // Basic Info
  name: string;
  slug: string;
  categoryId: string;
  brand: string;
  sku: string;

  // Pricing & Stock
  price: number;
  compareAtPrice: number;
  stockCount: number;
  lowStockThreshold: number;
  weight: number;

  // Product Details
  description: string;
  condition: "new" | "like-new" | "used" | "refurbished";
  features: string[];
  specifications: Record<string, string>;

  // Media
  images: string[];
  videos: string[];

  // Shipping & Policies
  pickupAddressId?: string;
  shippingClass: "standard" | "express" | "free" | "fragile";
  returnPolicy: string;
  warrantyInfo: string;

  // SEO & Publishing
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  status: "draft" | "published";

  // System fields
  shopId: string;
}

export interface StepProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export interface RequiredStepProps extends StepProps {
  uploadingImages: boolean;
  setUploadingImages: React.Dispatch<React.SetStateAction<boolean>>;
  uploadProgress: Record<string, number>;
  setUploadProgress: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

export interface OptionalStepProps extends StepProps {
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}
