import { withProviders } from "@/providers.config";
/**
 * Checkout Preflight
 *
 * POST /api/checkout/preflight
 *
 * Non-mutating stock availability check run immediately before order placement.
 * Allows the UI to warn the buyer that some items are no longer available and
 * ask whether they want to continue with a partial order, before any stock is
 * actually decremented.
 *
 * Returns:
 *   { available: CartItemDocument[], unavailable: UnavailableItem[] }
 *
 * NOTE: This check is advisory only â€” it is NOT atomic.  The actual checkout
 * route uses a Firestore transaction that re-validates stock under a lock.
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { unitOfWork } from "@mohasinac/appkit/core/unit-of-work";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { ProductStatusValues } from "@mohasinac/appkit/features/products/schemas/firestore";
import type { CartItemDocument } from "@mohasinac/appkit/features/cart/schemas/firestore";

// --- Schema -------------------------------------------------------------------

const schema = z.object({
  addressId: z.string().min(1, "addressId is required"),
});

// --- Types --------------------------------------------------------------------

export interface UnavailableItem {
  productId: string;
  productTitle: string;
  requestedQty: number;
  availableQty: number;
}

// --- POST Handler -------------------------------------------------------------

export const POST = withProviders(createRouteHandler<(typeof schema)["_output"]>({
  auth: true,
  schema,
  handler: async ({ user }) => {
    const uid = user!.uid;

    // Load cart
    const cart = await unitOfWork.carts.getOrCreate(uid);
    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.CART_EMPTY);
    }

    const available: CartItemDocument[] = [];
    const unavailable: UnavailableItem[] = [];

    // Check each item's available stock (parallel reads, not transactional)
    await Promise.all(
      cart.items.map(async (item) => {
        const product = await unitOfWork.products.findById(item.productId);
        if (
          !product ||
          product.status !== ProductStatusValues.PUBLISHED ||
          product.availableQuantity < item.quantity
        ) {
          unavailable.push({
            productId: item.productId,
            productTitle: item.productTitle,
            requestedQty: item.quantity,
            availableQty: product?.availableQuantity ?? 0,
          });
        } else {
          available.push(item);
        }
      }),
    );

    serverLogger.info(
      `Checkout preflight: uid=${uid} available=${available.length} unavailable=${unavailable.length}`,
    );

    return successResponse({ available, unavailable });
  },
}));
