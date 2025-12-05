/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/cleanup/[step]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Step-by-step cleanup for demo data
 * DELETE /api/admin/demo/cleanup/[step]
 */

const PREFIXES = ["DEMO_", "test_"];

/**
 * CleanupStep type
 * 
 * @typedef {Object} CleanupStep
 * @description Type definition for CleanupStep
 */
type CleanupStep =
  | "categories"
  | "users"
  | "shops"
  | "products"
  | "auctions"
  | "bids"
  | "reviews"
  | "orders"
  | "extras"
  | "settings";

/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Request */
  request, {});
 */

/**
 * Deletes 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ step: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The delete result
 *
 * @example
 * DELETE(request, {});
 */
export async function DELETE(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ step: string }> },
) {
  try {
    const { step } = await params;
    const db = getFirestoreAdmin();
    let deletedCount = 0;
    const breakdown: Array<{ collection: string; count: number }> = [];

    // Helper to delete by prefix
    /**
     * Performs async operation
     *
     * @param {string} collection - The collection
     * @param {string} field - The field
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @param {string} collection - The collection
     * @param {string} field - The field
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const deleteByPrefix = async (collection: string, field: string) => {
      let count = 0;
      for (const prefix of PREFIXES) {
        const snapshot = await db
          .collection(collection)
          .where(field, ">=", prefix)
          .where(field, "<", `${prefix}\uf8ff`)
          .get();

        if (!snapshot.empty) {
          const batchSize = 500;
          for (let i = 0; i < snapshot.docs.length; i += batchSize) {
            const batch = db.batch();
            /**
 * Performs batch docs operation
 *
 * @param {any} i - The i
 * @param {any} i+batchSize - The i+batchsize
 *
 * @returns {any} The batchdocs result
 *
 */
const batchDocs = snapshot.docs.slice(i, i + batchSize);
            batchDocs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
          }
          count += snapshot.size;
        }
      }
      if (count > 0) {
        breakdown.push({ collection, count });
      }
      return count;
    };

    // Helper to delete by related IDs
    /**
     * Performs async operation
     *
     * @param {string} collection - The collection
     * @param {string} field - The field
     * @param {string[]} relatedIds - The related ids
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const deleteByRelatedIds = async (
      /** Collection */
      collection: string,
      /** Field */
      field: string,
      /** Related Ids */
      relatedIds: string[],
    ) => {
      let count = 0;
      // Firestore 'in' query supports max 30 values
      for (let i = 0; i < relatedIds.length; i += 30) {
        const batch = relatedIds.slice(i, i + 30);
        if (batch.length > 0) {
          const snapsh/**
 * Performs write batch operation
 *
 * @returns {any} The writebatch result
 *
 */
ot = await db
            .collection(collection)
            .where(field, "in", batch)
            .get();

          if (!snapshot.empty) {
            const writeBatch = db.batch();
            snapshot.docs.forEach((doc) => writeBatch.delete(doc.ref));
            await writeBatch.commit();
            count += snapshot.size;
          }
        }
      }
      if (count > 0) {
        breakdown.push({ collection, count });
      }
      return count;
    };

    // Get IDs for related cleanup
    /**
     * Performs async operation
     *
     * @param {string} collection - The collection
     * @param {string} field - The field
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const getDemoIds = async (
      /** Collection */
      collection: string,
      /** Field */
      field: string,
    ): Promise<string[]> => {
      const ids: string[] = [];
      for (const prefix of PREFIXES) {
        const snapshot = await db
          .collection(collection)
          .where(field, ">=", prefix)
          .where(field, "<", `${prefix}\uf8ff`)
          .get();
        snapshot.docs.forEach((doc) => ids.push(doc.id));
      }
      return ids;
    };

    switch (step as CleanupStep) {
      case "categories":
        deletedCount = await deleteByPrefix("categories", "name");
        break;

      case "users":
        deletedCount = await deleteByPrefix("users", "name");
        break;

      case "shops":
        deletedCount = await deleteByPrefix("shops", "name");
        break;

      case "products":
        deletedCount = await deleteByPrefix("products", "name");
        break;

      case "auctions":
        deletedCount = await deleteByPrefix("auctions", "title");
        break;

      case "bids": {
        // Delete bids related to demo auctions
        const auctionIds = await getDemoIds("auctions", "title");
        if (auctionIds.length > 0) {
          deletedCount = await deleteByRelatedIds(
            "bids",
            "auctionId",
            auctionIds,
          );
        }
        // Also delete by bidderName prefix
        const prefixCount = await deleteByPrefix("bids", "bidderName");
        deletedCount += prefixCount;
        break;
      }

      case "reviews": {
        // Delete reviews related to demo products
        const productIds = await getDemoIds("products", "name");
        if (productIds.length > 0) {
          deletedCount = await deleteByRelatedIds(
            "reviews",
            "product_id",
            productIds,
          );
        }
        // Also delete by user_name prefix
        const prefixCount = await deleteByPrefix("reviews", "user_name");
        deletedCount += prefixCount;
        break;
      }

      case "orders": {
        // Get demo order IDs first for related cleanup
        const orderIds = await getDemoIds("orders", "orderNumber");

        // Delete payments
        const paymentCount = await deleteByPrefix("payments", "transactionId");
        deletedCount += paymentCount;

        // Delete shipments related to demo orders
        if (orderIds.length > 0) {
          const shipmentCount = await deleteByRelatedIds(
            "shipments",
            "orderId",
            orderIds,
          );
          deletedCount += shipmentCount;
        }
        // Also try by trackingNumber prefix
        const shipmentPrefixCount = await deleteByPrefix(
          "shipments",
          "trackingNumber",
        );
        deletedCount += shipmentPrefixCount;

        // Delete orders
        const orderCount = await deleteByPrefix("orders", "orderNumber");
        deletedCount += orderCount;
        break;
      }

      case "extras": {
        // Get user and shop IDs for related cleanup
        const userIds = await getDemoIds("users", "name");
        const shopIds = await getDemoIds("shops", "name");

        // Delete hero slides
        deletedCount += await deleteByPrefix("hero_slides", "title");

        // Delete coupons
        deletedCount += await deleteByPrefix("coupons", "code");

        // Delete featured sections
        deletedCount += await deleteByPrefix("featured_sections", "title");

        // Delete carts by user
        if (userIds.length > 0) {
          deletedCount += await deleteByRelatedIds("carts", "user_id", userIds);
        }

        // Delete favorites by user
        if (userIds.length > 0) {
          deletedCount += await deleteByRelatedIds(
            "favorites",
            "user_id",
            userIds,
          );
        }

        // Delete notifications by user
        if (userIds.length > 0) {
          deletedCount += await deleteByRelatedIds(
            "notifications",
            "userId",
            userIds,
          );
        }

        // Delete support tickets by user
        if (userIds.length > 0) {
          deletedCount += await deleteByRelatedIds(
            "support_tickets",
            "userId",
            userIds,
          );
        }

        // Delete returns by user
        if (userIds.length > 0) {
          deletedCount += await deleteByRelatedIds(
            "returns",
            "user_id",
            userIds,
          );
        }

        // Delete conversations (try prefix on subject/**
 * Performs participants operation
 *
 * @param {string} participants.some((p - The participants.some((p
 *
 * @returns {any} The participants result
 *
 */
 or participants)
        const convSnapshot = await db
          .collection(COLLECTIONS.CONVERSATIONS)
          .get();
        let convCount = 0;
        for (const doc of convSnapshot.docs) {
          const data = doc.data();
          const participants = data.participants || [];
          if (participants.some((p: string) => userIds.includes(p))) {
            await doc.ref.delete();
            convCount++;
          }
        }
        if (convCount > 0) {
          breakdown.push({ collection: "conversations", count: convCount });
          deletedCount += convCount;
        }

        // Delete messages from demo conversations
        const msgSnapshot = await db.collection(COLLECTIONS.MESSAGES).get();
        let msgCount = 0;
        for (const doc of msgSnapshot.docs) {
          const data = doc.data();
          if (userIds.includes(data.senderId)) {
            await doc.ref.delete();
            msgCount++;
          }
        }
        if (msgCount > 0) {
          breakdown.push({ collection: "messages", count: msgCount });
          deletedCount += msgCount;
        }

        // Delete payouts by shop
        if (shopIds.length > 0) {
          deletedCount += await deleteByRelatedIds(
            "payouts",
            "shopId",
            shopIds,
          );
        }
        break;
      }

      case "settings": {
        // Delete demo settings collections
        const settingsCollections = [
          "site_settings",
          "payment_settings",
          "shipping_zones",
          "shipping_carriers",
          "email_templates",
          "email_settings",
          "notification_settings",
          "feature_flags",
          "business_rules",
          "riplimit_settings",
          "analytics_settings",
          "homepage_settings",
        ];

        for (const collection of settingsCollections) {
          const snapshot = await db.collection(collection).get();
          let count = 0;
          for (const doc of snapshot.docs) {
            await doc.ref.delete();
            count++;
          }
          if (count > 0) {
            breakdown.push({ collection, count });
            deletedCount += count;
          }
        }
        break;
      }

      /** Default */
      default:
        return NextResponse.json(
          { success: false, error: `Unknown step: ${step}` },
          { status: 400 },
        );
    }

    return NextResponse.json({
      /** Success */
      success: true,
      step,
      /** Data */
      data: {
        /** Count */
        count: deletedCount,
        breakdown,
      },
    });
  } catch (error: unknown) {
    console.error("Cleanup step error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
