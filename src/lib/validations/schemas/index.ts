/**
 * Shared Validation Schemas - Index
 * Central export for all shared validation schemas
 */

// Re-export all schemas for easy access
export * from './product';
export * from './order';
export * from './user';
export * from './review';

// Import for namespace exports
import * as ProductSchemas from './product';
import * as OrderSchemas from './order';
import * as UserSchemas from './user';
import * as ReviewSchemas from './review';

// Namespace exports for organized imports
export const Schemas = {
  Product: ProductSchemas,
  Order: OrderSchemas,
  User: UserSchemas,
  Review: ReviewSchemas,
};

// Common validation utilities
export { ValidationPatterns, FormValidators, BusinessValidators } from '../index';
