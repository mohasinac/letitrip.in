/**
 * Shared Product types for admin product management.
 */

export interface AdminProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  currency: string;
  stockQuantity: number;
  availableQuantity: number;
  mainImage: string;
  images: string[];
  status: ProductStatus;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  featured: boolean;
  tags: string[];
  shippingInfo?: string;
  returnPolicy?: string;
  isAuction?: boolean;
  auctionEndDate?: string;
  startingBid?: number;
  currentBid?: number;
  bidCount?: number;
  isPromoted?: boolean;
  promotionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus =
  | "draft"
  | "published"
  | "out_of_stock"
  | "discontinued"
  | "sold";

export type ProductDrawerMode = "create" | "edit" | "delete" | null;

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] =
  [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "out_of_stock", label: "Out of Stock" },
    { value: "discontinued", label: "Discontinued" },
    { value: "sold", label: "Sold" },
  ];
