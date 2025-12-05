/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/sieve-middleware
 * @description This file contains functionality related to sieve-middleware
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
 * /**
 * GET constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for get
 */
export const GET = withSieve(productsSieveConfig, {
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

/**
 * SieveMiddlewareOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for SieveMiddlewareOptions
 */
export interface SieveMiddlewareOptions<T = unknown> {
  /**
   * Collection name in Firestore
   */
  /** Collection */
  collection: string;

  /**
   * Mandatory filters always applied to the query
   * These cannot be overridden by client requests
   */
  /** MandatoryFilters */
  mandatoryFilters?: FilterCondition[];

  /**
   * Transform function to apply to each result item
   */
  /** Transform */
  transform?: (item: any) => T;

  /**
   * Custom handler for more complex scenarios
   * If provided, overrides the default query execution
   */
  /** Handler */
  handler?: (
    /** Request */
    request: NextRequest,
    /** Sieve Query */
    sieveQuery: SieveQuery,
    /** Config */
    config: SieveConfig,
  ) => Promise<SievePaginatedResponse<any>>;

  /**
   * Callback to modify the sieve query before execution
   * Useful for adding dynamic filters based on request context
   */
  /** BeforeQuery */
  beforeQuery?: (
    /** Request */
    request: NextRequest,
    /** Sieve Query */
    sieveQuery: SieveQuery,
  ) => Promise<SieveQuery> | SieveQuery;

  /**
   * Callback to modify the response before sending
   */
  /** AfterQuery */
  afterQuery?: (
    /** Result */
    result: SievePaginatedResponse<any>,
    /** Request */
    request: NextRequest,
  ) => Promise<SievePaginatedResponse<any>> | SievePaginatedResponse<any>;

  /**
   * Whether to require authentication
   */
  /** RequireAuth */
  requireAuth?: boolean;

  /**
   * Required roles for access (only checked if requireAuth is true)
   */
  /** RequiredRoles */
  requiredRoles?: string[];
}

/**
 * Creates a Sieve-enabled GET handler for API routes
 */
/**
 * Performs with sieve operation
 *
 * @param {SieveConfig} config - The config
 * @param {SieveMiddlewareOptions<T>} options - Configuration options
 *
 * @returns {Promise<any>} Promise resolving to withsieve result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withSieve(config, options);
 */

/**
 * Performs with sieve operation
 *
 * @returns {any} The withsieve result
 *
 * @example
 * withSieve();
 */

export function withSieve<T = unknown>(
  /** Config */
  config: SieveConfig,
  /** Options */
  options: SieveMiddlewareOptions<T>,
) {
  return /**
 * Handles r
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<NextResponse>} The handler result
 *
 */
async function handler(request: NextRequest): Promise<NextResponse> {
    try {
      const searchParams = request.nextUrl.searchParams;

      // Parse the sieve query from URL parameters
      const parseResult = parseSieveQuery(searchParams, config);
      let sieveQuery = parseResult.query;

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
          config,
        );
      }

      // Transform results if transformer provided
      if (options.transform && result.data) {
        result = {
          ...result,
          /** Data */
          data: result.data.map(options.transform),
        };
      }

      // Allow modification after query
      if (options.afterQuery) {
        result = await options.afterQuery(result, request);
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error(`Sieve middleware error for ${options.collection}:`, error);
      const message =
        error instanceof Error ? error.message : "Internal server error";

      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: message,
        },
        { status: 500 },
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
    /** Field */
    field: "status",
    /** Operator */
    operator: "==",
    /** Value */
    value: "published",
  }),

  /**
   * Filter for active items
   */
  active: (): FilterCondition => ({
    /** Field */
    field: "status",
    /** Operator */
    operator: "==",
    /** Value */
    value: "active",
  }),

  /**
   * Filter for live auctions
   */
  liveAuction: (): FilterCondition => ({
    /** Field */
    field: "status",
    /** Operator */
    operator: "==",
    /** Value */
    value: "live",
  }),

  /**
   * Filter for verified shops
   */
  verifiedShop: (): FilterCondition => ({
    /** Field */
    field: "verified",
    /** Operator */
    operator: "==",
    /** Value */
    value: true,
  }),

  /**
   * Filter by shop ID
   */
  byShop: (shopId: string): FilterCondition => ({
    /** Field */
    field: "shopId",
    /** Operator */
    operator: "==",
    /** Value */
    value: shopId,
  }),

  /**
   * Filter by user ID
   */
  byUser: (userId: string): FilterCondition => ({
    /** Field */
    field: "userId",
    /** Operator */
    operator: "==",
    /** Value */
    value: userId,
  }),

  /**
   * Filter by category ID
   */
  byCategory: (categoryId: string): FilterCondition => ({
    /** Field */
    field: "categoryId",
    /** Operator */
    operator: "==",
    /** Value */
    value: categoryId,
  }),

  /**
   * Filter for non-deleted items (soft delete)
   */
  notDeleted: (): FilterCondition => ({
    /** Field */
    field: "deletedAt",
    /** Operator */
    operator: "==null",
    /** Value */
    value: null,
  }),

  /**
   * Filter for items in stock
   */
  inStock: (): FilterCondition => ({
    /** Field */
    field: "stock",
    /** Operator */
    operator: ">",
    /** Value */
    value: 0,
  }),

  /**
   * Filter for featured items
   */
  featured: (): FilterCondition => ({
    /** Field */
    field: "featured",
    /** Operator */
    operator: "==",
    /** Value */
    value: true,
  }),
};

/**
 * Creates a protected Sieve handler with authentication
 */
/**
 * Performs with protected sieve operation
 *
 * @param {SieveConfig} config - The config
 * @param {SieveMiddlewareOptions<T> & {
    getAuthFilter} options - Configuration options
 *
 * @returns {string} The withprotectedsieve result
 *
 * @example
 * withProtectedSieve(config, {});
 */

/**
 * Performs with protected sieve operation
 *
 * @returns {any} The withprotectedsieve result
 *
 * @example
 * withProtectedSieve();
 */

export function withProtectedSieve<T = unknown>(
  /** Config */
  config: SieveConfig,
  /** Options */
  options: SieveMiddlewareOptions<T/**
 * Handles r
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<NextResponse>} The handler result
 *
 */
> & {
    /** Get Auth Filter */
    getAuthFilter: (userId: string) => FilterCondition | FilterCondition[];
  },
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
          /** Success */
          success: false,
          /** Error */
          error: "Protected Sieve not fully implemented",
        },
        { status: 501 },
      );
    } catch (error) {
      console.error(
        `Protected Sieve middleware error for ${options.collection}:`,
        error,
      );
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Internal server error",
        },
        { status: 500 },
      );
    }
  };
}

export type { SieveQuery, FilterCondition, SieveConfig };
