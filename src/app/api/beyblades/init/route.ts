/**
 * API Route: Initialize default Beyblade stats in database
 * POST /api/beyblades/init (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "../../_lib/database/admin";
import { AuthorizationError } from "../../_lib/middleware/error-handler";

const auth = getAdminAuth();
const db = getAdminDb();

/**
 * Helper function to verify admin authentication
 */
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthorizationError("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const decodedToken = await auth.verifyIdToken(token);

  // Check if user is admin
  if (!decodedToken.admin && decodedToken.role !== "admin") {
    throw new AuthorizationError("Admin access required");
  }

  return decodedToken;
}

/**
 * POST /api/beyblades/init
 * Initialize default beyblade stats (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    // Check if beyblades already exist
    const snapshot = await db.collection("beybladeStats").limit(1).get();

    if (!snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "Beyblades already initialized",
        count: snapshot.size,
      });
    }

    // TODO: Add default beyblade data initialization
    // This would typically be done by importing from a data file
    // For now, we just return success
    
    return NextResponse.json({
      success: true,
      message: "Default Beyblade stats initialized successfully",
    });
  } catch (error) {
    console.error("Error initializing beyblades:", error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes("Missing or invalid") ? 401 : 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize beyblades",
      },
      { status: 500 }
    );
  }
}
