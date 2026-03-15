export type ProductStatus = "draft" | "published" | "archived" | "sold";
export type ProductCondition = "new" | "like_new" | "good" | "fair" | "poor";
export type ListingType = "fixed" | "auction";

export interface ProductImage {
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  order?: number;
}

export interface ProductSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProductItem {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  mainImage?: string;
  images?: ProductImage[];
  category?: string;
  categorySlug?: string;
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  status: ProductStatus;
  condition?: ProductCondition;
  listingType?: ListingType;
  isAuction?: boolean;
  isPreOrder?: boolean;
  inStock?: boolean;
  stockCount?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  attributes?: Record<string, string>;
  seo?: ProductSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface ProductListResponse {
  items: ProductItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ProductListParams {
  q?: string;
  category?: string;
  status?: ProductStatus;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isAuction?: boolean;
  sellerId?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  featured?: boolean;
}
