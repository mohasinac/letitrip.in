/**
 * @fileoverview TypeScript Module
 * @module src/app/api/seller/settings/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { getCurrentUser } from "@/app/api/lib/session";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * DEFAULT_SETTINGS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for default settings
 */
const DEFAULT_SETTINGS = {
  /** Profile */
  profile: {
    /** Display Name */
    displayName: "",
    /** Email */
    email: "",
    /** Phone */
    phone: "",
    /** Business Name */
    businessName: "",
    /** Business Type */
    businessType: "individual",
    /** Gst Number */
    gstNumber: "",
    /** Pan Number */
    panNumber: "",
    /** Address */
    address: {
      /** Street */
      street: "",
      /** City */
      city: "",
      /** State */
      state: "",
      /** Pincode */
      pincode: "",
    },
  },
  /** Notifications */
  notifications: {
    /** Email Notifications */
    emailNotifications: true,
    /** Order Alerts */
    orderAlerts: true,
    /** Review Alerts */
    reviewAlerts: true,
    /** Payout Alerts */
    payoutAlerts: true,
    /** Promotional Emails */
    promotionalEmails: false,
    /** Low Stock Alerts */
    lowStockAlerts: true,
    /** Daily Digest */
    dailyDigest: true,
  },
  /** Payout */
  payout: {
    /** Account Holder Name */
    accountHolderName: "",
    /** Bank Name */
    bankName: "",
    /** Account Number */
    accountNumber: "",
    /** Ifsc Code */
    ifscCode: "",
    /** Upi Id */
    upiId: "",
    /** Preferred Method */
    preferredMethod: "bank",
    /** Min Payout Amount */
    minPayoutAmount: 500,
  },
};

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
  try {
    user = await getCurrentUser(request);
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
        /** Profile */
        profile: {
          ...DEFAULT_SETTINGS.profile,
          /** Display Name */
          displayName: userData?.name || user.name || "",
          /** Email */
          email: user.email || "",
          /** Phone */
          phone: userData?.phone || "",
        },
      });
    }

    const settingsData = settingsDoc.data();

    // Merge with defaults to ensure all fields exist
    const settings = {
      /** Profile */
      profile: { ...DEFAULT_SETTINGS.profile, ...settingsData?.profile },
      /** Notifications */
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...settingsData?.notifications,
      },
      /** Payout */
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
    logError(error as Error, {
      /** Component */
      component: "API.seller.settings.get",
      /** Metadata */
      metadata: { userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

/**
 * Function: P U T
 */
/**
 * Performs p u t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(request);
 */

/**
 * Performs p u t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(request);
 */

export async function PUT(request: NextRequest) {
  let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
  try {
    user = await getCurrentUser(request);
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
      /** Updated At */
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
      /** Success */
      success: true,
      /** Message */
      message: "Settings updated successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.seller.settings.update",
      /** Metadata */
      metadata: { userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
