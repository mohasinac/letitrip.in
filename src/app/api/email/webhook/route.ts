/**
 * @fileoverview TypeScript Module
 * @module src/app/api/email/webhook/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Email Webhook API Route
 *
 * Handle webhooks from email providers (Resend, SendGrid)
 * Tracks delivery, opens, clicks, bounces, and spam reports
 *
 * @status IMPLEMENTED
 * @task 1.5.5
 */

import { logError } from "@/lib/firebase-error-logger";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * ResendWebhookEvent interface
 * 
 * @interface
 * @description Defines the structure and contract for ResendWebhookEvent
 */
interface ResendWebhookEvent {
  /** Type */
  type: string;
  /** Created_at */
  created_at: string;
  /** Data */
  data: {
    /** Email_id */
    email_id: string;
    /** To */
    to: string;
    /** From */
    from: string;
    /** Subject */
    subject: string;
    /** Clicked_link */
    clicked_link?: string;
    /** Bounce_type */
    bounce_type?: string;
  };
}

/**
 * SendGridWebhookEvent interface
 * 
 * @interface
 * @description Defines the structure and contract for SendGridWebhookEvent
 */
interface SendGridWebhookEvent {
  /** Event */
  event: string;
  /** Email */
  email: string;
  /** Timestamp */
  timestamp: number;
  /** Sg_message_id */
  sg_message_id: string;
  /** Url */
  url?: string;
  /** Reason */
  reason?: string;
  /** Type */
  type?: string;
}

// POST - Handle webhook events
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
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");

    if (!provider || !["resend", "sendgrid"].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const body = await req.json();

    if (provider === "resend") {
      await handleResendWebhook(body);
    } else if (provider === "sendgrid") {
      await handleSendGridWebhook(body);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EmailWebhookAPI.POST",
    });
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

/**
 * Handles resend webhook
 */
/**
 * Handles resend webhook event
 *
 * @param {ResendWebhookEvent | ResendWebhookEvent[]} events - The events
 *
 * @returns {Promise<any>} Promise resolving to handleresendwebhook result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Handles resend webhook event
 *
 * @param {ResendWebhookEvent | ResendWebhookEvent[]} /** Events */
  events - The /**  events */
  events
 *
 * @returns {Promise<any>} Promise resolving to handleresendwebhook result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Handles resend webhook
 *
 * @param {ResendWebhookEvent | ResendWebhookEvent[]} events - The events
 *
 * @returns {Promise<any>} The handleresendwebhook result
 *
 */
async function handleResendWebhook(
  /** Events */
  events: ResendWebhookEvent | ResendWebhookEvent[]
) {
  const db = admin.firestore();
  const eventArray = Array.isArray(events) ? events : [events];

  for (const event of eventArray) {
    const { type, data } = event;
    const emailId = data.email_id;

    // Map Resend event types to our statuses
    const statusMap: Record<string, string> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.delivery_delayed": "delayed",
      "email.complained": "complained",
      "email.bounced": "bounced",
      "email.opened": "opened",
      "email.clicked": "clicked",
    };

    const status = statusMap[type] || "unknown";

    // Find email log by message ID (stored in emailLogs collection)
    const logsQuery = await db
      .collection("emailLogs")
      .where("messageId", "==", emailId)
      .limit(1)
      .get();

    if (logsQuery.empty) {
      console.warn(`Email log not found for message ID: ${emailId}`);
      continue;
    }

    const logRef = logsQuery.docs[0].ref;

    // Update email log with event
    const updateData: Record<string, any> = {
      status,
      /** Last Updated */
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (type === "email.opened") {
      updateData.openedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (type === "email.clicked") {
      updateData.clickedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.clickedLink = data.clicked_link;
    } else if (type === "email.bounced") {
      updateData.bounceType = data.bounce_type;
    }

    await logRef.update(updateData);

    // Log webhook event
    await db.collection("emailWebhookEvents").add({
      /** Provider */
      provider: "resend",
      type,
      emailId,
      data,
      /** Received At */
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Handles send grid webhook
 */
/**
 * Handles send grid webhook event
 *
 * @param {SendGridWebhookEvent | SendGridWebhookEvent[]} events - The events
 *
 * @returns {Promise<any>} Promise resolving to handlesendgridwebhook result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Handles send grid webhook event
 *
 * @param {SendGridWebhookEvent | SendGridWebhookEvent[]} /** Events */
  events - The /** /**
 * Handles send grid webhook
 *
 * @param {SendGridWebhookEvent | SendGridWebhookEvent[]} events - The events
 *
 * @returns {Promise<any>} The handlesendgridwebhook result
 *
 */
 events */
  events
 *
 * @returns {Promise<any>} Promise resolving to handlesendgridwebhook result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function handleSendGridWebhook(
  /** Events */
  events: SendGridWebhookEvent | SendGridWebhookEvent[]
) {
  const db = admin.firestore();
  const eventArray = Array.isArray(events) ? events : [events];

  for (const event of eventArray) {
    const { event: eventType, sg_message_id } = event;

    // Map SendGrid event types to our statuses
    const statusMap: Record<string, string> = {
      /** Processed */
      processed: "sent",
      /** Delivered */
      delivered: "delivered",
      /** Open */
      open: "opened",
      /** Click */
      click: "clicked",
      /** Bounce */
      bounce: "bounced",
      /** Dropped */
      dropped: "dropped",
      /** Deferred */
      deferred: "delayed",
      /** Spamreport */
      spamreport: "complained",
    };

    const status = statusMap[eventType] || "unknown";

    // Find email log by message ID
    const logsQuery = await db
      .collection("emailLogs")
      .where("messageId", "==", sg_message_id)
      .limit(1)
      .get();

    if (logsQuery.empty) {
      console.warn(`Email log not found for message ID: ${sg_message_id}`);
      continue;
    }

    const logRef = logsQuery.docs[0].ref;

    // Update email log with event
    const updateData: Record<string, any> = {
      status,
      /** Last Updated */
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (eventType === "open") {
      updateData.openedAt = admin.firestore.Timestamp.fromMillis(
        event.timestamp * 1000
      );
    } else if (eventType === "click") {
      updateData.clickedAt = admin.firestore.Timestamp.fromMillis(
        event.timestamp * 1000
      );
      updateData.clickedLink = event.url;
    } else if (eventType === "bounce") {
      updateData.bounceType = event.type;
      updateData.bounceReason = event.reason;
    } else if (eventType === "dropped") {
      updateData.dropReason = event.reason;
    }

    await logRef.update(updateData);

    // Log webhook event
    await db.collection("emailWebhookEvents").add({
      /** Provider */
      provider: "sendgrid",
      /** Type */
      type: eventType,
      /** Email Id */
      emailId: sg_message_id,
      /** Data */
      data: event,
      /** Received At */
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// GET - Not allowed (webhooks are POST only)
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST for webhooks." },
    { status: 405 }
  );
}
