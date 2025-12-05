/**
 * Address API Settings API Route
 * GET /api/admin/settings/address-api - Get address API settings
 * PUT /api/admin/settings/address-api - Update address API settings
 *
 * Manages address API configuration (Google Places API key, etc.).
 * Requires admin authentication.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface AddressAPISettings {
  googlePlacesApiKey?: string;
  enabled: boolean;
  fallbackToLocalData: boolean;
  cacheEnabled: boolean;
  cacheDurationHours: number;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthFromRequest(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check admin role
    if (authResult.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get address API settings from Firestore
    const db = getFirestoreAdmin();
    const settingsDoc = await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("address-api")
      .get();

    if (!settingsDoc.exists) {
      // Return default settings
      return NextResponse.json(
        {
          enabled: false,
          fallbackToLocalData: true,
          cacheEnabled: true,
          cacheDurationHours: 24,
        },
        { status: 200 }
      );
    }

    const settings = settingsDoc.data() as AddressAPISettings;

    // Mask API key for security (show only last 4 characters)
    if (settings.googlePlacesApiKey) {
      const keyLength = settings.googlePlacesApiKey.length;
      settings.googlePlacesApiKey =
        "*".repeat(Math.max(0, keyLength - 4)) +
        settings.googlePlacesApiKey.slice(-4);
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    logError(error, {
      component: "AddressAPISettingsAPI",
      method: "GET",
      context: "Failed to retrieve address API settings",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to retrieve address API settings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthFromRequest(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check admin role
    if (authResult.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body: Partial<AddressAPISettings> = await request.json();

    // Validate settings
    if (body.cacheDurationHours !== undefined) {
      if (
        typeof body.cacheDurationHours !== "number" ||
        body.cacheDurationHours < 1 ||
        body.cacheDurationHours > 168
      ) {
        return NextResponse.json(
          {
            error: "Cache duration must be between 1 and 168 hours (1 week)",
          },
          { status: 400 }
        );
      }
    }

    if (body.enabled && body.googlePlacesApiKey) {
      // Validate Google Places API key format (basic check)
      if (
        !/^AIza[0-9A-Za-z-_]{35}$/.test(body.googlePlacesApiKey) &&
        body.googlePlacesApiKey !== "*" // Allow masked key to pass through
      ) {
        return NextResponse.json(
          {
            error: "Invalid Google Places API key format",
          },
          { status: 400 }
        );
      }
    }

    // Get existing settings to preserve masked API key
    const db = getFirestoreAdmin();
    const existingDoc = await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("address-api")
      .get();

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
      updatedBy: authResult.user.uid,
    };

    // If API key is masked (contains asterisks), use the existing key
    if (body.googlePlacesApiKey && body.googlePlacesApiKey.includes("*")) {
      const existingSettings = existingDoc.data();
      updateData.googlePlacesApiKey =
        existingSettings?.googlePlacesApiKey || "";
    }

    // Update address API settings in Firestore
    await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("address-api")
      .set(updateData, { merge: true });

    return NextResponse.json(
      {
        success: true,
        message: "Address API settings updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "AddressAPISettingsAPI",
      method: "PUT",
      context: "Failed to update address API settings",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to update address API settings",
      },
      { status: 500 }
    );
  }
}
