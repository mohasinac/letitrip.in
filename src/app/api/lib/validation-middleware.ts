/**
 * API Request Validation Middleware
 * Provides server-side validation for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateFormData, getValidationSchema, validateBulkAction } from '@/lib/validation/inline-edit-schemas';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  data?: any;
}

/**
 * Validate request body against a validation schema
 */
export async function validateRequest(
  req: NextRequest,
  resourceType: string
): Promise<ValidationResult> {
  try {
    const body = await req.json();
    const schema = getValidationSchema(resourceType);

    if (!schema || schema.length === 0) {
      return {
        valid: false,
        errors: [{ field: '_general', message: `No validation schema found for ${resourceType}` }],
      };
    }

    const validationErrors = validateFormData(body, schema);
    
    if (Object.keys(validationErrors).length > 0) {
      const errors: ValidationError[] = Object.entries(validationErrors).map(([field, message]) => ({
        field,
        message,
      }));

      return {
        valid: false,
        errors,
      };
    }

    return {
      valid: true,
      data: body,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ field: '_general', message: 'Invalid request body' }],
    };
  }
}

/**
 * Validate bulk operation request
 */
export async function validateBulkRequest(
  req: NextRequest,
  resourceType: string
): Promise<ValidationResult> {
  try {
    const body = await req.json();
    
    const { action, ids, data } = body;

    if (!action || typeof action !== 'string') {
      return {
        valid: false,
        errors: [{ field: 'action', message: 'Action is required and must be a string' }],
      };
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        valid: false,
        errors: [{ field: 'ids', message: 'IDs must be a non-empty array' }],
      };
    }

    // Validate action is valid for resource type
    const actionValidation = validateBulkAction(action, resourceType, data);
    if (!actionValidation.valid) {
      return {
        valid: false,
        errors: [{ field: 'action', message: actionValidation.error || 'Invalid action' }],
      };
    }

    return {
      valid: true,
      data: body,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ field: '_general', message: 'Invalid request body' }],
    };
  }
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(errors: ValidationError[]): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation failed',
      errors: errors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
      }, {} as Record<string, string>),
    },
    { status: 400 }
  );
}

/**
 * Middleware wrapper for API routes with validation
 */
export function withValidation(
  resourceType: string,
  handler: (req: NextRequest, validatedData: any) => Promise<NextResponse>
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
export function withBulkValidation(
  resourceType: string,
  handler: (req: NextRequest, validatedData: any) => Promise<NextResponse>
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
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove script tags and dangerous attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
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
export async function validateAndSanitize(
  req: NextRequest,
  resourceType: string
): Promise<ValidationResult> {
  const validation = await validateRequest(req, resourceType);
  
  if (!validation.valid) {
    return validation;
  }
  
  const sanitized = sanitizeInput(validation.data);
  
  return {
    valid: true,
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
