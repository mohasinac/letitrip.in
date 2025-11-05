/**
 * API Route: Get all Beyblade stats
 * GET /api/beyblades - List all beyblades (public access)
 * POST /api/beyblades - Create a new beyblade (admin only)
 * 
 * Supports filtering by:
 * - ?search=name - Search by name
 * - ?type=attack|defense|stamina|balanced - Filter by type
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from '../_lib/database/admin';
import { verifyAdminSession } from '../_lib/auth/admin-auth';
import { Timestamp } from "firebase-admin/firestore";
import { AuthorizationError, ValidationError } from "../_lib/middleware/error-handler";
import { BeybladeStats } from "@/types/beybladeStats";
import { DATABASE_CONSTANTS } from "@/constants/app";

const db = getAdminDb();

/**
 * GET /api/beyblades
 * List all beyblades (public access, no authentication required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    let query = db.collection(DATABASE_CONSTANTS.COLLECTIONS.BEYBLADE_STATS);

    // Filter by type if provided
    if (type && ["attack", "defense", "stamina", "balanced"].includes(type)) {
      query = query.where("type", "==", type) as any;
    }

    const snapshot = await query.get();
    let beyblades = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BeybladeStats[];

    // Client-side search by name if provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      beyblades = beyblades.filter((b) =>
        b.displayName?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: beyblades,
    });
  } catch (error) {
    console.error("Error fetching beyblades:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch beyblades",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beyblades
 * Create a new beyblade (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    const body = await request.json();

    // Validate required fields
    if (!body.displayName || !body.type) {
      throw new ValidationError(
        "Missing required fields: displayName and type are required"
      );
    }

    // Validate type enum
    const validTypes = ["attack", "defense", "stamina", "balanced"];
    if (!validTypes.includes(body.type)) {
      throw new ValidationError(
        `Invalid type. Must be one of: ${validTypes.join(", ")}`
      );
    }

    // Validate spin direction if provided
    if (body.spinDirection && !["left", "right"].includes(body.spinDirection)) {
      throw new ValidationError("Spin direction must be 'left' or 'right'");
    }

    // Generate ID from display name
    const id = body.displayName.toLowerCase().replace(/\s+/g, "_");

    // Check if beyblade already exists
    const existingDoc = await db.collection(DATABASE_CONSTANTS.COLLECTIONS.BEYBLADE_STATS).doc(id).get();
    if (existingDoc.exists) {
      throw new ValidationError(`Beyblade with name '${body.displayName}' already exists`);
    }

    // Generate fileName for backward compatibility
    const fileName = `${id}.svg`;

    // Create complete beyblade object with defaults
    const newBeyblade: BeybladeStats = {
      id,
      displayName: body.displayName,
      fileName,
      type: body.type,
      spinDirection: body.spinDirection || "right",
      mass: body.mass || 50, // grams
      radius: body.radius || 4, // cm
      actualSize: (body.radius || 4) * 10, // pixels = radius * 10
      typeDistribution: body.typeDistribution || {
        attack: 120,
        defense: 120,
        stamina: 120,
        total: 360,
      },
      pointsOfContact: body.pointsOfContact || [
        { angle: 0, damageMultiplier: 1.2, width: 45 },
        { angle: 90, damageMultiplier: 1.0, width: 45 },
        { angle: 180, damageMultiplier: 1.2, width: 45 },
        { angle: 270, damageMultiplier: 1.0, width: 45 },
      ],
      imageUrl: body.imageUrl,
      imagePosition: body.imagePosition || {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
      },
    };

    // Save to Firestore
    await db.collection(DATABASE_CONSTANTS.COLLECTIONS.BEYBLADE_STATS).doc(id).set(newBeyblade);

    return NextResponse.json({
      success: true,
      data: newBeyblade,
      message: "Beyblade created successfully",
    });
  } catch (error) {
    console.error("Error creating beyblade:", error);

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
        error: error instanceof Error ? error.message : "Failed to create beyblade",
      },
      { status: 500 }
    );
  }
}
