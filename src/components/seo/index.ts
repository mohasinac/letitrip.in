/**
 * SEO Components and Utilities
 * Export all SEO-related functionality
 */

export {
  generateSEOMetadata,
  StructuredData,
  generateStructuredData,
  type SEOProps,
} from './SEOHead';

export {
  generateMetadata,
  generateCategorySchema,
  generateProductSchema,
  generateOrganizationSchema,
  type SEOMetadata,
} from '@/lib/seo/metadata';

export {
  generateWebsiteSchema,
  generateOrganizationSchema as generateOrgSchema,
  generateProductSchema as generateProductStructuredData,
  generateBreadcrumbSchema as generateBreadcrumbStructuredData,
  generateFAQSchema,
  generateReviewSchema,
  generateCollectionPageSchema,
  generateLocalBusinessSchema,
  generateVideoSchema,
  generateOfferSchema,
} from '@/lib/seo/structured-data';
