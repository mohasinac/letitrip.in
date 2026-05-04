/**
 * Mock Razorpay API — Dev Only
 *
 * Simulates Razorpay's core APIs at /api/dev/mock-razorpay
 * Mirrors the real Razorpay schema so payment flows can be tested without
 * real credentials or going live.
 *
 * Endpoints (all require dev mode):
 *   POST   /api/dev/mock-razorpay          — create order (Razorpay POST /v1/orders)
 *   GET    /api/dev/mock-razorpay?id=:id   — fetch order  (Razorpay GET  /v1/orders/:id)
 *
 * NEVER ships to production: the route returns 403 outside NODE_ENV=development.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const DEV_ONLY = process.env.NODE_ENV !== "development";

function devGuard() {
  if (DEV_ONLY) {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }
  return null;
}

function mockOrderId() {
  return `order_mock_${crypto.randomBytes(8).toString("hex")}`;
}

function mockPaymentId() {
  return `pay_mock_${crypto.randomBytes(8).toString("hex")}`;
}

// In-memory store for created orders (persists per process restart only)
const ORDERS = new Map<string, Record<string, unknown>>();

export async function GET(req: NextRequest) {
  const guard = devGuard();
  if (guard) return guard;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id param" }, { status: 400 });
  }

  const order = ORDERS.get(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function POST(req: NextRequest) {
  const guard = devGuard();
  if (guard) return guard;

  const url = req.nextUrl.pathname;

  // POST /api/dev/mock-razorpay/payments/verify — signature verification
  if (url.includes("/payments/verify")) {
    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as Record<string, string>;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Always verify as success in mock mode — generate a valid mock signature
    const mockSecret = "mock_webhook_secret";
    const expectedSignature = crypto
      .createHmac("sha256", mockSecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const order = ORDERS.get(razorpay_order_id);
    if (order) {
      ORDERS.set(razorpay_order_id, { ...order, status: "paid" });
    }

    return NextResponse.json({
      verified: true,
      signature_match: razorpay_signature === expectedSignature,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      note: "Mock verification — always succeeds in dev mode",
    });
  }

  // POST /api/dev/mock-razorpay/payments/capture/:id
  if (url.includes("/payments/capture/")) {
    const paymentId = url.split("/payments/capture/").pop() ?? "";
    const body = await req.json().catch(() => ({})) as { amount?: number };
    return NextResponse.json({
      id: paymentId,
      entity: "payment",
      amount: body.amount ?? 100000,
      currency: "INR",
      status: "captured",
      captured: true,
      description: "Mock capture",
    });
  }

  // POST /api/dev/mock-razorpay/refunds
  if (url.includes("/refunds")) {
    const body = await req.json().catch(() => ({})) as { payment_id?: string; amount?: number };
    return NextResponse.json({
      id: `rfnd_mock_${crypto.randomBytes(8).toString("hex")}`,
      entity: "refund",
      amount: body.amount ?? 100000,
      currency: "INR",
      payment_id: body.payment_id ?? "",
      status: "processed",
      speed_processed: "normal",
      created_at: Math.floor(Date.now() / 1000),
    });
  }

  // Default: POST /api/dev/mock-razorpay — create order
  const body = await req.json().catch(() => ({})) as {
    amount?: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  };

  const { amount = 100000, currency = "INR", receipt, notes = {} } = body;

  const orderId = mockOrderId();
  const paymentId = mockPaymentId();

  const order: Record<string, unknown> = {
    id: orderId,
    entity: "order",
    amount,
    amount_paid: 0,
    amount_due: amount,
    currency,
    receipt: receipt ?? `rcpt_mock_${Date.now()}`,
    offer_id: null,
    status: "created",
    attempts: 0,
    notes: {
      ...notes,
      _mock: "true",
      _payment_id: paymentId,
    },
    created_at: Math.floor(Date.now() / 1000),
  };

  ORDERS.set(orderId, order);

  return NextResponse.json(order, { status: 200 });
}
