/**
 * @fileoverview TypeScript Module
 * @module src/app/api/email/preferences/[userId]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * EmailPreferences interface
 * 
 * @interface
 * @description Defines the structure and contract for EmailPreferences
 */
interface EmailPreferences {
  transactional: boolean; // Always true (cannot disable)
  /** Marketing */
  marketing: boolean;
  /** Notifications */
  notifications: boolean;
  account: boolean; // Always true (cannot disable)
}

// GET - Retrieve user email preferences
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Req */
  req, {});
 */

export async function GET(
  /** Req */
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

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
      /** Transactional */
      transactional: true,
      /** Marketing */
      marketing: true,
      /** Notifications */
      notifications: true,
      /** Account */
      account: true,
    };

    return NextResponse.json({ preferences });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailPreferencesAPI.GET",
      /** User Id */
      userId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to load preferences" },
      { status: 500 }
    );
  }
}

// PUT - Update user email preferences
/**
 * Function: P U T
 */
/**
 * Performs p u t operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(req, {});
 */

/**
 * Performs p u t operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(/** Req */
  req, {});
 */

export async function PUT(
  /** Req */
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    // Users can only update their own preferences (unless admin)
    if (authResult.user.uid !== userId && authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const preferences: Partial<EmailPreferences> = await req.json();

    // Force transactional and account to always be true
    const updatedPreferences: EmailPreferences = {
      /** Transactional */
      transactional: true,
      /** Marketing */
      marketing:
        preferences.marketing !== undefined ? preferences.marketing : true,
      /** Notifications */
      notifications:
        preferences.notifications !== undefined
          ? preferences.notifications
          : true,
      /** Account */
      account: true,
    };

    const db = admin.firestore();
    await db.collection("users").doc(userId).update({
      /** Email Preferences */
      emailPreferences: updatedPreferences,
      /** Updated At */
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Preferences */
      preferences: updatedPreferences,
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailPreferencesAPI.PUT",
      /** User Id */
      userId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
