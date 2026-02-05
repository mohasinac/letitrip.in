/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response formatting across all API routes
 */

import { NextResponse } from 'next/server';
import { ERROR_MESSAGES } from '@/constants';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: () => errorResponse(ERROR_MESSAGES.AUTH.UNAUTHORIZED, 401),
  
  forbidden: () => errorResponse(ERROR_MESSAGES.AUTH.FORBIDDEN, 403),
  
  notFound: (resource: string = 'Resource') =>
    errorResponse(`${resource} not found`, 404),
    
  badRequest: (message: string = ERROR_MESSAGES.GENERIC.BAD_REQUEST, details?: any) =>
    errorResponse(message, 400, details),
    
  internalError: (message: string = ERROR_MESSAGES.GENERIC.INTERNAL_ERROR) =>
    errorResponse(message, 500),
    
  validationError: (details: any) =>
    errorResponse(ERROR_MESSAGES.VALIDATION.INVALID_INPUT, 400, details),
};
