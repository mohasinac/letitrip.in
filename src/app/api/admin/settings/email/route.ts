/**
 * Admin Email Settings API Route
 *
 * Get/Update email service provider settings
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

interface EmailSettings {
  defaultProvider: "resend" | "sendgrid";
  resendEnabled: boolean;
  resendApiKey: string;
  resendFromEmail: string;
  resendFromName: string;
  sendgridEnabled: boolean;
  sendgridApiKey: string;
  sendgridFromEmail: string;
  sendgridFromName: string;
  fallbackEnabled: boolean;
  retryAttempts: number;
  retryDelay: number;
  categories: {
    TRANSACTIONAL: { enabled: boolean; provider?: "resend" | "sendgrid" };
    MARKETING: { enabled: boolean; provider?: "resend" | "sendgrid" };
    NOTIFICATIONS: { enabled: boolean; provider?: "resend" | "sendgrid" };
    ACCOUNT: { enabled: boolean; provider?: "resend" | "sendgrid" };
  };
}

// GET - Retrieve email settings
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = admin.firestore();
    const settingsDoc = await db.collection("settings").doc("email").get();

    if (!settingsDoc.exists) {
      return NextResponse.json({});
    }

    return NextResponse.json(settingsDoc.data());
  } catch (error) {
    logError(error as Error, {
      component: "AdminEmailSettingsAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

// PUT - Update email settings
export async function PUT(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings: EmailSettings = await req.json();

    // Validation
    if (
      !settings.defaultProvider ||
      !["resend", "sendgrid"].includes(settings.defaultProvider)
    ) {
      return NextResponse.json(
        { error: "Invalid default provider" },
        { status: 400 }
      );
    }

    if (
      settings.resendEnabled &&
      (!settings.resendApiKey || !settings.resendFromEmail)
    ) {
      return NextResponse.json(
        { error: "Resend requires API key and from email" },
        { status: 400 }
      );
    }

    if (
      settings.sendgridEnabled &&
      (!settings.sendgridApiKey || !settings.sendgridFromEmail)
    ) {
      return NextResponse.json(
        { error: "SendGrid requires API key and from email" },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    await db
      .collection("settings")
      .doc("email")
      .set({
        ...settings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: authResult.user.uid,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      component: "AdminEmailSettingsAPI.PUT",
    });
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
