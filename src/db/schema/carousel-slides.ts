/**
 * Carousel Slides Collection Schema
 *
 * Firestore schema definition for homepage carousel slides
 */

import { generateCarouselId, type GenerateCarouselIdInput } from "@/utils";

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface GridCard {
  id: string;
  gridPosition: { row: number; col: number }; // 3x3 grid (1-3)
  mobilePosition?: { row: number; col: number }; // 2x2 grid (1-2)
  width: number; // Grid cells span
  height: number; // Grid cells span
  background: {
    type: "color" | "gradient" | "image";
    value: string; // hex color, gradient string, or image URL
  };
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
  buttons: {
    id: string;
    text: string;
    link: string;
    variant: "primary" | "secondary" | "outline";
    openInNewTab: boolean;
  }[];
  isButtonOnly: boolean; // Card acts as large button
  mobileHideText: boolean; // Hide text on mobile
}

export interface CarouselSlideDocument {
  id: string;
  title: string;
  order: number; // Display order
  active: boolean; // Only max 5 slides can be active at once
  media: {
    type: "image" | "video";
    url: string;
    alt: string;
    thumbnail?: string; // For videos
  };
  link?: {
    url: string;
    openInNewTab: boolean;
  };
  mobileMedia?: {
    type: "image" | "video";
    url: string;
    alt: string;
  };
  cards: GridCard[];
  /** Analytics counters — system-managed, not admin-settable */
  stats?: {
    views: number; // Total times this slide was served in the public carousel
    lastViewed?: Date; // Timestamp of the most recent public serve
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
}

export const CAROUSEL_SLIDES_COLLECTION = "carouselSlides" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * Purpose:
 * - active + order: Fetch active slides in display order
 * - createdBy + createdAt: Admin can view their created slides
 */
export const CAROUSEL_SLIDES_INDEXED_FIELDS = [
  "active", // For filtering active slides
  "order", // For sorting slides
  "createdBy", // For filtering by creator
  "createdAt", // For date-based sorting
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) carouselSlides
 *
 * Foreign Keys:
 * - carouselSlides/{id}.createdBy references users/{uid}
 *
 * CASCADE BEHAVIOR:
 * - When user deleted: Set createdBy to null or "deleted_user"
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Maximum number of active slides allowed
 */
export const MAX_ACTIVE_SLIDES = 5 as const;

/**
 * Grid configuration
 */
export const GRID_CONFIG = {
  desktop: { rows: 9, cols: 9 },
  mobile: { rows: 2, cols: 2 },
} as const;

/**
 * Default data for new carousel slides
 */
export const DEFAULT_CAROUSEL_SLIDE_DATA: Partial<CarouselSlideDocument> = {
  active: false,
  order: 0,
  cards: [],
};

/**
 * Fields that are publicly readable
 */
export const CAROUSEL_SLIDES_PUBLIC_FIELDS = [
  "id",
  "title",
  "order",
  "active",
  "media",
  "link",
  "mobileMedia",
  "cards",
  "stats",
] as const;

/**
 * Fields that admins can update
 */
export const CAROUSEL_SLIDES_UPDATABLE_FIELDS = [
  "title",
  "order",
  "active",
  "media",
  "link",
  "mobileMedia",
  "cards",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new carousel slides (omit system-generated fields)
 */
export type CarouselSlideCreateInput = Omit<
  CarouselSlideDocument,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Type for updating carousel slides
 */
export type CarouselSlideUpdateInput = Partial<
  Pick<
    CarouselSlideDocument,
    "title" | "order" | "active" | "media" | "link" | "mobileMedia" | "cards"
  >
>;

/**
 * Type for grid card creation
 */
export type GridCardCreateInput = Omit<GridCard, "id">;

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const carouselSlideQueryHelpers = {
  active: () => ["active", "==", true] as const,
  inactive: () => ["active", "==", false] as const,
  byCreator: (userId: string) => ["createdBy", "==", userId] as const,
} as const;

// ============================================
// 7. ID GENERATION HELPER
// ============================================

/**
 * Generate SEO-friendly carousel slide ID
 * Pattern: carousel-{title-slug}-{timestamp}
 *
 * @param title - Carousel slide title
 * @returns SEO-friendly carousel ID
 *
 * Example: createCarouselId("Winter Sale") → "carousel-winter-sale-1707300000000"
 */
export function createCarouselId(title: string): string {
  return generateCarouselId({ title });
}

// ============================================
// 7. VALIDATION HELPERS
// ============================================
/**
 * Validate grid position is within bounds
 */
export function isValidGridPosition(
  position: { row: number; col: number },
  isMobile: boolean = false,
): boolean {
  const config = isMobile ? GRID_CONFIG.mobile : GRID_CONFIG.desktop;
  return (
    position.row >= 1 &&
    position.row <= config.rows &&
    position.col >= 1 &&
    position.col <= config.cols
  );
}

/**
 * Check if slide can be activated (max 5 active slides)
 */
export function canActivateSlide(currentActiveCount: number): boolean {
  return currentActiveCount < MAX_ACTIVE_SLIDES;
}
