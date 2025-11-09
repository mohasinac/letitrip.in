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
  shopLogo: (shopId: string, filename: string) =>
    `${STORAGE_BUCKETS.SHOP_LOGOS}/${shopId}/${filename}`,

  shopBanner: (shopId: string, filename: string) =>
    `${STORAGE_BUCKETS.SHOP_BANNERS}/${shopId}/${filename}`,

  // Product paths
  productImage: (shopId: string, productId: string, filename: string) =>
    `${STORAGE_BUCKETS.PRODUCT_IMAGES}/${shopId}/${productId}/${filename}`,

  productVideo: (shopId: string, productId: string, filename: string) =>
    `${STORAGE_BUCKETS.PRODUCT_VIDEOS}/${shopId}/${productId}/${filename}`,

  // Category paths
  categoryImage: (categoryId: string, filename: string) =>
    `${STORAGE_BUCKETS.CATEGORY_IMAGES}/${categoryId}/${filename}`,

  // Auction paths
  auctionImage: (shopId: string, auctionId: string, filename: string) =>
    `${STORAGE_BUCKETS.AUCTION_IMAGES}/${shopId}/${auctionId}/${filename}`,

  auctionVideo: (shopId: string, auctionId: string, filename: string) =>
    `${STORAGE_BUCKETS.AUCTION_VIDEOS}/${shopId}/${auctionId}/${filename}`,

  // User paths
  userAvatar: (userId: string, filename: string) =>
    `${STORAGE_BUCKETS.USER_AVATARS}/${userId}/${filename}`,

  // Review paths
  reviewImage: (userId: string, reviewId: string, filename: string) =>
    `${STORAGE_BUCKETS.REVIEW_IMAGES}/${userId}/${reviewId}/${filename}`,

  reviewVideo: (userId: string, reviewId: string, filename: string) =>
    `${STORAGE_BUCKETS.REVIEW_VIDEOS}/${userId}/${reviewId}/${filename}`,

  // Return paths
  returnImage: (userId: string, returnId: string, filename: string) =>
    `${STORAGE_BUCKETS.RETURN_IMAGES}/${userId}/${returnId}/${filename}`,

  returnVideo: (userId: string, returnId: string, filename: string) =>
    `${STORAGE_BUCKETS.RETURN_VIDEOS}/${userId}/${returnId}/${filename}`,

  // Support ticket paths
  ticketAttachment: (userId: string, ticketId: string, filename: string) =>
    `${STORAGE_BUCKETS.TICKET_ATTACHMENTS}/${userId}/${ticketId}/${filename}`,

  // Document paths
  invoice: (orderId: string, filename: string) =>
    `${STORAGE_BUCKETS.INVOICES}/${orderId}/${filename}`,

  shippingLabel: (orderId: string, filename: string) =>
    `${STORAGE_BUCKETS.SHIPPING_LABELS}/${orderId}/${filename}`,

  // Temporary upload path
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
    IMAGES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    VIDEOS: [
      "video/mp4",
      "video/webm",
      "video/quicktime", // .mov
    ],
    DOCUMENTS: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },

  // File extensions
  ALLOWED_EXTENSIONS: {
    IMAGES: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    VIDEOS: [".mp4", ".webm", ".mov"],
    DOCUMENTS: [".pdf", ".doc", ".docx"],
  },

  // Image optimization settings
  IMAGE_OPTIMIZATION: {
    THUMBNAIL: {
      width: 200,
      height: 200,
      quality: 80,
    },
    SMALL: {
      width: 400,
      height: 400,
      quality: 85,
    },
    MEDIUM: {
      width: 800,
      height: 800,
      quality: 85,
    },
    LARGE: {
      width: 1200,
      height: 1200,
      quality: 90,
    },
  },

  // Video optimization settings
  VIDEO_OPTIMIZATION: {
    THUMBNAIL: {
      timestamp: 1, // Extract thumbnail at 1 second
      width: 400,
      height: 300,
    },
    MAX_DURATION: 300, // 5 minutes in seconds
  },

  // Cleanup settings
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
  PLACEHOLDERS: {
    PRODUCT: "/images/placeholder-product.png",
    SHOP_LOGO: "/images/placeholder-shop-logo.png",
    SHOP_BANNER: "/images/placeholder-shop-banner.png",
    CATEGORY: "/images/placeholder-category.png",
    AVATAR: "/images/placeholder-avatar.png",
    AUCTION: "/images/placeholder-auction.png",
  },

  // CDN settings (if using a CDN)
  CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_URL || "",
  USE_CDN: process.env.NEXT_PUBLIC_USE_CDN === "true",

  // Cache control
  CACHE_CONTROL: {
    IMMUTABLE: "public, max-age=31536000, immutable",
    LONG: "public, max-age=86400", // 1 day
    SHORT: "public, max-age=3600", // 1 hour
    NO_CACHE: "no-cache, no-store, must-revalidate",
  },
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
