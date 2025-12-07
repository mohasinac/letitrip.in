/**
 * Email Preferences API Route
 *
 * Get/Update user email preferences
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

interface EmailPreferences {
  transactional: boolean; // Always true (cannot disable)
  marketing: boolean;
  notifications: boolean;
  account: boolean; // Always true (cannot disable)
}

// GET - Retrieve user email preferences
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Users can only access their own preferences (unless admin)
    if (authResult.user.uid !== userId && authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const preferences: EmailPreferences = userData?.emailPreferences || {
      transactional: true,
      marketing: true,
      notifications: true,
      account: true,
    };

    return NextResponse.json({ preferences });
  } catch (error) {
    const { userId } = await params;
    logError(error as Error, {
      component: "EmailPreferencesAPI.GET",
      userId,
    });
    return NextResponse.json(
      { error: "Failed to load preferences" },
      { status: 500 }
    );
  }
}

// PUT - Update user email preferences
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Users can only update their own preferences (unless admin)
    if (authResult.user.uid !== userId && authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const preferences: Partial<EmailPreferences> = await req.json();

    // Force transactional and account to always be true
    const updatedPreferences: EmailPreferences = {
      transactional: true,
      marketing:
        preferences.marketing !== undefined ? preferences.marketing : true,
      notifications:
        preferences.notifications !== undefined
          ? preferences.notifications
          : true,
      account: true,
    };

    const db = admin.firestore();
    await db.collection("users").doc(userId).update({
      emailPreferences: updatedPreferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
    });
  } catch (error) {
    const { userId } = await params;
    logError(error as Error, {
      component: "EmailPreferencesAPI.PUT",
      userId,
    });
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
