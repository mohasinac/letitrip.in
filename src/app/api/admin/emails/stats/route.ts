/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/emails/stats/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Admin Email Statistics API Route
 *
 * Get email statistics (sent, delivered, opened, clicked, bounced, failed)
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

// GET - Retrieve email statistics
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
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const template = searchParams.get("template");

    const db = admin.firestore();
    let query: admin.firestore.Query = db.collection("emailLogs");

    // Apply filters
    if (from) {
      const fromDate = admin.firestore.Timestamp.fromDate(new Date(from));
      query = query.where("sentAt", ">=", fromDate);
    }
    if (to) {
      const toDate = admin.firestore.Timestamp.fromDate(new Date(to));
      query = query.where("sentAt", "<=", toDate);
    }
    if (template && template !== "all") {
      query = query.where("template", "==", template);
    }

    const snapshot = await query.get();

    // Calculate statistics
    const stats = {
      /** Sent */
      sent: 0,
      /** Delivered */
      delivered: 0,
      /** Opened */
      opened: 0,
      /** Clicked */
      clicked: 0,
      /** Bounced */
      bounced: 0,
      /** Failed */
      failed: 0,
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.status;

      stats.sent++;

      switch (status) {
        case "delivered":
          stats.delivered++;
          break;
        case "opened":
          stats.opened++;
          stats.delivered++; // Opened implies delivered
          break;
        case "clicked":
          stats.clicked++;
          stats.opened++; // Clicked implies opened
          stats.delivered++; // Clicked implies delivered
          break;
        case "bounced":
          stats.bounced++;
          break;
        case "failed":
          stats.failed++;
          break;
      }
    });

    // Calculate rates
    const deliveryRate =
      stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;
    const openRate =
      stats.delivered > 0
        ? Math.round((stats.opened / stats.delivered) * 100)
        : 0;
    const clickRate =
      stats.opened > 0 ? Math.round((stats.clicked / stats.opened) * 100) : 0;

    return NextResponse.json({
      /** Stats */
      stats: {
        ...stats,
        deliveryRate,
        openRate,
        clickRate,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "AdminEmailStatsAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}
