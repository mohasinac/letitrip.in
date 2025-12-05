/**
 * @fileoverview TypeScript Module
 * @module src/app/api/homepage/banner/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * HOMEPAGE_SETTINGS_DOC constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for homepage settings doc
 */
const HOMEPAGE_SETTINGS_DOC = "homepage_config";
const SETTINGS_COLLECTION = "site_settings";

// GET /api/homepage/banner - Public endpoint for special event banner
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();

    const doc = await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .get();

    if (!doc.exists) {
      // Return default banner settings
      return NextResponse.json({
        /** Enabled */
        enabled: true,
        /** Content */
        content:
          "<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>",
        /** Link */
        link: "/special-offers",
        /** Background Color */
        backgroundColor: "#2563eb",
        /** Text Color */
        textColor: "#ffffff",
      });
    }

    const data = doc.data();
    const banner = data?.specialEventBanner || {
      /** Enabled */
      enabled: true,
      /** Content */
      content:
        "<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>",
      /** Link */
      link: "/special-offers",
      /** Background Color */
      backgroundColor: "#2563eb",
      /** Text Color */
      textColor: "#ffffff",
    };

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error fetching banner settings:", error);
    // Return default on error
    return NextResponse.json({
      /** Enabled */
      enabled: true,
      /** Content */
      content:
        "<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>",
      /** Link */
      link: "/special-offers",
      /** Background Color */
      backgroundColor: "#2563eb",
      /** Text Color */
      textColor: "#ffffff",
    });
  }
}
