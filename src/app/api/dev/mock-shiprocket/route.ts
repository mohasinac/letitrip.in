/**
 * Mock Shiprocket API — Dev Only
 *
 * Simulates Shiprocket's core APIs at /api/dev/mock-shiprocket
 * Mirrors the real Shiprocket schema so shipping flows can be tested without
 * real credentials.
 *
 * Endpoints (GET → status/tracking, POST → auth/order creation):
 *   POST   /api/dev/mock-shiprocket?action=login        — auth token
 *   POST   /api/dev/mock-shiprocket?action=create-order — create shipment
 *   GET    /api/dev/mock-shiprocket?action=track&awb=:awb — track by AWB
 *   GET    /api/dev/mock-shiprocket?action=rates&...    — courier rate lookup
 *
 * NEVER ships to production.
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

function mockId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function randomAwb() {
  return `AWB${Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000}`;
}

const SHIPMENTS = new Map<string, Record<string, unknown>>();

const TRACKING_STATUSES = [
  "Pickup Scheduled",
  "Pickup Completed",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

export async function GET(req: NextRequest) {
  const guard = devGuard();
  if (guard) return guard;

  const action = req.nextUrl.searchParams.get("action");

  // Health check
  if (!action || action === "status") {
    return NextResponse.json({
      status: "ok",
      mock: true,
      service: "Shiprocket Mock API",
      endpoints: ["login", "create-order", "track", "rates"],
    });
  }

  // Track by AWB
  if (action === "track") {
    const awb = req.nextUrl.searchParams.get("awb") ?? "";
    const shipment = SHIPMENTS.get(awb);
    const randomStatus = TRACKING_STATUSES[Math.floor(Math.random() * TRACKING_STATUSES.length)];

    return NextResponse.json({
      tracking_data: {
        track_status: 1,
        shipment_status: randomStatus,
        shipment_track: [
          {
            id: Math.floor(Math.random() * 100000),
            awb_code: awb,
            courier_company_id: 1,
            shipment_id: shipment?.shipment_id ?? mockId("shp"),
            order_id: shipment?.order_id ?? mockId("ord"),
            pickup_date: new Date(Date.now() - 86_400_000 * 2).toISOString(),
            delivered_date: randomStatus === "Delivered"
              ? new Date().toISOString()
              : null,
            weight: "0.5 kg",
            packages: 1,
            current_status: randomStatus,
            delivered_to: "Customer",
            destination: "Mumbai, MH",
            origin: "Delhi, DL",
            courier_company: "BlueDart Express",
          },
        ],
        shipment_track_activities: [
          {
            date: new Date(Date.now() - 86_400_000 * 2).toLocaleString("en-IN"),
            status: "Pickup Completed",
            activity: "Shipment picked up from origin",
            location: "Delhi Hub",
          },
          {
            date: new Date(Date.now() - 86_400_000).toLocaleString("en-IN"),
            status: "In Transit",
            activity: "In transit to destination hub",
            location: "Nagpur Sorting Centre",
          },
          ...(randomStatus === "Delivered"
            ? [{
                date: new Date().toLocaleString("en-IN"),
                status: "Delivered",
                activity: "Delivered to customer",
                location: "Mumbai, MH",
              }]
            : []),
        ],
        track_url: `https://shiprocket.co/tracking/${awb}`,
      },
    });
  }

  // Courier rates
  if (action === "rates") {
    const weight = req.nextUrl.searchParams.get("weight") ?? "0.5";
    return NextResponse.json({
      status: 200,
      courier_data: [
        {
          courier_company_id: 1,
          courier_name: "BlueDart Express",
          rate: 120,
          estimated_delivery_days: 2,
          is_surface: false,
          cod_charges: 0,
        },
        {
          courier_company_id: 2,
          courier_name: "Delhivery",
          rate: 89,
          estimated_delivery_days: 3,
          is_surface: true,
          cod_charges: 30,
        },
        {
          courier_company_id: 3,
          courier_name: "DTDC",
          rate: 65,
          estimated_delivery_days: 4,
          is_surface: true,
          cod_charges: 40,
        },
      ],
      weight_used: parseFloat(weight),
    });
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const guard = devGuard();
  if (guard) return guard;

  const action = req.nextUrl.searchParams.get("action");
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  // Login — return a mock JWT
  if (action === "login" || !action) {
    return NextResponse.json({
      token: `mock_sr_token_${crypto.randomBytes(16).toString("hex")}`,
      company_id: 1,
      user: {
        id: 1,
        company_id: 1,
        first_name: "Mock",
        last_name: "User",
        email: "mock@letitrip.dev",
      },
    });
  }

  // Create order
  if (action === "create-order") {
    const awb = randomAwb();
    const orderId = mockId("ord");
    const shipmentId = mockId("shp");
    const labelUrl = `https://ship.mock/labels/${awb}.pdf`;

    const shipment: Record<string, unknown> = {
      order_id: orderId,
      shipment_id: shipmentId,
      status: "NEW",
      status_code: 1,
      awb_code: awb,
      courier_company_id: 1,
      courier_name: "BlueDart Express",
      label: labelUrl,
      pickup_scheduled_date: new Date(Date.now() + 86_400_000).toISOString(),
      pickup_token_number: `PTN${Math.floor(Math.random() * 9000) + 1000}`,
      routing_code: `DEL-MUM-${Math.floor(Math.random() * 9000) + 1000}`,
      invoice: `INV-${Date.now()}`,
      order_billing_amount: (body.billing_customer_charge as number) ?? 0,
    };

    SHIPMENTS.set(awb, shipment);

    return NextResponse.json({
      order_id: orderId,
      shipment_id: shipmentId,
      status: 1,
      status_code: 200,
      awb_code: awb,
      courier_company_id: 1,
      courier_name: "BlueDart Express",
      applied_weight: 0.5,
      company_auto_ship_enabled: false,
      routing_code: shipment.routing_code,
      invoice: shipment.invoice,
      label: labelUrl,
      pickup_scheduled_date: shipment.pickup_scheduled_date,
      pickup_token_number: shipment.pickup_token_number,
    });
  }

  // Cancel order
  if (action === "cancel-order") {
    const ids = (body.ids as number[]) ?? [];
    return NextResponse.json({
      message: `${ids.length} Shipment(s) cancelled`,
      status_code: 200,
      ids,
    });
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
