import {
  SEO_CONFIG as APPKIT_SEO_CONFIG,
  createSeoConfig,
  generateMetadata,
  generateProfileMetadata,
  generateProductMetadata,
  generateCategoryMetadata,
  generateBlogMetadata,
  generateAuctionMetadata,
  generateSearchMetadata,
} from "@mohasinac/appkit/seo";

export const SEO_CONFIG = APPKIT_SEO_CONFIG as any;

export {
  createSeoConfig,
  generateMetadata,
  generateProfileMetadata,
  generateProductMetadata,
  generateCategoryMetadata,
  generateBlogMetadata,
  generateAuctionMetadata,
  generateSearchMetadata,
};

export type {
  SeoConfig,
  ProductSeoInput,
  CategorySeoInput,
  BlogSeoInput,
  AuctionSeoInput,
} from "@mohasinac/appkit/seo";
