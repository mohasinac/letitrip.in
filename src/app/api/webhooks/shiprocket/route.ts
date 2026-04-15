/**
 * POST /api/webhooks/shiprocket
 *
 * Receives Shiprocket shipment status update webhooks.
 * Shiprocket sends a webhook whenever a shipment's status changes.
 *
 * Security: Shiprocket allows setting a secret key for webhook verification.
 * When SHIPROCKET_WEBHOOK_SECRET is set in env, the X-Shiprocket-Signature
 * header is validated via HMAC-SHA256.
 *
 * On receipt:
 *   - Maps Shiprocket status to our internal order status
 *   - Updates order.shiprocketStatus, shiprocketUpdatedAt, trackingUrl
 *   - If status = "Delivered": sets order.status='delivered', deliveryDate=now,
 *                               payoutStatus='eligible'
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { orderRepository } from "@/repositories";
import { handleApiError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import type { ShiprocketWebhookPayload } from "@/lib/shiprocket/types";

// Vercel Hobby max is 60 s; Firestore read + write fits well within that.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// ─── Shiprocket → our internal order status mapping ──────────────────────────

const SHIPPED_STATUSES = new Set([
  "Shipped",
  "In Transit",
  "Out For Delivery",
  "Pickup Scheduled",
  "Picked Up",
]);

const DELIVERED_STATUS = "Delivered";

const CANCELLED_STATUSES = new Set([
  "Cancelled",
  "RTO Initiated",
  "RTO Delivered",
  "Lost",
  "Damaged",
]);

// ─── Signature verification helper ───────────────────────────────────────────

function verifyShiprocketSignature(body: string, signature: string): boolean {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  // Length guard: hex-encoded SHA-256 is always 64 chars
  if (signature.length !== 64) return false;
  return timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex"),
  );
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let rawBody = "";
  try {
    rawBody = await request.text();

    // Verify signature when configured
    const signature = request.headers.get("X-Shiprocket-Signature") ?? "";
    if (!verifyShiprocketSignature(rawBody, signature)) {
      serverLogger.warn("Shiprocket webhook: invalid signature", { signature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as ShiprocketWebhookPayload;
    const { order_id: srOrderId, current_status: status, awb } = payload;

    if (!srOrderId || !status) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Build standard Shiprocket tracking URL if AWB is present
    const trackingUrl = awb
      ? `https://shiprocket.co/tracking/${awb}`
      : undefined;

    // Find matching order by shiprocketOrderId numeric field
    const orders = await orderRepository.findBy("shiprocketOrderId", srOrderId);

    if (!orders || orders.length === 0) {
      serverLogger.warn("Shiprocket webhook: order not found", { srOrderId });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const order = orders[0];
    const orderId = order.id!;

    // Determine updates
    const updates: Record<string, unknown> = {
      shiprocketStatus: status,
      shiprocketUpdatedAt: new Date(),
    };
    if (trackingUrl) updates.trackingUrl = trackingUrl;
    if (awb) updates.shiprocketAWB = awb;

    if (status === DELIVERED_STATUS) {
      updates.status = "delivered";
      updates.deliveryDate = new Date();
      updates.payoutStatus = "eligible";
      serverLogger.info("Shiprocket webhook: order delivered", {
        orderId,
        srOrderId,
      });
    } else if (SHIPPED_STATUSES.has(status)) {
      if (order.status !== "delivered") {
        updates.status = "shipped";
      }
    } else if (CANCELLED_STATUSES.has(status)) {
      serverLogger.info("Shiprocket webhook: order cancelled/returned", {
        orderId,
        srOrderId,
        status,
      });
      // Do not override status automatically on cancellation — admin handles manually
    }

    await orderRepository.update(
      orderId,
      updates as Partial<import("@/db/schema").OrderDocument>,
    );

    serverLogger.info("Shiprocket webhook processed", {
      orderId,
      srOrderId,
      status,
      awb,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    serverLogger.error("Shiprocket webhook error", {
      error,
      rawBody: rawBody.slice(0, 500),
    });
    return handleApiError(error);
  }
}

