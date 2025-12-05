/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/validation-middleware
 * @description This file contains functionality related to validation-middleware
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * API Request Validation Middleware
 * Provides server-side validation for API endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateFormData,
  getValidationSchema,
  validateBulkAction,
} from "@/lib/validation/inline-edit-schemas";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

/**
 * ValidationError interface
 * 
 * @interface
 * @description Defines the structure and contract for ValidationError
 */
export interface ValidationError {
  /** Field */
  field: string;
  /** Message */
  message: string;
}

/**
 * ValidationResult interface
 * 
 * @interface
 * @description Defines the structure and contract for ValidationResult
 */
export interface ValidationResult {
  /** Valid */
  valid: boolean;
  /** Errors */
  errors?: ValidationError[];
  /** Data */
  data?: any;
}

/**
 * Validate request body against a validation schema
 */
/**
 * Validates request
 *
 * @param {NextRequest} req - The req
 * @param {string} resourceType - The resource type
 *
 * @returns {Promise<any>} Promise resolving to validaterequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateRequest(req, "example");
 */

/**
 * Validates request
 *
 * @returns {Promise<any>} Promise resolving to validaterequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateRequest();
 */

export async function validateRequest(
  /** Req */
  req: NextRequest,
  /** Resource Type */
  resourceType: string,
): Promise<ValidationResult> {
  try {
    const body = await req.json();
    const schema = getValidationSchema(resourceType);

    if (!schema || schema.length === 0) {
      return {
        /** Valid */
        valid: false,
        /** Errors */
        errors: [
          {
            /** Field */
            field: "_general",
            /** Message */
            message: `No validation schema found for ${resourceType}`,
          },
        ],
      };
    }

    const validationErrors = validateFormData(body, schema);

    if (Object.keys(validationErrors).length > 0) {
      /**
 * Performs errors operation
 *
 * @param {any} validationErrors - The validationerrors
 *
 * @returns {any} The errors result
 *
 */
const errors: ValidationError[] = Object.entries(validationErrors).map(
        ([field, message]) => ({
          field,
          message,
        }),
      );

      return {
        /** Valid */
        valid: false,
        errors,
      };
    }

    return {
      /** Valid */
      valid: true,
      /** Data */
      data: body,
    };
  } catch (error) {
    return {
      /** Valid */
      valid: false,
      /** Errors */
      errors: [{ field: "_general", message: "Invalid request body" }],
    };
  }
}

/**
 * Validate bulk operation request
 */
/**
 * Validates bulk request
 *
 * @param {NextRequest} req - The req
 * @param {string} resourceType - The resource type
 *
 * @returns {Promise<any>} Promise resolving to validatebulkrequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateBulkRequest(req, "example");
 */

/**
 * Validates bulk request
 *
 * @returns {Promise<any>} Promise resolving to validatebulkrequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateBulkRequest();
 */

export async function validateBulkRequest(
  /** Req */
  req: NextRequest,
  /** Resource Type */
  resourceType: string,
): Promise<ValidationResult> {
  try {
    const body = await req.json();

    const { action, ids, data } = body;

    if (!action || typeof action !== "string") {
      return {
        /** Valid */
        valid: false,
        /** Errors */
        errors: [
          {
            /** Field */
            field: "action",
            /** Message */
            message: "Action is required and must be a string",
          },
        ],
      };
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        /** Valid */
        valid: false,
        /** Errors */
        errors:/**
 * Performs action validation operation
 *
 * @param {any} action - The action
 * @param {any} resourceType - The resourcetype
 * @param {any} data - The data
 *
 * @returns {NextResponse} The actionvalidation result
 *
 * @example
 * actionValidation(action, resourceType, data);
 */
 [{ field: "ids", message: "IDs must be a non-empty array" }],
      };
    }

    // Validate action is valid for resource type
    const actionValidation = validateBulkAction(action, resourceType, data);
    if (!actionValidation.valid) {
      return {
        /** Valid */
        valid: false,
        /** Errors */
        errors: [
          {
            /** Field */
            field: "action",
            /** Message */
            message: actionValidation.error || "Invalid action",
          },
        ],
      };
    }

    return {
      /** Valid */
      valid: true,
      /** Data */
      data: body,
    };
  } catch (error) {
    return {
      /** Valid */
      valid: false,
      /** Errors */
      errors: [{ field: "_general", message: "Invalid request body" }],
    };
  }
}

/**
 * Create validation error response
 */
/**
 * Creates a new validation error response
 *
 * @param {ValidationError[]} errors - The errors
 *
 * @returns {any} The validationerrorresponse result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createValidationErrorResponse(errors);
 */

/**
 * Creates a new validation error response
 *
 * @param {ValidationError[]} /** Errors */
  errors - The /**  errors */
  errors
 *
 * @returns {any} The validationerrorresponse result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createValidationErrorResponse(/** Errors */
  errors);
 */

/**
 * Creates validation error response
 *
 * @param {ValidationError[]} errors - The errors
 *
 * @returns {NextResponse} The createvalidationerrorresponse result
 *
 * @example
 * createValidationErrorResponse([]);
 */
export function createValidationErrorResponse(
  /** Errors */
  errors: ValidationError[],
): NextResponse {
  return NextResponse.json(
    {
      /** Success */
      success: false,
      /** Message */
      message: "Validation failed",
      /** Errors */
      errors: errors.reduce(
        (acc, err) => {
          acc[err.field] = err.message;
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
    { status: 400 },
  );
}

/**
 * Middleware wrapper for API routes with validation
 */
/**
 * Performs with validation operation
 *
 * @param {string} resourceType - The resource type
 * @param {(req} handler - The handler
 * @param {any} validatedData - The validated data
 *
 * @returns {Promise<any>} Promise resolving to withvalidation result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withValidation("example", handler, validatedData);
 */

/**
 * Performs with validation operation
 *
 * @param {string} /** Resource Type */
  resourceType - The /**  resource  type */
  resource type
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 * @param {a/**
 * Performs validation operation
 *
 * @param {any} req - The req
 * @param {any} resourceType - The resourcetype
 *
 * @returns {any} The validation result
 *
 * @example
 * validation(req, resourceType);
 */
ny} validatedData - The validated data
 *
 * @returns {string} The withvalidation result
 *
 * @example
 * withValidation("example", /** Handler */
  handler, validatedData);
 */

export function withValidation(
  /** Resource Type */
  resourceType: string,
  /** Handler */
  handler: (req: NextRequest, validatedData: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const validation = await validateRequest(req, resourceType);

    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors || []);
    }

    return handler(req, validation.data);
  };
}

/**
 * Middleware wrapper for bulk operation API routes with validation
 */
/**
 * Performs with bulk validation operation
 *
 * @param {string} resourceType - The resource type
 * @param {(req} handler - The handler
 * @param {any} validatedData - The validated data
 *
 * @returns {Promise<any>} Promise resolving to withbulkvalidation result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withBulkValidation("example", handler, validatedData);
 */

/**
 * Performs with bulk validation operation
 *
 * @param {string} /** Resource Type */
  resourceType - The /**  resource  type */
  resource type
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 * @param {any} validatedData - The validated data
 *
 * @returns {string} The withbulkvalidation result
 *
 * @example
 * withBulkValidation("example", /** Handler */
  handler, validatedData);
 */

export function withBulkValidation(
  /** Resource Type */
  resourceType: string,
  /** Handler */
  handler: (req: NextRequest, validatedData: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const validation = await validateBulkRequest(req, resourceType);

    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors || []);
    }

    return handler(req, validation.data);
  };
}

/**
 * Sanitize input to prevent XSS and injection attacks
 */
/**
 * Performs sanitize input operation
 *
 * @param {any} input - The input
 *
 * @returns {any} The sanitizeinput result
 *
 * @example
 * sanitizeInput(input);
 */

/**
 * Performs sanitize input operation
 *
 * @param {any} input - The input
 *
 * @returns {any} The sanitizeinput result
 *
 * @example
 * sanitizeInput(input);
 */

export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    // Remove script tags and dangerous attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/javascript:/gi, "")
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }

  return input;
}

/**
 * Validate and sanitize request body
 */
/**
 * Validates and sanitize
 *
 * @param {NextRequest} req - The req
 * @param {string} resourceType - The resource type
 *
 * @returns {Promise<any>} Promise resolving to validateandsanitize result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateAndSanitize(req, "example");
 */

/**
 * Validates and sanitize
 *
 * @returns {Promise<any>} Promise resolving to validateandsanitize result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateAndSanitize();
 */

export async function validateAndSanitize(
  /** Req */
  req: NextRequest,
  /** Resource Type */
  resourceType: string,
): Promise<ValidationResult> {
  const validation = await validateRequest(req, resourceType);

  if (!validation.valid) {
    return validation;
  }

  const sanitized = sanitizeInput(validation.data);

  return {
    /** Valid */
    valid: true,
    /** Data */
    data: sanitized,
  };
}

export default {
  validateRequest,
  validateBulkRequest,
  createValidationErrorResponse,
  withValidation,
  withBulkValidation,
  sanitizeInput,
  validateAndSanitize,
};
