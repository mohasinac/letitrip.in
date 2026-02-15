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
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Response metadata for tracking and debugging
 */
export interface ResponseMetadata {
  requestId: string; // Unique request identifier for tracing
  timestamp: Date; // Response generation time
  version: string; // API version (e.g., "v1")
  duration?: number; // Response time in milliseconds
}

/**
 * Extended API response with metadata
 */
export interface ApiResponseWithMetadata<T = unknown> extends ApiResponse<T> {
  meta?: ResponseMetadata;
}

/**
 * HATEOAS Link for hypermedia-driven APIs
 */
export interface HATEOASLink {
  rel: "self" | "first" | "last" | "next" | "prev" | "parent" | "child";
  href: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  title?: string;
  type?: string; // MIME type
}

/**
 * Offset-based pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasMore: boolean;
}

/**
 * Cursor-based pagination for efficient large dataset handling
 */
export interface CursorPaginationMeta {
  nextCursor?: string; // Base64-encoded cursor for next page
  prevCursor?: string; // Base64-encoded cursor for previous page
  hasMore: boolean; // Whether more results exist
  total?: number; // Total count (optional, expensive to compute)
  limit: number; // Items per page
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams {
  cursor?: string; // Base64-encoded pagination marker
  limit: number; // Results per page
  sort?: {
    field: string; // Field to sort by
    direction: "asc" | "desc";
  };
}

/**
 * Paginated API response with offset-based pagination
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  meta: PaginationMeta & { links?: HATEOASLink[] };
}

/**
 * API response with cursor-based pagination
 */
export interface CursorPaginatedApiResponse<T = unknown> extends ApiResponse<
  T[]
> {
  meta: CursorPaginationMeta & { links?: HATEOASLink[] };
}

/**
 * Filter operator for complex filtering
 */
export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin"
  | "exists"
  | "regex"
  | "between";

/**
 * Individual filter condition
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Complex filter with logical operators
 */
export interface ComplexFilter {
  $and?: FilterCondition[];
  $or?: FilterCondition[];
  $nor?: FilterCondition[];
  conditions?: FilterCondition[];
}

/**
 * Sparse fieldset for bandwidth optimization
 */
export interface FieldSelection {
  fields?: string[]; // Include-based field selection
  exclude?: string[]; // Exclude-based field selection
}

/**
 * Relation/include expansion options
 */
export interface IncludeOptions {
  include?: string[]; // Relations to expand (e.g., "seller", "reviews", "images")
  depth?: number; // Nesting depth (default: 1, max: 5)
  maxSize?: number; // Max size of related array
}

/**
 * Common query parameters for list endpoints
 */
export interface CommonQueryParams extends FieldSelection, IncludeOptions {
  page?: number;
  limit?: number;
  cursor?: string; // For cursor-based pagination
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filter?: ComplexFilter; // Complex filtering support
}

/**
 * Expanded resource with related data
 */
export interface ExpandedResource<T> {
  data: T;
  included?: {
    [key: string]: any[]; // Related resources grouped by type
  };
}

// ============================================
// PRODUCT API TYPES
// ============================================

/**
 * Product list query parameters with advanced filtering
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
  brand?: string;
  condition?: "new" | "used" | "refurbished";
  location?: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number; // km radius for location-based search
  };
  inStock?: boolean; // true = in_stock, false = out_of_stock
  rating?: {
    min: number; // Min average rating (0-5)
  };
  tags?: string[];
}

/**
 * Product creation request body
 */
export interface ProductCreateRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  originalPrice?: number; // For showing discounts
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
  isDraft?: boolean; // Draft auto-save support
  // Auction fields (optional)
  isAuction?: boolean;
  auctionEndDate?: string; // ISO date string
  startingBid?: number;
}

/**
 * Product update request body with PATCH semantics
 */
export type ProductUpdateRequest = Partial<ProductCreateRequest> & {
  status?: ProductStatus;
  version?: number; // For optimistic locking
};

/**
 * Bulk product creation request
 */
export interface ProductBulkCreateRequest {
  products: ProductCreateRequest[];
  importSource?: "csv" | "url" | "api";
  dryRun?: boolean; // Validate without creating
}

/**
 * Response from bulk import operation
 */
export interface BulkImportResponse {
  imported: number;
  failed: number;
  skipped: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
}

/**
 * Product response with computed fields
 */
export interface ProductResponse extends ProductDocument {
  // Computed fields (not in database)
  viewCount?: number;
  favoriteCount?: number;
  averageRating?: number;
  reviewCount?: number;
  isInUserWishlist?: boolean; // If user is authenticated
  sellerRating?: number; // Seller's average rating
  sellerReviewCount?: number; // Total reviews for seller
}

// ============================================
// CATEGORY API TYPES
// ============================================

/**
 * Category list query parameters with tree support
 */
export interface CategoryListQuery extends CommonQueryParams {
  rootId?: string;
  parentId?: string;
  featured?: boolean;
  includeMetrics?: boolean;
  flat?: boolean; // Return flat list instead of tree
  maxDepth?: number; // Depth limit for tree queries (default: 3)
  includeInactive?: boolean; // Include inactive categories
  expandChildren?: boolean; // Fetch all descendants
}

/**
 * Category creation request
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
 * Bulk category import request
 */
export interface CategoryBulkImport {
  categories: Array<{
    name: string;
    parentId?: string;
    image?: string;
    description?: string;
  }>;
}

/**
 * Category tree node (nested structure)
 */
export interface CategoryTreeNode extends CategoryDocument {
  children?: CategoryTreeNode[];
  productCount?: number; // Number of products in category
}

// ============================================
// REVIEW API TYPES
// ============================================

/**
 * Review list query parameters with advanced filtering
 */
export interface ReviewListQuery extends CommonQueryParams {
  productId: string; // Required
  status?: ReviewStatus;
  rating?: number; // Filter by specific rating
  ratingRange?: [number, number]; // Filter by rating range
  verified?: boolean; // Filter by verification status
  minHelpful?: number; // Filter by helpful votes threshold
  sortBy?: "recent" | "helpful" | "rating"; // Sort order
}

/**
 * Review creation request
 */
export interface ReviewCreateRequest {
  productId: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  media?: string[]; // Image/video URLs
  video?: {
    url: string;
    thumbnailUrl: string;
    duration: number;
    trimStart?: number;
    trimEnd?: number;
  };
  template?: "quick" | "detailed"; // Pre-filled template
  verified?: boolean; // Mark as verified purchase
}

/**
 * Review update request with edit history
 */
export type ReviewUpdateRequest = Partial<
  Omit<ReviewCreateRequest, "productId">
>;

/**
 * Edit history entry for reviews
 */
export interface ReviewEditHistory {
  editedAt: Date;
  previousContent: string;
  previousRating?: number;
}

/**
 * Review response with computed fields
 */
export interface ReviewResponse extends ReviewDocument {
  userHasVoted?: boolean; // If authenticated user has voted
  userVote?: "helpful" | "not_helpful";
  history?: ReviewEditHistory[]; // Edit history for admins
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
  startDate?: Date; // Slide scheduling start
  endDate?: Date; // Slide scheduling end
  template?: string; // Template reference
  duplicateFrom?: string; // Duplicate from another slide
}

/**
 * Carousel slide update request
 */
export type CarouselUpdateRequest = Partial<CarouselCreateRequest>;

/**
 * Carousel reorder request for drag-and-drop
 */
export interface CarouselReorderRequest {
  slideIds: string[]; // Ordered array of slide IDs
}

/**
 * Generic reorder request for drag-and-drop operations
 */
export interface ReorderRequest {
  itemId: string;
  newOrder: number;
  targetPosition?: "before" | "after";
  targetItemId?: string;
}

/**
 * Response from reorder operation
 */
export interface ReorderResponse {
  success: boolean;
  items: Array<{
    id: string;
    order: number;
  }>;
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
 */
export interface HomepageSectionCreateRequest {
  type: "welcome" | "featured" | "categories" | "trending" | "custom";
  title: string;
  order: number;
  enabled: boolean;
  config?: {
    maxItems?: number;
    layout?: "grid" | "carousel" | "list";
    columns?: number; // For responsive layout
    template?: string; // Template reference
  };
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
 */
export interface FAQListQuery extends CommonQueryParams {
  category?: string;
  featured?: boolean;
  priority?: number;
  tags?: string[];
  sortBy?: "popular" | "recent" | "helpful"; // Popularity-based sorting
}

/**
 * FAQ creation request (admin only)
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
  relatedFAQs?: string[]; // Array of FAQ IDs for suggestions
  template?: string; // FAQ template reference
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
 * Standard error response with field-level errors
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string; // For i18n translation
  message?: string; // Human-readable message
  details?: unknown;
  fields?: Record<string, string[]>; // Field-level validation errors
  timestamp?: Date;
  traceId?: string; // For debugging/logging
}

// ============================================
// MEDIA UPLOAD TYPES
// ============================================

/**
 * Media upload request with chunking and progress tracking
 */
export interface MediaUploadRequest {
  file: File | Blob;
  type: "image" | "video";
  entityType: "product" | "review" | "category" | "carousel" | "user";
  entityId?: string;
  chunkSize?: number; // For chunked upload (default: 5MB)
  uploadId?: string; // For resumable upload
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
 * Chunked upload request for large files
 */
export interface ChunkedUploadRequest {
  uploadId: string; // Unique upload session ID
  chunkIndex: number; // 0-based chunk index
  totalChunks: number; // Total number of chunks
  chunkSize: number; // Size of this chunk in bytes
  chunk: File | Blob; // Chunk data
}

/**
 * Chunked upload progress
 */
export interface UploadProgress {
  uploadId: string;
  chunkIndex: number;
  totalChunks: number;
  percentComplete: number; // 0-100
  bytesUploaded: number;
  totalBytes: number;
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
  uploadId?: string; // For resumable uploads
}
