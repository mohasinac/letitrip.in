/**
 * @fileoverview TypeScript Module
 * @module src/app/api/email/unsubscribe/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Email Unsubscribe API Route
 *
 * Unsubscribe from marketing emails
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * UnsubscribeRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for UnsubscribeRequest
 */
interface UnsubscribeRequest {
  /** Email */
  email: string;
  /** Token */
  token?: string;
}

// POST - Unsubscribe from emails
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  try {
    const body: UnsubscribeRequest = await req.json();
    const { email, token } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = admin.firestore();

    // Find user by email
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDoc = usersSnapshot.docs[0];

    // Update email preferences - disable marketing and notifications
    await userDoc.ref.update({
      "emailPreferences.marketing": false,
      "emailPreferences.notifications": false,
      /** Unsubscribed At */
      unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log unsubscribe event
    await db.collection("emailEvents").add({
      /** Type */
      type: "unsubscribe",
      email,
      /** User Id */
      userId: userDoc.id,
      /** Timestamp */
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Successfully unsubscribed from marketing emails",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailUnsubscribeAPI.POST",
    });
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
