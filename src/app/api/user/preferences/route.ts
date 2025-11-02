import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/config";
import { doc, updateDoc } from "firebase/firestore";

/**
 * PUT /api/user/preferences
 * Update user preferences (currency, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferredCurrency } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ["INR", "USD", "EUR", "GBP"];
    if (preferredCurrency && !validCurrencies.includes(preferredCurrency)) {
      return NextResponse.json(
        { error: "Invalid currency code" },
        { status: 400 }
      );
    }

    // Update user document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      preferredCurrency,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
