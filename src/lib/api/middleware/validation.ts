/**
 * Request Validation Middleware
 * Centralized validation using Zod schemas with consistent error handling
 */

import { NextRequest } from 'next/server';
import { ZodSchema, ZodError, z } from 'zod';
import { throwApiError } from './error-handler';

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      
      throwApiError(
        'Request validation failed',
        422,
        'VALIDATION_ERROR',
        formattedErrors
      );
    }
    
    if (error instanceof SyntaxError) {
      throwApiError('Invalid JSON in request body', 400, 'INVALID_JSON');
    }
    
    throwApiError('Failed to validate request body', 500);
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, any> = {};
    
    // Convert URLSearchParams to object
    searchParams.forEach((value, key) => {
      // Handle multiple values for the same key
      if (params[key]) {
        if (Array.isArray(params[key])) {
          params[key].push(value);
        } else {
          params[key] = [params[key], value];
        }
      } else {
        params[key] = value;
      }
    });

    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      
      throwApiError(
        'Query parameter validation failed',
        422,
        'VALIDATION_ERROR',
        formattedErrors
      );
    }
    
    throwApiError('Failed to validate query parameters', 500);
  }
}

/**
 * Validate path parameters with Zod schema
 */
export function validatePathParams<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      
      throwApiError(
        'Path parameter validation failed',
        422,
        'VALIDATION_ERROR',
        formattedErrors
      );
    }
    
    throwApiError('Failed to validate path parameters', 500);
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  pagination: {
    page: (defaultValue = 1, min = 1, max = 1000) => 
      z.coerce.number().int().min(min).max(max).default(defaultValue),
    limit: (defaultValue = 50, min = 1, max = 100) => 
      z.coerce.number().int().min(min).max(max).default(defaultValue),
    offset: (min = 0) => 
      z.coerce.number().int().min(min).optional(),
  },
  
  id: z.string().min(1, 'ID cannot be empty'),
  
  search: z.string().optional(),
  
  sort: {
    field: z.string().min(1),
    direction: z.enum(['asc', 'desc']).default('desc'),
  },
  
  filters: {
    status: z.enum(['active', 'inactive', 'pending', 'deleted']).optional(),
    role: z.enum(['user', 'seller', 'admin']).optional(),
    dateRange: {
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    },
  },
};

/**
 * Middleware wrapper for request validation
 */
export function withRequestValidation<
  TBody = any,
  TQuery = any,
  TParams = any
>(config: {
  body?: ZodSchema<TBody>;
  query?: ZodSchema<TQuery>;
  params?: ZodSchema<TParams>;
}) {
  return function <T extends any[]>(
    handler: (
      request: NextRequest,
      validated: {
        body?: TBody;
        query?: TQuery;
        params?: TParams;
      },
      ...args: T
    ) => Promise<any>
  ) {
    return async (
      request: NextRequest,
      context?: { params?: Record<string, string | string[]> },
      ...args: T
    ) => {
      const validated: {
        body?: TBody;
        query?: TQuery;
        params?: TParams;
      } = {};

      // Validate body if schema provided
      if (config.body) {
        validated.body = await validateRequestBody(request, config.body);
      }

      // Validate query parameters if schema provided
      if (config.query) {
        validated.query = validateQueryParams(request, config.query);
      }

      // Validate path parameters if schema provided
      if (config.params && context?.params) {
        validated.params = validatePathParams(context.params, config.params);
      }

      return handler(request, validated, ...args);
    };
  };
}

/**
 * Helper to create pagination query schema
 */
export function createPaginationSchema(options: {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
} = {}) {
  const { defaultPage = 1, defaultLimit = 50, maxLimit = 100 } = options;
  
  return z.object({
    page: z.coerce.number().int().min(1).default(defaultPage),
    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
    offset: z.coerce.number().int().min(0).optional(),
  });
}

/**
 * Helper to create search and filter schema
 */
export function createSearchSchema(additionalFilters: Record<string, ZodSchema<any>> = {}) {
  return z.object({
    search: z.string().optional(),
    ...additionalFilters,
  });
}

/**
 * Helper to create sort schema
 */
export function createSortSchema(allowedFields: string[]) {
  return z.object({
    sortBy: z.enum(allowedFields as [string, ...string[]]).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  });
}
