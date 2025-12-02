export interface CategoryFormData {
  name: string;
  parentCategory: string;
  description: string;
  imageUrl: string;
  icon: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  displayOrder: string;
  featured: boolean;
  isActive: boolean;
}

export type OnChange = (field: keyof CategoryFormData, value: any) => void;