import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { getAdminDb } from "@/lib/database/admin";

/**
 * PUT /api/user/preferences
 * Update user preferences (currency, notifications, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify Firebase token
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      preferredCurrency,
      emailNotifications,
      orderUpdates,
      promotionalEmails,
    } = body;

    // Validate currency if provided
    const validCurrencies = ["INR", "USD", "EUR", "GBP"];
    if (preferredCurrency && !validCurrencies.includes(preferredCurrency)) {
      return NextResponse.json(
        { error: "Invalid currency code" },
        { status: 400 }
      );
    }

    // Prepare update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (preferredCurrency !== undefined) {
      updates.preferredCurrency = preferredCurrency;
    }
    if (emailNotifications !== undefined) {
      updates.emailNotifications = emailNotifications;
    }
    if (orderUpdates !== undefined) {
      updates.orderUpdates = orderUpdates;
    }
    if (promotionalEmails !== undefined) {
      updates.promotionalEmails = promotionalEmails;
    }

    // Update user document using Admin SDK
    const db = getAdminDb();
    await db.collection("users").doc(user.uid).update(updates);

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update preferences" },
      { status: 500 }
    );
  }
}
