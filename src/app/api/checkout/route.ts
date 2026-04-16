import "@/providers.config";
import { z } from "zod";
import {
  unitOfWork, siteSettingsRepository, userRepository, } from "@mohasinac/appkit/repositories";
import { failedCheckoutRepository } from "@mohasinac/appkit/features/checkout";
import { successResponse } from "@mohasinac/appkit/next";
import {
  ApiError, ValidationError, NotFoundError, } from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { sendOrderConfirmationEmail } from "@mohasinac/appkit/features/contact";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { splitCartIntoOrderGroups, resolveDate } from "@mohasinac/appkit/utils";

/**
 * Checkout API
 *
 * POST /api/checkout — Place order(s) from the user's cart
 *
 * Flow:
 *  1.  Authenticate user
 *  2.  Validate request body (addressId, paymentMethod, excludedProductIds?)
 *  3.  Load cart & verify it has items
 *  4.  Resolve & validate shipping address
 *  5.  Detect third-party address → require verified consent OTP
 *  6.  Run a single Firestore transaction that:
 *        a. Re-reads each product's availableQuantity under a lock
 *        b. Decrements stock for items that are in-stock
 *        c. Collects out-of-stock items as unavailableItems (no decrement)
 *        d. Clears the cart (removes only items that succeeded)
 *  7.  Create order documents for available items
 *  8.  Send confirmation emails (fire-and-forget)
 *  9.  Return { orderIds, total, itemCount, unavailableItems? }
 *
 * The transaction in step 6 guarantees that concurrent buyers never
 * double-decrement stock: if two users buy the last unit simultaneously,
 * exactly one transaction wins and the other returns that item as unavailable.
 */

import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import { PRODUCT_COLLECTION, CART_COLLECTION } from "@/db/schema";
import {
  consentOtpRef,
  consentOtpRateLimitRef,
  CONSENT_OTP_MAX_BYPASS_CREDITS,
} from "@mohasinac/appkit/features/auth";
import type { AddressDocument, ProductDocument } from "@/db/schema";

// ─── Validation Schema ────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  addressId: z.string().min(1, "addressId is required"),
  paymentMethod: z.enum(["cod", "online", "upi_manual"]).default("cod"),
  notes: z.string().max(500).optional(),
  /** Product IDs the buyer explicitly excluded (e.g., after preflight warned they're unavailable). */
  excludedProductIds: z.array(z.string()).optional(),
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

export const POST = createRouteHandler<(typeof checkoutSchema)["_output"]>({
  auth: true,
  schema: checkoutSchema,
  handler: async ({ user, body }) => {
    const { addressId, paymentMethod, notes, excludedProductIds = [] } = body!;
    const uid = user!.uid;

    // Fetch commission config from site settings (for deposit + shipping fees)
    const siteSettings = await siteSettingsRepository.getSingleton();
    const commissions = siteSettings?.commissions ?? {
      codDepositPercent: 10,
      sellerShippingFixed: 50,
      platformShippingPercent: 10,
      platformShippingFixedMin: 50,
    };

    // 3. Load cart
    const cart = await unitOfWork.carts.getOrCreate(uid);
    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.CART_EMPTY);
    }

    // Apply buyer exclusions (items they chose to skip after the preflight warning)
    const excludedSet = new Set(excludedProductIds);
    const cartItems = cart.items.filter(
      (item) => !excludedSet.has(item.productId),
    );
    if (cartItems.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.CART_EMPTY);
    }

    // 4. Resolve shipping address
    const address = await unitOfWork.addresses.findById(uid, addressId);
    if (!address) {
      failedCheckoutRepository
        .logCheckout(uid, "address_not_found", "Address not found", {
          addressId,
          paymentMethod,
        })
        .catch(() => {});
      throw new NotFoundError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
    }
    const shippingAddress = formatShippingAddress(address);

    // 5. Every order — regardless of whether it's for self or a third party —
    //    requires a verified checkout consent OTP (either SMS or email path).
    //    The consent doc is written by grantCheckoutConsentViaSmsAction (SMS)
    //    or verifyConsentOtpAction / consent-otp/verify route (email) before
    //    the buyer calls this endpoint.
    const db = getAdminDb();
    const otpRef = consentOtpRef(db, uid, addressId);

    interface StockResult {
      available: { item: (typeof cartItems)[0]; product: ProductDocument }[];
      unavailable: {
        productId: string;
        productTitle: string;
        requestedQty: number;
        availableQty: number;
      }[];
      /** Whether the consent OTP was verified via email (not SMS). Used for bypass-credit grant. */
      emailOtpUsed: boolean;
    }

    let stockResult: StockResult;
    try {
      stockResult = await db.runTransaction(
        async (tx: FirebaseFirestore.Transaction): Promise<StockResult> => {
          // Validate consent OTP atomically — checked for ALL orders.
          // Two concurrent requests both seeing verified=true: only one transaction
          // commits (Firestore optimistic locking); the second finds the OTP gone.
          const otpSnap = await tx.get(otpRef);
          const otpData = otpSnap.exists
            ? (otpSnap.data() as {
                verified?: boolean;
                expiresAt?: FirebaseFirestore.Timestamp;
                verifiedVia?: string;
              })
            : null;
          const isConsentValid =
            otpData?.verified === true &&
            otpData.expiresAt &&
            (resolveDate(otpData.expiresAt)?.getTime() ?? 0) > Date.now();
          if (!isConsentValid) {
            const reason = !otpData ? "otp_not_verified" : "consent_expired";
            throw Object.assign(
              new ApiError(
                403,
                "Order verification required. Please complete OTP verification before placing this order.",
              ),
              { _failReason: reason },
            );
          }
          const emailOtpUsed = otpData.verifiedVia !== "sms";

          const productRefs = cartItems.map((item) =>
            db.collection(PRODUCT_COLLECTION).doc(item.productId),
          );
          const productDocs = await Promise.all(
            productRefs.map((ref) => tx.get(ref)),
          );

          const availableItems: StockResult["available"] = [];
          const unavailableItems: StockResult["unavailable"] = [];

          for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            const doc = productDocs[i];
            const productData = doc.exists
              ? (doc.data() as ProductDocument)
              : null;

            if (
              !productData ||
              productData.status !== "published" ||
              productData.availableQuantity < item.quantity
            ) {
              unavailableItems.push({
                productId: item.productId,
                productTitle: item.productTitle,
                requestedQty: item.quantity,
                availableQty: productData?.availableQuantity ?? 0,
              });
            } else {
              // Decrement stock atomically
              tx.update(productRefs[i], {
                availableQuantity:
                  productData.availableQuantity - item.quantity,
                updatedAt: new Date(),
              });
              availableItems.push({ item, product: productData });
            }
          }

          // Clear only the successfully-ordered items from cart.
          // Items that failed (unavailableItems) remain so the buyer can see them.
          if (availableItems.length > 0) {
            const orderedProductIds = new Set(
              availableItems.map((a) => a.item.productId),
            );
            const remainingCartItems = cart.items.filter(
              (ci) => !orderedProductIds.has(ci.productId),
            );
            const cartRef = db.collection(CART_COLLECTION).doc(uid);
            tx.set(
              cartRef,
              { items: remainingCartItems, updatedAt: new Date() },
              { merge: true },
            );
            // Atomically consume the consent OTP so a concurrent request cannot reuse it
            tx.delete(otpRef);
          }

          return {
            available: availableItems,
            unavailable: unavailableItems,
            emailOtpUsed,
          };
        },
      );
    } catch (err: unknown) {
      // Log the failure before re-throwing
      const reason =
        (err as { _failReason?: string })?._failReason === "consent_expired"
          ? "consent_expired"
          : (err as { _failReason?: string })?._failReason ===
              "otp_not_verified"
            ? "otp_not_verified"
            : "unknown";
      failedCheckoutRepository
        .logCheckout(
          uid,
          reason as import("@/db/schema").FailedCheckoutReason,
          err instanceof Error ? err.message : String(err),
          { addressId, paymentMethod },
        )
        .catch(() => {});
      throw err;
    }
    const { available, unavailable, emailOtpUsed } = stockResult;

    // All items were out of stock — no order can be placed
    if (available.length === 0) {
      failedCheckoutRepository
        .logCheckout(uid, "stock_failed", "All items out of stock", {
          addressId,
          paymentMethod,
          cartItemCount: cartItems.length,
        })
        .catch(() => {});
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.INSUFFICIENT_STOCK);
    }

    // 7. Create orders from the products that were successfully reserved
    const userName =
      (user!["displayName"] as string | null | undefined) ??
      user!.email ??
      "Unknown User";
    const userEmail = user!.email ?? "";

    const orderGroups = splitCartIntoOrderGroups(available);

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
      let shippingFee = 0;
      const sellerId = firstItem.sellerId;
      if (sellerId) {
        const sellerUser = await userRepository.findById(sellerId);
        const shippingConfig = sellerUser?.shippingConfig;
        if (shippingConfig?.isConfigured) {
          if (shippingConfig.method === "custom") {
            shippingFee = shippingConfig.customShippingPrice ?? 0;
          } else if (shippingConfig.method === "shiprocket") {
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

      // ── Collect deduplicated main images for order display convenience ────
      const imageUrls = [
        ...new Set(
          group
            .map(({ product }) => product.mainImage)
            .filter((url): url is string => typeof url === "string" && url.length > 0),
        ),
      ];

      const order = await unitOfWork.orders.create({
        productId: firstItem.productId,
        productTitle: firstItem.productTitle,
        userId: uid,
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
        offerId: firstItem.offerId ?? undefined,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod,
        shippingAddress,
        notes,
        shippingFee: shippingFee > 0 ? shippingFee : undefined,
        depositAmount,
        codRemainingAmount,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
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

    // 8. Grant a bypass credit for the EMAIL OTP cooldown if this was a partial
    //    order (unavailable items) and the email OTP path was used.
    //    SMS path has its own per-user cooldown via requestOtpGrant — no bypass needed.
    if (emailOtpUsed && unavailable.length > 0) {
      const metaRef = consentOtpRateLimitRef(db, uid);
      metaRef
        .get()
        .then((snap: FirebaseFirestore.DocumentSnapshot) => {
          const cur = snap.exists
            ? ((snap.data()?.bypassCredits as number) ?? 0)
            : 0;
          return metaRef.set(
            {
              bypassCredits: Math.min(cur + 1, CONSENT_OTP_MAX_BYPASS_CREDITS),
            },
            { merge: true },
          );
        })
        .catch((err: unknown) =>
          serverLogger.warn("Failed to grant consent OTP bypass credit", {
            err,
          }),
        );
    }

    // 9. Send confirmation emails (fire-and-forget)
    if (emailsToSend.length > 0) {
      Promise.all(emailsToSend.map((e) => sendOrderConfirmationEmail(e))).catch(
        (err: unknown) =>
          serverLogger.error("Order confirmation email error:", err),
      );
    }

    serverLogger.info(
      `POST /api/checkout: ${orderIds.length} order(s) placed for uid=${uid}` +
        (unavailable.length > 0
          ? ` (${unavailable.length} item(s) unavailable)`
          : ""),
    );

    // 10. Return success — include unavailableItems so the client can inform the buyer
    return successResponse(
      {
        orderIds,
        total,
        itemCount: orderIds.length,
        ...(unavailable.length > 0 && { unavailableItems: unavailable }),
      },
      SUCCESS_MESSAGES.CHECKOUT.ORDER_PLACED,
    );
  },
});

