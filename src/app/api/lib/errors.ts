/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/errors
 * @description This file contains functionality related to errors
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextResponse } from "next/server";

/**
 * ApiError class
 * 
 * @class
 * @description Description of ApiError class functionality
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    /** Message */
    message: string,
    public errors?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * BadRequestError class
 * 
 * @class
 * @description Description of BadRequestError class functionality
 */
export class BadRequestError extends ApiError {
  constructor(message: string = "Bad Request", errors?: any) {
    super(400, message, errors);
    this.name = "BadRequestError";
  }
}

/**
 * UnauthorizedError class
 * 
 * @class
 * @description Description of UnauthorizedError class functionality
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

/**
 * ForbiddenError class
 * 
 * @class
 * @description Description of ForbiddenError class functionality
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

/**
 * NotFoundError class
 * 
 * @class
 * @description Description of NotFoundError class functionality
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Not Found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

/**
 * ConflictError class
 * 
 * @class
 * @description Description of ConflictError class functionality
 */
export class ConflictError extends ApiError {
  constructor(message: string = "Conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

/**
 * TooManyRequestsError class
 * 
 * @class
 * @description Description of TooManyRequestsError class functionality
 */
export class TooManyRequestsError extends ApiError {
  constructor(message: string = "Too Many Requests", retryAfter?: number) {
    super(429, message, { retryAfter });
    this.name = "TooManyRequestsError";
  }
}

/**
 * InternalServerError class
 * 
 * @class
 * @description Description of InternalServerError class functionality
 */
export class InternalServerError extends ApiError {
  constructor(message: string = "Internal Server Error") {
    super(500, message);
    this.name = "InternalServerError";
  }
}

/**
 * Handles api error
 */
/**
 * Handles api error event
 *
 * @param {any} error - Error object
 *
 * @returns {any} The handleapierror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * handleApiError(error);
 */

/**
 * Handles api error event
 *
 * @param {any} error - Error object
 *
 * @returns {any} The handleapierror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * handleApiError(error);
 */

export function handleApiError(error: any): NextResponse {
  if (error instanceof ApiError) {
    const response: any = {
      /** Error */
      error: error.message,
    };

    if (error.errors) {
      response.details = error.errors;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Unknown error
  console.error("Unhandled error:", error);
  return NextResponse.json(
    {
      /** Error */
      error: "Internal Server Error",
      /** Message */
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : error.message || "Unknown error",
    },
    { status: 500 },
  );
}
