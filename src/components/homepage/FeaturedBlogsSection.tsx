/**
 * @fileoverview React Component
 * @module src/components/homepage/FeaturedBlogsSection
 * @description This file contains the FeaturedBlogsSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import FeaturedSection from "@/components/common/FeaturedSection";
import { homepageService } from "@/services/homepage.service";
import type { BlogPostFE } from "@/services/homepage.service";
import { BookOpen } from "lucide-react";

/**
 * FeaturedBlogsSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FeaturedBlogsSectionProps
 */
interface FeaturedBlogsSectionProps {
  /** Limit */
  limit?: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Featured Blogs Section
 */
/**
 * Performs featured blogs section operation
 *
 * @param {FeaturedBlogsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The featuredblogssection result
 *
 * @example
 * FeaturedBlogsSection({
  limit);
 */

/**
 * Performs featured blogs section operation
 *
 * @param {FeaturedBlogsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The featuredblogssection result
 *
 * @example
 * FeaturedBlogsSection({
  limit);
