/**
 * @fileoverview TypeScript Module
 * @module src/constants/storage
 * @description This file contains functionality related to storage
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Firebase Storage Bucket Names and Paths
 * Centralized constants for all storage locations
 */

/**
 * Storage Buckets - Top-level folders in Firebase Storage
 */
export const STORAGE_BUCKETS = {
  // Shop & Product Media
  SHOP_LOGOS: "shop-logos",
  SHOP_BANNERS: "shop-banners",
  PRODUCT_IMAGES: "product-images",
  PRODUCT_VIDEOS: "product-videos",

  // Category Media
  CATEGORY_IMAGES: "category-images",

  // Auction Media
  AUCTION_IMAGES: "auction-images",
  AUCTION_VIDEOS: "auction-videos",

  // User Media
  USER_AVATARS: "user-avatars",

  // Review Media
  REVIEW_IMAGES: "review-images",
  REVIEW_VIDEOS: "review-videos",

  // Return Media (for dispute evidence)
  RETURN_IMAGES: "return-images",
  RETURN_VIDEOS: "return-videos",

  // Support Ticket Attachments
  TICKET_ATTACHMENTS: "ticket-attachments",

  // Documents
  /** I N V O I C E S */
  INVOICES: "invoices",
  SHIPPING_LABELS: "shipping-labels",

  // Temporary uploads (for processing)
  TEMP_UPLOADS: "temp-uploads",
} as const;

/**
 * Storage Path Patterns
 * Use these functions to generate consistent storage paths
 */
export const STORAGE_PATHS = {
  // Shop paths
  /** Shop Logo */
  shopLogo: (shopId: string, filename: string) =>
    `${STORAGE_BUCKETS.SHOP_LOGOS}/${shopId}/${filename}`,

  /** Shop Banner */
  shopBanner: (shopId: string, filename: string) =>
    `${STORAGE_BUCKETS.SHOP_BANNERS}/${shopId}/${filename}`,

  // Product paths
  /** Product Image */
  productImage: (shopId: string, productId: string, filename: string) =>
    `${STORAGE_BUCKETS.PRODUCT_IMAGES}/${shopId}/${productId}/${filename}`,

  /** Product Video */
  productVideo: (shopId: string, productId: string, filename: string) =>
    `${STORAGE_BUCKETS.PRODUCT_VIDEOS}/${shopId}/${productId}/${filename}`,

  // Category paths
  /** Category Image */
  categoryImage: (categoryId: string, filename: string) =>
    `${STORAGE_BUCKETS.CATEGORY_IMAGES}/${categoryId}/${filename}`,

  // Auction paths
  /** Auction Image */
  auctionImage: (shopId: string, auctionId: string, filename: string) =>
    `${STORAGE_BUCKETS.AUCTION_IMAGES}/${shopId}/${auctionId}/${filename}`,

  /** Auction Video */
  auctionVideo: (shopId: string, auctionId: string, filename: string) =>
    `${STORAGE_BUCKETS.AUCTION_VIDEOS}/${shopId}/${auctionId}/${filename}`,

  // User paths
  /** User Avatar */
  userAvatar: (userId: string, filename: string) =>
    `${STORAGE_BUCKETS.USER_AVATARS}/${userId}/${filename}`,

  // Review paths
  /** Review Image */
  reviewImage: (userId: string, reviewId: string, filename: string) =>
    `${STORAGE_BUCKETS.REVIEW_IMAGES}/${userId}/${reviewId}/${filename}`,

  /** Review Video */
  reviewVideo: (userId: string, reviewId: string, filename: string) =>
    `${STORAGE_BUCKETS.REVIEW_VIDEOS}/${userId}/${reviewId}/${filename}`,

  // Return paths
  /** Return Image */
  returnImage: (userId: string, returnId: string, filename: string) =>
    `${STORAGE_BUCKETS.RETURN_IMAGES}/${userId}/${returnId}/${filename}`,

  /** Return Video */
  returnVideo: (userId: string, returnId: string, filename: string) =>
    `${STORAGE_BUCKETS.RETURN_VIDEOS}/${userId}/${returnId}/${filename}`,

  // Support ticket paths
  /** Ticket Attachment */
  ticketAttachment: (userId: string, ticketId: string, filename: string) =>
    `${STORAGE_BUCKETS.TICKET_ATTACHMENTS}/${userId}/${ticketId}/${filename}`,

  // Document paths
  /** Invoice */
  invoice: (orderId: string, filename: string) =>
    `${STORAGE_BUCKETS.INVOICES}/${orderId}/${filename}`,

  /** Shipping Label */
  shippingLabel: (orderId: string, filename: string) =>
    `${STORAGE_BUCKETS.SHIPPING_LABELS}/${orderId}/${filename}`,

  // Temporary upload path
  /** Temp Upload */
  tempUpload: (userId: string, filename: string) =>
    `${STORAGE_BUCKETS.TEMP_UPLOADS}/${userId}/${Date.now()}-${filename}`,
} as const;

/**
 * Storage Configuration
 */
export const STORAGE_CONFIG = {
  // Maximum file sizes (in bytes)
  MAX_FILE_SIZE: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    DOCUMENT: 5 * 1024 * 1024, // 5MB
    AVATAR: 2 * 1024 * 1024, // 2MB
  },

  // Allowed MIME types
  ALLOWED_MIME_TYPES: {
    /** I M A G E S */
    IMAGES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    /** V I D E O S */
    VIDEOS: [
      "video/mp4",
      "video/webm",
      "video/quicktime", // .mov
    ],
    /** D O C U M E N T S */
    DOCUMENTS: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },

  // File extensions
  ALLOWED_EXTENSIONS: {
    /** I M A G E S */
    IMAGES: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    /** V I D E O S */
    VIDEOS: [".mp4", ".webm", ".mov"],
    /** D O C U M E N T S */
    DOCUMENTS: [".pdf", ".doc", ".docx"],
  },

  // Image optimization settings
  IMAGE_OPTIMIZATION: {
    /** T H U M B N A I L */
    THUMBNAIL: {
      /** Width */
      width: 200,
      /** Height */
      height: 200,
      /** Quality */
      quality: 80,
    },
    /** S M A L L */
    SMALL: {
      /** Width */
      width: 400,
      /** Height */
      height: 400,
      /** Quality */
      quality: 85,
    },
    /** M E D I U M */
    MEDIUM: {
      /** Width */
      width: 800,
      /** Height */
      height: 800,
      /** Quality */
      quality: 85,
    },
    /** L A R G E */
    LARGE: {
      /** Width */
      width: 1200,
      /** Height */
      height: 1200,
      /** Quality */
      quality: 90,
    },
  },

  // Video optimization settings
  VIDEO_OPTIMIZATION: {
    /** T H U M B N A I L */
    THUMBNAIL: {
      timestamp: 1, // Extract thumbnail at 1 second
      /** Width */
      width: 400,
      /** Height */
      height: 300,
    },
    MAX_DURATION: 300, // 5 minutes in seconds
  },

  // Cleanup settings
  /** C L E A N U P */
  CLEANUP: {
    TEMP_FILES_TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    FAILED_UPLOAD_RETRY_COUNT: 3,
  },
} as const;

/**
 * Media URL Configuration
 */
export const MEDIA_URL_CONFIG = {
  // Placeholder images
  /** P L A C E H O L D E R S */
  PLACEHOLDERS: {
    /** P R O D U C T */
    PRODUCT: "/images/placeholder-product.png",
    SHOP_LOGO: "/images/placeholder-shop-logo.png",
    SHOP_BANNER: "/images/placeholder-shop-banner.png",
    /** C A T E G O R Y */
    CATEGORY: "/images/placeholder-category.png",
    /** A V A T A R */
    AVATAR: "/images/placeholder-avatar.png",
    /** A U C T I O N */
    AUCTION: "/images/placeholder-auction.png",
  },

  // CDN settings (if using a CDN)
  CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_URL || "",
  USE_CDN: process.env.NEXT_PUBLIC_USE_CDN === "true",

  // Cache control
  CACHE_CONTROL: {
    /** I M M U T A B L E */
    IMMUTABLE: "public, max-age=31536000, immutable",
    LONG: "public, max-age=86400", // 1 day
    SHORT: "public, max-age=3600", // 1 hour
    NO_CACHE: "no-cache, no-store, must-revalidate",
  },
} as const;

/**
 * StorageBucket type
 * 
 * @typedef {Object} StorageBucket
 * @description Type definition for StorageBucket
 */
/**
 * StorageBucket type definition
 *
 * @typedef {(typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]} StorageBucket
 * @description Type definition for StorageBucket
 */
export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
