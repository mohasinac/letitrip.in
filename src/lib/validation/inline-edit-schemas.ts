/**
 * @fileoverview TypeScript Module
 * @module src/lib/validation/inline-edit-schemas
 * @description This file contains functionality related to inline-edit-schemas
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Validation Schemas for Inline Edit & Quick Create Forms
 * Provides client-side and server-side validation rules
 */

import { InlineField } from "@/types/inline-edit";

// Common validation patterns
/**
 * PATTERNS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for patterns
 */
const PATTERNS = {
  /** Email */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^(https?:\/\/.+|\/[^\s]*)/, // Allow http(s):// URLs OR relative paths starting with /
  /** Slug */
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /** Alphanumeric */
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  /** Numeric */
  numeric: /^\d+$/,
  /** Decimal */
  decimal: /^\d+(\.\d{1,2})?$/,
  /** Phone */
  phone: /^\+?[\d\s()-]{10,}$/,
};

// Validation helper functions
/**
 * Performs validators operation
 *
 * @param {any} value - The value
 * @param {string} fieldName - The fieldname
 *
 * @returns {string | null =>} The validators result
 *
 * @example
 * validators(value, "example");
 */
export const validators = {
  /** Required */
  required: (value: any, fieldName: string): string | null => {
    if (value === undefined || value === null || value === "") {
      return `${fieldName} is required`;
    }
    return null;
  },

  /** Email */
  email: (value: string): string | null => {
    if (value && !PATTERNS.email.test(value)) {
      return "Invalid email address";
    }
    return null;
  },

  /** Url */
  url: (value: string): string | null => {
    if (value && !PATTERNS.url.test(value)) {
      return "Invalid URL (must be an absolute URL or relative path like /products)";
    }
    return null;
  },

  /** Slug */
  slug: (value: string): string | null => {
    if (value && !PATTERNS.slug.test(value)) {
      return "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    return null;
  },

  /** Min Length */
  minLength: (value: string, min: number): string | null => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  /** Max Length */
  maxLength: (value: string, max: number): string | null => {
    if (value && value.length > max) {
      return `Must be at most ${max} characters`;
    }
    return null;
  },

  /** Min */
  min: (value: number, min: number): string | null => {
    if (value !== undefined && value < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  /** Max */
  max: (value: number, max: number): string | null => {
    if (value !== undefined && value > max) {
      return `Must be at most ${max}`;
    }
    return null;
  },

  /** Pattern */
  pattern: (value: string, pattern: RegExp, message: string): string | null => {
    if (value && !pattern.test(value)) {
      return message;
    }
    return null;
  },

  /** Custom */
  custom: (
    /** Value */
    value: any,
    /** Validator */
 /**
 * Performs hero slide fields operation
 *
 * @param {any} value - The value
 *
 * @returns {any} The heroslidefields result
 *
 * @example
 * heroSlideFields(value);
 */
   validator: (_val: any) => boolean,
    /** Message */
    message: string,
  ): string | null => {
    if (value && !validator(value)) {
      return message;
    }
    return null;
  },
};

// Hero Slides validation schema
export const heroSlideFields: InlineField[] = [
  {
    /** Key */
    key: "title",
    /** Type */
    type: "text",
    /** Label */
    label: "Title",
    /** Required */
    required: true,
    /** Placeholder */
    placeholder: "Enter slide title",
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Title");
      if (required) return required;
      return validators.maxLength(value, 100);
    },
  },
  {
    /** Key */
    key: "subtitle",
    /** Type */
    type: "text",
    /** Label */
    label: "Subtitle",
    /** Pla/**
 * Performs required operation
 *
 * @param {any} value - The value
 * @param {any} "Image" - The "image"
 *
 * @returns {any} The required result
 *
 */
ceholder */
    placeholder: "Enter subtitle (optional)",
    /** Validate */
    validate: (value) => validators.maxLength(value, 200),
  },
  {
    /** Key */
    key: "image_url",
    /** Type */
    type: "image",
    /** Label */
    label: "Image",
    /** Required */
    required: true,
    /** Placeholder */
    placeholder: "hero-slide",
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Image");
      if (required) return required;
      return validators.url(value);
   /**
 * Performs category fields operation
 *
 * @param {any} value - The value
 *
 * @returns {any} The categoryfields result
 *
 * @example
 * categoryFields(value);
 */
 },
  },
  {
    /** Key */
    key: "link_url",
    /** Type */
    type: "url",
    /** Label */
    label: "Link URL",
    /** Placeholder */
    placeholder: "/products",
    /** Validate */
    validate: (value) => (value ? validators.url(value) : null),
  },
  {
    /** Key */
    key: "is_active",
    /** Type */
    type: "checkbox",
    /** Label */
    label: "Active",
  },
  {
    /** Key */
    key: "show_in_carousel",
    /** Type */
    type: "checkbox",
    /** Label */
    label: "Show in Carousel",
  },
];

// Cat/**
 * Performs required operation
 *
 * @param {any} value - The value
 * @param {any} "Slug" - The "slug"
 *
 * @returns {any} The required result
 *
 */
egory validation schema
export const categoryFields: InlineField[] = [
  {
    /** Key */
    key: "name",
    /** Type */
    type: "text",
    /** Label */
    label: "Name",
    /** Required */
    required: true,
    /** Placeholder */
    placeholder: "Category name",
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Name");
      if (required) return required;
      return validators.maxLength(value, 50);
    },
  },
  {
    /** Key */
    key: "slug",
    /**/**
 * Performs product fields operation
 *
 * @param {any} value - The value
 *
 * @returns {any} The productfields result
 *
 * @example
 * productFields(value);
 */
 Type */
    type: "text",
    /** Label */
    label: "Slug",
    /** Required */
    required: true,
    /** Placeholder */
    placeholder: "category-slug",
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Slug");
      if (required) return required;
      return validators.slug(value);
    },
  },
  {
    /** Key */
    key: "image_url",
    /** Type */
    type: "image",
    /** Label */
    label: "Icon",
    /** Placeholder */
    placeholder: "category",
    /** Validate */
    validate: (value) => (value ? /**
 * Performs required operation
 *
 * @param {any} value - The value
 * @param {any} "Price" - The "price"
 *
 * @returns {any} The required result
 *
 */
validators.url(value) : null),
  },
  {
    /** Key */
    key: "is_featured",
    /** Type */
    type: "checkbox",
    /** Label */
    label: "Featured",
  },
  {
    /** Key */
    key: "is_active",
    /** Type */
    type: "checkbox",
    /** Label */
    label: "Active",
  },
];

// Product validation schema
export const productFields: InlineField[] = [
  {
    /** Key */
    key: "name",
    /** Type */
    type: "text",
    /** Label */
    label: "Product Name",
    /** Required */
    required: true,
    /** Placeholder */
    placeholder: "Enter product name",
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Product name");
      if (required) return required;
      return validators.maxLength(value, 100);
    },
  },
  {
    /** Key */
    key: "price",
    /** Type */
    type: "number",
    /** Label */
    label: "Price (₹)",
    /** Required */
    required: true,
    /** Min */
    min: 0,
    /** Step */
    step: 0.01,
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Price");
      if (required) return required;
    /**
 * Performs auction fields operation
 *
 * @param {any} value - The value
 *
 * @returns {any} The auctionfields result
 *
 * @example
 * auctionFields(value);
 */
  return validators.min(parseFloat(value), 0);
    },
  },
  {
    /** Key */
    key: "stockCount",
    /** Type */
    type: "number",
    /** Label */
    label: "Stock",
    /** Required */
    required: true,
    /** Min */
    min: 0,
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Stock");
      if (required) return required;
      return validators.min(parseInt(value), 0);
    },
  },
  {
    /** Key */
    key: "image_url",
    /** Type */
    type: "image",
    /** Label */
    label: "Image",
    /** Required */**
 * Performs required operation
 *
 * @param {any} value - The value
 * @param {any} "Startingbid" - The "startingbid"
 *
 * @returns {any} The required result
 *
 */
/
    required: true,
    /** Placeholder */
    placeholder: "product",
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Image");
      if (required) return required;
      return validators.url(value);
    },
  },
  {
    /** Key */
    key: "status",
    /** Type */
    type: "select",
    /** Label */
    label: "Status",
    /** Required */
    required: true,
    /** Options */
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ],
  },
];

// Auction validation schema
export const auctionFields: InlineField[] = [
  {
    /** Key */
    key: "title",
    /** Type */
    type: "text",
    /** Label */
    label: "Auction Title",
    /** Required */
    required: true,
    /** Placeholder */
    placeholder: "Enter auction title",
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Title");
      if (required) return required;
      return validators.maxLength(value, 100);
    },
  },
  {
    /** Key */
    key: "starting_bid",
    /** Type */
    type: "number",
    /** Label */
    label: "Starting Bid (₹)",
    /** Required */
    required: true,
    /** Min */
    min: 1,
    /** Step */
    step: 1,
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Starting bid");
      if (required) return required;
      return validators.min(parseFloat(value), 1);
    },
  },
  {
    /** Key */
    key: "start_time",
    /** Type */
    type: "date",
    /** Label */
    label: "Start Time",
    /** Required */
    required: true,
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Start time");
      if (required) return required;

      const startDate/**
 * Custom React hook for r fields
 *
 * @param {any} value - The value
 *
 * @returns {any} The userfields result
 *
 * @example
 * userFields(value);
 */
 = new Date(value);
      const now = new Date();

      if (startDate < now) {
        return "Start time must be in the future";
      }
      return null;
    },
  },
  {
    /** Key */
    key: "end_time",
    /** Type */
    type: "date",
    /** Label */
    label: "End Time",
    /** Required */
    required: true,
    /** Validate */
    validate: (value, formData) => {
      const required = validators.required(value, "End time");
      if (required) return required;

      const endDate = new Date(value);
      const startDate = new Date(formData?.start_time);

      if (endDate <= startDate) {
        return "End time must be after start time";
      }
      return null;
    },
  },
  {
    /** Key */
    key: "image_url",
    /** Type */
    type: "image",
    /** Label */
    label: "Image",
    /** Required */
    required: true,
    /** Placeholder */
    placeholder: "auction",
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Image");
      if (required) return required;
      return validators.url(value);
    },
  },
  {
    /** Key */
    key: "status",
    /** Type */
    type: "select",
    /** Label */
    label: "Status",
    /** Required */
    required: true,
    /** Options */
    options: [
      { value: "draft", label: "Draft" },
      { value: "scheduled", label: "Scheduled" },
      { value: "live", label: "Live" },
      { value: "ended", label: "Ended" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

// User validation schema
export const userFields: InlineField[] = [
  {
    /** Key */
    key: "name",
    /** Type */
    type: "text",
    /** Label */
    label: "Full Name",
    /** Required */
    required: true,
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Name");
      if (required) return required;
      return validators.maxLength(value, 100);
    },
  },
  {
    /** Key */
    key: "email",
    /** Type */
    type: "email",
    /** Label */
    label: "Email",
    /** Required */
    required: true,
    /** Validate */
    validate: (value) => {
      const required = validators.required(value, "Email");
      if (required) return required;
      return validators.email(value);
    },
  },
  {
    /** Key */
    key: "role",
    /** Type */
    type: "select",
    /** Label */
    label: "Role",
    /** Required */
    required: true,
    /** Options */
    options: [
      { value: "user", label: "User" },
      { value: "seller", labe/**
 * Performs errors operation
 *
 * @param {any} (field - The (field
 *
 * @returns {any} The errors result
 *
 */
l: "Seller" },
      { value: "admin", label: "Admin" },
    ],
  },
  {
    /** Key */
    key: "is_banned",
    /** Type */
    type: "checkbox",
    /** Label */
    label: "Banned",
  },
];

// Validation schema map
export const validationSchemas = {
  "hero-slides": heroSlideFields,
  /** Categories */
  categories: categoryFields,
  /** Products */
  products: productFields,
  /** Auctions */
  auctions: auctionFields,
  /** Users */
  users: userFields,
};

// Get validation schema by resource name
/**
 * Retrieves validation schema
 */
/**
 * Retrieves validation schema
 *
 * @param {string} resourceName - Name of resource
 *
 * @returns {string} The validationschema result
 *
 * @example
 * getValidationSchema("example");
 */

/**
 * Retrieves validation schema
 *
 * @param {string} resourceName - Name of resource
 *
 * @returns {string} The validationschema result
 *
 * @example
 * getValidationSchema("example");
 */

export function getValidationSchema(resourceName: string): InlineField[] {
  return (
    validationSchemas[resourceName as keyof typeof validationSchemas] || []
  );
}

// Validate form data against schema
/**
 * Function: Validate Form Data
 */
/**
 * Validates form data
 *
 * @param {Record<string, any>} data - Data object containing information
 * @param {InlineField[]} fields - The fields
 *
 * @returns {any} The validateformdata result
 *
 * @example
 * validateFormData(data, fields);
 */

/**
 * Validates form data
 *
 * @returns {any} The validateformdata result
 *
 * @example
 * validateFormData();
 */

export function validateFormData(
  /** Data */
  data: Record<string, any>,
  /** Fields */
  fields: InlineField[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const value = data[field.key];

    // Check required
    if (field.required) {
      const error = validators.required(value, field.label);
      if (error) {
        errors[field.key] = error;
        return;
      }
    }

    // Custom validation
    if (
      field.validate &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      const error = field.validate(value, data);
      if (error) {
        errors[field.key] = error;
      }
    }

    // Type-specific validation
    if (value !== undefined && value !== null && value !== "") {
      switch (field.type) {
        case "email":
          const emailError = validators.email(value);
          if (emailError) errors[field.key] = emailError;
          break;

        case "url":
          const urlError = validators.url(value);
          if (urlError) errors[field.key] = urlError;
          break;

        case "number":
          if (field.min !== undefined) {
            const minError = validators.min(parseFloat(value), field.min);
            if (minError) errors[field.key] = minError;
          }
          if (field.max !== undefined) {
            const maxError = validators.max(parseFloat(value), field.max);
            if (maxError) errors[field.key] = maxError;
          }
          break;
      }
    }
  });

  return errors;
}

// Server-side validation for bulk operations
/**
 * Function: Validate Bulk Action
 */
/**
 * Validates bulk action
 *
 * @param {string} action - The action
 * @param {string} resourceType - The resource type
 * @param {Record<string, any>} [data] - Data object containing information
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validateBulkAction("example", "example", data);
 */

/**
 * Validates bulk action
 *
 * @returns {string} The validatebulkaction result
 *
 * @example
 * validateBulkAction();
 */

export function validateBulkAction(
  /** Action */
  action: string,
  /** Resource Type */
  resourceType: string,
  /** Data */
  data?: Record<string, any>,
): { valid: boolean; error?: string } {
  // Validate action exists for resource type
  const validActions: Record<string, string[]> = {
    "hero-slides": [
      "activate",
      "deactivate",
      "add-to-carousel",
      "remove-from-carousel",
      "delete",
    ],
    /** Categories */
    categories: ["activate", "deactivate", "feature", "unfeature", "delete"],
    /** Products */
    products: ["publish", "draft", "archive", "update-stock", "delete"],
    /** Auctions */
    auctions: ["schedule", "cancel", "end", "delete"],
    /** Users */
    users: ["make-seller", "make-user", "ban", "unban"],
  };

  const actions = validActions[resourceType];
  if (!actions || !actions.includes(action)) {
    return {
      /** Valid */
      valid: false,
      /** Error */
      error: `Invalid action '${action}' for resource '${resourceType}'`,
    };
  }

  // Validate required data for specific actions
  if (action === "update-stock" && !data?.stockCount) {
    return {
      /** Valid */
      valid: false,
      /** Error */
      error: "Stock count is required for update-stock action",
    };
  }

  return { valid: true };
}

const inlineEditSchemas = {
  validators,
  validationSchemas,
  getValidationSchema,
  validateFormData,
  validateBulkAction,
};

export default inlineEditSchemas;
