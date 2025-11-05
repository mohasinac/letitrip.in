/**
 * API Route: Get specific Beyblade stats by ID
 * GET /api/beyblades/[id] - Get beyblade details (public access)
 * PUT /api/beyblades/[id] - Update beyblade (admin only)
 * DELETE /api/beyblades/[id] - Delete beyblade (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "../../_lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";
import { AuthorizationError, ValidationError } from "../../_lib/middleware/error-handler";
import { BeybladeStats } from "@/types/beybladeStats";
import { verifyAdminSession } from "../../_lib/auth/admin-auth";
import { DATABASE_CONSTANTS } from "@/constants/app";

const db = getAdminDb();



/**
 * GET /api/beyblades/[id]
 * Get beyblade details (public access, no authentication required)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const doc = await db.collection(DATABASE_CONSTANTS.COLLECTIONS.BEYBLADE_STATS).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Beyblade not found",
        },
        { status: 404 }
      );
    }

    const beyblade = {
      id: doc.id,
      ...doc.data(),
    } as BeybladeStats;

    return NextResponse.json({
      success: true,
      data: beyblade,
    });
  } catch (error) {
    console.error("Error fetching beyblade:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch beyblade",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/beyblades/[id]
 * Update beyblade (admin only)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    const { id } = await context.params;
    const body = await request.json();

    // Get existing beyblade
    const doc = await db.collection(DATABASE_CONSTANTS.COLLECTIONS.BEYBLADE_STATS).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Beyblade not found",
        },
        { status: 404 }
      );
    }

    // Validate type if provided
    if (body.type) {
      const validTypes = ["attack", "defense", "stamina", "balanced"];
      if (!validTypes.includes(body.type)) {
        throw new ValidationError(
          `Invalid type. Must be one of: ${validTypes.join(", ")}`
        );
      }
    }

    // Validate spin direction if provided
    if (body.spinDirection && !["left", "right"].includes(body.spinDirection)) {
      throw new ValidationError("Spin direction must be 'left' or 'right'");
    }

    // Prevent changing the ID
    const { id: _, ...updateData } = body;

    // Merge with existing data (partial update)
    const updatedBeyblade = {
      ...doc.data(),
      ...updateData,
      id, // Ensure ID doesn't change
    } as BeybladeStats;

    // Save to Firestore
    await db.collection(DATABASE_CONSTANTS.COLLECTIONS.BEYBLADE_STATS).doc(id).set(updatedBeyblade);

    return NextResponse.json({
      success: true,
      data: updatedBeyblade,
      message: "Beyblade updated successfully",
    });
  } catch (error) {
    console.error("Error updating beyblade:", error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes("Missing or invalid") ? 401 : 403 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update beyblade",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beyblades/[id]
 * Delete beyblade (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    const { id } = await context.params;

    // Check if beyblade exists
    const doc = await db.collection(DATABASE_CONSTANTS.COLLECTIONS.BEYBLADE_STATS).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Beyblade not found",
        },
        { status: 404 }
      );
    }

    // Delete from Firestore
    await db.collection(DATABASE_CONSTANTS.COLLECTIONS.BEYBLADE_STATS).doc(id).delete();

    return NextResponse.json({
      success: true,
      data: { id },
      message: "Beyblade deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting beyblade:", error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes("Missing or invalid") ? 401 : 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete beyblade",
      },
      { status: 500 }
    );
  }
}
