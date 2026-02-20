/**
 * Blog Posts Collection Schema
 *
 * Firestore schema definition for blog post management
 */

// ============================================
// BLOG TYPE ENUMS & INTERFACES
// ============================================

export type BlogPostStatus = "draft" | "published" | "archived";

export type BlogPostCategory =
  | "news"
  | "tips"
  | "guides"
  | "updates"
  | "community";

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface BlogPostDocument {
  id: string;
  title: string;
  slug: string;
  excerpt: string; // Short description, ~150 chars
  content: string; // Full HTML/markdown content
  coverImage?: string; // URL to cover image

  // Organization
  category: BlogPostCategory;
  tags: string[];
  isFeatured: boolean;

  // Status & Visibility
  status: BlogPostStatus;
  publishedAt?: Date;

  // Author
  authorId: string;
  authorName: string;
  authorAvatar?: string;

  // Metrics
  readTimeMinutes: number;
  views: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export const BLOG_POSTS_COLLECTION = "blogPosts" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * - status + publishedAt DESC: Published posts newest-first
 * - status + isFeatured + publishedAt DESC: Featured published posts
 * - status + category + publishedAt DESC: Posts by category
 * - slug: Unique slug lookup
 */
export const BLOG_POSTS_INDEXED_FIELDS = [
  "status",
  "publishedAt",
  "isFeatured",
  "category",
  "slug",
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * blogPosts.authorId → users.id (FK reference)
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================

export const BLOG_POST_FIELDS = {
  ID: "id",
  TITLE: "title",
  SLUG: "slug",
  EXCERPT: "excerpt",
  CONTENT: "content",
  COVER_IMAGE: "coverImage",
  CATEGORY: "category",
  TAGS: "tags",
  IS_FEATURED: "isFeatured",
  STATUS: "status",
  PUBLISHED_AT: "publishedAt",
  AUTHOR_ID: "authorId",
  AUTHOR_NAME: "authorName",
  AUTHOR_AVATAR: "authorAvatar",
  READ_TIME_MINUTES: "readTimeMinutes",
  VIEWS: "views",
  META_TITLE: "metaTitle",
  META_DESCRIPTION: "metaDescription",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  STATUS_VALUES: {
    DRAFT: "draft" as BlogPostStatus,
    PUBLISHED: "published" as BlogPostStatus,
    ARCHIVED: "archived" as BlogPostStatus,
  },

  CATEGORY_VALUES: {
    NEWS: "news" as BlogPostCategory,
    TIPS: "tips" as BlogPostCategory,
    GUIDES: "guides" as BlogPostCategory,
    UPDATES: "updates" as BlogPostCategory,
    COMMUNITY: "community" as BlogPostCategory,
  },
} as const;

export const BLOG_POST_PUBLIC_FIELDS: (keyof BlogPostDocument)[] = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "coverImage",
  "category",
  "tags",
  "isFeatured",
  "status",
  "publishedAt",
  "authorName",
  "authorAvatar",
  "readTimeMinutes",
  "views",
  "metaTitle",
  "metaDescription",
  "createdAt",
  "updatedAt",
];

export const DEFAULT_BLOG_POST_DATA: Omit<
  BlogPostDocument,
  "id" | "createdAt" | "updatedAt"
> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "news",
  tags: [],
  isFeatured: false,
  status: "draft",
  authorId: "",
  authorName: "",
  readTimeMinutes: 5,
  views: 0,
};

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type BlogPostCreateInput = Omit<
  BlogPostDocument,
  "id" | "views" | "createdAt" | "updatedAt"
> & {
  views?: number;
};

export type BlogPostUpdateInput = Partial<
  Omit<BlogPostDocument, "id" | "createdAt" | "updatedAt">
>;

// ============================================
// 6. QUERY HELPERS
// ============================================

export const blogPostQueryHelpers = {
  /** Filter for published posts */
  publishedFilter: () => ({
    field: BLOG_POST_FIELDS.STATUS,
    value: "published" as BlogPostStatus,
  }),

  /** Filter for featured posts */
  featuredFilter: () => ({ field: BLOG_POST_FIELDS.IS_FEATURED, value: true }),

  /** Filter by category */
  categoryFilter: (category: BlogPostCategory) => ({
    field: BLOG_POST_FIELDS.CATEGORY,
    value: category,
  }),
};
