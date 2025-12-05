/**
 * @fileoverview TypeScript Module
 * @module src/app/api/homepage/faqs/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * const result = GET();
 */
/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

export async function GET() {
  try {
    const db = getFirestoreAdmin();

    // Get all active FAQs
    const faqsSnapshot = await db
      .collection(COLLECTIONS.FAQS)
      .where("is_active", "==", true)
      .orderBy("order", "asc")
      .get();

    /**
 * Performs faqs operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The faqs result
 *
 */
const faqs = faqsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        /** Id */
        id: doc.id,
        /** Question */
        question: data.question,
        /** Answer */
        answer: data.answer,
        /** Category */
        category: data.category,
        /** Order */
        order: data.order || 0,
      };
    });

    return NextResponse.json({ data: faqs });
  } catch (error) {
    console.error("FAQs error:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch FAQs" },
      { status: 500 },
    );
  }
}
