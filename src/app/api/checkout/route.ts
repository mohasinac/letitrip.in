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
 *  6. Split cart by type+seller → auction=1/item, preorder=1/seller, standard=1/seller
 *  7. Deduct availableQuantity from each product
 *  8. Clear the cart
 *  9. Return { orderIds, total, itemCount }
 */

import { z } from "zod";
import {
  unitOfWork,
  siteSettingsRepository,
  userRepository,
} from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createApiHandler } from "@/lib/api/api-handler";
import { splitCartIntoOrderGroups } from "@/utils";
import type { AddressDocument } from "@/db/schema";

// ─── Validation Schema ────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  addressId: z.string().min(1, "addressId is required"),
  paymentMethod: z.enum(["cod", "online", "upi_manual"]).default("cod"),
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

export const POST = createApiHandler<(typeof checkoutSchema)["_output"]>({
  auth: true,
  schema: checkoutSchema,
  handler: async ({ user, body }) => {
    const { addressId, paymentMethod, notes } = body!;

    // Fetch commission config from site settings (for deposit + shipping fees)
    const siteSettings = await siteSettingsRepository.getSingleton();
    const commissions = siteSettings?.commissions ?? {
      codDepositPercent: 10,
      sellerShippingFixed: 50,
      platformShippingPercent: 10,
      platformShippingFixedMin: 50,
    };

    // 3. Load cart
    const cart = await unitOfWork.carts.getOrCreate(user!.uid);
    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.CART_EMPTY);
    }

    // 4. Resolve shipping address (throws NotFoundError if missing)
    const address = await unitOfWork.addresses.findById(user!.uid, addressId);
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

    // 6. Split cart into typed order groups:
    //    • auction items   → 1 order per item (independent lot)
    //    • pre-order items → 1 order per seller (consolidated deposit)
    //    • standard items  → 1 order per seller (same-store shipment)
    const userName = user!.displayName ?? user!.email ?? "Unknown User";
    const userEmail = user!.email ?? "";

    const orderGroups = splitCartIntoOrderGroups(productChecks);

    const orderIds: string[] = [];
    let total = 0;
    const emailsToSend: Parameters<typeof sendOrderConfirmationEmail>[0][] = [];

    for (const { items: group, orderType } of orderGroups) {
      const firstItem = group[0].item;
      const groupTotal = group.reduce(
        (sum, { item }) => sum + item.price * item.quantity,
        0,
      );
      total += groupTotal;

      const orderItems = group.map(({ item }) => ({
        productId: item.productId,
        productTitle: item.productTitle,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      }));
      const totalQuantity = group.reduce(
        (sum, { item }) => sum + item.quantity,
        0,
      );

      // ── Shipping fee ──────────────────────────────────────────────────────
      // Fetch seller's shipping config to determine shipping fee for this group.
      let shippingFee = 0;
      const sellerId = firstItem.sellerId;
      if (sellerId) {
        const sellerUser = await userRepository.findById(sellerId);
        const shippingConfig = sellerUser?.shippingConfig;
        if (shippingConfig?.isConfigured) {
          if (shippingConfig.method === "custom") {
            // Seller sets their own price; platform takes ₹50 commission (internal).
            shippingFee = shippingConfig.customShippingPrice ?? 0;
          } else if (shippingConfig.method === "shiprocket") {
            // Platform charges: max(10% of order total, minimum fixed fee).
            const percentFee =
              groupTotal * (commissions.platformShippingPercent / 100);
            shippingFee = Math.max(
              percentFee,
              commissions.platformShippingFixedMin,
            );
          }
        }
      }

      // ── COD deposit ───────────────────────────────────────────────────────
      const isCodLike =
        paymentMethod === "cod" || paymentMethod === "upi_manual";
      const depositAmount = isCodLike
        ? Math.round(groupTotal * (commissions.codDepositPercent / 100) * 100) /
          100
        : undefined;
      const codRemainingAmount = isCodLike
        ? Math.round((groupTotal - (depositAmount ?? 0)) * 100) / 100
        : undefined;

      const orderTotal = groupTotal + shippingFee;

      const order = await unitOfWork.orders.create({
        productId: firstItem.productId,
        productTitle: firstItem.productTitle,
        userId: user!.uid,
        userName,
        userEmail,
        quantity: totalQuantity,
        unitPrice: firstItem.price,
        totalPrice: orderTotal,
        currency: firstItem.currency ?? "INR",
        sellerId: firstItem.sellerId || undefined,
        sellerName: firstItem.sellerName || undefined,
        items: orderItems,
        orderType,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod,
        shippingAddress,
        notes,
        shippingFee: shippingFee > 0 ? shippingFee : undefined,
        depositAmount,
        codRemainingAmount,
      });

      orderIds.push(order.id);

      if (userEmail) {
        emailsToSend.push({
          to: userEmail,
          userName,
          orderId: order.id,
          productTitle:
            orderItems.length > 1
              ? `${orderItems.length} items`
              : firstItem.productTitle,
          quantity: totalQuantity,
          totalPrice: orderTotal,
          currency: firstItem.currency ?? "INR",
          shippingAddress,
          paymentMethod,
          items: orderItems,
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
      unitOfWork.carts.updateInBatch(batch, user!.uid, { items: [] } as any);
    });

    // 9. Send confirmation emails (fire-and-forget)
    if (emailsToSend.length > 0) {
      Promise.all(emailsToSend.map((e) => sendOrderConfirmationEmail(e))).catch(
        (err) => serverLogger.error("Order confirmation email error:", err),
      );
    }

    serverLogger.info(
      `POST /api/checkout: ${orderIds.length} store order(s) placed for user ${user!.uid}`,
    );

    // 10. Return success
    return successResponse(
      { orderIds, total, itemCount: orderIds.length },
      SUCCESS_MESSAGES.CHECKOUT.ORDER_PLACED,
    );
  },
});
