/**
 * Enhanced Request Validation Middleware
 * Comprehensive validation with schema support and utilities
 */

import { NextRequest } from 'next/server';
import { ZodSchema, ZodError, z } from 'zod';
import { throwApiError } from './error-handler';
import * as schemas from '../../validations';

/**
 * Enhanced validation class with comprehensive schema support
 */
export class ValidationHandler {
  /**
   * Validate request body with enhanced error handling
   */
  static async validateBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
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
   * Validate query parameters with enhanced parsing
   */
  static validateQuery<T>(request: NextRequest, schema: ZodSchema<T>): T {
    try {
      const { searchParams } = new URL(request.url);
      const params: Record<string, any> = {};
      
      // Convert URLSearchParams to object with proper type handling
      searchParams.forEach((value, key) => {
        if (params[key]) {
          if (Array.isArray(params[key])) {
            params[key].push(value);
          } else {
            params[key] = [params[key], value];
          }
        } else {
          // Try to parse as number or boolean for common query param types
          if (value === 'true') params[key] = true;
          else if (value === 'false') params[key] = false;
          else if (/^\d+$/.test(value)) params[key] = parseInt(value, 10);
          else if (/^\d*\.\d+$/.test(value)) params[key] = parseFloat(value);
          else params[key] = value;
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
   * Validate path parameters
   */
  static validateParams<T>(params: Record<string, string | string[]>, schema: ZodSchema<T>): T {
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
   * Pre-built validators for common operations using correct schema names
   */
  static validators = {
    // Authentication operations
    login: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.loginSchema),
    register: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.registerSchema),
    resetPassword: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.resetPasswordSchema),
    changePassword: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.changePasswordSchema),
    forgotPassword: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.forgotPasswordSchema),

    // User operations
    updateProfile: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateProfileSchema),

    // Product operations
    createProduct: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createProductSchema),
    updateProduct: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateProductSchema),
    bulkProductUpdate: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.bulkProductUpdateSchema),
    
    // Order operations
    createOrder: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createOrderSchema),
    updateOrderStatus: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateOrderStatusSchema),
    orderReturn: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.orderReturnSchema),

    // Cart operations
    addToCart: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.addToCartSchema),
    updateCartItem: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateCartItemSchema),

    // Address operations
    address: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.addressSchema),

    // Coupon operations
    createCoupon: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createCouponSchema),
    updateCoupon: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateCouponSchema),
    applyCoupon: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.applyCouponSchema),

    // Category operations
    createCategory: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createCategorySchema),
    updateCategory: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateCategorySchema),
    bulkCategoryUpdate: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.bulkCategoryUpdateSchema),

    // Review operations
    createReview: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createReviewSchema),
    updateReview: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateReviewSchema),
    reviewModeration: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.reviewModerationSchema),

    // Auction operations
    createAuction: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createAuctionSchema),
    placeBid: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.placeBidSchema),

    // Seller operations
    sellerRegistration: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.sellerRegistrationSchema),
    updateSellerProfile: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateSellerProfileSchema),

    // Payment operations
    verifyPayment: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.verifyPaymentSchema),
    refundRequest: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.refundRequestSchema),

    // Shipping operations
    getShippingRates: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.getShippingRatesSchema),
    createShipment: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createShipmentSchema),

    // Notification operations
    createNotification: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createNotificationSchema),

    // Support operations
    createSupportTicket: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.createSupportTicketSchema),
    updateSupportTicket: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.updateSupportTicketSchema),

    // Contact operations
    contactForm: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.contactFormSchema),
    newsletterSubscription: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.newsletterSubscriptionSchema),

    // Admin operations
    adminUserManagement: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.adminUserManagementSchema),
    adminSettings: (request: NextRequest) => 
      ValidationHandler.validateBody(request, schemas.adminSettingsSchema),

    // Query validators
    pagination: (request: NextRequest) => 
      ValidationHandler.validateQuery(request, schemas.paginationSchema),
    productFilter: (request: NextRequest) => 
      ValidationHandler.validateQuery(request, schemas.productFilterSchema),
    orderFilter: (request: NextRequest) => 
      ValidationHandler.validateQuery(request, schemas.orderFilterSchema),
    analyticsFilter: (request: NextRequest) => 
      ValidationHandler.validateQuery(request, schemas.analyticsFilterSchema),
    sort: (request: NextRequest) => 
      ValidationHandler.validateQuery(request, schemas.sortSchema),
  };

  /**
   * Validation helper methods
   */
  static async validateField<T>(schema: ZodSchema<T>, value: T) {
    try {
      return { isValid: true, data: await schema.parseAsync(value), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { 
          isValid: false, 
          data: null, 
          error: error.errors[0]?.message || 'Validation failed' 
        };
      }
      return { isValid: false, data: null, error: 'Validation failed' };
    }
  }

  static async validateForm<T>(schema: ZodSchema<T>, data: unknown) {
    try {
      const validData = await schema.parseAsync(data);
      return { isValid: true, data: validData, errors: null };
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        return { isValid: false, data: null, errors: fieldErrors };
      }
      return { isValid: false, data: null, errors: { general: 'Validation failed' } };
    }
  }
}

/**
 * Enhanced validation wrapper
 */
export function withValidation(validatorName: keyof typeof ValidationHandler.validators) {
  return function (handler: (request: NextRequest, validatedData: any, ...args: any[]) => Promise<any>) {
    return async (request: NextRequest, ...args: any[]) => {
      const validator = ValidationHandler.validators[validatorName];
      const validatedData = await validator(request);
      return handler(request, validatedData, ...args);
    };
  };
}

/**
 * Advanced validation wrapper for complex operations
 */
export function withComplexValidation<TBody = any, TQuery = any, TParams = any>(config: {
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
        validated.body = await ValidationHandler.validateBody(request, config.body);
      }

      // Validate query parameters if schema provided
      if (config.query) {
        validated.query = ValidationHandler.validateQuery(request, config.query);
      }

      // Validate path parameters if schema provided
      if (config.params && context?.params) {
        validated.params = ValidationHandler.validateParams(context.params, config.params);
      }

      return handler(request, validated, ...args);
    };
  };
}

/**
 * Quick validation helpers
 */
export const QuickValidators = {
  /**
   * Validate pagination query
   */
  pagination: (request: NextRequest) => {
    const paginationSchema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      offset: z.coerce.number().int().min(0).optional(),
    });
    return ValidationHandler.validateQuery(request, paginationSchema);
  },

  /**
   * Validate search query
   */
  search: (request: NextRequest) => {
    const searchSchema = z.object({
      q: z.string().min(1).max(200),
      category: z.string().optional(),
      sort: z.enum(['relevance', 'price', 'rating', 'newest']).default('relevance'),
    });
    return ValidationHandler.validateQuery(request, searchSchema);
  },

  /**
   * Validate ID parameter
   */
  id: (id: string) => {
    const idSchema = z.string().min(1, 'ID is required');
    try {
      return idSchema.parse(id);
    } catch (error) {
      throwApiError('Invalid ID parameter', 400, 'INVALID_ID');
    }
  },

  /**
   * Validate email
   */
  email: (email: string) => {
    const emailSchema = z.string().email('Invalid email format');
    try {
      return emailSchema.parse(email);
    } catch (error) {
      throwApiError('Invalid email format', 400, 'INVALID_EMAIL');
    }
  },
};

/**
 * Validation utilities for frontend integration
 */
export const ValidationUtils = {
  /**
   * Get validation errors in frontend-friendly format
   */
  formatErrors: (error: ZodError) => {
    const fieldErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(err.message);
    });
    return fieldErrors;
  },

  /**
   * Create validation summary
   */
  createSummary: (errors: Record<string, string[]>) => {
    const errorCount = Object.keys(errors).length;
    const totalErrors = Object.values(errors).reduce((sum, arr) => sum + arr.length, 0);
    
    return {
      hasErrors: errorCount > 0,
      fieldCount: errorCount,
      totalErrors,
      firstError: Object.values(errors)[0]?.[0],
    };
  },

  /**
   * Validate single field
   */
  validateSingleField: async <T>(schema: ZodSchema<T>, value: T) => {
    try {
      const result = await schema.parseAsync(value);
      return { success: true, data: result, error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          data: null,
          error: error.errors[0]?.message || 'Validation failed',
        };
      }
      return {
        success: false,
        data: null,
        error: 'Validation failed',
      };
    }
  },
};
