/**
 * @fileoverview Type Definitions
 * @module src/components/admin/blog-wizard/types
 * @description This file contains TypeScript type definitions for types
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Blog Form Data interface
 * @interface BlogFormData
 */
export interface BlogFormData {
  /** Title */
  title: string;
  /** Slug */
  slug: string;
  /** Excerpt */
  excerpt: string;
  /** Content */
  content: string;
  /** Category */
  category: string;
  /** Tags */
  tags: string[];
  /** Status */
  status: "draft" | "published";
  /** Featured */
  featured: boolean;
}

/**
 * OnBlogChange type
 * 
 * @typedef {Object} OnBlogChange
 * @description Type definition for OnBlogChange
 */
export type OnBlogChange = (field: keyof BlogFormData, value: any) => void;
