import type { ProductStatus, ProductCondition } from "@/types/shared/common.types";

export interface ProductEditFormData {
  name: string;
  slug: string;
  price: number;
  categoryId: string;
  description: string;
  stockCount: number;
  sku: string;
  condition: ProductCondition;
  status: ProductStatus;
}

export interface StepProps {
  formData: ProductEditFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductEditFormData>>;
}
