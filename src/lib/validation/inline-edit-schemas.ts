/**
 * Validation Schemas for Inline Edit & Quick Create Forms
 * Provides client-side and server-side validation rules
 */

import { InlineField } from '@/types/inline-edit';

// Common validation patterns
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/,
  phone: /^\+?[\d\s()-]{10,}$/,
};

// Validation helper functions
export const validators = {
  required: (value: any, fieldName: string): string | null => {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value: string): string | null => {
    if (value && !PATTERNS.email.test(value)) {
      return 'Invalid email address';
    }
    return null;
  },

  url: (value: string): string | null => {
    if (value && !PATTERNS.url.test(value)) {
      return 'Invalid URL (must start with http:// or https://)';
    }
    return null;
  },

  slug: (value: string): string | null => {
    if (value && !PATTERNS.slug.test(value)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    return null;
  },

  minLength: (value: string, min: number): string | null => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value: string, max: number): string | null => {
    if (value && value.length > max) {
      return `Must be at most ${max} characters`;
    }
    return null;
  },

  min: (value: number, min: number): string | null => {
    if (value !== undefined && value < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  max: (value: number, max: number): string | null => {
    if (value !== undefined && value > max) {
      return `Must be at most ${max}`;
    }
    return null;
  },

  pattern: (value: string, pattern: RegExp, message: string): string | null => {
    if (value && !pattern.test(value)) {
      return message;
    }
    return null;
  },

  custom: (value: any, validator: (val: any) => boolean, message: string): string | null => {
    if (value && !validator(value)) {
      return message;
    }
    return null;
  },
};

// Hero Slides validation schema
export const heroSlideFields: InlineField[] = [
  {
    key: 'title',
    type: 'text',
    label: 'Title',
    required: true,
    placeholder: 'Enter slide title',
    validate: (value) => {
      const required = validators.required(value, 'Title');
      if (required) return required;
      return validators.maxLength(value, 100);
    },
  },
  {
    key: 'subtitle',
    type: 'text',
    label: 'Subtitle',
    placeholder: 'Enter subtitle (optional)',
    validate: (value) => validators.maxLength(value, 200),
  },
  {
    key: 'image_url',
    type: 'image',
    label: 'Image',
    required: true,
    placeholder: 'hero-slide',
    validate: (value) => {
      const required = validators.required(value, 'Image');
      if (required) return required;
      return validators.url(value);
    },
  },
  {
    key: 'link_url',
    type: 'url',
    label: 'Link URL',
    placeholder: '/products',
    validate: (value) => value ? validators.url(value) : null,
  },
  {
    key: 'is_active',
    type: 'checkbox',
    label: 'Active',
  },
  {
    key: 'show_in_carousel',
    type: 'checkbox',
    label: 'Show in Carousel',
  },
];

// Category validation schema
export const categoryFields: InlineField[] = [
  {
    key: 'name',
    type: 'text',
    label: 'Name',
    required: true,
    placeholder: 'Category name',
    validate: (value) => {
      const required = validators.required(value, 'Name');
      if (required) return required;
      return validators.maxLength(value, 50);
    },
  },
  {
    key: 'slug',
    type: 'text',
    label: 'Slug',
    required: true,
    placeholder: 'category-slug',
    validate: (value) => {
      const required = validators.required(value, 'Slug');
      if (required) return required;
      return validators.slug(value);
    },
  },
  {
    key: 'image_url',
    type: 'image',
    label: 'Icon',
    placeholder: 'category',
    validate: (value) => value ? validators.url(value) : null,
  },
  {
    key: 'is_featured',
    type: 'checkbox',
    label: 'Featured',
  },
  {
    key: 'is_active',
    type: 'checkbox',
    label: 'Active',
  },
];

// Product validation schema
export const productFields: InlineField[] = [
  {
    key: 'name',
    type: 'text',
    label: 'Product Name',
    required: true,
    placeholder: 'Enter product name',
    validate: (value) => {
      const required = validators.required(value, 'Product name');
      if (required) return required;
      return validators.maxLength(value, 100);
    },
  },
  {
    key: 'price',
    type: 'number',
    label: 'Price (₹)',
    required: true,
    min: 0,
    step: 0.01,
    validate: (value) => {
      const required = validators.required(value, 'Price');
      if (required) return required;
      return validators.min(parseFloat(value), 0);
    },
  },
  {
    key: 'stockCount',
    type: 'number',
    label: 'Stock',
    required: true,
    min: 0,
    validate: (value) => {
      const required = validators.required(value, 'Stock');
      if (required) return required;
      return validators.min(parseInt(value), 0);
    },
  },
  {
    key: 'image_url',
    type: 'image',
    label: 'Image',
    required: true,
    placeholder: 'product',
    validate: (value) => {
      const required = validators.required(value, 'Image');
      if (required) return required;
      return validators.url(value);
    },
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    required: true,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' },
    ],
  },
];

// Auction validation schema
export const auctionFields: InlineField[] = [
  {
    key: 'title',
    type: 'text',
    label: 'Auction Title',
    required: true,
    placeholder: 'Enter auction title',
    validate: (value) => {
      const required = validators.required(value, 'Title');
      if (required) return required;
      return validators.maxLength(value, 100);
    },
  },
  {
    key: 'starting_bid',
    type: 'number',
    label: 'Starting Bid (₹)',
    required: true,
    min: 1,
    step: 1,
    validate: (value) => {
      const required = validators.required(value, 'Starting bid');
      if (required) return required;
      return validators.min(parseFloat(value), 1);
    },
  },
  {
    key: 'start_time',
    type: 'date',
    label: 'Start Time',
    required: true,
    validate: (value) => {
      const required = validators.required(value, 'Start time');
      if (required) return required;
      
      const startDate = new Date(value);
      const now = new Date();
      
      if (startDate < now) {
        return 'Start time must be in the future';
      }
      return null;
    },
  },
  {
    key: 'end_time',
    type: 'date',
    label: 'End Time',
    required: true,
    validate: (value, formData) => {
      const required = validators.required(value, 'End time');
      if (required) return required;
      
      const endDate = new Date(value);
      const startDate = new Date(formData?.start_time);
      
      if (endDate <= startDate) {
        return 'End time must be after start time';
      }
      return null;
    },
  },
  {
    key: 'image_url',
    type: 'image',
    label: 'Image',
    required: true,
    placeholder: 'auction',
    validate: (value) => {
      const required = validators.required(value, 'Image');
      if (required) return required;
      return validators.url(value);
    },
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    required: true,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'live', label: 'Live' },
      { value: 'ended', label: 'Ended' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
];

// User validation schema
export const userFields: InlineField[] = [
  {
    key: 'name',
    type: 'text',
    label: 'Full Name',
    required: true,
    validate: (value) => {
      const required = validators.required(value, 'Name');
      if (required) return required;
      return validators.maxLength(value, 100);
    },
  },
  {
    key: 'email',
    type: 'email',
    label: 'Email',
    required: true,
    validate: (value) => {
      const required = validators.required(value, 'Email');
      if (required) return required;
      return validators.email(value);
    },
  },
  {
    key: 'role',
    type: 'select',
    label: 'Role',
    required: true,
    options: [
      { value: 'user', label: 'User' },
      { value: 'seller', label: 'Seller' },
      { value: 'admin', label: 'Admin' },
    ],
  },
  {
    key: 'is_banned',
    type: 'checkbox',
    label: 'Banned',
  },
];

// Validation schema map
export const validationSchemas = {
  'hero-slides': heroSlideFields,
  'categories': categoryFields,
  'products': productFields,
  'auctions': auctionFields,
  'users': userFields,
};

// Get validation schema by resource name
export function getValidationSchema(resourceName: string): InlineField[] {
  return validationSchemas[resourceName as keyof typeof validationSchemas] || [];
}

// Validate form data against schema
export function validateFormData(
  data: Record<string, any>,
  fields: InlineField[]
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
    if (field.validate && value !== undefined && value !== null && value !== '') {
      const error = field.validate(value, data);
      if (error) {
        errors[field.key] = error;
      }
    }

    // Type-specific validation
    if (value !== undefined && value !== null && value !== '') {
      switch (field.type) {
        case 'email':
          const emailError = validators.email(value);
          if (emailError) errors[field.key] = emailError;
          break;

        case 'url':
          const urlError = validators.url(value);
          if (urlError) errors[field.key] = urlError;
          break;

        case 'number':
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
export function validateBulkAction(
  action: string,
  resourceType: string,
  data?: Record<string, any>
): { valid: boolean; error?: string } {
  // Validate action exists for resource type
  const validActions: Record<string, string[]> = {
    'hero-slides': ['activate', 'deactivate', 'add-to-carousel', 'remove-from-carousel', 'delete'],
    'categories': ['activate', 'deactivate', 'feature', 'unfeature', 'delete'],
    'products': ['publish', 'draft', 'archive', 'update-stock', 'delete'],
    'auctions': ['schedule', 'cancel', 'end', 'delete'],
    'users': ['make-seller', 'make-user', 'ban', 'unban'],
  };

  const actions = validActions[resourceType];
  if (!actions || !actions.includes(action)) {
    return {
      valid: false,
      error: `Invalid action '${action}' for resource '${resourceType}'`,
    };
  }

  // Validate required data for specific actions
  if (action === 'update-stock' && !data?.stockCount) {
    return {
      valid: false,
      error: 'Stock count is required for update-stock action',
    };
  }

  return { valid: true };
}

export default {
  validators,
  validationSchemas,
  getValidationSchema,
  validateFormData,
  validateBulkAction,
};
