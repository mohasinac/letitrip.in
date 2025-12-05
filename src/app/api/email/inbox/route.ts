/**
 * @fileoverview TypeScript Module
 * @module src/app/api/email/inbox/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Email Inbox API Route
 *
 * Fetch received emails (simulated or from email provider)
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * InboxEmail interface
 * 
 * @interface
 * @description Defines the structure and contract for InboxEmail
 */
interface InboxEmail {
  /** Id */
  id: string;
  /** From */
  from: string;
  /** To */
  to: string;
  /** Subject */
  subject: string;
  /** Body */
  body: string;
  /** Received At */
  receivedAt: Date;
  /** Read */
  read: boolean;
  /** Labels */
  labels: string[];
}

// GET - Retrieve inbox emails
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

    // Only admin can view inbox
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const read = searchParams.get("read");
    const label = searchParams.get("label");
    const limit = parseInt(searchParams.get("limit") || "50");

    const db = admin.firestore();
    let query: admin.firestore.Query = db.collection("inboxEmails");

    // Apply filters
    if (read !== null && read !== "all") {
      query = query.where("read", "==", read === "true");
    }
    if (label && label !== "all") {
      query = query.where("labels", "array-contains", label);
    }

    query = query.orderBy("receivedAt", "desc").limit(limit);

    const snapshot = await query.get();
    const emails = snapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
      /** Received At */
      receivedAt: doc.data().receivedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ emails });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailInboxAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}

// POST - Create inbox email (for testing/simulation)
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
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can create inbox emails
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { from, to, subject, body: emailBody, labels } = body;

    // Validation
    if (!from || !to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const emailRef = db.collection("inboxEmails").doc();

    const email: Omit<InboxEmail, "id"> = {
      from,
      to,
      subject,
      /** Body */
      body: emailBody,
      /** Received At */
      receivedAt: admin.firestore.FieldValue.serverTimestamp() as any,
      /** Read */
      read: false,
      /** Labels */
      labels: labels || [],
    };

    await emailRef.set(email);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Id */
      id: emailRef.id,
      /** Email */
      email: {
        /** Id */
        id: emailRef.id,
        ...email,
        /** Received At */
        receivedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailInboxAPI.POST",
    });
    return NextResponse.json(
      { error: "Failed to create inbox email" },
      { status: 500 }
    );
  }
}

// PATCH - Mark email as read/unread
/**
 * Function: P A T C H
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(req);
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(req);
 */

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can update inbox
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, read, labels } = body;

    if (!id) {
      return NextResponse.json({ error: "Email ID required" }, { status: 400 });
    }

    const db = admin.firestore();
    const emailRef = db.collection("inboxEmails").doc(id);

    const emailDoc = await emailRef.get();
    if (!emailDoc.exists) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const updateData: Partial<InboxEmail> = {};
    if (read !== undefined) updateData.read = read;
    if (labels !== undefined) updateData.labels = labels;

    await emailRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailInboxAPI.PATCH",
    });
    return NextResponse.json(
      { error: "Failed to update inbox email" },
      { status: 500 }
    );
  }
}

// DELETE - Delete inbox email
/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req);
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req);
 */

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can delete inbox emails
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Email ID required" }, { status: 400 });
    }

    const db = admin.firestore();
    const emailRef = db.collection("inboxEmails").doc(id);

    const emailDoc = await emailRef.get();
    if (!emailDoc.exists) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    await emailRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailInboxAPI.DELETE",
    });
    return NextResponse.json(
      { error: "Failed to delete inbox email" },
      { status: 500 }
    );
  }
}
