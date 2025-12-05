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

interface UnsubscribeRequest {
  email: string;
  token?: string;
}

// POST - Unsubscribe from emails
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
      unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log unsubscribe event
    await db.collection("emailEvents").add({
      type: "unsubscribe",
      email,
      userId: userDoc.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from marketing emails",
    });
  } catch (error) {
    logError(error as Error, {
      component: "EmailUnsubscribeAPI.POST",
    });
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
