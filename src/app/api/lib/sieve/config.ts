/**
 * Sieve Resource Configurations
 * Epic: E026 - Sieve-style Pagination
 *
 * Defines which fields can be sorted and filtered for each resource.
 */

import { SieveConfig } from "./types";

// ==================== RESOURCE CONFIGS ====================

/**
 * Products sieve configuration
 */
export const productsSieveConfig: SieveConfig = {
  resource: "products",
  sortableFields: [
    "createdAt",
    "updatedAt",
    "price",
    "name",
    "stock",
    "rating",
    "reviewCount",
  ],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "price",
      operators: ["==", "!=", ">", "<", ">=", "<="],
      type: "number",
    },
    {
      field: "categoryId",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "shopId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "name",
      operators: ["==", "@=", "_=", "@=*"],
      type: "string",
    },
    {
      field: "condition",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "stock",
      operators: [">", "<", ">=", "<=", "=="],
      type: "number",
    },
    {
      field: "featured",
      operators: ["=="],
      type: "boolean",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 50,
  defaultPageSize: 20,
};

/**
 * Auctions sieve configuration
 */
export const auctionsSieveConfig: SieveConfig = {
  resource: "auctions",
  sortableFields: [
    "createdAt",
    "startTime",
    "endTime",
    "currentBid",
    "startingPrice",
    "name",
    "bidCount",
  ],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "currentBid",
      operators: ["==", "!=", ">", "<", ">=", "<="],
      type: "number",
    },
    {
      field: "categoryId",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "shopId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "name",
      operators: ["==", "@=", "_=", "@=*"],
      type: "string",
    },
    {
      field: "type",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "startTime",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
    {
      field: "endTime",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
    {
      field: "featured",
      operators: ["=="],
      type: "boolean",
    },
  ],
  defaultSort: { field: "endTime", direction: "asc" },
  maxPageSize: 50,
  defaultPageSize: 20,
};

/**
 * Orders sieve configuration
 */
export const ordersSieveConfig: SieveConfig = {
  resource: "orders",
  sortableFields: [
    "createdAt",
    "updatedAt",
    "total",
    "status",
    "paymentStatus",
  ],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "paymentStatus",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "total",
      operators: ["==", "!=", ">", "<", ">=", "<="],
      type: "number",
    },
    {
      field: "userId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "shopId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
    {
      field: "orderNumber",
      operators: ["==", "@="],
      type: "string",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 100,
  defaultPageSize: 20,
};

/**
 * Users sieve configuration
 */
export const usersSieveConfig: SieveConfig = {
  resource: "users",
  sortableFields: ["createdAt", "updatedAt", "displayName", "email", "role"],
  filterableFields: [
    {
      field: "role",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "email",
      operators: ["==", "@=", "_="],
      type: "string",
    },
    {
      field: "displayName",
      operators: ["==", "@=", "_=", "@=*"],
      type: "string",
    },
    {
      field: "emailVerified",
      operators: ["=="],
      type: "boolean",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 100,
  defaultPageSize: 20,
};

/**
 * Shops sieve configuration
 */
export const shopsSieveConfig: SieveConfig = {
  resource: "shops",
  sortableFields: [
    "createdAt",
    "updatedAt",
    "name",
    "rating",
    "productCount",
    "orderCount",
  ],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "verified",
      operators: ["=="],
      type: "boolean",
    },
    {
      field: "name",
      operators: ["==", "@=", "_=", "@=*"],
      type: "string",
    },
    {
      field: "ownerId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "rating",
      operators: ["==", "!=", ">", "<", ">=", "<="],
      type: "number",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 50,
  defaultPageSize: 20,
};

/**
 * Reviews sieve configuration
 */
export const reviewsSieveConfig: SieveConfig = {
  resource: "reviews",
  sortableFields: ["createdAt", "rating", "helpfulCount"],
  filterableFields: [
    {
      field: "rating",
      operators: ["==", "!=", ">", "<", ">=", "<="],
      type: "number",
    },
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "productId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "userId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "shopId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "verified",
      operators: ["=="],
      type: "boolean",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 50,
  defaultPageSize: 20,
};

/**
 * Categories sieve configuration
 */
export const categoriesSieveConfig: SieveConfig = {
  resource: "categories",
  sortableFields: ["createdAt", "name", "order", "productCount"],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "parentId",
      operators: ["==", "!=", "==null", "!=null"],
      type: "string",
    },
    {
      field: "name",
      operators: ["==", "@=", "_=", "@=*"],
      type: "string",
    },
    {
      field: "slug",
      operators: ["=="],
      type: "string",
    },
    {
      field: "featured",
      operators: ["=="],
      type: "boolean",
    },
  ],
  defaultSort: { field: "order", direction: "asc" },
  maxPageSize: 100,
  defaultPageSize: 50,
};

/**
 * Coupons sieve configuration
 */
export const couponsSieveConfig: SieveConfig = {
  resource: "coupons",
  sortableFields: ["createdAt", "discount", "expiresAt", "usageCount"],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "type",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "code",
      operators: ["==", "@=", "_="],
      type: "string",
    },
    {
      field: "shopId",
      operators: ["==", "!=null"],
      type: "string",
    },
    {
      field: "discount",
      operators: ["==", "!=", ">", "<", ">=", "<="],
      type: "number",
    },
    {
      field: "expiresAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 50,
  defaultPageSize: 20,
};

/**
 * Returns sieve configuration
 */
export const returnsSieveConfig: SieveConfig = {
  resource: "returns",
  sortableFields: ["createdAt", "updatedAt", "status"],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "orderId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "userId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "shopId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "reason",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 50,
  defaultPageSize: 20,
};

/**
 * Tickets sieve configuration
 */
export const ticketsSieveConfig: SieveConfig = {
  resource: "tickets",
  sortableFields: ["createdAt", "updatedAt", "priority", "status"],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "priority",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "category",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "userId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "assignedTo",
      operators: ["==", "==null", "!=null"],
      type: "string",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 50,
  defaultPageSize: 20,
};

/**
 * Blog posts sieve configuration
 */
export const blogSieveConfig: SieveConfig = {
  resource: "blog",
  sortableFields: ["createdAt", "publishedAt", "title", "viewCount"],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "category",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "author",
      operators: ["=="],
      type: "string",
    },
    {
      field: "title",
      operators: ["==", "@=", "_=", "@=*"],
      type: "string",
    },
    {
      field: "featured",
      operators: ["=="],
      type: "boolean",
    },
    {
      field: "publishedAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "publishedAt", direction: "desc" },
  maxPageSize: 50,
  defaultPageSize: 10,
};

/**
 * Hero slides sieve configuration
 */
export const heroSlidesSieveConfig: SieveConfig = {
  resource: "hero-slides",
  sortableFields: ["createdAt", "order"],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "position",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "order",
      operators: ["==", ">", "<", ">=", "<="],
      type: "number",
    },
  ],
  defaultSort: { field: "order", direction: "asc" },
  maxPageSize: 20,
  defaultPageSize: 10,
};

/**
 * Payouts sieve configuration
 */
export const payoutsSieveConfig: SieveConfig = {
  resource: "payouts",
  sortableFields: ["createdAt", "amount", "status"],
  filterableFields: [
    {
      field: "status",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "shopId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "method",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "amount",
      operators: ["==", "!=", ">", "<", ">=", "<="],
      type: "number",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 50,
  defaultPageSize: 20,
};

/**
 * Favorites sieve configuration
 */
export const favoritesSieveConfig: SieveConfig = {
  resource: "favorites",
  sortableFields: ["createdAt"],
  filterableFields: [
    {
      field: "type",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "userId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "itemId",
      operators: ["=="],
      type: "string",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 100,
  defaultPageSize: 20,
};

/**
 * Notifications sieve configuration
 */
export const notificationsSieveConfig: SieveConfig = {
  resource: "notifications",
  sortableFields: ["createdAt", "type"],
  filterableFields: [
    {
      field: "type",
      operators: ["==", "!="],
      type: "string",
    },
    {
      field: "read",
      operators: ["=="],
      type: "boolean",
    },
    {
      field: "userId",
      operators: ["=="],
      type: "string",
    },
    {
      field: "createdAt",
      operators: [">", "<", ">=", "<="],
      type: "date",
    },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 100,
  defaultPageSize: 20,
};

// ==================== CONFIG REGISTRY ====================

/**
 * Get sieve config for a resource
 */
export function getSieveConfig(resource: string): SieveConfig | undefined {
  const configs: Record<string, SieveConfig> = {
    products: productsSieveConfig,
    auctions: auctionsSieveConfig,
    orders: ordersSieveConfig,
    users: usersSieveConfig,
    shops: shopsSieveConfig,
    reviews: reviewsSieveConfig,
    categories: categoriesSieveConfig,
    coupons: couponsSieveConfig,
    returns: returnsSieveConfig,
    tickets: ticketsSieveConfig,
    blog: blogSieveConfig,
    "hero-slides": heroSlidesSieveConfig,
    payouts: payoutsSieveConfig,
    favorites: favoritesSieveConfig,
    notifications: notificationsSieveConfig,
  };

  return configs[resource];
}

/**
 * Get all resource configs
 */
export function getAllSieveConfigs(): SieveConfig[] {
  return [
    productsSieveConfig,
    auctionsSieveConfig,
    ordersSieveConfig,
    usersSieveConfig,
    shopsSieveConfig,
    reviewsSieveConfig,
    categoriesSieveConfig,
    couponsSieveConfig,
    returnsSieveConfig,
    ticketsSieveConfig,
    blogSieveConfig,
    heroSlidesSieveConfig,
    payoutsSieveConfig,
    favoritesSieveConfig,
    notificationsSieveConfig,
  ];
}
