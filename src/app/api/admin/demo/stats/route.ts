/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/stats/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { safeToISOString } from "@/lib/date-utils";
import { COLLECTIONS } from "@/constants/database";

// Disable caching for live stats
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * DEMO_PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for demo prefix
 */
const DEMO_PREFIX = "DEMO_";

/**
 * Get statistics for existing demo data with DEMO_ prefix
 * GET /api/admin/demo/stats
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

    // Count documents with DEMO_ prefix in each collection
    const [
      categoriesSnapshot,
      usersSnapshot,
      shopsSnapshot,
      productsSnapshot,
      auctionsSnapshot,
      bidsSnapshot,
      ordersSnapshot,
      paymentsSnapshot,
      shipmentsSnapshot,
      reviewsSnapshot,
      heroSlidesSnapshot,
      favoritesSnapshot,
      cartsSnapshot,
      notificationsSnapshot,
    ] = await Promise.all([
      db
        .collection(COLLECTIONS.CATEGORIES)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.USERS)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.SHOPS)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.PRODUCTS)
        .where("name", ">=", DEMO_PREFIX)
        .where("name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.AUCTIONS)
        .where("title", ">=", DEMO_PREFIX)
        .where("title", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.BIDS)
        .where("bidderName", ">=", DEMO_PREFIX)
        .where("bidderName", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.ORDERS)
        .where("buyerName", ">=", DEMO_PREFIX)
        .where("buyerName", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.PAYMENTS)
        .where("transactionId", ">=", DEMO_PREFIX)
        .where("transactionId", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.SHIPMENTS)
        .where("trackingNumber", ">=", DEMO_PREFIX)
        .where("trackingNumber", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.REVIEWS)
        .where("user_name", ">=", DEMO_PREFIX)
        .where("user_name", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db
        .collection(COLLECTIONS.HERO_SLIDES)
        .where("title", ">=", DEMO_PREFIX)
        .where("title", "<", DEMO_PREFIX + "\uf8ff")
        .get(),
      db.collection(COLLECTIONS.FAVORITES).get(), // Favorites don't have DEMO_ prefix, count all for demo users
      db.collection(COLLECTIONS.CARTS).get(), // Carts don't have DEMO_ prefix, count all for demo users
      db.collection(COLLECTIONS.NOTIFICATIONS).get(), // Notifications don't have DEMO_ prefix
    ]);

    const categories = categoriesSnapshot.size;
    const users = usersSnapshot.size;
    const shops = shopsSnapshot.size;
    const products = productsSnapshot.size;
    const auctions = auctionsSnapshot.size;
    const bids = bidsSnapshot.size;
    const orders = ordersSnapshot.size;
    const payments = paymentsSnapshot.size;
    const shipments = shipmentsSnapshot.size;
    const reviews = reviewsSnapshot.size;
    const heroSlides = heroSlidesSnapshot.size;
    const favorites = favoritesSnapshot.size;
    const carts = cartsSnapshot.size;
    const notifications = notificationsSnapshot.size;

    // Get the latest creation timestamp
    let latestCreatedAt = null;
    if (!categoriesSnapshot.empty) {
      const firstDoc = categoriesSnapshot.docs[0].data();
      latestCreatedAt =
        firstDoc.created_at?.toDate() || firstDoc.createdAt?.toDate();
    }

    // Check if any demo data exists
    const hasData =
      categories > 0 || users > 0 || shops > 0 || products > 0 || auctions > 0;

    if (!hasData) {
      return NextResponse.json({
        /** Exists */
        exists: false,
        /** Summary */
        summary: null,
      });
    }

    // Count settings collections
    const [
      siteSettings,
      paymentSettings,
      shippingZones,
      emailTemplates,
      featureFlags,
      homepageSettings,
    ] = await Promise.all([
      db.collection(COLLECTIONS.SITE_SETTINGS).get(),
      db.collection(COLLECTIONS.PAYMENT_SETTINGS).get(),
      db.collection(COLLECTIONS.SHIPPING_ZONES).get(),
      db.collection(COLLECTIONS.EMAIL_TEMPLATES).get(),
      db.collection(COLLECTIONS.FEATURE_FLAGS).get(),
      db.collection(COLLECTIONS.HOMEPAGE_SETTINGS).get(),
    ]);

    const settings =
      siteSettings.size +
      paymentSettings.size +
      shippingZones.size +
      emailTemplates.size +
      featureFlags.size +
      homepageSettings.size;

    return NextResponse.json({
      /** Exists */
      exists: true,
      /** Summary */
      summary: {
        /** Prefix */
        prefix: DEMO_PREFIX,
        categories,
        users,
        shops,
        products,
        auctions,
        bids,
        orders,
        payments,
        shipments,
        reviews,
        heroSlides,
        favorites,
        carts,
        notifications,
        settings,
        /** Created At */
        createdAt: latestCreatedAt
          ? (safeToISOString(latestCreatedAt) ?? new Date().toISOString())
          : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Demo stats fetch error:", error);
    return NextResponse.json(
      {
        /** Exists */
        exists: false,
        /** Summary */
        summary: null,
        /** Error */
        error: error.message,
      },
      { status: 200 },
    );
  }
}
