"use server";

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { DATABASE_CONSTANTS } from "@/constants/app";

const CONSENT_COLLECTION = DATABASE_CONSTANTS.COLLECTIONS.SETTINGS;

/**
 * GET /api/consent
 * Get user's cookie consent settings
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const sessionId = request.cookies.get("app_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "No session found",
        },
        { status: 404 },
      );
    }

    const doc = await db
      .collection(CONSENT_COLLECTION)
      .doc(`consent_${sessionId}`)
      .get();

    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        data: { consentGiven: null },
      });
    }

    return NextResponse.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    console.error("Error fetching consent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch consent",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/consent
 * Save user's cookie consent settings
 */
export async function POST(request: NextRequest) {
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
    const { consentGiven, analyticsStorage, consentDate } = body;

    const consentData = {
      sessionId,
      consentGiven,
      analyticsStorage:
        analyticsStorage || (consentGiven ? "granted" : "denied"),
      consentDate: consentDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection(CONSENT_COLLECTION)
      .doc(`consent_${sessionId}`)
      .set(consentData, { merge: true });

    return NextResponse.json({
      success: true,
      data: consentData,
    });
  } catch (error) {
    console.error("Error saving consent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save consent",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/consent
 * Delete user's consent settings
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
      .collection(CONSENT_COLLECTION)
      .doc(`consent_${sessionId}`)
      .delete();

    return NextResponse.json({
      success: true,
      message: "Consent deleted",
    });
  } catch (error) {
    console.error("Error deleting consent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete consent",
      },
      { status: 500 },
    );
  }
}
