/**
 * Trigger: onOrderCreate
 *
 * Fires whenever a new order document is created in the `orders` collection.
 *
 * What it does:
 *   1. Builds a purchase announcement message (buyer name + items + total).
 *   2. Sends the message to all platform admin WhatsApp numbers configured
 *      in the WHATSAPP_ADMIN_NOTIFY_NUMBERS environment variable.
 *   3. Looks up the store owner and sends the same announcement to their
 *      WhatsApp number (decrypted from the user document).
 *
 * All sends are non-fatal — a delivery failure never blocks the function.
 * Env vars required (Firebase Secret Manager or .env):
 *   WHATSAPP_PHONE_NUMBER_ID   — Meta platform phone number ID
 *   WHATSAPP_CLOUD_API_TOKEN   — Meta platform system user access token
 *   WHATSAPP_ADMIN_NOTIFY_NUMBERS — comma-separated digits-only numbers
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import {
  storeRepository,
  userRepository,
  sendWhatsAppBusinessMessage,
  buildPurchaseAnnouncementMessage,
} from "../lib/appkit";
import { logInfo, logError } from "../utils/logger";
import { REGION, COLLECTIONS } from "../config/constants";
import { decryptPii } from "../lib/pii";

const TRIGGER = "onOrderCreate";

interface OrderItem {
  title?: string;
  name?: string;
}

interface NewOrder {
  buyerDisplayName?: string;
  buyerId?: string;
  items?: OrderItem[];
  totalAmount?: number;
  storeId?: string;
}

async function sendAnnouncement(
  toPhone: string,
  message: string,
  phoneNumberId: string,
  accessToken: string,
  label: string,
  orderId: string,
): Promise<void> {
  try {
    const sent = await sendWhatsAppBusinessMessage({
      toPhone,
      message,
      phoneNumberId,
      accessToken,
    });
    if (sent) {
      logInfo(TRIGGER, `Announcement sent to ${label}`, { orderId, toPhone: `...${toPhone.slice(-4)}` });
    } else {
      logError(TRIGGER, `Announcement delivery failed for ${label} (non-fatal)`, null, { orderId });
    }
  } catch (err) {
    logError(TRIGGER, `Announcement send threw for ${label} (non-fatal)`, err, { orderId });
  }
}

export const onOrderCreate = onDocumentCreated(
  {
    document: `${COLLECTIONS.ORDERS}/{orderId}`,
    region: REGION,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logError(TRIGGER, "No snapshot data", null);
      return;
    }

    const orderId = event.params.orderId;
    const order = snap.data() as NewOrder;

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
    const accessToken = process.env.WHATSAPP_CLOUD_API_TOKEN ?? "";

    if (!phoneNumberId || !accessToken) {
      logInfo(TRIGGER, "WhatsApp Cloud API not configured — skipping announcement", { orderId });
      return;
    }

    const items = order.items ?? [];
    const firstItem = items[0];
    const firstItemName = firstItem?.title ?? firstItem?.name ?? "an item";
    const additionalItemCount = Math.max(0, items.length - 1);
    const buyerName = order.buyerDisplayName ?? "A customer";

    const message = buildPurchaseAnnouncementMessage({
      buyerName,
      firstItemName,
      additionalItemCount,
      totalAmount: order.totalAmount ?? 0,
      orderId,
    });

    // ── Admin numbers ─────────────────────────────────────────────────────────
    const adminNumbersRaw = process.env.WHATSAPP_ADMIN_NOTIFY_NUMBERS ?? "";
    const adminNumbers = adminNumbersRaw
      .split(",")
      .map((n) => n.trim().replace(/\D/g, ""))
      .filter(Boolean);

    for (const num of adminNumbers) {
      await sendAnnouncement(num, message, phoneNumberId, accessToken, "admin", orderId);
    }

    // ── Store owner ───────────────────────────────────────────────────────────
    const storeId = order.storeId;
    if (storeId) {
      try {
        const store = await storeRepository.findBySlug(storeId);
        if (store?.ownerId) {
          const owner = await userRepository.findById(store.ownerId);
          const encryptedPhone = owner?.phoneNumber as string | undefined;
          if (encryptedPhone) {
            const ownerPhone = decryptPii(encryptedPhone) as string | null;
            if (ownerPhone) {
              await sendAnnouncement(ownerPhone, message, phoneNumberId, accessToken, "store-owner", orderId);
            }
          }
        }
      } catch (err) {
        logError(TRIGGER, "Store owner lookup failed (non-fatal)", err, { orderId, storeId });
      }
    }

    logInfo(TRIGGER, `Order announcement complete`, {
      orderId,
      adminCount: adminNumbers.length,
      storeId: storeId ?? "unknown",
    });
  },
);
