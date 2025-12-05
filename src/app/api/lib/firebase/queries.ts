/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/firebase/queries
 * @description This file contains functionality related to queries
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Common Firestore Query Builders
 * Provides role-based filtering and common query patterns
 * Location: /src/app/api/lib/firebase/queries.ts
 */

import { COLLECTIONS } from "@/constants/database";
import {
  OrderByDirection,
  Query,
  WhereFilterOp,
} from "firebase-admin/firestore";
import { Collections } from "./collections";

/**
 * User roles for access control
 */
export enum UserRole {
  USER = "user",
  SELLER = "seller",
  ADMIN = "admin",
}

/**
 * Filter options for queries
 */
export interface QueryFilter {
  /** Field */
  field: string;
  /** Operator */
  operator: WhereFilterOp;
  /** Value */
  value: any;
}

/**
 * QueryOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for QueryOptions
 */
export interface QueryOptions {
  /** Filters */
  filters?: QueryFilter[];
  /** Order By */
  orderBy?: { field: string; direction?: OrderByDirection };
  /** Limit */
  limit?: number;
  /** Start After */
  startAfter?: any;
}

/**
 * Apply filters to a query
 */
/**
 * Performs apply filters operation
 *
 * @param {Query} query - The query
 * @param {QueryFilter[]} filters - The filters
 *
 * @returns {any} The applyfilters result
 *
 * @example
 * applyFilters(query, filters);
 */

/**
 * Performs apply filters operation
 *
 * @param {Query} query - The query
 * @param {QueryFilter[]} filters - The filters
 *
 * @returns {any} The applyfilters result
 *
 * @example
 * applyFilters(query, filters);
 */

export function applyFilters(query: Query, filters: QueryFilter[]): Query {
  let filteredQuery = query;

  for (const filter of filters) {
    filteredQuery = filteredQuery.where(
      filter.field,
      filter.operator,
      filter.value,
    );
  }

  return filteredQuery;
}

/**
 * Apply pagination to a query
 * @deprecated Use the pagination utilities from @/app/api/lib/utils/pagination instead
 */
/**
 * Performs apply pagination operation
 *
 * @param {Query} query - The query
 * @param {number} [limit] - The limit
 * @param {any} [startAfter] - The start after
 *
 * @returns {number} The applypagination result
 *
 * @example
 * applyPagination(query, 123, startAfter);
 */

/**
 * Performs apply pagination operation
 *
 * @returns {number} The applypagination result
 *
 * @example
 * applyPagination();
 */

export function applyPagination(
  /** Query */
  query: Query,
  /** Limit */
  limit?: number,
  /** Start After */
  startAfter?: any,
): Query {
  let paginatedQuery = query;

  if (limit) {
    paginatedQuery = paginatedQuery.limit(limit);
  }

  if (startAfter) {
    paginatedQuery = paginatedQuery.startAfter(startAfter);
  }

  return paginatedQuery;
}

/**
 * Apply ordering to a query
 */
/**
 * Performs apply ordering operation
 *
 * @param {Query} query - The query
 * @param {{ field} [orderBy] - The order by
 *
 * @returns {string} The applyordering result
 *
 * @example
 * applyOrdering(query, {});
 */

/**
 * Performs apply ordering operation
 *
 * @returns {string} The applyordering result
 *
 * @example
 * applyOrdering();
 */

export function applyOrdering(
  /** Query */
  query: Query,
  /** Order By */
  orderBy?: { field: string; direction?: OrderByDirection },
): Query {
  if (orderBy) {
    return query.orderBy(orderBy.field, orderBy.direction || "desc");
  }
  return query;
}

/**
 * Build a complete query with filters, ordering, and pagination
 */
/**
 * Performs build query operation
 *
 * @param {Query} baseQuery - The base query
 * @param {QueryOptions} options - Configuration options
 *
 * @returns {any} The buildquery result
 *
 * @example
 * buildQuery(baseQuery, options);
 */

/**
 * Performs build query operation
 *
 * @param {Query} baseQuery - The base query
 * @param {QueryOptions} options - Configuration options
 *
 * @returns {any} The buildquery result
 *
 * @example
 * buildQuery(baseQuery, options);
 */

export function buildQuery(baseQuery: Query, options: QueryOptions): Query {
  let query = baseQuery;

  // Apply filters
  if (options.filters && options.filters.length > 0) {
    query = applyFilters(query, options.filters);
  }

  // Apply ordering
  if (options.orderBy) {
    query = applyOrdering(query, options.orderBy);
  }

  // Apply pagination
  if (options.limit || options.startAfter) {
    query = applyPagination(query, options.limit, options.startAfter);
  }

  return query;
}

/**
 * Role-based query builders for shops
 */
/**
 * Retrieves shops query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [userId] - user identifier
 *
 * @returns {string} The shopsquery result
 *
 * @example
 * getShopsQuery(userRole, "example");
 */

/**
 * Retrieves shops query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [userId] - user identifier
 *
 * @returns {string} The shopsquery result
 *
 * @example
 * getShopsQuery(userRole, "example");
 */

export function getShopsQuery(userRole: UserRole, userId?: string) {
  const shopsRef = Collections.shops();

  switch (userRole) {
    case UserRole.ADMIN:
      // Admin sees all shops
      return shopsRef;

    case UserRole.SELLER:
      // Seller sees own shops + public verified shops
      // Note: This requires an OR query which Firestore doesn't support natively
      // We'll need to do two queries and merge results in the API route
      return shopsRef.where("owner_id", "==", userId);

    case UserRole.USER:
    /** Default */
    default:
      // Guest/User sees only verified shops
      // We'll filter out banned shops in the API route to avoid composite index
      return shopsRef.where("is_verified", "==", true);
  }
}

/**
 * Role-based query builders for products
 */
/**
 * Retrieves products query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [shopId] - shop identifier
 *
 * @returns {string} The productsquery result
 *
 * @example
 * getProductsQuery(userRole, "example");
 */

/**
 * Retrieves products query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [shopId] - shop identifier
 *
 * @returns {string} The productsquery result
 *
 * @example
 * getProductsQuery(userRole, "example");
 */

export function getProductsQuery(userRole: UserRole, shopId?: string) {
  const productsRef = Collections.products();

  switch (userRole) {
    case UserRole.ADMIN:
      // Admin sees all products
      return productsRef;

    case UserRole.SELLER:
      // Seller sees only products from their shops
      if (!shopId) {
        throw new Error("shopId is required for seller product queries");
      }
      return productsRef.where("shop_id", "==", shopId);

    case UserRole.USER:
    /** Default */
    default:
      // Guest/User sees only published products
      return productsRef.where("status", "==", "published");
  }
}

/**
 * Role-based query builders for orders
 */
/**
 * Retrieves orders query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [userId] - user identifier
 * @param {string} [shopId] - shop identifier
 *
 * @returns {string} The ordersquery result
 *
 * @example
 * getOrdersQuery(userRole, "example", "example");
 */

/**
 * Retrieves orders query
 *
 * @returns {string} The ordersquery result
 *
 * @example
 * getOrdersQuery();
 */

export function getOrdersQuery(
  /** User Role */
  userRole: UserRole,
  /** User Id */
  userId?: string,
  /** Shop Id */
  shopId?: string,
) {
  const ordersRef = Collections.orders();

  switch (userRole) {
    case UserRole.ADMIN:
      // Admin sees all orders
      return ordersRef;

    case UserRole.SELLER:
      // Seller sees orders containing their shop's products
      // This requires checking order_items, so we'll need to handle this differently
      // Return base query and filter in API route
      return ordersRef;

    case UserRole.USER:
    /** Default */
    default:
      // User sees only their own orders
      if (!userId) {
        throw new Error("userId is required for user order queries");
      }
      return ordersRef.where("user_id", "==", userId);
  }
}

/**
 * Role-based query builders for auctions
 */
/**
 * Retrieves auctions query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [shopId] - shop identifier
 *
 * @returns {string} The auctionsquery result
 *
 * @example
 * getAuctionsQuery(userRole, "example");
 */

/**
 * Retrieves auctions query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [shopId] - shop identifier
 *
 * @returns {string} The auctionsquery result
 *
 * @example
 * getAuctionsQuery(userRole, "example");
 */

export function getAuctionsQuery(userRole: UserRole, shopId?: string) {
  const auctionsRef = Collections.auctions();

  switch (userRole) {
    case UserRole.ADMIN:
      // Admin sees all auctions
      return auctionsRef;

    case UserRole.SELLER:
      // Seller sees only their shop's auctions
      if (!shopId) {
        throw new Error("shopId is required for seller auction queries");
      }
      return auctionsRef.where("shop_id", "==", shopId);

    case UserRole.USER:
    /** Default */
    default:
      // Guest/User sees only active public auctions
      return auctionsRef.where("status", "==", "active");
  }
}

/**
 * Role-based query builders for returns
 */
/**
 * Retrieves returns query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [userId] - user identifier
 * @param {string} [shopId] - shop identifier
 *
 * @returns {string} The returnsquery result
 *
 * @example
 * getReturnsQuery(userRole, "example", "example");
 */

/**
 * Retrieves returns query
 *
 * @returns {string} The returnsquery result
 *
 * @example
 * getReturnsQuery();
 */

export function getReturnsQuery(
  /** User Role */
  userRole: UserRole,
  /** User Id */
  userId?: string,
  /** Shop Id */
  shopId?: string,
) {
  const returnsRef = Collections.returns();

  switch (userRole) {
    case UserRole.ADMIN:
      // Admin sees all returns, especially those requiring intervention
      return returnsRef;

    case UserRole.SELLER:
      // Seller sees returns for their shop's products
      if (!shopId) {
        throw new Error("shopId is required for seller return queries");
      }
      return returnsRef.where("shop_id", "==", shopId);

    case UserRole.USER:
    /** Default */
    default:
      // User sees only their own returns
      if (!userId) {
        throw new Error("userId is required for user return queries");
      }
      return returnsRef.where("user_id", "==", userId);
  }
}

/**
 * Role-based query builders for support tickets
 */
/**
 * Retrieves support tickets query
 *
 * @param {UserRole} userRole - The user role
 * @param {string} [userId] - user identifier
 * @param {string} [shopId] - shop identifier
 *
 * @returns {string} The supportticketsquery result
 *
 * @example
 * getSupportTicketsQuery(userRole, "example", "example");
 */

/**
 * Retrieves support tickets query
 *
 * @returns {string} The supportticketsquery result
 *
 * @example
 * getSupportTicketsQuery();
 */

export function getSupportTicketsQuery(
  /** User Role */
  userRole: UserRole,
  /** User Id */
  userId?: string,
  /** Shop Id */
  shopId?: string,
) {
  const ticketsRef = Collections.supportTickets();

  switch (userRole) {
    case UserRole.ADMIN:
      // Admin sees all tickets
      return ticketsRef;

    case UserRole.SELLER:
      // Seller sees tickets related to their shops
      if (!shopId) {
        throw new Error("shopId is required for seller ticket queries");
      }
      return ticketsRef.where("shop_id", "==", shopId);

    case UserRole.USER:
    /** Default */
    default:
      // User sees only their own tickets
      if (!userId) {
        throw new Error("userId is required for user ticket queries");
      }
      return ticketsRef.where("user_id", "==", userId);
  }
}

/**
 * Helper to check if user owns a resource
 */
/**
 * Custom React hook for user owns resource
 *
 * @returns {Promise<any>} Promise resolving to userownsresource result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * userOwnsResource();
 */

/**
 * Custom React hook for user owns resource
 *
 * @returns {Promise<any>} Promise resolving to userownsresource result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * userOwnsResource();
 */

export async function userOwnsResource(
  /** Collection Name */
  collectionName: string,
  /** Resource Id */
  resourceId: string,
  /** User Id */
  userId: string,
  /** Owner Field */
  ownerField: string = "owner_id",
): Promise<boolean> {
  try {
    const { getDocumentById } = await import("./collections");
    const resource = await getDocumentById<any>(collectionName, resourceId);

    if (!resource) {
      return false;
    }

    return resource[ownerField] === userId;
  } catch (error) {
    console.error("Error checking resource ownership:", error);
    return false;
  }
}

/**
 * Helper to check if user owns a shop
 */
/**
 * Custom React hook for user owns shop
 *
 * @param {string} shopId - shop identifier
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to userownsshop result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * userOwnsShop("example", "example");
 */

/**
 * Custom React hook for user owns shop
 *
 * @returns {Promise<any>} Promise resolving to userownsshop result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * userOwnsShop();
 */

export async function userOwnsShop(
  /** Shop Id */
  shopId: string,
  /** User Id */
  userId: string,
): Promise<boolean> {
  return userOwnsResource(COLLECTIONS.SHOPS, shopId, userId, "owner_id");
}
