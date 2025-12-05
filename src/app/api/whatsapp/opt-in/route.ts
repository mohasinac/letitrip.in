/**
 * @fileoverview TypeScript Module
 * @module src/app/api/whatsapp/opt-in/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * WhatsApp Opt-In API
 *
 * @status IMPLEMENTED
 * @task 1.4.4
 */

import { adminDb } from "@/app/api/lib/firebase/config";
import { getCurrentUser } from "@/app/api/lib/session";
import type { MessageCategory } from "@/config/whatsapp.config";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      phone,
      categories,
    }: { phone: string; categories: MessageCategory[] } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    // Store opt-in in Firestore
    await adminDb
      .collection(COLLECTIONS.WHATSAPP_OPT_INS)
      .doc(phone)
      .set({
        phone,
        /** Opted In */
        optedIn: true,
        /** Opted In At */
        optedInAt: new Date(),
        /** Categories */
        categories: categories || ["UTILITY", "SERVICE"],
        /** Updated At */
        updatedAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, { route: "POST /api/whatsapp/opt-in" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
