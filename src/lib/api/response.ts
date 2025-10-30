/**
 * API Response Utilities
 * Standardized response formatting for all API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCorsHeaders } from "./cors";
import { HTTP_STATUS, API_ERROR_MESSAGES } from "./constants";

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ field?: string; message: string }>;
  message?: string;
  timestamp?: string;
}

/**
 * Success Response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK,
  request?: NextRequest,
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  const headers = request
    ? getCorsHeaders(request.headers.get("origin") || undefined)
    : {};

  return NextResponse.json(response, { status, headers });
}

/**
 * Error Response
 */
export function errorResponse(
  error: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: Array<{ field?: string; message: string }>,
  request?: NextRequest,
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error,
    errors,
    timestamp: new Date().toISOString(),
  };

  const headers = request
    ? getCorsHeaders(request.headers.get("origin") || undefined)
    : {};

  return NextResponse.json(response, { status, headers });
}

/**
 * Validation Error Response (Zod)
 */
export function validationErrorResponse(
  zodError: ZodError,
  request?: NextRequest,
): NextResponse<ApiResponse> {
  const errors = zodError.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return errorResponse(
    API_ERROR_MESSAGES.VALIDATION_ERROR,
    HTTP_STATUS.BAD_REQUEST,
    errors,
    request,
  );
}

/**
 * Not Found Response
 */
export function notFoundResponse(
  message: string = API_ERROR_MESSAGES.NOT_FOUND,
  request?: NextRequest,
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.NOT_FOUND, undefined, request);
}

/**
 * Unauthorized Response
 */
export function unauthorizedResponse(
  message: string = API_ERROR_MESSAGES.UNAUTHORIZED,
  request?: NextRequest,
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.UNAUTHORIZED, undefined, request);
}

/**
 * Forbidden Response
 */
export function forbiddenResponse(
  message: string = API_ERROR_MESSAGES.FORBIDDEN,
  request?: NextRequest,
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.FORBIDDEN, undefined, request);
}

/**
 * Internal Server Error Response
 */
export function internalErrorResponse(
  error: unknown,
  request?: NextRequest,
): NextResponse<ApiResponse> {
  console.error("Internal Server Error:", error);

  const message =
    error instanceof Error ? error.message : API_ERROR_MESSAGES.INTERNAL_ERROR;

  return errorResponse(
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    undefined,
    request,
  );
}

/**
 * Handle API Error
 * Centralized error handling for all API routes
 */
export function handleApiError(
  error: unknown,
  request?: NextRequest,
): NextResponse<ApiResponse> {
  // Zod validation errors
  if (error instanceof ZodError) {
    return validationErrorResponse(error, request);
  }

  // Custom API errors
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("not found")) {
      return notFoundResponse(error.message, request);
    }
    if (error.message.includes("unauthorized")) {
      return unauthorizedResponse(error.message, request);
    }
    if (error.message.includes("forbidden")) {
      return forbiddenResponse(error.message, request);
    }
  }

  // Default to internal server error
  return internalErrorResponse(error, request);
}
