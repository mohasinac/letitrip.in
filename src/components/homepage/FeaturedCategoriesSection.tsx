/**
 * @fileoverview React Component
 * @module src/components/homepage/FeaturedCategoriesSection
 * @description This file contains the FeaturedCategoriesSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import FeaturedSection from "@/components/common/FeaturedSection";
import { homepageService } from "@/services/homepage.service";
import type { CategoryWithItems } from "@/services/homepage.service";
import { FolderTree } from "lucide-react";

/**
 * FeaturedCategoriesSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FeaturedCategoriesSectionProps
 */
interface FeaturedCategoriesSectionProps {
  /** Category Limit */
  categoryLimit?: number;
  /** Items Per Category */
  itemsPerCategory?: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Featured Categories Section
 */
/**
 * Performs featured categories section operation
 *
 * @param {FeaturedCategoriesSectionProps} [{
  categoryLimit] - The {
  category limit
 *
 * @returns {any} The featuredcategoriessection result
 *
 * @example
 * FeaturedCategoriesSection({
  categoryLimit);
 */

/**
 * Performs featured categories section operation
 *
 * @param {FeaturedCategoriesSectionProps} [{
  categoryLimit] - The {
  category limit
 *
 * @returns {any} The featuredcategoriessection result
 *
 * @example
 * FeaturedCategoriesSection({
  categoryLimit);
 */

/**
 * Performs featured categories section operation
 *
 * @param {FeaturedCategoriesSectionProps} [{
  categoryLimit = 6,
