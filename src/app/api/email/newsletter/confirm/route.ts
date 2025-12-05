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
      confirmed: true,
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
      type: "newsletter_confirm",
      email: subscription.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send welcome email
    await db.collection("emailQueue").add({
      to: subscription.email,
      template: "newsletter_welcome",
      data: {
        recipientName: subscription.name,
        recipientEmail: subscription.email,
      },
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/confirmed`
    );
  } catch (error) {
    logError(error as Error, {
      component: "NewsletterConfirmAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to confirm subscription" },
      { status: 500 }
    );
  }
}
