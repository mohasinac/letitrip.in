/**
 * @fileoverview Configuration
 * @module src/app/api/lib/sieve/config
 * @description This file contains functionality related to config
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  /** Resource */
  resource: "products",
  /** Sortable Fields */
  sortableFields: [
    "createdAt",
    "updatedAt",
    "price",
    "name",
    "stock",
    "rating",
    "reviewCount",
  ],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "price",
      /** Operators */
      operators: ["==", "!=", ">", "<", ">=", "<="],
      /** Type */
      type: "number",
    },
    {
      /** Field */
      field: "categoryId",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "shopId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "name",
      /** Operators */
      operators: ["==", "@=", "_=", "@=*"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "condition",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "stock",
      /** Operators */
      operators: [">", "<", ">=", "<=", "=="],
      /** Type */
      type: "number",
    },
    {
      /** Field */
      field: "featured",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "boolean",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Auctions sieve configuration
 */
export const auctionsSieveConfig: SieveConfig = {
  /** Resource */
  resource: "auctions",
  /** Sortable Fields */
  sortableFields: [
    "createdAt",
    "startTime",
    "endTime",
    "currentBid",
    "startingPrice",
    "name",
    "bidCount",
  ],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "currentBid",
      /** Operators */
      operators: ["==", "!=", ">", "<", ">=", "<="],
      /** Type */
      type: "number",
    },
    {
      /** Field */
      field: "categoryId",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "shopId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "name",
      /** Operators */
      operators: ["==", "@=", "_=", "@=*"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "type",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "startTime",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
    {
      /** Field */
      field: "endTime",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
    {
      /** Field */
      field: "featured",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "boolean",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "endTime", direction: "asc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Orders sieve configuration
 */
export const ordersSieveConfig: SieveConfig = {
  /** Resource */
  resource: "orders",
  /** Sortable Fields */
  sortableFields: [
    "createdAt",
    "updatedAt",
    "total",
    "status",
    "paymentStatus",
  ],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "paymentStatus",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "total",
      /** Operators */
      operators: ["==", "!=", ">", "<", ">=", "<="],
      /** Type */
      type: "number",
    },
    {
      /** Field */
      field: "userId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "shopId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
    {
      /** Field */
      field: "orderNumber",
      /** Operators */
      operators: ["==", "@="],
      /** Type */
      type: "string",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 100,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Users sieve configuration
 */
export const usersSieveConfig: SieveConfig = {
  /** Resource */
  resource: "users",
  /** Sortable Fields */
  sortableFields: ["createdAt", "updatedAt", "displayName", "email", "role"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "role",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "email",
      /** Operators */
      operators: ["==", "@=", "_="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "displayName",
      /** Operators */
      operators: ["==", "@=", "_=", "@=*"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "emailVerified",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "boolean",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 100,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Shops sieve configuration
 */
export const shopsSieveConfig: SieveConfig = {
  /** Resource */
  resource: "shops",
  /** Sortable Fields */
  sortableFields: [
    "createdAt",
    "updatedAt",
    "name",
    "rating",
    "productCount",
    "orderCount",
  ],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "verified",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "boolean",
    },
    {
      /** Field */
      field: "name",
      /** Operators */
      operators: ["==", "@=", "_=", "@=*"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "ownerId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "rating",
      /** Operators */
      operators: ["==", "!=", ">", "<", ">=", "<="],
      /** Type */
      type: "number",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Reviews sieve configuration
 */
export const reviewsSieveConfig: SieveConfig = {
  /** Resource */
  resource: "reviews",
  /** Sortable Fields */
  sortableFields: ["createdAt", "rating", "helpfulCount"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "rating",
      /** Operators */
      operators: ["==", "!=", ">", "<", ">=", "<="],
      /** Type */
      type: "number",
    },
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "productId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "userId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "shopId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "verified",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "boolean",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Categories sieve configuration
 */
export const categoriesSieveConfig: SieveConfig = {
  /** Resource */
  resource: "categories",
  /** Sortable Fields */
  sortableFields: ["createdAt", "name", "order", "productCount"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "parentId",
      /** Operators */
      operators: ["==", "!=", "==null", "!=null"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "name",
      /** Operators */
      operators: ["==", "@=", "_=", "@=*"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "slug",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "featured",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "boolean",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "order", direction: "asc" },
  /** Max Page Size */
  maxPageSize: 100,
  /** Default Page Size */
  defaultPageSize: 50,
};

/**
 * Coupons sieve configuration
 */
export const couponsSieveConfig: SieveConfig = {
  /** Resource */
  resource: "coupons",
  /** Sortable Fields */
  sortableFields: ["createdAt", "discount", "expiresAt", "usageCount"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "type",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "code",
      /** Operators */
      operators: ["==", "@=", "_="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "shopId",
      /** Operators */
      operators: ["==", "!=null"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "discount",
      /** Operators */
      operators: ["==", "!=", ">", "<", ">=", "<="],
      /** Type */
      type: "number",
    },
    {
      /** Field */
      field: "expiresAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Returns sieve configuration
 */
export const returnsSieveConfig: SieveConfig = {
  /** Resource */
  resource: "returns",
  /** Sortable Fields */
  sortableFields: ["createdAt", "updatedAt", "status"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "orderId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "userId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "shopId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "reason",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Tickets sieve configuration
 */
export const ticketsSieveConfig: SieveConfig = {
  /** Resource */
  resource: "tickets",
  /** Sortable Fields */
  sortableFields: ["createdAt", "updatedAt", "priority", "status"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "priority",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "category",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "userId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "assignedTo",
      /** Operators */
      operators: ["==", "==null", "!=null"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Blog posts sieve configuration
 */
export const blogSieveConfig: SieveConfig = {
  /** Resource */
  resource: "blog",
  /** Sortable Fields */
  sortableFields: ["createdAt", "publishedAt", "title", "viewCount"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "category",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "author",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "title",
      /** Operators */
      operators: ["==", "@=", "_=", "@=*"],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "featured",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "boolean",
    },
    {
      /** Field */
      field: "publishedAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "publishedAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 10,
};

/**
 * Hero slides sieve configuration
 */
export const heroSlidesSieveConfig: SieveConfig = {
  /** Resource */
  resource: "hero-slides",
  /** Sortable Fields */
  sortableFields: ["createdAt", "order"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "position",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "order",
      /** Operators */
      operators: ["==", ">", "<", ">=", "<="],
      /** Type */
      type: "number",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "order", direction: "asc" },
  /** Max Page Size */
  maxPageSize: 20,
  /** Default Page Size */
  defaultPageSize: 10,
};

/**
 * Payouts sieve configuration
 */
export const payoutsSieveConfig: SieveConfig = {
  /** Resource */
  resource: "payouts",
  /** Sortable Fields */
  sortableFields: ["createdAt", "amount", "status"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "status",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "shopId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "method",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "amount",
      /** Operators */
      operators: ["==", "!=", ">", "<", ">=", "<="],
      /** Type */
      type: "number",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 50,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Favorites sieve configuration
 */
export const favoritesSieveConfig: SieveConfig = {
  /** Resource */
  resource: "favorites",
  /** Sortable Fields */
  sortableFields: ["createdAt"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "type",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "userId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "itemId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 100,
  /** Default Page Size */
  defaultPageSize: 20,
};

/**
 * Notifications sieve configuration
 */
export const notificationsSieveConfig: SieveConfig = {
  /** Resource */
  resource: "notifications",
  /** Sortable Fields */
  sortableFields: ["createdAt", "type"],
  /** Filterable Fields */
  filterableFields: [
    {
      /** Field */
      field: "type",
      /** Operators */
      operators: ["==", "!="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "read",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "boolean",
    },
    {
      /** Field */
      field: "userId",
      /** Operators */
      operators: ["=="],
      /** Type */
      type: "string",
    },
    {
      /** Field */
      field: "createdAt",
      /** Operators */
      operators: [">", "<", ">=", "<="],
      /** Type */
      type: "date",
    },
  ],
  /** Default Sort */
  defaultSort: { field: "createdAt", direction: "desc" },
  /** Max Page Size */
  maxPageSize: 100,
  /** Default Page Size */
  defaultPageSize: 20,
};

// ==================== CONFIG REGISTRY ====================

/**
 * Get sieve config for a resource
 */
/**
 * Retrieves sieve config
 *
 * @param {string} resource - The resource
 *
 * @returns {string} The sieveconfig result
 *
 * @example
 * getSieveConfig("example");
 */

/**
 * Retrieves sieve config
 *
 * @param {string} resource - The resource
 *
 * @returns {string} The sieveconfig result
 *
 * @example
 * getSieveConfig("example");
 */

export function getSieveConfig(resource: string): SieveConfig | undefined {
  const configs: Record<string, SieveConfig> = {
    /** Products */
    products: productsSieveConfig,
    /** Auctions */
    auctions: auctionsSieveConfig,
    /** Orders */
    orders: ordersSieveConfig,
    /** Users */
    users: usersSieveConfig,
    /** Shops */
    shops: shopsSieveConfig,
    /** Reviews */
    reviews: reviewsSieveConfig,
    /** Categories */
    categories: categoriesSieveConfig,
    /** Coupons */
    coupons: couponsSieveConfig,
    /** Returns */
    returns: returnsSieveConfig,
    /** Tickets */
    tickets: ticketsSieveConfig,
    /** Blog */
    blog: blogSieveConfig,
    "hero-slides": heroSlidesSieveConfig,
    /** Payouts */
    payouts: payoutsSieveConfig,
    /** Favorites */
    favorites: favoritesSieveConfig,
    /** Notifications */
    notifications: notificationsSieveConfig,
  };

  return configs[resource];
}

/**
 * Get all resource configs
 */
/**
 * Retrieves all sieve configs
 *
 * @returns {any} The allsieveconfigs result
 *
 * @example
 * getAllSieveConfigs();
 */

/**
 * Retrieves all sieve configs
 *
 * @returns {any} The allsieveconfigs result
 *
 * @example
 * getAllSieveConfigs();
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
