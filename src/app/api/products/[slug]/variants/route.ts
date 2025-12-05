/**
 * @fileoverview TypeScript Module
 * @module src/app/api/products/[slug]/variants/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextResponse } from "next/server";

// GET /api/products/[slug]/variants - same leaf category
/**
 * Function: G E T
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
  let slug: string | undefined;
  try {
    const awaitedParams = await params;
    slug = awaitedParams.slug;
    const prodSnap = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (prodSnap.empty)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    const prod: any = { id: prodSnap.docs[0].id, ...prodSnap.docs[0].data() };

    let data: any[] = [];
    try {
      // Try indexed query first
      /**
       * Performs same leaf operation
       *
       * @param {any} await Collections.products()
        .where("category_id" - The await  collections.products()
        .where("category_id"
       * @param {any} ["] - The "
       * @param {any} prod.category_id)
        .where("slug" - The prod.category_id)
        .where("slug"
       * @param {string} ["!] - The "!
       * @param {any} [slug)) as any;
      const sameLeafSnap] - The slug)) as any;
      const same leaf snap
       *
       * @returns {any} The sameleaf result
       */

      /**
       * Performs same leaf operation
       *
       * @param {any} await Collections.products()
        .where("category_id" - The await  collections.products()
        .where("category_id"
       * @param {any} ["] - The "
       * @param {any} prod.category_id)
        .where("slug" - The prod.category_id)
        .where("slug"
       * @param {string} ["!] - The "!
       * @param {any} [slug)) as any;
      const sameLeafSnap] - The slug)) as any;
      const same leaf snap
       *
       * @returns {any} The sameleaf result
       */

      const sameLeaf = (await Collections.products()
        .where("category_id", "==", prod.category_id)
        .where("slug", "!=", slug)) as any;
      const sameLeafSnap = await sameLeaf.limit(20).get();
      data = sameLeafSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (indexError: any) {
      // Fallback: get all products in category and filter in-memory
      console.log("Index not ready, using fallback query");
      const allInCategory = await Collections.products()
        .where("category_id", "==", prod.category_id)
        .get();
      data = allInCategory.docs
        .map((d: any) => ({ id: d.id, ...d.data() }))
        .filter((p: any) => p.slug !== slug)
        .slice(0, 20);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.products.slug.variants.GET",
      /** Metadata */
      metadata: { slug },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load variants" },
      { status: 500 },
    );
  }
}
