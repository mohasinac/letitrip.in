/**
 * Common Shared Types
 * Types used across both UI and Backend
 */

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any;
  message?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Generic filter interface
 */
export interface BaseFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

/**
 * Status filter
 */
export interface StatusFilter<T = string> {
  status?: T | T[];
}

/**
 * Generic ID reference
 */
export type EntityId = string;

/**
 * Timestamp fields (common in all entities)
 */
export interface Timestamps {
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Soft delete support
 */
export interface SoftDelete {
  deletedAt?: string | Date | null;
  isDeleted?: boolean;
}

/**
 * Audit fields
 */
export interface AuditFields extends Timestamps {
  createdBy?: EntityId;
  updatedBy?: EntityId;
}

/**
 * SEO metadata
 */
export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
}

/**
 * Image metadata
 */
export interface ImageMetadata {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  size?: number; // bytes
  format?: string; // jpg, png, webp, etc.
}

/**
 * Video metadata
 */
export interface VideoMetadata {
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number; // seconds
  width?: number;
  height?: number;
  size?: number; // bytes
  format?: string; // mp4, webm, etc.
}

/**
 * Coordinates (for maps, locations)
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Social media links
 */
export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  pinterest?: string;
  whatsapp?: string;
  telegram?: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: any;
}

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  success: number;
  failed: number;
  total: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  storagePath: string;
}

/**
 * Generic statistics
 */
export interface Statistics {
  total: number;
  active?: number;
  inactive?: number;
  pending?: number;
  [key: string]: number | undefined;
}
