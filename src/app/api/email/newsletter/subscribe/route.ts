/**
 * @fileoverview TypeScript Module
 * @module src/app/api/email/newsletter/subscribe/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Newsletter Subscribe API Route
 *
 * Subscribe to newsletter (requires confirmation)
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { logError } from "@/lib/firebase-error-logger";
import { randomBytes } from "crypto";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * SubscribeRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for SubscribeRequest
 */
interface SubscribeRequest {
  /** Email */
  email: string;
  /** Name */
  name?: string;
}

// POST - Subscribe to newsletter
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
    const body: SubscribeRequest = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const db = admin.firestore();

    // Check if already subscribed
    const existingSubscription = await db
      .collection("newsletterSubscriptions")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingSubscription.empty) {
      const sub = existingSubscription.docs[0].data();
      if (sub.confirmed) {
        return NextResponse.json(
          { error: "Email already subscribed" },
          { status: 400 }
        );
      }
    }

    // Generate confirmation token
    const confirmationToken = randomBytes(32).toString("hex");

    // Create or update subscription
    const subscriptionData = {
      email,
      /** Name */
      name: name || null,
      /** Confirmed */
      confirmed: false,
      confirmationToken,
      /** Subscribed At */
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      /** Updated At */
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!existingSubscription.empty) {
      await existingSubscription.docs[0].ref.update(subscriptionData);
    } else {
      await db.collection("newsletterSubscriptions").add(subscriptionData);
    }

    // Send confirmation email
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/newsletter/confirm?token=${confirmationToken}`;

    await db.collection("emailQueue").add({
      /** To */
      to: email,
      /** Template */
      template: "newsletter_confirm",
      /** Data */
      data: {
        /** Recipient Name */
        recipientName: name,
        /** Recipient Email */
        recipientEmail: email,
        confirmationUrl,
      },
      /** Status */
      status: "pending",
      /** Created At */
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Please check your email to confirm subscription",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "NewsletterSubscribeAPI.POST",
    });
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
