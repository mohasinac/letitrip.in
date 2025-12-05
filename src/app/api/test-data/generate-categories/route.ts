/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/generate-categories/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextResponse } from "next/server";

/**
 * PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for prefix
 */
const PREFIX = "TEST_";

/**
 * Retrieves unsplash image
 */
/**
 * Retrieves unsplash image
 *
 * @param {string} category - The category
 * @param {number} index - The index
 *
 * @returns {string} The unsplashimage result
 */

/**
 * Retrieves unsplash image
 *
 * @param {string} category - The category
 * @param {number} index - The index
 *
 * @returns {string} The unsplashimage result
 */

function getUnsplashImage(category: string, index: number): string {
  return `https://source.unsplash.com/800x600/?${category}&sig=${index}`;
}

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST();
 */

/**
 * Performs p o s t operation
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST();
 */

export async function POST() {
  try {
    const db = getFirestoreAdmin();
    const categories = [];

    const categoryNames = [
      "Electronics",
      "Fashion",
      "Home & Kitchen",
      "Books",
      "Sports",
      "Toys",
      "Jewelry",
      "Beauty",
      "Automotive",
      "Garden",
    ];

    for (const name of categoryNames) {
      const categoryData: any = {
        /** Name */
        name: `${PREFIX}${name}`,
        /** Slug */
        slug: `${PREFIX}${name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${Date.now()}`,
        /** Description */
        description: `Test category for ${name}`,
        parent_id: null,
        is_active: true,
        is_featured: Math.random() < 0.3,
        show_on_homepage: Math.random() < 0.2,
        sort_order: categories.length,
        /** Image */
        image: getUnsplashImage(name.toLowerCase(), categories.length),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await db
        .collection(COLLECTIONS.CATEGORIES)
        .add(categoryData);
      categories.push({ id: docRef.id, ...categoryData });
    }

    return NextResponse.json({
      /** Success */
      success: true,
      categories,
      /** Count */
      count: categories.length,
    });
  } catch (error: any) {
    logError(error as Error, { component: "API.testData.generateCategories" });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to generate categories",
      },
      { status: 500 },
    );
  }
}
