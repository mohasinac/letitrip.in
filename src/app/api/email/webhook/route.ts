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

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    to: string;
    from: string;
    subject: string;
    clicked_link?: string;
    bounce_type?: string;
  };
}

interface SendGridWebhookEvent {
  event: string;
  email: string;
  timestamp: number;
  sg_message_id: string;
  url?: string;
  reason?: string;
  type?: string;
}

// POST - Handle webhook events
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
      component: "EmailWebhookAPI.POST",
    });
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handleResendWebhook(
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
      provider: "resend",
      type,
      emailId,
      data,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

async function handleSendGridWebhook(
  events: SendGridWebhookEvent | SendGridWebhookEvent[]
) {
  const db = admin.firestore();
  const eventArray = Array.isArray(events) ? events : [events];

  for (const event of eventArray) {
    const { event: eventType, sg_message_id } = event;

    // Map SendGrid event types to our statuses
    const statusMap: Record<string, string> = {
      processed: "sent",
      delivered: "delivered",
      open: "opened",
      click: "clicked",
      bounce: "bounced",
      dropped: "dropped",
      deferred: "delayed",
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
      provider: "sendgrid",
      type: eventType,
      emailId: sg_message_id,
      data: event,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// GET - Not allowed (webhooks are POST only)
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST for webhooks." },
    { status: 405 }
  );
}
