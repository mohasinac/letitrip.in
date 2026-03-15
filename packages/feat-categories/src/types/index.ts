export interface CategorySeo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface CategoryDisplay {
  icon?: string;
  coverImage?: string;
  showInMenu?: boolean;
}

export interface CategoryMetrics {
  productCount: number;
  totalItemCount: number;
  lastUpdated?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  rootId?: string;
  parentIds?: string[];
  childrenIds?: string[];
  tier: number;
  path?: string;
  order?: number;
  isLeaf?: boolean;
  metrics?: CategoryMetrics;
  isFeatured?: boolean;
  featuredPriority?: number;
  isBrand?: boolean;
  seo?: CategorySeo;
  display?: CategoryDisplay;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  items: CategoryItem[];
  total: number;
}
