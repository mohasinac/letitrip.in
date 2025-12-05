/**
 * @fileoverview TypeScript Module
 * @module src/constants/filters
 * @description This file contains functionality related to filters
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Filter Configurations
 * Predefined filter configurations for each resource type
 */

import { FilterSection } from "@/components/common/FilterSidebar";

/**
 * Product Filters Configuration
 */
export const PRODUCT_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Price Range",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "price",
        /** Label */
        label: "Price",
        /** Type */
        type: "range",
        /** Placeholder */
        placeholder: "Min - Max",
        /** Min */
        min: 0,
        /** Max */
        max: 1000000,
        /** Step */
        step: 100,
      },
    ],
  },
  {
    /** Title */
    title: "Categories",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "category_id",
        /** Label */
        label: "Category",
        /** Type */
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
  {
    /** Title */
    title: "Shops",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "shop_id",
        /** Label */
        label: "Shop",
        /** Type */
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
  {
    /** Title */
    title: "Availability",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "in_stock",
        /** Label */
        label: "In Stock Only",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Show only in-stock products", value: "true" }],
      },
      {
        /** Key */
        key: "condition",
        /** Label */
        label: "Condition",
        /** Type */
        type: "radio",
        /** Options */
        options: [
          { label: "New", value: "new" },
          { label: "Used - Like New", value: "like_new" },
          { label: "Used - Good", value: "good" },
          { label: "Used - Fair", value: "fair" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Product Features",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "is_returnable",
        /** Label */
        label: "Returnable",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Returnable products only", value: "true" }],
      },
      {
        /** Key */
        key: "is_featured",
        /** Label */
        label: "Featured",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Featured products only", value: "true" }],
      },
    ],
    /** Collapsible */
    collapsible: true,
    /** Default Collapsed */
    defaultCollapsed: true,
  },
];

/**
 * Shop Filters Configuration
 */
export const SHOP_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Verification Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "is_verified",
        /** Label */
        label: "Verified Shops Only",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Show only verified shops", value: "true" }],
      },
    ],
  },
  {
    /** Title */
    title: "Rating",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "min_rating",
        /** Label */
        label: "Minimum Rating",
        /** Type */
        type: "select",
        /** Options */
        options: [
          { label: "4 stars & up", value: "4" },
          { label: "3 stars & up", value: "3" },
          { label: "2 stars & up", value: "2" },
          { label: "Any rating", value: "0" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Shop Features",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "is_featured",
        /** Label */
        label: "Featured",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Featured shops only", value: "true" }],
      },
      {
        /** Key */
        key: "is_homepage",
        /** Label */
        label: "Homepage",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Homepage shops only", value: "true" }],
      },
    ],
    /** Collapsible */
    collapsible: true,
    /** Default Collapsed */
    defaultCollapsed: true,
  },
];

/**
 * Order Filters Configuration
 */
export const ORDER_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Order Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Pending", value: "pending" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Processing", value: "processing" },
          { label: "Shipped", value: "shipped" },
          { label: "Delivered", value: "delivered" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Date Range",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "date_range",
        /** Label */
        label: "Order Date",
        /** Type */
        type: "daterange",
      },
    ],
  },
  {
    /** Title */
    title: "Order Amount",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "amount",
        /** Label */
        label: "Total Amount",
        /** Type */
        type: "range",
        /** Min */
        min: 0,
        /** Max */
        max: 100000,
        /** Step */
        step: 500,
      },
    ],
    /** Collapsible */
    collapsible: true,
    /** Default Collapsed */
    defaultCollapsed: true,
  },
];

/**
 * Return Filters Configuration
 */
export const RETURN_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Return Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Pending Review", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Item Received", value: "received" },
          { label: "Refunded", value: "refunded" },
          { label: "Closed", value: "closed" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Return Reason",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "reason",
        /** Label */
        label: "Reason",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Defective/Damaged", value: "defective" },
          { label: "Wrong Item", value: "wrong_item" },
          { label: "Not as Described", value: "not_as_described" },
          { label: "Changed Mind", value: "changed_mind" },
          { label: "Other", value: "other" },
        ],
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
  {
    /** Title */
    title: "Admin Intervention",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "requires_admin",
        /** Label */
        label: "Requires Admin",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Requires admin intervention", value: "true" }],
      },
    ],
  },
];

/**
 * Coupon Filters Configuration
 */
export const COUPON_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Coupon Type",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "discount_type",
        /** Label */
        label: "Type",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Percentage", value: "percentage" },
          { label: "Fixed Amount", value: "fixed" },
          { label: "BOGO", value: "bogo" },
          { label: "Tiered", value: "tiered" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "radio",
        /** Options */
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Expired", value: "expired" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Expiry Date",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "expiry_date",
        /** Label */
        label: "Expires",
        /** Type */
        type: "daterange",
      },
    ],
    /** Collapsible */
    collapsible: true,
    /** Default Collapsed */
    defaultCollapsed: true,
  },
];

/**
 * User Filters Configuration
 */
export const USER_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "User Role",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "role",
        /** Label */
        label: "Role",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Admin", value: "admin" },
          { label: "Seller", value: "seller" },
          { label: "User", value: "user" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Account Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Active", value: "active" },
          { label: "Banned", value: "banned" },
          { label: "Suspended", value: "suspended" },
        ],
      },
      {
        /** Key */
        key: "is_verified",
        /** Label */
        label: "Verified",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Email verified only", value: "true" }],
      },
    ],
  },
  {
    /** Title */
    title: "Registration Date",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "registered_date",
        /** Label */
        label: "Registered",
        /** Type */
        type: "daterange",
      },
    ],
    /** Collapsible */
    collapsible: true,
    /** Default Collapsed */
    defaultCollapsed: true,
  },
];

/**
 * Category Filters Configuration
 */
export const CATEGORY_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Product Count",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "product_count",
        /** Label */
        label: "Product Count",
        /** Type */
        type: "range",
        /** Min */
        min: 0,
        /** Max */
        max: 1000,
        /** Step */
        step: 10,
      },
    ],
  },
  {
    /** Title */
    title: "Category Features",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "is_featured",
        /** Label */
        label: "Featured",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Featured categories only", value: "true" }],
      },
      {
        /** Key */
        key: "is_homepage",
        /** Label */
        label: "Homepage",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Homepage categories only", value: "true" }],
      },
    ],
  },
  {
    /** Title */
    title: "Category Level",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "parent_id",
        /** Label */
        label: "Parent Category",
        /** Type */
        type: "select",
        options: [], // Will be populated dynamically
      },
      {
        /** Key */
        key: "is_leaf",
        /** Label */
        label: "Leaf Categories",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Leaf categories only", value: "true" }],
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
];

/**
 * Review Filters Configuration
 */
export const REVIEW_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Rating",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "rating",
        /** Label */
        label: "Rating",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "5 Stars", value: "5" },
          { label: "4 Stars", value: "4" },
          { label: "3 Stars", value: "3" },
          { label: "2 Stars", value: "2" },
          { label: "1 Star", value: "1" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Categories",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "category_id",
        /** Label */
        label: "Category",
        /** Type */
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
  {
    /** Title */
    title: "Shops",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "shop_id",
        /** Label */
        label: "Shop",
        /** Type */
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
  {
    /** Title */
    title: "Review Type",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "verified_purchase",
        /** Label */
        label: "Verified Purchase",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Verified purchases only", value: "true" }],
      },
      {
        /** Key */
        key: "has_media",
        /** Label */
        label: "With Media",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Reviews with images/videos", value: "true" }],
      },
    ],
  },
  {
    /** Title */
    title: "Review Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "radio",
        /** Options */
        options: [
          { label: "Approved", value: "approved" },
          { label: "Pending", value: "pending" },
          { label: "Rejected", value: "rejected" },
        ],
      },
    ],
    /** Collapsible */
    collapsible: true,
    /** Default Collapsed */
    defaultCollapsed: true,
  },
];

/**
 * Auction Filters Configuration
 */
export const AUCTION_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Auction Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "select",
        /** Options */
        options: [
          { label: "Live Auctions", value: "active" },
          { label: "Upcoming", value: "scheduled" },
          { label: "Ended", value: "ended" },
          { label: "All", value: "" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Categories",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "category_id",
        /** Label */
        label: "Category",
        /** Type */
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
  {
    /** Title */
    title: "Shops",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "shop_id",
        /** Label */
        label: "Shop",
        /** Type */
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
  {
    /** Title */
    title: "Time Left",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "time_left",
        /** Label */
        label: "Ending Soon",
        /** Type */
        type: "select",
        /** Options */
        options: [
          { label: "Ending in 1 hour", value: "1h" },
          { label: "Ending in 6 hours", value: "6h" },
          { label: "Ending in 24 hours", value: "24h" },
          { label: "Ending in 7 days", value: "7d" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Bid Range",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "current_bid",
        /** Label */
        label: "Current Bid",
        /** Type */
        type: "range",
        /** Min */
        min: 0,
        /** Max */
        max: 1000000,
        /** Step */
        step: 1000,
      },
    ],
    /** Collapsible */
    collapsible: true,
    /** Default Collapsed */
    defaultCollapsed: true,
  },
];

/**
 * Support Ticket Filters Configuration
 */
export const TICKET_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Ticket Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Open", value: "open" },
          { label: "In Progress", value: "in_progress" },
          { label: "Resolved", value: "resolved" },
          { label: "Closed", value: "closed" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Priority",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "priority",
        /** Label */
        label: "Priority",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Urgent", value: "urgent" },
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Category",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "category",
        /** Label */
        label: "Category",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "Order Issue", value: "order_issue" },
          { label: "Return/Refund", value: "return_refund" },
          { label: "Product Question", value: "product_question" },
          { label: "Account", value: "account" },
          { label: "Payment", value: "payment" },
          { label: "Other", value: "other" },
        ],
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
];

/**
 * Payment Filters Configuration
 */
export const PAYMENT_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Payment Filters",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [
          { label: "Pending", value: "pending" },
          { label: "Processing", value: "processing" },
          { label: "Success", value: "success" },
          { label: "Failed", value: "failed" },
          { label: "Refunded", value: "refunded" },
        ],
      },
      {
        /** Key */
        key: "gateway",
        /** Label */
        label: "Payment Gateway",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [
          { label: "Razorpay", value: "razorpay" },
          { label: "PayPal", value: "paypal" },
          { label: "Cash on Delivery", value: "cod" },
        ],
      },
      {
        /** Key */
        key: "dateRange",
        /** Label */
        label: "Date Range",
        /** Type */
        type: "daterange",
      },
    ],
  },
];

/**
 * Payout Filters Configuration
 */
export const PAYOUT_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Payout Filters",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [
          { label: "Pending", value: "pending" },
          { label: "Processing", value: "processing" },
          { label: "Processed", value: "processed" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      {
        /** Key */
        key: "dateRange",
        /** Label */
        label: "Date Range",
        /** Type */
        type: "daterange",
      },
    ],
  },
];

/**
 * Blog Post Filters Configuration
 */
export const BLOG_FILTERS: FilterSection[] = [
  {
    /** Title */
    title: "Status",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "status",
        /** Label */
        label: "Status",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [
          { label: "Published", value: "published" },
          { label: "Draft", value: "draft" },
          { label: "Archived", value: "archived" },
        ],
      },
    ],
  },
  {
    /** Title */
    title: "Visibility",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "featured",
        /** Label */
        label: "Featured Posts",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Featured only", value: "true" }],
      },
      {
        /** Key */
        key: "showOnHomepage",
        /** Label */
        label: "Homepage Posts",
        /** Type */
        type: "checkbox",
        /** Options */
        options: [{ label: "Show on homepage", value: "true" }],
      },
    ],
  },
  {
    /** Title */
    title: "Category",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "category",
        /** Label */
        label: "Category",
        /** Type */
        type: "multiselect",
        /** Options */
        options: [
          { label: "News", value: "news" },
          { label: "Guides", value: "guides" },
          { label: "Updates", value: "updates" },
          { label: "Tips", value: "tips" },
          { label: "Events", value: "events" },
        ],
      },
    ],
    /** Collapsible */
    collapsible: true,
  },
  {
    /** Title */
    title: "Sort By",
    /** Fields */
    fields: [
      {
        /** Key */
        key: "sortBy",
        /** Label */
        label: "Sort By",
        /** Type */
        type: "radio",
        /** Options */
        options: [
          { label: "Publish Date", value: "publishedAt" },
          { label: "Views", value: "views" },
          { label: "Likes", value: "likes" },
          { label: "Created Date", value: "createdAt" },
        ],
      },
      {
        /** Key */
        key: "sortOrder",
        /** Label */
        label: "Order",
        /** Type */
        type: "radio",
        /** Options */
        options: [
          { label: "Descending", value: "desc" },
          { label: "Ascending", value: "asc" },
        ],
      },
    ],
  },
];

/**
 * Filters
 * @constant
 */
export const FILTERS = {
  /** P R O D U C T */
  PRODUCT: PRODUCT_FILTERS,
  /** S H O P */
  SHOP: SHOP_FILTERS,
  /** O R D E R */
  ORDER: ORDER_FILTERS,
  /** R E T U R N */
  RETURN: RETURN_FILTERS,
  /** C O U P O N */
  COUPON: COUPON_FILTERS,
  /** U S E R */
  USER: USER_FILTERS,
  /** C A T E G O R Y */
  CATEGORY: CATEGORY_FILTERS,
  /** R E V I E W */
  REVIEW: REVIEW_FILTERS,
  /** A U C T I O N */
  AUCTION: AUCTION_FILTERS,
  /** T I C K E T */
  TICKET: TICKET_FILTERS,
  /** P A Y M E N T */
  PAYMENT: PAYMENT_FILTERS,
  /** P A Y O U T */
  PAYOUT: PAYOUT_FILTERS,
  /** B L O G */
  BLOG: BLOG_FILTERS,
} as const;

/**
 * FilterType type
 * 
 * @typedef {Object} FilterType
 * @description Type definition for FilterType
 */
/**
 * FilterType type definition
 *
 * @typedef {keyof typeof FILTERS} FilterType
 * @description Type definition for FilterType
 */
export type FilterType = keyof typeof FILTERS;
