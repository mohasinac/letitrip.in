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

import { z } from "zod";
import {
  unitOfWork,
  siteSettingsRepository,
  userRepository,
} from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { ApiError, ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createApiHandler } from "@/lib/api/api-handler";
import { splitCartIntoOrderGroups } from "@/utils";
import { resolveDate } from "@/utils";
import { getAdminDb } from "@/lib/firebase/admin";
import { PRODUCT_COLLECTION, CART_COLLECTION } from "@/db/schema";
import {
  consentOtpRef,
  consentOtpRateLimitRef,
  CONSENT_OTP_MAX_BYPASS_CREDITS,
} from "@/lib/consent-otp";
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

/**
 * Normalize a name or phone for comparison — lower-case, strip extra spaces,
 * keep only the last 10 digits for phone numbers.
 */
function normalizeName(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function normalizePhone(s: string): string {
  return s.replace(/[^0-9]/g, "").slice(-10);
}

/**
 * Returns true when the shipping address appears to belong to a different
 * person than the account holder (third-party delivery).
 *
 * Matching criteria (either match → NOT third-party):
 *  • Normalized fullName equals user displayName
 *  • Normalized address phone equals user phoneNumber (last 10 digits)
 */
function isThirdPartyAddress(
  address: AddressDocument,
  displayName: string | null,
  phoneNumber: string | null,
): boolean {
  if (
    displayName &&
    normalizeName(address.fullName) === normalizeName(displayName)
  ) {
    return false;
  }
  if (
    phoneNumber &&
    normalizePhone(address.phone) === normalizePhone(phoneNumber)
  ) {
    return false;
  }
  // If we have neither displayName nor phoneNumber to compare against,
  // we cannot determine a mismatch, so don't require consent.
  if (!displayName && !phoneNumber) return false;
  return true;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export const POST = createApiHandler<(typeof checkoutSchema)["_output"]>({
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
      throw new NotFoundError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
    }
    const shippingAddress = formatShippingAddress(address);

    // 5. Determine whether this is a third-party address (consent required).
    const requiresConsent = isThirdPartyAddress(
      address,
      user!.displayName ?? null,
      user!.phoneNumber ?? null,
    );

    // 6. Atomic Firestore transaction: re-read stock under a lock, decrement
    //    available items and collect out-of-stock items as unavailable.
    //    Also clears only the successfully-ordered cart items.
    //    Consent OTP is validated and deleted inside the transaction so two
    //    concurrent requests cannot both pass on the same single-use OTP.
    const db = getAdminDb();
    const otpRef = requiresConsent ? consentOtpRef(db, uid, addressId) : null;

    interface StockResult {
      available: { item: (typeof cartItems)[0]; product: ProductDocument }[];
      unavailable: {
        productId: string;
        productTitle: string;
        requestedQty: number;
        availableQty: number;
      }[];
    }

    const { available, unavailable } = await db.runTransaction(
      async (tx): Promise<StockResult> => {
        // Validate consent OTP atomically: if two concurrent requests both see
        // verified=true here, only one transaction will commit (Firestore
        // optimistic locking). The second retry will find the OTP already gone.
        if (otpRef) {
          const otpSnap = await tx.get(otpRef);
          const otpData = otpSnap.exists
            ? (otpSnap.data() as {
                verified?: boolean;
                expiresAt?: FirebaseFirestore.Timestamp;
              })
            : null;
          const isConsentValid =
            otpData?.verified === true &&
            otpData.expiresAt &&
            (resolveDate(otpData.expiresAt)?.getTime() ?? 0) > Date.now();
          if (!isConsentValid) {
            throw new ApiError(
              403,
              "Third-party shipping consent required. Please verify via email OTP before placing this order.",
            );
          }
        }

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
              availableQuantity: productData.availableQuantity - item.quantity,
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
          if (otpRef) tx.delete(otpRef);
        }

        return { available: availableItems, unavailable: unavailableItems };
      },
    );

    // All items were out of stock — no order can be placed
    if (available.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.INSUFFICIENT_STOCK);
    }

    // 7. Create orders from the products that were successfully reserved
    const userName = user!.displayName ?? user!.email ?? "Unknown User";
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

    // 8. Grant a bypass credit if partial order (consent OTP was already
    //    consumed atomically inside the transaction; no separate revoke needed).
    if (requiresConsent && unavailable.length > 0) {
      const metaRef = consentOtpRateLimitRef(db, uid);
      metaRef
        .get()
        .then((snap) => {
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
        .catch((err) =>
          serverLogger.warn("Failed to grant consent OTP bypass credit", {
            err,
          }),
        );
    }

    // 9. Send confirmation emails (fire-and-forget)
    if (emailsToSend.length > 0) {
      Promise.all(emailsToSend.map((e) => sendOrderConfirmationEmail(e))).catch(
        (err) => serverLogger.error("Order confirmation email error:", err),
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
