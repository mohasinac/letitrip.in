/**
 * API Route: Initialize Default Beyblades
 * POST /api/beyblades/init - Create default beyblades in database
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from '../../_lib/database/admin';
import { DEFAULT_BEYBLADE_STATS } from "@/constants/beybladeStatsData";

const db = getAdminDb();

/**
 * POST /api/beyblades/init
 * Initialize database with default beyblades (public access for setup)
 */
export async function POST(request: NextRequest) {
  try {
    const batch = db.batch();
    const results = [];

    for (const [id, stats] of Object.entries(DEFAULT_BEYBLADE_STATS)) {
      const docRef = db.collection("beybladeStats").doc(id);
      const doc = await docRef.get();

      // Only add if doesn't exist
      if (!doc.exists) {
        const beybladeData = {
          ...stats,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        };
        batch.set(docRef, beybladeData);
        results.push({ id, created: true });
      } else {
        results.push({ id, created: false, message: "Already exists" });
      }
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      data: results,
      message: `Initialized ${results.filter(r => r.created).length} beyblades`,
    });
  } catch (error) {
    console.error("Error initializing beyblades:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize beyblades",
      },
      { status: 500 }
    );
  }
}
