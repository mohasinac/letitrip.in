/**
 * @fileoverview TypeScript Module
 * @module src/app/api/orders/[id]/shipment/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Request */
  request, {});
 */

export async function POST(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const user = await getCurrentUser(request);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const role = user.role;
    if (!(role === "seller" || role === "admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const awaitedParams = await params;
    id = awaitedParams.id;
    const orderRef = Collections.orders().doc(id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );

    const order = orderSnap.data() as any;
    if (role === "seller") {
      const owns = await userOwnsShop(order.shop_id, user.id);
      if (!owns)
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
    }

    const { carrier, tracking_number, eta } = await request.json();
    const shipment = {
      /** Carrier */
      carrier: carrier || null,
      tracking_number: tracking_number || null,
      /** Eta */
      eta: eta || null,
      created_at: new Date().toISOString(),
      created_by: user.id,
    };

    await orderRef.update({
      shipment,
      /** Status */
      status: "shipped",
      updated_at: new Date().toISOString(),
    });

    const updated = await orderRef.get();
    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.orders.shipment",
      /** Metadata */
      metadata: { orderId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to create shipment" },
      { status: 500 },
    );
  }
}
