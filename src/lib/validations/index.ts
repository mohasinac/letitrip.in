/**
 * Validation Index
 * Central export for all validation schemas and utilities
 */

// Export all comprehensive schemas
export * from "./comprehensive-schemas";

// Export legacy schemas for backward compatibility
export * from "./schemas";

// Additional validation utilities
import { z } from "zod";

/**
 * Common validation patterns used across the application
 */
export const ValidationPatterns = {
  // Email patterns
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Phone patterns (supports various formats)
  phone: {
    indian: /^[+]?91?[-.\s]?[6-9]\d{9}$/,
    international: /^[+]?[\d\s\-\(\)]{10,15}$/,
    generic: /^[+]?[\d\s\-\(\)]{10,15}$/,
  },

  // Indian specific patterns
  pincode: /^\d{6}$/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,

  // Common patterns
  slug: /^[a-z0-9-]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,

  // Security patterns
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  mediumPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/,

  // File patterns
  imageExtensions: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  videoExtensions: /\.(mp4|webm|ogg|avi|mov)$/i,
  documentExtensions: /\.(pdf|doc|docx|txt|rtf)$/i,
};

/**
 * Dynamic validation schema generators
 */
export const createDynamicSchema = {
  /**
   * Create enum schema from array
   */
  enumFromArray: <T extends string>(values: T[], message?: string) =>
    z.enum(values as [T, ...T[]], {
      errorMap: () => ({
        message: message || `Must be one of: ${values.join(", ")}`,
      }),
    }),

  /**
   * Create conditional required field
   */
  conditionalRequired: <T>(
    schema: z.ZodSchema<T>,
    condition: (data: any) => boolean,
  ) =>
    z.union([schema, z.undefined()]).superRefine((value, ctx) => {
      if (condition(ctx.path) && value === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This field is required based on your selection",
        });
      }
    }),

  /**
   * Create min/max length string with custom messages
   */
  stringLength: (min: number, max: number, fieldName: string) =>
    z
      .string()
      .min(min, `${fieldName} must be at least ${min} characters`)
      .max(max, `${fieldName} cannot exceed ${max} characters`),

  /**
   * Create numeric range with custom messages
   */
  numericRange: (min: number, max: number, fieldName: string) =>
    z
      .number()
      .min(min, `${fieldName} must be at least ${min}`)
      .max(max, `${fieldName} cannot exceed ${max}`),

  /**
   * Create array with min/max items
   */
  arrayLength: <T>(
    itemSchema: z.ZodSchema<T>,
    min: number,
    max: number,
    itemName: string,
  ) =>
    z
      .array(itemSchema)
      .min(
        min,
        `At least ${min} ${itemName}${min === 1 ? " is" : "s are"} required`,
      )
      .max(max, `Maximum ${max} ${itemName}s allowed`),

  /**
   * Create file upload schema
   */
  fileUpload: (
    allowedTypes: string[],
    maxSize: number,
    required: boolean = true,
  ) => {
    const baseSchema = z.object({
      url: z.string().url("Please provide a valid file URL"),
      type: z
        .string()
        .refine(
          (type) => allowedTypes.includes(type),
          `File type must be one of: ${allowedTypes.join(", ")}`,
        ),
      size: z
        .number()
        .positive("File size must be positive")
        .max(maxSize, `File size cannot exceed ${maxSize} bytes`),
      name: z.string().min(1, "File name is required"),
    });

    return required ? baseSchema : baseSchema.optional();
  },
};

/**
 * Form validation helpers
 */
export const FormValidators = {
  /**
   * Validate form field in real-time
   */
  validateField: async <T>(schema: z.ZodSchema<T>, value: T) => {
    try {
      await schema.parseAsync(value);
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || "Validation failed",
        };
      }
      return { isValid: false, error: "Validation failed" };
    }
  },

  /**
   * Validate entire form
   */
  validateForm: async <T>(schema: z.ZodSchema<T>, data: unknown) => {
    try {
      const validData = await schema.parseAsync(data);
      return {
        isValid: true,
        data: validData,
        errors: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        });
        return {
          isValid: false,
          data: null,
          errors: fieldErrors,
        };
      }
      return {
        isValid: false,
        data: null,
        errors: { general: "Validation failed" },
      };
    }
  },

  /**
   * Get validation summary
   */
  getValidationSummary: (errors: Record<string, string>) => {
    const errorCount = Object.keys(errors).length;
    const firstError = Object.values(errors)[0];
    return {
      hasErrors: errorCount > 0,
      errorCount,
      summary:
        errorCount === 1 ? firstError : `${errorCount} validation errors found`,
      firstError,
    };
  },
};

/**
 * Custom validation rules for business logic
 */
export const BusinessValidators = {
  /**
   * Validate Indian mobile number
   */
  indianMobile: z
    .string()
    .regex(
      ValidationPatterns.phone.indian,
      "Please enter a valid Indian mobile number",
    ),

  /**
   * Validate GST number
   */
  gstNumber: z
    .string()
    .regex(ValidationPatterns.gst, "Please enter a valid GST number"),

  /**
   * Validate PAN number
   */
  panNumber: z
    .string()
    .regex(ValidationPatterns.pan, "Please enter a valid PAN number"),

  /**
   * Validate IFSC code
   */
  ifscCode: z
    .string()
    .regex(ValidationPatterns.ifsc, "Please enter a valid IFSC code"),

  /**
   * Validate price with currency constraints
   */
  price: (min: number = 0.01, max: number = 10000000) =>
    z
      .number()
      .min(min, `Price must be at least ₹${min}`)
      .max(max, `Price cannot exceed ₹${max.toLocaleString("en-IN")}`),

  /**
   * Validate discount percentage
   */
  discountPercentage: z
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),

  /**
   * Validate Indian pincode
   */
  pincode: z
    .string()
    .regex(ValidationPatterns.pincode, "Please enter a valid 6-digit pincode"),

  /**
   * Validate business hours
   */
  businessHours: z
    .object({
      open: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      close: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      closed: z.boolean(),
    })
    .refine(
      (data) => {
        if (!data.closed) {
          const openTime = new Date(`1970-01-01T${data.open}:00`);
          const closeTime = new Date(`1970-01-01T${data.close}:00`);
          return openTime < closeTime;
        }
        return true;
      },
      {
        message: "Closing time must be after opening time",
        path: ["close"],
      },
    ),

  /**
   * Validate date range
   */
  dateRange: (startField: string = "startDate", endField: string = "endDate") =>
    z
      .object({
        [startField]: z.string().datetime(),
        [endField]: z.string().datetime(),
      })
      .refine(
        (data) => {
          return new Date(data[startField]) < new Date(data[endField]);
        },
        {
          message: "End date must be after start date",
          path: [endField],
        },
      ),

  /**
   * Validate age (18+)
   */
  minimumAge: (minimumAge: number = 18) =>
    z
      .string()
      .datetime()
      .refine(
        (dateString) => {
          const birthDate = new Date(dateString);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            return age - 1 >= minimumAge;
          }
          return age >= minimumAge;
        },
        {
          message: `You must be at least ${minimumAge} years old`,
        },
      ),
};

/**
 * Pre-built form schemas for common use cases
 */
export const CommonFormSchemas = {
  // Simple contact form
  contact: z.object({
    name: createDynamicSchema.stringLength(2, 100, "Name"),
    email: z.string().email("Please enter a valid email address"),
    subject: createDynamicSchema.stringLength(5, 200, "Subject"),
    message: createDynamicSchema.stringLength(10, 1000, "Message"),
  }),

  // Newsletter subscription
  newsletter: z.object({
    email: z.string().email("Please enter a valid email address"),
    preferences: z
      .object({
        weekly: z.boolean().default(true),
        promotional: z.boolean().default(false),
      })
      .optional(),
  }),

  // Basic search
  search: z.object({
    query: z
      .string()
      .min(1, "Search query is required")
      .max(200, "Search query is too long"),
    filters: z.record(z.string()).optional(),
    sort: z.string().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),

  // File upload
  fileUpload: z.object({
    files: z
      .array(
        createDynamicSchema.fileUpload(
          ["image/jpeg", "image/png", "image/webp"],
          5 * 1024 * 1024,
        ),
      )
      .min(1, "At least one file is required")
      .max(10, "Maximum 10 files allowed"),
    category: z.string().optional(),
    description: z.string().max(500, "Description is too long").optional(),
  }),

  // Settings form
  userSettings: z.object({
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean(),
    }),
    privacy: z.object({
      profilePublic: z.boolean(),
      showActivity: z.boolean(),
    }),
    preferences: z.object({
      language: z.enum(["en", "hi"]),
      currency: z.enum(["INR", "USD"]),
      theme: z.enum(["light", "dark", "auto"]),
    }),
  }),
};

/**
 * Export validation error messages
 */
export const ValidationMessages = {
  required: "This field is required",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  password:
    "Password must contain at least 8 characters with uppercase, lowercase, number, and special character",
  confirmPassword: "Passwords do not match",
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Cannot exceed ${max} characters`,
  minValue: (min: number) => `Must be at least ${min}`,
  maxValue: (max: number) => `Cannot exceed ${max}`,
  invalidFormat: "Invalid format",
  future: "Date must be in the future",
  past: "Date must be in the past",
  invalidUrl: "Please enter a valid URL",
  invalidFile: "Invalid file type or size",
  terms: "You must accept the terms and conditions",
  privacy: "You must accept the privacy policy",
  age: "You must be 18 or older",
};
