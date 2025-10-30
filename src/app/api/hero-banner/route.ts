"use server";

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { DATABASE_CONSTANTS } from "@/constants/app";

const SETTINGS_COLLECTION = DATABASE_CONSTANTS.COLLECTIONS.SETTINGS;

/**
 * GET /api/hero-banner
 * Get user's hero banner preferences from database
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const sessionId = request.cookies.get("app_session")?.value;

    if (!sessionId) {
      return NextResponse.json({
        success: true,
        data: {},
      });
    }

    const doc = await db
      .collection(SETTINGS_COLLECTION)
      .doc(`heroBanner_${sessionId}`)
      .get();

    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        data: {
          lastViewedSlide: 0,
          dismissedBanners: [],
          viewCount: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    console.error("Error fetching hero banner preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch preferences",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/hero-banner
 * Update hero banner preferences in database
 */
export async function PATCH(request: NextRequest) {
  try {
    const db = getAdminDb();
    const sessionId = request.cookies.get("app_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "No session found",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { lastViewedSlide, dismissedBanners, viewCount } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (lastViewedSlide !== undefined) {
      updateData.lastViewedSlide = lastViewedSlide;
    }
    if (dismissedBanners !== undefined) {
      updateData.dismissedBanners = dismissedBanners;
    }
    if (viewCount !== undefined) {
      updateData.viewCount = viewCount;
    }

    await db
      .collection(SETTINGS_COLLECTION)
      .doc(`heroBanner_${sessionId}`)
      .set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      data: updateData,
    });
  } catch (error) {
    console.error("Error updating hero banner preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update preferences",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/hero-banner
 * Reset hero banner preferences
 */
export async function DELETE(request: NextRequest) {
  try {
    const db = getAdminDb();
    const sessionId = request.cookies.get("app_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "No session found",
        },
        { status: 400 },
      );
    }

    await db
      .collection(SETTINGS_COLLECTION)
      .doc(`heroBanner_${sessionId}`)
      .delete();

    return NextResponse.json({
      success: true,
      message: "Preferences reset",
    });
  } catch (error) {
    console.error("Error deleting hero banner preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset preferences",
      },
      { status: 500 },
    );
  }
}
