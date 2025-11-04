/**
 * API Route: Cookie Consent
 * GET /api/consent - Get user's consent settings (public access)
 * POST /api/consent - Save user's consent settings (public access)
 * DELETE /api/consent - Delete user's consent settings (public access)
 * 
 * Features:
 * - GDPR compliance
 * - Session-based consent tracking
 * - Analytics storage permission
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "../_lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";
import { ValidationError } from "../_lib/middleware/error-handler";

const db = getAdminDb();
const CONSENT_COLLECTION = "settings";

/**
 * GET /api/consent
 * Get user's cookie consent settings (public access)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("app_session")?.value;

    if (!sessionId) {
      return NextResponse.json({
        success: true,
        data: { 
          consentGiven: null,
          message: "No session found"
        },
      });
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

    const data = doc.data();
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        consentDate: data?.consentDate,
        updatedAt: data?.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching consent:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch consent",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/consent
 * Save user's cookie consent settings (public access)
 */
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("app_session")?.value;

    if (!sessionId) {
      throw new ValidationError("No session found");
    }

    const body = await request.json();
    
    // Validate consent given field
    if (typeof body.consentGiven !== "boolean") {
      throw new ValidationError("consentGiven must be a boolean");
    }

    const consentData = {
      sessionId,
      consentGiven: body.consentGiven,
      analyticsStorage: body.analyticsStorage || (body.consentGiven ? "granted" : "denied"),
      consentDate: body.consentDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection(CONSENT_COLLECTION)
      .doc(`consent_${sessionId}`)
      .set(consentData, { merge: true });

    return NextResponse.json({
      success: true,
      data: consentData,
      message: "Consent settings saved successfully",
    });
  } catch (error) {
    console.error("Error saving consent:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save consent",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/consent
 * Delete user's consent settings (public access)
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("app_session")?.value;

    if (!sessionId) {
      throw new ValidationError("No session found");
    }

    await db
      .collection(CONSENT_COLLECTION)
      .doc(`consent_${sessionId}`)
      .delete();

    return NextResponse.json({
      success: true,
      message: "Consent deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting consent:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete consent",
      },
      { status: 500 }
    );
  }
}
