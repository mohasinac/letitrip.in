/**
 * TypeScript input types for CRUD operations.
 * Used as request body types for API route handlers and form schemas.
 */

// --- Admin: Categories ---
export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentCategory?: string | null;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// --- Admin: Brands ---
export interface CreateBrandInput {
  name: string;
  slug?: string;
  description?: string;
  logoURL?: string;
  bannerURL?: string;
  website?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export type UpdateBrandInput = Partial<CreateBrandInput>;

// --- Admin: Coupons ---
export type CouponType =
  | "percentage"
  | "fixed"
  | "free_shipping"
  | "bxgy"
  | "tiered";
export type CouponScope = "admin" | "seller";

export interface CreateCouponInput {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  scope: CouponScope;
  sellerId?: string;
  discount: {
    value: number;
    maxDiscount?: number;
    minPurchase?: number;
  };
  usage?: {
    totalLimit?: number;
    perUserLimit?: number;
  };
  validity?: {
    startDate?: Date | string;
    endDate?: Date | string;
    isActive?: boolean;
  };
  restrictions?: {
    applicableProducts?: string[];
    applicableCategories?: string[];
    applicableSellers?: string[];
    excludeProducts?: string[];
    excludeCategories?: string[];
    firstTimeUserOnly?: boolean;
    combineWithSellerCoupons?: boolean;
  };
}

export type UpdateCouponInput = Partial<
  Omit<CreateCouponInput, "code" | "scope" | "sellerId">
>;

// --- Admin: Blog Posts ---
export type BlogPostStatus = "draft" | "published" | "archived";

export interface CreateBlogPostInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  category?: string;
  status?: BlogPostStatus;
  isFeatured?: boolean;
  publishDate?: Date | string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

// --- Admin: FAQs ---
export interface CreateFaqInput {
  question: string;
  answer: string;
  category?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateFaqInput = Partial<CreateFaqInput>;

// --- Admin: Carousel Slides ---
export interface CreateCarouselSlideInput {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  linkLabel?: string;
  backgroundColor?: string;
  textColor?: string;
  order?: number;
  isActive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
}

export type UpdateCarouselSlideInput = Partial<CreateCarouselSlideInput>;

// --- Admin: Users ---
export type UserRole = "user" | "seller" | "admin" | "moderator";

export interface UpdateUserRoleInput {
  role?: UserRole;
  disabled?: boolean;
}

// --- Admin: Orders ---
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface UpdateOrderStatusInput {
  status?: OrderStatus;
  trackingNumber?: string;
  shippingCarrier?: string;
  trackingUrl?: string;
  cancellationReason?: string;
}

// --- Admin: Stores ---
export type StoreStatus = "pending" | "approved" | "rejected" | "suspended";

export interface UpdateStoreStatusInput {
  storeStatus: StoreStatus;
  reason?: string;
  isVerified?: boolean;
}

// --- Admin: Reviews ---
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface UpdateReviewStatusInput {
  status?: ReviewStatus;
  featured?: boolean;
  adminReply?: string;
  rejectionReason?: string;
}

// --- Store: Profile ---
export interface UpdateStoreProfileInput {
  storeName?: string;
  storeDescription?: string;
  storeLogoURL?: string;
  storeBannerURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  isVacationMode?: boolean;
  vacationMessage?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  storeSlug?: string;
}

// --- Store: Shipping ---
export interface UpdateShippingConfigInput {
  method?: "custom" | "shiprocket";
  customShippingPrice?: number;
  customCarrierName?: string;
  shiprocketEmail?: string;
  pickupAddress?: {
    locationName?: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
}

// --- Store: Payout Settings ---
export interface UpdatePayoutSettingsInput {
  method?: "upi" | "bank_transfer";
  upiId?: string;
  bankDetails?: {
    holderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountType?: "savings" | "current";
  };
}
