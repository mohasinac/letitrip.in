/**
 * Checkout API
 *
 * POST /api/checkout — Place order(s) from the user's cart
 *
 * Flow:
 *  1. Authenticate user
 *  2. Validate request body (addressId, paymentMethod)
 *  3. Load cart & verify it has items
 *  4. Resolve & validate shipping address
 *  5. For each cart item: fetch product, check stock
 *  6. Create one OrderDocument per cart item
 *  7. Deduct availableQuantity from each product
 *  8. Clear the cart
 *  9. Return { orderIds, total, itemCount }
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { unitOfWork } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { AddressDocument } from "@/db/schema";

// ─── Validation Schema ────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  addressId: z.string().min(1, "addressId is required"),
  paymentMethod: z.enum(["cod", "online"]).default("cod"),
  notes: z.string().max(500).optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats an AddressDocument into a single-line string for the order record.
 */
function formatShippingAddress(a: AddressDocument): string {
  const parts = [
    a.fullName,
    a.addressLine1,
    a.addressLine2,
    a.landmark,
    a.city,
    a.state,
    a.postalCode,
    a.country,
  ].filter(Boolean);
  return parts.join(", ");
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const user = await requireAuthFromRequest(request);

    // 2. Validate body
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }
    const { addressId, paymentMethod, notes } = validation.data;

    // 3. Load cart
    const cart = await unitOfWork.carts.getOrCreate(user.uid);
    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.CART_EMPTY);
    }

    // 4. Resolve shipping address (throws NotFoundError if missing)
    const address = await unitOfWork.addresses.findById(user.uid, addressId);
    if (!address) {
      throw new NotFoundError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
    }
    const shippingAddress = formatShippingAddress(address);

    // 5. Pre-validate all products (fail fast before creating any orders)
    const productChecks = await Promise.all(
      cart.items.map(async (item) => {
        const product = await unitOfWork.products.findById(item.productId);
        return { item, product };
      }),
    );

    for (const { item, product } of productChecks) {
      if (!product || product.status !== "published") {
        throw new ValidationError(ERROR_MESSAGES.CHECKOUT.PRODUCT_UNAVAILABLE);
      }
      if (product.availableQuantity < item.quantity) {
        throw new ValidationError(ERROR_MESSAGES.CHECKOUT.INSUFFICIENT_STOCK);
      }
    }

    // 6. Create one order per cart item
    const userName = user.displayName ?? user.email ?? "Unknown User";
    const userEmail = user.email ?? "";

    const orderIds: string[] = [];
    let total = 0;
    const emailsToSend: Parameters<typeof sendOrderConfirmationEmail>[0][] = [];

    for (const { item, product } of productChecks) {
      if (!product) continue; // narrowing — already validated above

      const unitPrice = item.price; // captured price at add-to-cart time
      const totalPrice = unitPrice * item.quantity;
      total += totalPrice;

      const order = await unitOfWork.orders.create({
        productId: item.productId,
        productTitle: item.productTitle,
        userId: user.uid,
        userName,
        userEmail,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        currency: item.currency ?? "INR",
        status: "pending",
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
        paymentMethod,
        shippingAddress,
        notes,
      });

      orderIds.push(order.id);

      if (userEmail) {
        emailsToSend.push({
          to: userEmail,
          userName,
          orderId: order.id,
          productTitle: item.productTitle,
          quantity: item.quantity,
          totalPrice,
          currency: item.currency ?? "INR",
          shippingAddress,
          paymentMethod,
        });
      }
    }

    // 7+8. Atomically deduct stock for every item and clear the cart
    //      (batch ensures either ALL stock updates + cart clear succeed, or none do)
    await unitOfWork.runBatch((batch) => {
      for (const { item, product } of productChecks) {
        if (!product) continue;
        unitOfWork.products.updateInBatch(batch, item.productId, {
          availableQuantity: product.availableQuantity - item.quantity,
        } as any);
      }
      unitOfWork.carts.updateInBatch(batch, user.uid, { items: [] } as any);
    });

    // 9. Send confirmation emails (fire-and-forget)
    if (emailsToSend.length > 0) {
      Promise.all(emailsToSend.map((e) => sendOrderConfirmationEmail(e))).catch(
        (err) => serverLogger.error("Order confirmation email error:", err),
      );
    }

    serverLogger.info(
      `POST /api/checkout: ${orderIds.length} orders placed for user ${user.uid}`,
    );

    // 10. Return success
    return successResponse(
      { orderIds, total, itemCount: orderIds.length },
      SUCCESS_MESSAGES.CHECKOUT.ORDER_PLACED,
    );
  } catch (error) {
    serverLogger.error(`POST /api/checkout error:`, error);
    return handleApiError(error);
  }
}
