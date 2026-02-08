/**
 * API Request/Response Type Definitions
 *
 * Centralized types for all API endpoints
 *
 * TODO - Phase 2 Refactoring:
 * - Add OpenAPI/Swagger documentation generation
 * - Implement API versioning types (v1, v2)
 * - Add WebSocket event types
 * - Create GraphQL schema types (if implementing GraphQL)
 * - Add type guards for runtime validation
 * - Implement discriminated unions for polymorphic responses
 */

import type {
  ProductDocument,
  ProductStatus,
  ProductSpecification,
} from "@/db/schema/products";
import type { CategoryDocument } from "@/db/schema/categories";
import type { ReviewDocument, ReviewStatus } from "@/db/schema/reviews";
import type { SiteSettingsDocument } from "@/db/schema/site-settings";
import type { CarouselSlideDocument } from "@/db/schema/carousel-slides";
import type { HomepageSectionDocument } from "@/db/schema/homepage-sections";
import type { FAQDocument } from "@/db/schema/faqs";

// ============================================
// COMMON API TYPES
// ============================================

/**
 * Standard API response wrapper
 * TODO: Add response metadata (requestId, timestamp, version)
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response metadata
 * TODO: Add cursor-based pagination support
 * TODO: Add links for HATEOAS (next, prev, first, last)
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasMore: boolean;
  nextCursor?: string; // For cursor-based pagination
  prevCursor?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * Common query parameters for list endpoints
 * TODO: Add support for complex filters (OR, AND conditions)
 * TODO: Add support for field selection (sparse fieldsets)
 * TODO: Add support for includes/relations expansion
 */
export interface CommonQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  fields?: string[]; // Field selection for response
}

// ============================================
// PRODUCT API TYPES
// ============================================

/**
 * Product list query parameters
 * TODO: Add price range filter (minPrice, maxPrice)
 * TODO: Add brand filter
 * TODO: Add condition filter (new, used, refurbished)
 * TODO: Add location-based filtering
 * TODO: Add availability filter (in_stock, out_of_stock)
 */
export interface ProductListQuery extends CommonQueryParams {
  category?: string;
  subcategory?: string;
  status?: ProductStatus;
  sellerId?: string;
  featured?: boolean;
  isAuction?: boolean;
  isPromoted?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

/**
 * Product creation request body
 * TODO: Add bulk creation support (array of products)
 * TODO: Add draft auto-save support
 * TODO: Add import from URL/CSV
 */
export interface ProductCreateRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  currency: string;
  stockQuantity: number;
  mainImage: string; // Pre-uploaded URL or will be uploaded
  images?: string[];
  video?: {
    url: string;
    thumbnailUrl: string;
    duration: number;
    trimStart?: number;
    trimEnd?: number;
  };
  specifications?: ProductSpecification[];
  features?: string[];
  tags?: string[];
  shippingInfo?: string;
  returnPolicy?: string;
  // Auction fields (optional)
  isAuction?: boolean;
  auctionEndDate?: string; // ISO date string
  startingBid?: number;
}

/**
 * Product update request body
 * TODO: Add partial update support with PATCH semantics
 * TODO: Add optimistic locking with version field
 */
export type ProductUpdateRequest = Partial<ProductCreateRequest> & {
  status?: ProductStatus;
};

/**
 * Product response with computed fields
 * TODO: Add seller rating/reputation
 * TODO: Add average review rating
 * TODO: Add view count
 * TODO: Add favorite/wishlist count
 */
export interface ProductResponse extends ProductDocument {
  // Computed fields (not in database)
  viewCount?: number;
  favoriteCount?: number;
  averageRating?: number;
  reviewCount?: number;
  isInUserWishlist?: boolean; // If user is authenticated
}

// ============================================
// CATEGORY API TYPES
// ============================================

/**
 * Category list query parameters
 * TODO: Add depth limit for tree queries
 * TODO: Add include/exclude inactive categories
 */
export interface CategoryListQuery extends CommonQueryParams {
  rootId?: string;
  parentId?: string;
  featured?: boolean;
  includeMetrics?: boolean;
  flat?: boolean; // Return flat list instead of tree
  maxDepth?: number;
}

/**
 * Category creation request
 * TODO: Add bulk import support
 * TODO: Add category templates
 */
export interface CategoryCreateRequest {
  name: string;
  parentId?: string;
  description?: string;
  display?: {
    icon?: string;
    coverImage?: string;
    color?: string;
    showInMenu?: boolean;
    showInFooter?: boolean;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

/**
 * Category update request
 */
export type CategoryUpdateRequest = Partial<CategoryCreateRequest> & {
  order?: number;
  isFeatured?: boolean;
};

/**
 * Category tree node (nested structure)
 * TODO: Implement lazy loading for large trees
 */
export interface CategoryTreeNode extends CategoryDocument {
  children?: CategoryTreeNode[];
}

// ============================================
// REVIEW API TYPES
// ============================================

/**
 * Review list query parameters
 * TODO: Add filter by verification status
 * TODO: Add filter by helpful votes threshold
 */
export interface ReviewListQuery extends CommonQueryParams {
  productId: string; // Required
  status?: ReviewStatus;
  rating?: number;
  verified?: boolean;
}

/**
 * Review creation request
 * TODO: Add media upload handling
 * TODO: Add review templates/quick reviews
 */
export interface ReviewCreateRequest {
  productId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  video?: {
    url: string;
    thumbnailUrl: string;
    duration: number;
    trimStart?: number;
    trimEnd?: number;
  };
}

/**
 * Review update request
 * TODO: Add edit history tracking
 */
export type ReviewUpdateRequest = Partial<
  Omit<ReviewCreateRequest, "productId">
>;

/**
 * Review response with computed fields
 */
export interface ReviewResponse extends ReviewDocument {
  userHasVoted?: boolean; // If authenticated user has voted
  userVote?: "helpful" | "not_helpful";
}

/**
 * Review vote request
 */
export interface ReviewVoteRequest {
  vote: "helpful" | "not_helpful";
}

// ============================================
// SITE SETTINGS API TYPES
// ============================================

/**
 * Site settings update request (admin only)
 * TODO: Add validation for each nested object
 * TODO: Add settings diff for change tracking
 */
export type SiteSettingsUpdateRequest = Partial<
  Omit<SiteSettingsDocument, "id" | "createdAt" | "updatedAt">
>;

// ============================================
// CAROUSEL API TYPES
// ============================================

/**
 * Carousel list query parameters
 */
export interface CarouselListQuery {
  includeInactive?: boolean; // Admin only
}

/**
 * Carousel slide creation request (admin only)
 * TODO: Add slide duplication feature
 * TODO: Add slide scheduling (start/end dates)
 */
export interface CarouselCreateRequest {
  title: string;
  order: number;
  active: boolean;
  media: {
    type: "image" | "video";
    url: string;
    alt: string;
    thumbnail?: string;
  };
  link?: {
    url: string;
    openInNewTab: boolean;
  };
  gridCards: Array<{
    gridPosition: { row: number; col: number };
    mobilePosition?: { row: number; col: number };
    width: number;
    height: number;
    background: {
      type: "color" | "gradient" | "image";
      value: string;
    };
    content?: {
      title?: string;
      subtitle?: string;
      description?: string;
    };
    buttons?: Array<{
      text: string;
      link: string;
      variant: "primary" | "secondary" | "outline";
      openInNewTab: boolean;
    }>;
    isButtonOnly?: boolean;
    mobileHideText?: boolean;
  }>;
}

/**
 * Carousel slide update request
 */
export type CarouselUpdateRequest = Partial<CarouselCreateRequest>;

/**
 * Carousel reorder request
 * TODO: Implement drag-and-drop ordering
 */
export interface CarouselReorderRequest {
  slideIds: string[]; // Ordered array of slide IDs
}

// ============================================
// HOMEPAGE SECTIONS API TYPES
// ============================================

/**
 * Homepage sections list query
 */
export interface HomepageSectionsListQuery {
  includeDisabled?: boolean; // Admin only
}

/**
 * Homepage section creation request (admin only)
 * TODO: Add section templates library
 * TODO: Add A/B testing configuration
 */
export interface HomepageSectionCreateRequest {
  type: string; // Section type (welcome, products, categories, etc.)
  title: string;
  order: number;
  enabled: boolean;
  config: Record<string, unknown>; // Section-specific configuration
}

/**
 * Homepage section update request
 */
export type HomepageSectionUpdateRequest =
  Partial<HomepageSectionCreateRequest>;

/**
 * Homepage sections reorder request
 */
export interface HomepageSectionsReorderRequest {
  sectionIds: string[]; // Ordered array of section IDs
}

// ============================================
// FAQ API TYPES
// ============================================

/**
 * FAQ list query parameters
 * TODO: Add popularity-based sorting
 * TODO: Add related FAQs suggestions
 */
export interface FAQListQuery extends CommonQueryParams {
  category?: string;
  featured?: boolean;
  priority?: number;
  tags?: string[];
}

/**
 * FAQ creation request (admin only)
 * TODO: Add AI-powered FAQ generation
 * TODO: Add FAQ templates
 */
export interface FAQCreateRequest {
  question: string;
  answer: {
    text: string; // Can contain variables like {{companyName}}
    format: "plain" | "markdown" | "html";
  };
  category: string;
  priority: number; // 1-10
  featured: boolean;
  tags?: string[];
  relatedFAQs?: string[]; // Array of FAQ IDs
}

/**
 * FAQ update request
 */
export type FAQUpdateRequest = Partial<FAQCreateRequest>;

/**
 * FAQ vote request
 */
export interface FAQVoteRequest {
  vote: "helpful" | "not_helpful";
}

/**
 * FAQ response with interpolated variables
 */
export interface FAQResponse extends FAQDocument {
  // Answer will have variables replaced with actual values
  userHasVoted?: boolean;
  userVote?: "helpful" | "not_helpful";
}

// ============================================
// ERROR RESPONSE TYPES
// ============================================

/**
 * Standard error response
 * TODO: Add error codes for i18n
 * TODO: Add field-level validation errors
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  fields?: Record<string, string[]>; // Field-level errors
}

// ============================================
// MEDIA UPLOAD TYPES
// ============================================

/**
 * Media upload request
 * TODO: Implement chunked upload for large files
 * TODO: Add upload progress tracking
 * TODO: Add resumable upload support
 */
export interface MediaUploadRequest {
  file: File | Blob;
  type: "image" | "video";
  entityType: "product" | "review" | "category" | "carousel" | "user";
  entityId?: string;
  // For images
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    aspectRatio?: string; // "1:1", "16:9", etc.
  };
  // For videos
  trimData?: {
    start: number; // seconds
    end: number; // seconds
  };
  thumbnailData?: {
    timePosition: number; // seconds - which frame to use as thumbnail
  };
}

/**
 * Media upload response
 */
export interface MediaUploadResponse {
  url: string;
  thumbnailUrl?: string; // For videos
  width?: number;
  height?: number;
  duration?: number; // For videos
  size: number; // bytes
  mimeType: string;
}
