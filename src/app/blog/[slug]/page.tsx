/**
 * @fileoverview React Component
 * @module src/app/blog/[slug]/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";

/**
 * Props type
 * 
 * @typedef {Object} Props
 * @description Type definition for Props
 */
type Props = {
  /** Params */
  params: Promise<{ slug: string }>;
};

/**
 * Function: Generate Metadata
 */
/**
 * Performs generate metadata operation
 *
 * @param {Props} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to generatemetadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * generateMetadata({ params });
 */

/**
 * Performs generate metadata operation
 *
 * @param {Props} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to generatemetadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * generateMetadata({ params });
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    /** Title */
    title: `Blog Post | Letitrip`,
    /** Description */
    description: "Read our latest blog post",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
