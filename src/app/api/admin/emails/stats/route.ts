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
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
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
      stats: {
        ...stats,
        deliveryRate,
        openRate,
        clickRate,
      },
    });
  } catch (error) {
    logError(error as Error, {
      component: "AdminEmailStatsAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}
