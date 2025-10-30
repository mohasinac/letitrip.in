/**
 * Comprehensive Zod Validation Schemas
 * Complete validation for all forms, API requests, and data models
 */

import { z } from "zod";

// ==================== UTILITY SCHEMAS ====================

// Common field patterns
const emailSchema = z.string().email("Please enter a valid email address");
const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s\-\(\)]{10,15}$/, "Please enter a valid phone number");
const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Please enter a valid 6-digit pincode");
const urlSchema = z.string().url("Please enter a valid URL");
const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens",
  );
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  );

// Date schemas
const dateStringSchema = z.string().datetime("Please enter a valid date");
const futureDateSchema = z
  .string()
  .datetime()
  .refine((date) => new Date(date) > new Date(), "Date must be in the future");

// File upload schemas
const imageFileSchema = z.object({
  url: urlSchema,
  alt: z.string().min(1, "Alt text is required for accessibility"),
  order: z.number().int().nonnegative("Order must be a non-negative number"),
  size: z.number().positive("File size must be positive").optional(),
  type: z.string().optional(),
});

const videoFileSchema = z.object({
  url: urlSchema,
  title: z.string().min(1, "Video title is required"),
  thumbnail: urlSchema.optional(),
  duration: z.number().positive("Duration must be positive").optional(),
  order: z.number().int().nonnegative("Order must be a non-negative number"),
});

// ==================== USER & AUTH SCHEMAS ====================

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    phone: phoneSchema.optional(),
    role: z.enum(["admin", "seller", "user"]).default("user"),
    isOver18: z.boolean().refine((val) => val === true, {
      message: "You must be 18 or older to create an account",
    }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
    agreeToPrivacy: z.boolean().refine((val) => val === true, {
      message: "You must agree to the privacy policy",
    }),
    marketingConsent: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .optional(),
  phone: phoneSchema.optional(),
  avatar: urlSchema.optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  bio: z.string().max(500, "Bio is too long").optional(),
  preferences: z
    .object({
      notifications: z
        .object({
          email: z.boolean().default(true),
          sms: z.boolean().default(false),
          push: z.boolean().default(true),
          marketing: z.boolean().default(false),
          orderUpdates: z.boolean().default(true),
          priceAlerts: z.boolean().default(false),
        })
        .optional(),
      privacy: z
        .object({
          profileVisibility: z.enum(["public", "private"]).default("public"),
          showPurchaseHistory: z.boolean().default(false),
          showWishlist: z.boolean().default(true),
        })
        .optional(),
      display: z
        .object({
          language: z.enum(["en", "hi"]).default("en"),
          currency: z.enum(["INR", "USD"]).default("INR"),
          theme: z.enum(["light", "dark", "auto"]).default("auto"),
        })
        .optional(),
    })
    .optional(),
});

// ==================== ADDRESS SCHEMAS ====================

export const addressSchema = z.object({
  type: z.enum(["home", "work", "other"]).default("home"),
  name: z.string().min(1, "Full name is required").max(100, "Name is too long"),
  phone: phoneSchema,
  addressLine1: z
    .string()
    .min(5, "Street address is required")
    .max(200, "Address is too long"),
  addressLine2: z.string().max(200, "Address is too long").optional(),
  landmark: z.string().max(100, "Landmark is too long").optional(),
  area: z.string().max(100, "Area is too long").optional(),
  city: z.string().min(2, "City is required").max(100, "City name is too long"),
  state: z
    .string()
    .min(2, "State is required")
    .max(100, "State name is too long"),
  pincode: pincodeSchema,
  country: z.string().min(2, "Country is required").default("India"),
  isDefault: z.boolean().default(false),
  instructions: z
    .string()
    .max(500, "Delivery instructions are too long")
    .optional(),
});

// ==================== PRODUCT SCHEMAS ====================

export const productDimensionsSchema = z.object({
  length: z.number().positive("Length must be positive"),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  unit: z.enum(["cm", "in"]).default("cm"),
});

export const productSEOSchema = z.object({
  title: z
    .string()
    .min(10, "SEO title is too short")
    .max(60, "SEO title should be under 60 characters"),
  description: z
    .string()
    .min(50, "SEO description is too short")
    .max(160, "SEO description should be under 160 characters"),
  keywords: z.array(z.string().min(1)).max(20, "Maximum 20 keywords allowed"),
  focusKeyword: z.string().optional(),
});

export const createProductSchema = z
  .object({
    // Basic Information
    name: z
      .string()
      .min(2, "Product name is required")
      .max(200, "Product name is too long"),
    slug: slugSchema,
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description is too long"),
    shortDescription: z
      .string()
      .max(500, "Short description is too long")
      .optional(),

    // Pricing
    price: z
      .number()
      .positive("Price must be positive")
      .max(10000000, "Price is too high"),
    compareAtPrice: z
      .number()
      .positive("Compare at price must be positive")
      .optional(),
    cost: z.number().positive("Cost must be positive").optional(),

    // Inventory
    sku: z.string().min(1, "SKU is required").max(100, "SKU is too long"),
    barcode: z.string().max(50, "Barcode is too long").optional(),
    quantity: z
      .number()
      .int()
      .nonnegative("Quantity must be non-negative")
      .max(100000, "Quantity is too high"),
    lowStockThreshold: z
      .number()
      .int()
      .nonnegative("Low stock threshold must be non-negative")
      .max(1000, "Threshold is too high")
      .default(10),
    trackQuantity: z.boolean().default(true),
    allowBackorders: z.boolean().default(false),

    // Physical Properties
    weight: z
      .number()
      .positive("Weight is required for shipping calculations")
      .max(1000, "Weight is too high"),
    weightUnit: z.enum(["kg", "g", "lb", "oz"]).default("kg"),
    dimensions: productDimensionsSchema.optional(),

    // Media
    images: z
      .array(imageFileSchema)
      .min(1, "At least one image is required")
      .max(10, "Maximum 10 images allowed"),
    videos: z
      .array(videoFileSchema)
      .max(5, "Maximum 5 videos allowed")
      .optional(),

    // Categorization
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().optional(),
    tags: z
      .array(z.string().min(1))
      .max(20, "Maximum 20 tags allowed")
      .default([]),
    brand: z.string().max(100, "Brand name is too long").optional(),

    // Status
    status: z.enum(["active", "draft", "archived"]).default("draft"),
    isFeatured: z.boolean().default(false),
    isDigital: z.boolean().default(false),
    requiresShipping: z.boolean().default(true),

    // SEO
    seo: productSEOSchema.optional(),

    // Variants (for future use)
    hasVariants: z.boolean().default(false),
    variants: z
      .array(
        z.object({
          name: z.string(),
          values: z.array(z.string()),
        }),
      )
      .optional(),

    // Additional Info
    manufacturer: z
      .string()
      .max(100, "Manufacturer name is too long")
      .optional(),
    warranty: z
      .string()
      .max(200, "Warranty information is too long")
      .optional(),
    features: z
      .array(z.string())
      .max(20, "Maximum 20 features allowed")
      .optional(),
    specifications: z.record(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.compareAtPrice && data.compareAtPrice <= data.price) {
        return false;
      }
      return true;
    },
    {
      message: "Compare at price must be higher than the regular price",
      path: ["compareAtPrice"],
    },
  );

export const updateProductSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(2, "Product name is required")
    .max(200, "Product name is too long")
    .optional(),
  slug: slugSchema.optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description is too long")
    .optional(),
  shortDescription: z
    .string()
    .max(500, "Short description is too long")
    .optional(),

  // Pricing
  price: z
    .number()
    .positive("Price must be positive")
    .max(10000000, "Price is too high")
    .optional(),
  compareAtPrice: z
    .number()
    .positive("Compare at price must be positive")
    .optional(),
  cost: z.number().positive("Cost must be positive").optional(),

  // Inventory
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(100, "SKU is too long")
    .optional(),
  barcode: z.string().max(50, "Barcode is too long").optional(),
  quantity: z
    .number()
    .int()
    .nonnegative("Quantity must be non-negative")
    .max(100000, "Quantity is too high")
    .optional(),
  lowStockThreshold: z
    .number()
    .int()
    .nonnegative("Low stock threshold must be non-negative")
    .max(1000, "Threshold is too high")
    .optional(),
  trackQuantity: z.boolean().optional(),
  allowBackorders: z.boolean().optional(),

  // Physical Properties
  weight: z
    .number()
    .positive("Weight is required for shipping calculations")
    .max(1000, "Weight is too high")
    .optional(),
  weightUnit: z.enum(["kg", "g", "lb", "oz"]).optional(),
  dimensions: productDimensionsSchema.optional(),

  // Media
  images: z
    .array(imageFileSchema)
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed")
    .optional(),
  videos: z
    .array(videoFileSchema)
    .max(5, "Maximum 5 videos allowed")
    .optional(),

  // Categorization
  category: z.string().min(1, "Category is required").optional(),
  subcategory: z.string().optional(),
  tags: z
    .array(z.string().min(1))
    .max(20, "Maximum 20 tags allowed")
    .optional(),
  brand: z.string().max(100, "Brand name is too long").optional(),

  // Status
  status: z.enum(["active", "draft", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),

  // SEO
  seo: productSEOSchema.optional(),

  // Variants (for future use)
  hasVariants: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
      }),
    )
    .optional(),

  // Additional Info
  manufacturer: z.string().max(100, "Manufacturer name is too long").optional(),
  warranty: z.string().max(200, "Warranty information is too long").optional(),
  features: z
    .array(z.string())
    .max(20, "Maximum 20 features allowed")
    .optional(),
  specifications: z.record(z.string()).optional(),
});

export const bulkProductUpdateSchema = z.object({
  productIds: z
    .array(z.string().min(1))
    .min(1, "At least one product must be selected"),
  updates: z.object({
    status: z.enum(["active", "draft", "archived"]).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    price: z.number().positive().optional(),
    quantity: z.number().int().nonnegative().optional(),
  }),
});

// ==================== CATEGORY SCHEMAS ====================

export const categorySEOSchema = z.object({
  metaTitle: z
    .string()
    .max(60, "Meta title should be under 60 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description should be under 160 characters")
    .optional(),
  altText: z
    .string()
    .max(125, "Alt text should be under 125 characters")
    .optional(),
  keywords: z
    .array(z.string())
    .max(10, "Maximum 10 keywords allowed")
    .optional(),
  focusKeyword: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name is too long"),
  slug: slugSchema,
  description: z.string().max(1000, "Description is too long").optional(),
  image: urlSchema.optional(),
  icon: z.string().optional(), // Can be URL or icon class
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  sortOrder: z
    .number()
    .int()
    .nonnegative("Sort order must be non-negative")
    .default(0),
  seo: categorySEOSchema.optional(),
  commission: z
    .number()
    .min(0)
    .max(100, "Commission cannot exceed 100%")
    .optional(),
  filters: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(["select", "multiselect", "range", "boolean"]),
        values: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1, "Category ID is required"),
});

export const bulkCategoryUpdateSchema = z.object({
  categoryIds: z
    .array(z.string().min(1))
    .min(1, "At least one category must be selected"),
  updates: z.object({
    isActive: z.boolean().optional(),
    featured: z.boolean().optional(),
    parentId: z.string().optional(),
    sortOrder: z.number().int().nonnegative().optional(),
  }),
});

// ==================== ORDER SCHEMAS ====================

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().positive("Quantity must be positive"),
        price: z.number().positive("Price must be positive").optional(),
        notes: z.string().max(200, "Item notes are too long").optional(),
      }),
    )
    .min(1, "Order must have at least one item"),
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  billingAddressId: z.string().min(1, "Billing address is required"),
  paymentMethod: z.enum(["razorpay", "cod", "wallet", "bank_transfer"]),
  couponCode: z.string().optional(),
  notes: z.string().max(500, "Notes are too long").optional(),
  giftMessage: z.string().max(200, "Gift message is too long").optional(),
  isGift: z.boolean().default(false),
  expectedDeliveryDate: dateStringSchema.optional(),
  priority: z.enum(["normal", "urgent", "express"]).default("normal"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
    "returned",
  ]),
  trackingNumber: z.string().optional(),
  courierName: z.string().optional(),
  estimatedDelivery: dateStringSchema.optional(),
  notes: z.string().max(500, "Notes are too long").optional(),
  notifyCustomer: z.boolean().default(true),
});

export const orderReturnSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.enum([
    "damaged",
    "wrong_item",
    "not_as_described",
    "quality_issues",
    "size_issue",
    "color_issue",
    "changed_mind",
    "other",
  ]),
  description: z
    .string()
    .min(10, "Please provide a detailed description")
    .max(1000, "Description is too long"),
  images: z.array(urlSchema).max(5, "Maximum 5 images allowed").optional(),
  refundMethod: z
    .enum(["original_payment", "wallet", "bank_transfer"])
    .default("original_payment"),
  pickupAddress: z.string().optional(),
});

// ==================== CART SCHEMAS ====================

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .int()
    .positive("Quantity must be positive")
    .max(10, "Maximum quantity is 10"),
  variantId: z.string().optional(),
  customization: z.record(z.string()).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .nonnegative("Quantity must be non-negative")
    .max(10, "Maximum quantity is 10"),
});

export const applyCouponSchema = z.object({
  couponCode: z
    .string()
    .min(1, "Coupon code is required")
    .max(50, "Coupon code is too long"),
});

// ==================== COUPON SCHEMAS ====================

export const couponRestrictionsSchema = z
  .object({
    firstTimeOnly: z.boolean().default(false),
    newCustomersOnly: z.boolean().default(false),
    existingCustomersOnly: z.boolean().default(false),
    minQuantity: z.number().int().nonnegative().optional(),
    maxQuantity: z.number().int().positive().optional(),
    maxUsesPerDay: z.number().int().positive().optional(),
    applicablePaymentMethods: z
      .array(z.enum(["razorpay", "cod", "wallet"]))
      .optional(),
    excludeDiscountedItems: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (
        data.minQuantity &&
        data.maxQuantity &&
        data.minQuantity >= data.maxQuantity
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Minimum quantity must be less than maximum quantity",
      path: ["maxQuantity"],
    },
  );

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code is too long")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Coupon code can only contain uppercase letters, numbers, hyphens, and underscores",
      ),
    name: z
      .string()
      .min(2, "Coupon name is required")
      .max(100, "Coupon name is too long"),
    description: z.string().max(500, "Description is too long").optional(),
    type: z.enum(["percentage", "fixed", "free_shipping", "bogo", "tier"]),
    value: z.number().positive("Value must be positive"),
    minimumAmount: z
      .number()
      .nonnegative("Minimum amount must be non-negative")
      .default(0),
    maximumAmount: z
      .number()
      .positive("Maximum amount must be positive")
      .optional(),
    maxUses: z.number().int().positive("Max uses must be positive").optional(),
    maxUsesPerUser: z
      .number()
      .int()
      .positive("Max uses per user must be positive")
      .default(1),
    startDate: dateStringSchema,
    endDate: futureDateSchema,
    status: z.enum(["active", "inactive", "scheduled"]).default("active"),
    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    excludeProducts: z.array(z.string()).optional(),
    excludeCategories: z.array(z.string()).optional(),
    restrictions: couponRestrictionsSchema.optional(),
    combinable: z.boolean().default(false),
    priority: z
      .number()
      .int()
      .nonnegative("Priority must be non-negative")
      .default(0),
    autoApply: z.boolean().default(false),
    publiclyVisible: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.type === "percentage" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["value"],
    },
  )
  .refine(
    (data) => {
      if (new Date(data.startDate) >= new Date(data.endDate)) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export const updateCouponSchema = z.object({
  id: z.string().min(1, "Coupon ID is required"),
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code is too long")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Coupon code can only contain uppercase letters, numbers, hyphens, and underscores",
    )
    .optional(),
  name: z
    .string()
    .min(2, "Coupon name is required")
    .max(100, "Coupon name is too long")
    .optional(),
  description: z.string().max(500, "Description is too long").optional(),
  type: z
    .enum(["percentage", "fixed", "free_shipping", "bogo", "tier"])
    .optional(),
  value: z.number().positive("Value must be positive").optional(),
  minimumAmount: z
    .number()
    .nonnegative("Minimum amount must be non-negative")
    .optional(),
  maximumAmount: z
    .number()
    .positive("Maximum amount must be positive")
    .optional(),
  maxUses: z.number().int().positive("Max uses must be positive").optional(),
  maxUsesPerUser: z
    .number()
    .int()
    .positive("Max uses per user must be positive")
    .optional(),
  startDate: dateStringSchema.optional(),
  endDate: futureDateSchema.optional(),
  status: z.enum(["active", "inactive", "scheduled"]).optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  excludeProducts: z.array(z.string()).optional(),
  excludeCategories: z.array(z.string()).optional(),
  restrictions: couponRestrictionsSchema.optional(),
  combinable: z.boolean().optional(),
  priority: z
    .number()
    .int()
    .nonnegative("Priority must be non-negative")
    .optional(),
  autoApply: z.boolean().optional(),
  publiclyVisible: z.boolean().optional(),
});

// ==================== REVIEW SCHEMAS ====================

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .min(2, "Review title is required")
    .max(100, "Review title is too long"),
  comment: z
    .string()
    .min(10, "Review comment must be at least 10 characters")
    .max(2000, "Review comment is too long"),
  images: z.array(urlSchema).max(5, "Maximum 5 images allowed").optional(),
  pros: z.array(z.string()).max(10, "Maximum 10 pros allowed").optional(),
  cons: z.array(z.string()).max(10, "Maximum 10 cons allowed").optional(),
  wouldRecommend: z.boolean().optional(),
  verified: z.boolean().default(false),
});

export const updateReviewSchema = createReviewSchema
  .partial()
  .omit({ productId: true });

export const reviewModerationSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  moderationNote: z.string().max(500, "Moderation note is too long").optional(),
});

// ==================== AUCTION SCHEMAS ====================

export const createAuctionSchema = z
  .object({
    productId: z.string().min(1, "Product ID is required"),
    title: z
      .string()
      .min(2, "Auction title is required")
      .max(200, "Auction title is too long"),
    description: z
      .string()
      .max(1000, "Auction description is too long")
      .optional(),
    startingPrice: z.number().positive("Starting price must be positive"),
    reservePrice: z
      .number()
      .positive("Reserve price must be positive")
      .optional(),
    buyNowPrice: z
      .number()
      .positive("Buy now price must be positive")
      .optional(),
    startTime: dateStringSchema,
    endTime: futureDateSchema,
    autoExtend: z.boolean().default(false),
    extensionTime: z
      .number()
      .int()
      .positive("Extension time must be positive")
      .default(10), // minutes
    bidIncrement: z
      .number()
      .positive("Bid increment must be positive")
      .default(10),
    allowBuyNow: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    maxBids: z.number().int().positive("Max bids must be positive").optional(),
  })
  .refine(
    (data) => {
      if (data.reservePrice && data.reservePrice <= data.startingPrice) {
        return false;
      }
      return true;
    },
    {
      message: "Reserve price must be higher than starting price",
      path: ["reservePrice"],
    },
  )
  .refine(
    (data) => {
      if (data.buyNowPrice && data.buyNowPrice <= data.startingPrice) {
        return false;
      }
      return true;
    },
    {
      message: "Buy now price must be higher than starting price",
      path: ["buyNowPrice"],
    },
  );

export const placeBidSchema = z
  .object({
    amount: z.number().positive("Bid amount must be positive"),
    isAutoBid: z.boolean().default(false),
    maxAutoBid: z
      .number()
      .positive("Maximum auto bid must be positive")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.isAutoBid && !data.maxAutoBid) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum auto bid is required for auto bidding",
      path: ["maxAutoBid"],
    },
  );

// ==================== SELLER SCHEMAS ====================

export const sellerRegistrationSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name is required")
    .max(200, "Business name is too long"),
  storeName: z
    .string()
    .min(2, "Store name is required")
    .max(100, "Store name is too long"),
  storeDescription: z
    .string()
    .max(1000, "Store description is too long")
    .optional(),
  businessType: z.enum(["individual", "company", "partnership"]),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GST number",
    )
    .optional(),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),
  businessAddress: addressSchema,
  bankDetails: z.object({
    accountNumber: z
      .string()
      .min(9, "Account number must be at least 9 digits")
      .max(18, "Account number is too long"),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
    accountHolderName: z
      .string()
      .min(2, "Account holder name is required")
      .max(100, "Name is too long"),
    bankName: z
      .string()
      .min(2, "Bank name is required")
      .max(100, "Bank name is too long"),
    branchName: z.string().max(100, "Branch name is too long").optional(),
  }),
  documents: z.object({
    businessLicense: urlSchema.optional(),
    gstCertificate: urlSchema.optional(),
    panCard: urlSchema,
    addressProof: urlSchema,
    cancelledCheque: urlSchema,
  }),
  agreements: z.object({
    termsAccepted: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions",
      ),
    privacyAccepted: z
      .boolean()
      .refine((val) => val === true, "You must accept the privacy policy"),
    sellerAgreementAccepted: z
      .boolean()
      .refine((val) => val === true, "You must accept the seller agreement"),
  }),
});

export const updateSellerProfileSchema = z.object({
  storeName: z
    .string()
    .min(2, "Store name is required")
    .max(100, "Store name is too long")
    .optional(),
  storeDescription: z
    .string()
    .max(1000, "Store description is too long")
    .optional(),
  storeStatus: z.enum(["live", "maintenance", "offline"]).optional(),
  awayMode: z.boolean().optional(),
  awayMessage: z.string().max(200, "Away message is too long").optional(),
  businessHours: z
    .object({
      monday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      tuesday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      wednesday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      thursday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      friday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      saturday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      sunday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
    })
    .optional(),
  policies: z
    .object({
      returnPolicy: z
        .string()
        .max(2000, "Return policy is too long")
        .optional(),
      shippingPolicy: z
        .string()
        .max(2000, "Shipping policy is too long")
        .optional(),
      privacyPolicy: z
        .string()
        .max(2000, "Privacy policy is too long")
        .optional(),
    })
    .optional(),
});

// ==================== PAYMENT SCHEMAS ====================

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentId: z.string().min(1, "Payment ID is required"),
  signature: z.string().min(1, "Payment signature is required"),
});

export const refundRequestSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  amount: z.number().positive("Refund amount must be positive"),
  reason: z
    .string()
    .min(10, "Refund reason is required")
    .max(500, "Reason is too long"),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

// ==================== SHIPPING SCHEMAS ====================

export const getShippingRatesSchema = z.object({
  fromPincode: pincodeSchema,
  toPincode: pincodeSchema,
  weight: z.number().positive("Weight must be positive"),
  dimensions: productDimensionsSchema.optional(),
  cod: z.boolean().default(false),
  declaredValue: z.number().positive("Declared value must be positive"),
});

export const createShipmentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  courierId: z.number().int().positive("Courier ID is required"),
  pickupDate: dateStringSchema.optional(),
  specialInstructions: z
    .string()
    .max(500, "Instructions are too long")
    .optional(),
});

// ==================== ADMIN SCHEMAS ====================

export const adminUserManagementSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  action: z.enum([
    "activate",
    "deactivate",
    "verify",
    "unverify",
    "change_role",
    "delete",
  ]),
  newRole: z.enum(["admin", "seller", "user"]).optional(),
  reason: z.string().max(500, "Reason is too long").optional(),
});

export const adminSettingsSchema = z.object({
  siteName: z
    .string()
    .min(1, "Site name is required")
    .max(100, "Site name is too long")
    .optional(),
  siteDescription: z
    .string()
    .max(500, "Site description is too long")
    .optional(),
  contactEmail: emailSchema.optional(),
  supportPhone: phoneSchema.optional(),
  defaultCurrency: z.enum(["INR", "USD"]).optional(),
  defaultLanguage: z.enum(["en", "hi"]).optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z
    .string()
    .max(500, "Maintenance message is too long")
    .optional(),
  features: z
    .object({
      enableAuctions: z.boolean().optional(),
      enableReviews: z.boolean().optional(),
      enableWishlist: z.boolean().optional(),
      enableCoupons: z.boolean().optional(),
      enableChat: z.boolean().optional(),
    })
    .optional(),
  limits: z
    .object({
      maxProductsPerSeller: z.number().int().positive().optional(),
      maxImagesPerProduct: z.number().int().positive().max(20).optional(),
      maxFileSize: z.number().positive().optional(),
      rateLimit: z.number().int().positive().optional(),
    })
    .optional(),
});

// ==================== FILTER & SEARCH SCHEMAS ====================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().optional(),
});

export const sortSchema = z.object({
  sortBy: z.string().min(1, "Sort field is required"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const productFilterSchema = paginationSchema.extend({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().min(1).optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
  inStock: z.boolean().optional(),
  sellerId: z.string().optional(),
  sort: z
    .enum([
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
      "newest",
      "oldest",
      "popular",
      "rating",
      "reviews",
    ])
    .optional(),
});

export const orderFilterSchema = paginationSchema.extend({
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
      "returned",
    ])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  paymentMethod: z
    .enum(["razorpay", "cod", "wallet", "bank_transfer"])
    .optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  search: z.string().min(1).optional(),
  sellerId: z.string().optional(),
  customerId: z.string().optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().positive().optional(),
});

export const analyticsFilterSchema = z.object({
  period: z
    .enum(["today", "week", "month", "quarter", "year", "custom"])
    .default("month"),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  sellerId: z.string().optional(),
  categoryId: z.string().optional(),
  productId: z.string().optional(),
  metrics: z
    .array(
      z.enum([
        "revenue",
        "orders",
        "customers",
        "products",
        "conversion_rate",
        "average_order_value",
        "customer_lifetime_value",
        "retention_rate",
      ]),
    )
    .optional(),
});

// ==================== NOTIFICATION SCHEMAS ====================

export const createNotificationSchema = z.object({
  type: z.enum([
    "order",
    "product",
    "review",
    "payment",
    "system",
    "promotion",
  ]),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message is too long"),
  recipients: z.object({
    userIds: z.array(z.string()).optional(),
    roles: z.array(z.enum(["admin", "seller", "user"])).optional(),
    segments: z.array(z.string()).optional(),
    all: z.boolean().default(false),
  }),
  channels: z.array(z.enum(["email", "sms", "push", "in_app"])),
  priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
  scheduledAt: dateStringSchema.optional(),
  data: z.record(z.any()).optional(),
});

// ==================== SUPPORT SCHEMAS ====================

export const createSupportTicketSchema = z.object({
  subject: z
    .string()
    .min(2, "Subject is required")
    .max(200, "Subject is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  category: z.enum([
    "order_issue",
    "payment_issue",
    "product_inquiry",
    "technical_support",
    "account_issue",
    "shipping_issue",
    "return_refund",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  orderId: z.string().optional(),
  productId: z.string().optional(),
  attachments: z
    .array(urlSchema)
    .max(5, "Maximum 5 attachments allowed")
    .optional(),
});

export const updateSupportTicketSchema = z.object({
  status: z
    .enum(["open", "in_progress", "waiting_customer", "resolved", "closed"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().optional(),
  resolution: z.string().max(2000, "Resolution is too long").optional(),
  internalNotes: z.string().max(1000, "Internal notes are too long").optional(),
});

// ==================== CONTACT FORM SCHEMAS ====================

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(100, "Name is too long"),
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z
    .string()
    .min(2, "Subject is required")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
  category: z
    .enum([
      "general_inquiry",
      "business_inquiry",
      "partnership",
      "media_inquiry",
      "technical_support",
      "feedback",
      "complaint",
      "other",
    ])
    .default("general_inquiry"),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  consentToContact: z
    .boolean()
    .refine((val) => val === true, "You must consent to being contacted"),
});

// ==================== NEWSLETTER SCHEMAS ====================

export const newsletterSubscriptionSchema = z.object({
  email: emailSchema,
  preferences: z
    .object({
      promotions: z.boolean().default(true),
      newProducts: z.boolean().default(true),
      salesAlerts: z.boolean().default(false),
      newsletters: z.boolean().default(true),
    })
    .optional(),
  source: z.string().optional(),
});

// ==================== TYPE EXPORTS ====================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
export type SellerRegistrationInput = z.infer<typeof sellerRegistrationSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type CreateSupportTicketInput = z.infer<
  typeof createSupportTicketSchema
>;
