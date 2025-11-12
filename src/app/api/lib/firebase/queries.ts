/**
 * Common Firestore Query Builders
 * Provides role-based filtering and common query patterns
 * Location: /src/app/api/lib/firebase/queries.ts
 */

import {
  Query,
  WhereFilterOp,
  OrderByDirection,
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
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: { field: string; direction?: OrderByDirection };
  limit?: number;
  startAfter?: any;
}

/**
 * Apply filters to a query
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
 */
export function applyPagination(
  query: Query,
  limit?: number,
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
export function applyOrdering(
  query: Query,
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
    default:
      // Guest/User sees only verified shops
      // We'll filter out banned shops in the API route to avoid composite index
      return shopsRef.where("is_verified", "==", true);
  }
}

/**
 * Role-based query builders for products
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
    default:
      // Guest/User sees only published products
      return productsRef.where("status", "==", "published");
  }
}

/**
 * Role-based query builders for orders
 */
export function getOrdersQuery(
  userRole: UserRole,
  userId?: string,
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
    default:
      // Guest/User sees only active public auctions
      return auctionsRef.where("status", "==", "active");
  }
}

/**
 * Role-based query builders for returns
 */
export function getReturnsQuery(
  userRole: UserRole,
  userId?: string,
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
export function getSupportTicketsQuery(
  userRole: UserRole,
  userId?: string,
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
export async function userOwnsResource(
  collectionName: string,
  resourceId: string,
  userId: string,
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
export async function userOwnsShop(
  shopId: string,
  userId: string,
): Promise<boolean> {
  return userOwnsResource("shops", shopId, userId, "owner_id");
}
