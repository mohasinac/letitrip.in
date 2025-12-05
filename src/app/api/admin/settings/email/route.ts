/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/settings/email/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * EmailSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for EmailSettings
 */
interface EmailSettings {
  /** Default Provider */
  defaultProvider: "resend" | "sendgrid";
  /** Resend Enabled */
  resendEnabled: boolean;
  /** Resend Api Key */
  resendApiKey: string;
  /** Resend From Email */
  resendFromEmail: string;
  /** Resend From Name */
  resendFromName: string;
  /** Sendgrid Enabled */
  sendgridEnabled: boolean;
  /** Sendgrid Api Key */
  sendgridApiKey: string;
  /** Sendgrid From Email */
  sendgridFromEmail: string;
  /** Sendgrid From Name */
  sendgridFromName: string;
  /** Fallback Enabled */
  fallbackEnabled: boolean;
  /** Retry Attempts */
  retryAttempts: number;
  /** Retry Delay */
  retryDelay: number;
  /** Categories */
  categories: {
    /** T R A N S A C T I O N A L */
    TRANSACTIONAL: { enabled: boolean; provider?: "resend" | "sendgrid" };
    /** M A R K E T I N G */
    MARKETING: { enabled: boolean; provider?: "resend" | "sendgrid" };
    /** N O T I F I C A T I O N S */
    NOTIFICATIONS: { enabled: boolean; provider?: "resend" | "sendgrid" };
    /** A C C O U N T */
    ACCOUNT: { enabled: boolean; provider?: "resend" | "sendgrid" };
  };
}

// GET - Retrieve email settings
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
      /** Component */
      component: "AdminEmailSettingsAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

// PUT - Update email settings
/**
 * Function: P U T
 */
/**
 * Performs p u t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(req);
 */

/**
 * Performs p u t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(req);
 */

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
        /** Updated At */
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        /** Updated By */
        updatedBy: authResult.user.uid,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "AdminEmailSettingsAPI.PUT",
    });
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
