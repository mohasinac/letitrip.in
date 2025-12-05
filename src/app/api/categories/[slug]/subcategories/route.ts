/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/[slug]/subcategories/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * GET /api/categories/[slug]/subcategories
 * Fetch immediate children of a category
 */
/**
 * Performs g e t operation
 *
 * @param {Request} _ - The _
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_, {});
 */

/**
 * Performs g e t operation
 *
 * @param {Request} _ - The _
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_, {});
 */

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // First, get the category by slug
    const categoriesSnapshot = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const categoryDoc = categoriesSnapshot.docs[0];
    const categoryId = categoryDoc.id;

    // Fetch subcategories
    const subcategoriesSnapshot = await Collections.categories()
      .where("parentId", "==", categoryId)
      .where("isActive", "==", true)
      .orderBy("sortOrder", "asc")
      .get();

    /**
 * Performs subcategories operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The subcategories result
 *
 */
const subcategories = subcategoriesSnapshot.docs.map((doc: any) => ({
/**
 * Performs subcategories with counts operation
 *
 * @param {any} subcategories.map(async(cat - The subcategories.map(async(cat
 *
 * @returns {Promise<any>} The subcategorieswithcounts result
 *
 */
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    // Optionally, get product counts for each subcategory
    const subcategoriesWithCounts = await Promise.all(
      subcategories.map(async (cat: any) => {
        const countSnapshot = await Collections.products()
          .where("categoryId", "==", cat.id)
          .where("status", "==", "published")
          .count()
          .get();

        return {
          ...cat,
          /** Product Count */
          productCount: countSnapshot.data().count,
        };
      }),
    );

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: subcategoriesWithCounts,
    });
  } catch (error: any) {
    console.error("Subcategories error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch subcategories",
      },
      { status: 500 },
    );
  }
}
