/**
 * Sieve Middleware
 *
 * Provides reusable middleware for standardized Sieve pagination across API routes.
 * This middleware handles query parsing, mandatory filters, and response formatting.
 *
 * @example
 * // Basic usage
 * import { withSieve } from '@/app/api/lib/sieve-middleware';
 * import { productsSieveConfig } from '@/app/api/lib/sieve';
 *
 * export const GET = withSieve(productsSieveConfig, {
 *   mandatoryFilters: [{ field: 'status', operator: '==', value: 'published' }],
 *   transform: transformProduct,
 * });
 *
 * @example
 * // With custom handler
 * export const GET = withSieve(productsSieveConfig, {
 *   mandatoryFilters: [{ field: 'status', operator: '==', value: 'published' }],
 *   handler: async (request, sieveQuery) => {
 *     // Custom logic before query
 *     const result = await executeSieveQuery('products', sieveQuery, productsSieveConfig);
 *     // Custom logic after query
 *     return result;
 *   },
 * });
 */

import { NextRequest, NextResponse } from "next/server";
import type {
  SieveConfig,
  SieveQuery,
  FilterCondition,
  SievePaginatedResponse,
} from "./sieve/types";
import { parseSieveQuery } from "./sieve/parser";
import { executeSieveQuery } from "./sieve/firestore";

export interface SieveMiddlewareOptions<T = unknown> {
  /**
   * Collection name in Firestore
   */
  collection: string;

  /**
   * Mandatory filters always applied to the query
   * These cannot be overridden by client requests
   */
  mandatoryFilters?: FilterCondition[];

  /**
   * Transform function to apply to each result item
   */
  transform?: (item: any) => T;

  /**
   * Custom handler for more complex scenarios
   * If provided, overrides the default query execution
   */
  handler?: (
    request: NextRequest,
    sieveQuery: SieveQuery,
    config: SieveConfig
  ) => Promise<SievePaginatedResponse<any>>;

  /**
   * Callback to modify the sieve query before execution
   * Useful for adding dynamic filters based on request context
   */
  beforeQuery?: (
    request: NextRequest,
    sieveQuery: SieveQuery
  ) => Promise<SieveQuery> | SieveQuery;

  /**
   * Callback to modify the response before sending
   */
  afterQuery?: (
    result: SievePaginatedResponse<any>,
    request: NextRequest
  ) => Promise<SievePaginatedResponse<any>> | SievePaginatedResponse<any>;

  /**
   * Whether to require authentication
   */
  requireAuth?: boolean;

  /**
   * Required roles for access (only checked if requireAuth is true)
   */
  requiredRoles?: string[];
}

/**
 * Creates a Sieve-enabled GET handler for API routes
 */
export function withSieve<T = unknown>(
  config: SieveConfig,
  options: SieveMiddlewareOptions<T>
) {
  return async function handler(request: NextRequest): Promise<NextResponse> {
    try {
      const searchParams = request.nextUrl.searchParams;

      // Parse the sieve query from URL parameters
      let sieveQuery = parseSieveQuery(searchParams, config);

      // Add mandatory filters
      if (options.mandatoryFilters && options.mandatoryFilters.length > 0) {
        sieveQuery.filters = [
          ...options.mandatoryFilters,
          ...sieveQuery.filters,
        ];
      }

      // Allow modification before query
      if (options.beforeQuery) {
        sieveQuery = await options.beforeQuery(request, sieveQuery);
      }

      // Execute query (custom handler or default)
      let result: SievePaginatedResponse<any>;

      if (options.handler) {
        result = await options.handler(request, sieveQuery, config);
      } else {
        result = await executeSieveQuery(
          options.collection,
          sieveQuery,
          config
        );
      }

      // Transform results if transformer provided
      if (options.transform && result.data) {
        result = {
          ...result,
          data: result.data.map(options.transform),
        };
      }

      // Allow modification after query
      if (options.afterQuery) {
        result = await options.afterQuery(result, request);
      }

      return NextResponse.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(`Sieve middleware error for ${options.collection}:`, error);
      const message =
        error instanceof Error ? error.message : "Internal server error";

      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to create common filter patterns
 */
export const sieveFilters = {
  /**
   * Filter for published/active items
   */
  published: (): FilterCondition => ({
    field: "status",
    operator: "==",
    value: "published",
  }),

  /**
   * Filter for active items
   */
  active: (): FilterCondition => ({
    field: "status",
    operator: "==",
    value: "active",
  }),

  /**
   * Filter for live auctions
   */
  liveAuction: (): FilterCondition => ({
    field: "status",
    operator: "==",
    value: "live",
  }),

  /**
   * Filter for verified shops
   */
  verifiedShop: (): FilterCondition => ({
    field: "verified",
    operator: "==",
    value: true,
  }),

  /**
   * Filter by shop ID
   */
  byShop: (shopId: string): FilterCondition => ({
    field: "shopId",
    operator: "==",
    value: shopId,
  }),

  /**
   * Filter by user ID
   */
  byUser: (userId: string): FilterCondition => ({
    field: "userId",
    operator: "==",
    value: userId,
  }),

  /**
   * Filter by category ID
   */
  byCategory: (categoryId: string): FilterCondition => ({
    field: "categoryId",
    operator: "==",
    value: categoryId,
  }),

  /**
   * Filter for non-deleted items (soft delete)
   */
  notDeleted: (): FilterCondition => ({
    field: "deletedAt",
    operator: "==null",
    value: null,
  }),

  /**
   * Filter for items in stock
   */
  inStock: (): FilterCondition => ({
    field: "stock",
    operator: ">",
    value: 0,
  }),

  /**
   * Filter for featured items
   */
  featured: (): FilterCondition => ({
    field: "featured",
    operator: "==",
    value: true,
  }),
};

/**
 * Creates a protected Sieve handler with authentication
 */
export function withProtectedSieve<T = unknown>(
  config: SieveConfig,
  options: SieveMiddlewareOptions<T> & {
    getAuthFilter: (userId: string) => FilterCondition | FilterCondition[];
  }
) {
  return async function handler(request: NextRequest): Promise<NextResponse> {
    try {
      // TODO: Get authenticated user from session
      // const session = await getServerSession();
      // if (!session?.user?.id) {
      //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      // }

      // For now, return unauthorized if no implementation
      return NextResponse.json(
        {
          success: false,
          error: "Protected Sieve not fully implemented",
        },
        { status: 501 }
      );
    } catch (error) {
      console.error(
        `Protected Sieve middleware error for ${options.collection}:`,
        error
      );
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  };
}

export type { SieveQuery, FilterCondition, SieveConfig };
