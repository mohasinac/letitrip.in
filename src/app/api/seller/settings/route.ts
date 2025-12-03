/**
 * Seller Settings API
 *
 * @status IMPLEMENTED
 * @epic E006 - Shop Management
 *
 * Handles:
 * - GET: Get seller settings (profile, notifications, payout)
 * - PUT: Update seller settings
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { getCurrentUser } from "@/app/api/lib/session";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { FieldValue } from "firebase-admin/firestore";

const DEFAULT_SETTINGS = {
  profile: {
    displayName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "individual",
    gstNumber: "",
    panNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  },
  notifications: {
    emailNotifications: true,
    orderAlerts: true,
    reviewAlerts: true,
    payoutAlerts: true,
    promotionalEmails: false,
    lowStockAlerts: true,
    dailyDigest: true,
  },
  payout: {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    preferredMethod: "bank",
    minPayoutAmount: 500,
  },
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Seller access required." },
        { status: 403 },
      );
    }

    const db = getFirestoreAdmin();

    // Get seller settings
    const settingsDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_SETTINGS)
      .doc("seller")
      .get();

    if (!settingsDoc.exists) {
      // Return defaults with user's basic info
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(user.id).get();
      const userData = userDoc.data();

      return NextResponse.json({
        ...DEFAULT_SETTINGS,
        profile: {
          ...DEFAULT_SETTINGS.profile,
          displayName: userData?.name || user.name || "",
          email: user.email || "",
          phone: userData?.phone || "",
        },
      });
    }

    const settingsData = settingsDoc.data();

    // Merge with defaults to ensure all fields exist
    const settings = {
      profile: { ...DEFAULT_SETTINGS.profile, ...settingsData?.profile },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...settingsData?.notifications,
      },
      payout: { ...DEFAULT_SETTINGS.payout, ...settingsData?.payout },
    };

    // Mask sensitive payout info
    if (settings.payout.accountNumber) {
      const accNum = settings.payout.accountNumber;
      settings.payout.accountNumber =
        accNum.length > 4 ? "••••" + accNum.slice(-4) : accNum;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching seller settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Seller access required." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { profile, notifications, payout } = body;

    const db = getFirestoreAdmin();
    const settingsRef = db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_SETTINGS)
      .doc("seller");

    // Get current settings to preserve full account number
    const currentDoc = await settingsRef.get();
    const currentData = currentDoc.exists ? currentDoc.data() : {};

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (profile) {
      updateData.profile = profile;
    }

    if (notifications) {
      updateData.notifications = notifications;
    }

    if (payout) {
      // If account number is masked, preserve the original
      if (
        payout.accountNumber?.startsWith("••••") &&
        currentData?.payout?.accountNumber
      ) {
        payout.accountNumber = currentData.payout.accountNumber;
      }
      updateData.payout = payout;
    }

    await settingsRef.set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating seller settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
