/**
 * Filter Presets API
 * 
 * Allows users to save and manage their search filter presets.
 * Useful for frequently used search/filter combinations.
 * 
 * @route POST /api/filters/presets - Save a new filter preset
 * @route GET /api/filters/presets - List user's saved presets
 * @route DELETE /api/filters/presets/[id] - Delete a preset
 * 
 * @example
 * ```tsx
 * // Save preset
 * const response = await fetch('/api/filters/presets', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     userId: 'user-id',
 *     name: 'Gaming Laptops',
 *     filters: {
 *       category: 'laptops',
 *       priceMin: 50000,
 *       priceMax: 150000,
 *       ...
 *     }
 *   })
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

interface FilterPreset {
  userId: string;
  name: string;
  filters: {
    category?: string;
    shop?: string;
    priceMin?: number;
    priceMax?: number;
    condition?: string;
    status?: string;
    search?: string;
    [key: string]: any;
  };
  type?: "product" | "auction" | "shop";
}

/**
 * POST /api/filters/presets
 * 
 * Save a new filter preset for the user.
 * 
 * Request Body:
 * - userId: User ID (required)
 * - name: Preset name (required)
 * - filters: Filter object (required)
 * - type: Content type (product/auction/shop)
 */
export async function POST(request: NextRequest) {
  try {
    const body: FilterPreset = await request.json();
    const { userId, name, filters, type } = body;

    // Validate required fields
    if (!userId || !name || !filters) {
      return NextResponse.json(
        { error: "userId, name, and filters are required" },
        { status: 400 }
      );
    }

    // Check if user already has a preset with this name
    const existingQuery = query(
      collection(db, "filterPresets"),
      where("userId", "==", userId),
      where("name", "==", name)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: "A preset with this name already exists" },
        { status: 409 }
      );
    }

    // Create preset document
    const presetData = {
      userId,
      name,
      filters,
      type: type || "product",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "filterPresets"), presetData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...presetData,
        },
        message: "Filter preset saved successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving filter preset:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to save preset" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save preset", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/filters/presets
 * 
 * List all filter presets for a user.
 * 
 * Query Parameters:
 * - userId: User ID (required)
 * - type: Filter by content type (product/auction/shop)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Build query
    const constraints: any[] = [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ];

    if (type) {
      constraints.unshift(where("type", "==", type));
    }

    const presetsQuery = query(
      collection(db, "filterPresets"),
      ...constraints
    );

    const querySnapshot = await getDocs(presetsQuery);

    const presets = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          presets,
          count: presets.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching filter presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/filters/presets
 * 
 * Delete a filter preset.
 * 
 * Query Parameters:
 * - id: Preset ID (required)
 * - userId: User ID (required, for verification)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const presetId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!presetId || !userId) {
      return NextResponse.json(
        { error: "id and userId are required" },
        { status: 400 }
      );
    }

    // Verify preset belongs to user before deleting
    const presetDoc = await getDocs(
      query(
        collection(db, "filterPresets"),
        where("__name__", "==", presetId),
        where("userId", "==", userId)
      )
    );

    if (presetDoc.empty) {
      return NextResponse.json(
        { error: "Preset not found or access denied" },
        { status: 404 }
      );
    }

    // Delete preset
    await deleteDoc(doc(db, "filterPresets", presetId));

    return NextResponse.json(
      {
        success: true,
        message: "Filter preset deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting filter preset:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to delete preset" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete preset", details: error.message },
      { status: 500 }
    );
  }
}
