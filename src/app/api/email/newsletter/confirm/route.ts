/**
 * @fileoverview TypeScript Module
 * @module src/app/api/email/newsletter/confirm/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Newsletter Confirm API Route
 *
 * Confirm newsletter subscription
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

// GET - Confirm newsletter subscription
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const db = admin.firestore();

    // Find subscription by token
    const subscriptionsSnapshot = await db
      .collection("newsletterSubscriptions")
      .where("confirmationToken", "==", token)
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subscription = subscriptionDoc.data();

    // Check if already confirmed
    if (subscription.confirmed) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/already-confirmed`
      );
    }

    // Confirm subscription
    await subscriptionDoc.ref.update({
      /** Confirmed */
      confirmed: true,
      /** Confirmed At */
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      confirmationToken: admin.firestore.FieldValue.delete(), // Remove token after confirmation
    });

    // Update user preferences if user exists
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", subscription.email)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      await usersSnapshot.docs[0].ref.update({
        "emailPreferences.marketing": true,
      });
    }

    // Log confirmation event
    await db.collection("emailEvents").add({
      /** Type */
      type: "newsletter_confirm",
      /** Email */
      email: subscription.email,
      /** Timestamp */
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send welcome email
    await db.collection("emailQueue").add({
      /** To */
      to: subscription.email,
      /** Template */
      template: "newsletter_welcome",
      /** Data */
      data: {
        /** Recipient Name */
        recipientName: subscription.name,
        /** Recipient Email */
        recipientEmail: subscription.email,
      },
      /** Status */
      status: "pending",
      /** Created At */
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/confirmed`
    );
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "NewsletterConfirmAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to confirm subscription" },
      { status: 500 }
    );
  }
}
