/**
 * Filter Configurations
 * Predefined filter configurations for each resource type
 */

import { FilterSection } from "@letitrip/react-library";

/**
 * Product Filters Configuration
 */
export const PRODUCT_FILTERS: FilterSection[] = [
  {
    title: "Price Range",
    fields: [
      {
        key: "price",
        label: "Price",
        type: "range",
        placeholder: "Min - Max",
        min: 0,
        max: 1000000,
        step: 100,
      },
    ],
  },
  {
    title: "Categories",
    fields: [
      {
        key: "category_id",
        label: "Category",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    collapsible: true,
  },
  {
    title: "Shops",
    fields: [
      {
        key: "shop_id",
        label: "Shop",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    collapsible: true,
  },
  {
    title: "Availability",
    fields: [
      {
        key: "in_stock",
        label: "In Stock Only",
        type: "checkbox",
        options: [{ label: "Show only in-stock products", value: "true" }],
      },
      {
        key: "condition",
        label: "Condition",
        type: "radio",
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
    title: "Product Features",
    fields: [
      {
        key: "is_returnable",
        label: "Returnable",
        type: "checkbox",
        options: [{ label: "Returnable products only", value: "true" }],
      },
      {
        key: "is_featured",
        label: "Featured",
        type: "checkbox",
        options: [{ label: "Featured products only", value: "true" }],
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
];

/**
 * Shop Filters Configuration
 */
export const SHOP_FILTERS: FilterSection[] = [
  {
    title: "Verification Status",
    fields: [
      {
        key: "is_verified",
        label: "Verified Shops Only",
        type: "checkbox",
        options: [{ label: "Show only verified shops", value: "true" }],
      },
    ],
  },
  {
    title: "Rating",
    fields: [
      {
        key: "min_rating",
        label: "Minimum Rating",
        type: "select",
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
    title: "Shop Features",
    fields: [
      {
        key: "is_featured",
        label: "Featured",
        type: "checkbox",
        options: [{ label: "Featured shops only", value: "true" }],
      },
      {
        key: "is_homepage",
        label: "Homepage",
        type: "checkbox",
        options: [{ label: "Homepage shops only", value: "true" }],
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
];

/**
 * Order Filters Configuration
 */
export const ORDER_FILTERS: FilterSection[] = [
  {
    title: "Order Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "multiselect",
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
    title: "Date Range",
    fields: [
      {
        key: "date_range",
        label: "Order Date",
        type: "daterange",
      },
    ],
  },
  {
    title: "Order Amount",
    fields: [
      {
        key: "amount",
        label: "Total Amount",
        type: "range",
        min: 0,
        max: 100000,
        step: 500,
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
];

/**
 * Return Filters Configuration
 */
export const RETURN_FILTERS: FilterSection[] = [
  {
    title: "Return Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "multiselect",
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
    title: "Return Reason",
    fields: [
      {
        key: "reason",
        label: "Reason",
        type: "multiselect",
        options: [
          { label: "Defective/Damaged", value: "defective" },
          { label: "Wrong Item", value: "wrong_item" },
          { label: "Not as Described", value: "not_as_described" },
          { label: "Changed Mind", value: "changed_mind" },
          { label: "Other", value: "other" },
        ],
      },
    ],
    collapsible: true,
  },
  {
    title: "Admin Intervention",
    fields: [
      {
        key: "requires_admin",
        label: "Requires Admin",
        type: "checkbox",
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
    title: "Coupon Type",
    fields: [
      {
        key: "discount_type",
        label: "Type",
        type: "multiselect",
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
    title: "Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "radio",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Expired", value: "expired" },
        ],
      },
    ],
  },
  {
    title: "Expiry Date",
    fields: [
      {
        key: "expiry_date",
        label: "Expires",
        type: "daterange",
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
];

/**
 * User Filters Configuration
 */
export const USER_FILTERS: FilterSection[] = [
  {
    title: "User Role",
    fields: [
      {
        key: "role",
        label: "Role",
        type: "multiselect",
        options: [
          { label: "Admin", value: "admin" },
          { label: "Seller", value: "seller" },
          { label: "User", value: "user" },
        ],
      },
    ],
  },
  {
    title: "Account Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "multiselect",
        options: [
          { label: "Active", value: "active" },
          { label: "Banned", value: "banned" },
          { label: "Suspended", value: "suspended" },
        ],
      },
      {
        key: "is_verified",
        label: "Verified",
        type: "checkbox",
        options: [{ label: "Email verified only", value: "true" }],
      },
    ],
  },
  {
    title: "Registration Date",
    fields: [
      {
        key: "registered_date",
        label: "Registered",
        type: "daterange",
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
];

/**
 * Category Filters Configuration
 */
export const CATEGORY_FILTERS: FilterSection[] = [
  {
    title: "Product Count",
    fields: [
      {
        key: "product_count",
        label: "Product Count",
        type: "range",
        min: 0,
        max: 1000,
        step: 10,
      },
    ],
  },
  {
    title: "Category Features",
    fields: [
      {
        key: "is_featured",
        label: "Featured",
        type: "checkbox",
        options: [{ label: "Featured categories only", value: "true" }],
      },
      {
        key: "is_homepage",
        label: "Homepage",
        type: "checkbox",
        options: [{ label: "Homepage categories only", value: "true" }],
      },
    ],
  },
  {
    title: "Category Level",
    fields: [
      {
        key: "parent_id",
        label: "Parent Category",
        type: "select",
        options: [], // Will be populated dynamically
      },
      {
        key: "is_leaf",
        label: "Leaf Categories",
        type: "checkbox",
        options: [{ label: "Leaf categories only", value: "true" }],
      },
    ],
    collapsible: true,
  },
];

/**
 * Review Filters Configuration
 */
export const REVIEW_FILTERS: FilterSection[] = [
  {
    title: "Rating",
    fields: [
      {
        key: "rating",
        label: "Rating",
        type: "multiselect",
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
    title: "Categories",
    fields: [
      {
        key: "category_id",
        label: "Category",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    collapsible: true,
  },
  {
    title: "Shops",
    fields: [
      {
        key: "shop_id",
        label: "Shop",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    collapsible: true,
  },
  {
    title: "Review Type",
    fields: [
      {
        key: "verified_purchase",
        label: "Verified Purchase",
        type: "checkbox",
        options: [{ label: "Verified purchases only", value: "true" }],
      },
      {
        key: "has_media",
        label: "With Media",
        type: "checkbox",
        options: [{ label: "Reviews with images/videos", value: "true" }],
      },
    ],
  },
  {
    title: "Review Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "radio",
        options: [
          { label: "Approved", value: "approved" },
          { label: "Pending", value: "pending" },
          { label: "Rejected", value: "rejected" },
        ],
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
];

/**
 * Auction Filters Configuration
 */
export const AUCTION_FILTERS: FilterSection[] = [
  {
    title: "Auction Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "select",
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
    title: "Categories",
    fields: [
      {
        key: "category_id",
        label: "Category",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    collapsible: true,
  },
  {
    title: "Shops",
    fields: [
      {
        key: "shop_id",
        label: "Shop",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    collapsible: true,
  },
  {
    title: "Time Left",
    fields: [
      {
        key: "time_left",
        label: "Ending Soon",
        type: "select",
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
    title: "Bid Range",
    fields: [
      {
        key: "current_bid",
        label: "Current Bid",
        type: "range",
        min: 0,
        max: 1000000,
        step: 1000,
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
];

/**
 * Support Ticket Filters Configuration
 */
export const TICKET_FILTERS: FilterSection[] = [
  {
    title: "Ticket Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "multiselect",
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
    title: "Priority",
    fields: [
      {
        key: "priority",
        label: "Priority",
        type: "multiselect",
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
    title: "Category",
    fields: [
      {
        key: "category",
        label: "Category",
        type: "multiselect",
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
    collapsible: true,
  },
];

/**
 * Payment Filters Configuration
 */
export const PAYMENT_FILTERS: FilterSection[] = [
  {
    title: "Payment Filters",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "checkbox",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Processing", value: "processing" },
          { label: "Success", value: "success" },
          { label: "Failed", value: "failed" },
          { label: "Refunded", value: "refunded" },
        ],
      },
      {
        key: "gateway",
        label: "Payment Gateway",
        type: "checkbox",
        options: [
          { label: "Razorpay", value: "razorpay" },
          { label: "PayPal", value: "paypal" },
          { label: "Cash on Delivery", value: "cod" },
        ],
      },
      {
        key: "dateRange",
        label: "Date Range",
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
    title: "Payout Filters",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "checkbox",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Processing", value: "processing" },
          { label: "Processed", value: "processed" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      {
        key: "dateRange",
        label: "Date Range",
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
    title: "Status",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "checkbox",
        options: [
          { label: "Published", value: "published" },
          { label: "Draft", value: "draft" },
          { label: "Archived", value: "archived" },
        ],
      },
    ],
  },
  {
    title: "Visibility",
    fields: [
      {
        key: "featured",
        label: "Featured Posts",
        type: "checkbox",
        options: [{ label: "Featured only", value: "true" }],
      },
      {
        key: "showOnHomepage",
        label: "Homepage Posts",
        type: "checkbox",
        options: [{ label: "Show on homepage", value: "true" }],
      },
    ],
  },
  {
    title: "Category",
    fields: [
      {
        key: "category",
        label: "Category",
        type: "multiselect",
        options: [
          { label: "News", value: "news" },
          { label: "Guides", value: "guides" },
          { label: "Updates", value: "updates" },
          { label: "Tips", value: "tips" },
          { label: "Events", value: "events" },
        ],
      },
    ],
    collapsible: true,
  },
  {
    title: "Sort By",
    fields: [
      {
        key: "sortBy",
        label: "Sort By",
        type: "radio",
        options: [
          { label: "Publish Date", value: "publishedAt" },
          { label: "Views", value: "views" },
          { label: "Likes", value: "likes" },
          { label: "Created Date", value: "createdAt" },
        ],
      },
      {
        key: "sortOrder",
        label: "Order",
        type: "radio",
        options: [
          { label: "Descending", value: "desc" },
          { label: "Ascending", value: "asc" },
        ],
      },
    ],
  },
];

export const FILTERS = {
  PRODUCT: PRODUCT_FILTERS,
  SHOP: SHOP_FILTERS,
  ORDER: ORDER_FILTERS,
  RETURN: RETURN_FILTERS,
  COUPON: COUPON_FILTERS,
  USER: USER_FILTERS,
  CATEGORY: CATEGORY_FILTERS,
  REVIEW: REVIEW_FILTERS,
  AUCTION: AUCTION_FILTERS,
  TICKET: TICKET_FILTERS,
  PAYMENT: PAYMENT_FILTERS,
  PAYOUT: PAYOUT_FILTERS,
  BLOG: BLOG_FILTERS,
} as const;

export type FilterType = keyof typeof FILTERS;
