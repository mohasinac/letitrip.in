/**
 * Trigger: onOrderStatusChange
 *
 * Fires whenever an order document is updated in the `orders` collection.
 * If the `status` field changed, it:
 *   1. Writes a typed Firestore notification to the buyer.
 *   2. Pushes a real-time alert to `notifications/{uid}` in Realtime DB.
 *   3. Sends a transactional email via Resend for key transitions
 *      (confirmed, shipped, delivered).
 */
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { notificationRepository } from "@mohasinac/appkit";
import { getRtdb } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { REGION, COLLECTIONS } from "../config/constants";
import { IntegrationError } from "../lib/errors";
import { decryptPii } from "../lib/pii";
import {
  ORDER_MESSAGES,
  EMAIL_SUBJECTS,
  FN_ERROR_MESSAGES,
} from "../constants/messages";

const TRIGGER = "onOrderStatusChange";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled";

interface StatusConfig {
  type: NotificationType;
  title: string;
  message: (order: { productTitle: string; trackingNumber?: string }) => string;
  priority: "low" | "normal" | "high";
  /** Whether to also send a Resend email for this transition */
  sendEmail: boolean;
}

const STATUS_CONFIG: Partial<Record<OrderStatus, StatusConfig>> = {
  confirmed: {
    type: "order_confirmed",
    title: ORDER_MESSAGES.CONFIRMED_TITLE,
    message: (o) => ORDER_MESSAGES.CONFIRMED_MESSAGE(o.productTitle),
    priority: "normal",
    sendEmail: true,
  },
  shipped: {
    type: "order_shipped",
    title: ORDER_MESSAGES.SHIPPED_TITLE,
    message: (o) =>
      ORDER_MESSAGES.SHIPPED_MESSAGE(o.productTitle, o.trackingNumber),
    priority: "high",
    sendEmail: true,
  },
  delivered: {
    type: "order_delivered",
    title: ORDER_MESSAGES.DELIVERED_TITLE,
    message: (o) => ORDER_MESSAGES.DELIVERED_MESSAGE(o.productTitle),
    priority: "normal",
    sendEmail: true,
  },
  cancelled: {
    type: "order_cancelled",
    title: ORDER_MESSAGES.CANCELLED_TITLE,
    message: (o) => `Your order for "${o.productTitle}" has been cancelled.`,
    priority: "normal",
    sendEmail: false,
  },
};

async function sendResendEmail(params: {
  to: string;
  status: OrderStatus;
  orderId: string;
  productTitle: string;
  trackingNumber?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY ?? "";
  if (!apiKey) {
    logError(TRIGGER, FN_ERROR_MESSAGES.RESEND_KEY_MISSING, null);
    return;
  }

  const subject =
    params.status === "confirmed"
      ? EMAIL_SUBJECTS.ORDER_CONFIRMED(params.productTitle)
      : params.status === "shipped"
        ? EMAIL_SUBJECTS.ORDER_SHIPPED(params.productTitle)
        : params.status === "delivered"
          ? EMAIL_SUBJECTS.ORDER_DELIVERED(params.productTitle)
          : EMAIL_SUBJECTS.ORDER_UPDATE_FALLBACK(params.productTitle);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "LetItRip <orders@letitrip.in>",
      to: [params.to],
      subject: subject,
      // Use a simple text/html for now; replace with a proper template later
      html: `<p>Hi,</p><p>Your order for <strong>${params.productTitle}</strong> is now <strong>${params.status}</strong>.</p>${
        params.trackingNumber
          ? `<p>Tracking number: ${params.trackingNumber}</p>`
          : ""
      }<p>Thanks,<br/>LetItRip Team</p>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new IntegrationError(
      "Resend",
      response.status,
      FN_ERROR_MESSAGES.RESEND_API_ERROR(response.status, body),
    );
  }
}

export const onOrderStatusChange = onDocumentUpdated(
  {
    document: `${COLLECTIONS.ORDERS}/{orderId}`,
    region: REGION,
  },
  async (event) => {
    const before = event.data?.before?.data() as
      | { status: OrderStatus }
      | undefined;
    const after = event.data?.after?.data() as
      | {
          status: OrderStatus;
          userId: string;
          userEmail: string;
          productTitle: string;
          trackingNumber?: string;
        }
      | undefined;

    if (!before || !after) return;
    if (before.status === after.status) return; // nothing changed

    // Decrypt PII that was encrypted at rest
    after.userEmail = decryptPii(after.userEmail) as string;

    const newStatus = after.status;
    const orderId = event.params.orderId;
    const config = STATUS_CONFIG[newStatus];

    if (!config) {
      // Status transition not configured (e.g. returned) — log and skip
      logInfo(TRIGGER, `No handler for status transition → ${newStatus}`, {
        orderId,
      });
      return;
    }

    try {
      const messageText = config.message({
        productTitle: after.productTitle,
        trackingNumber: after.trackingNumber,
      });

      // ── Firestore notification ───────────────────────────────────────────
      // Firestore notification
      await notificationRepository.create({
        userId: after.userId,
        type: config.type,
        priority: config.priority,
        title: config.title,
        message: messageText,
        relatedId: orderId,
        relatedType: "order",
      });

      // ── Realtime DB push ─────────────────────────────────────────────────
      try {
        await getRtdb().ref(`notifications/${after.userId}`).push({
          type: config.type,
          title: config.title,
          message: messageText,
          timestamp: Date.now(),
          read: false,
        });
      } catch (rtdbError) {
        logError(TRIGGER, "Realtime DB push failed (non-fatal)", rtdbError);
      }

      // ── Resend email ─────────────────────────────────────────────────────
      if (config.sendEmail) {
        try {
          await sendResendEmail({
            to: after.userEmail,
            status: newStatus,
            orderId,
            productTitle: after.productTitle,
            trackingNumber: after.trackingNumber,
          });
        } catch (emailError) {
          logError(TRIGGER, "Email send failed (non-fatal)", emailError, {
            orderId,
          });
        }
      }

      logInfo(TRIGGER, `Order ${orderId} status → ${newStatus}`, {
        userId: after.userId,
        emailSent: config.sendEmail,
      });
    } catch (error) {
      logError(TRIGGER, "Error handling order status change", error, {
        orderId,
      });
      throw error;
    }
  },
);
