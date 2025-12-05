/**
 * Firebase Function: Auto Schedule Pickups
 *
 * Scheduled function that runs daily at 10 AM IST
 * Queries Firestore for orders ready for pickup
 * Automatically schedules pickups with Shiprocket
 */

import axios from "axios";
import * as functions from "firebase-functions/v1";
import { adminDb } from "../config/firebase-admin";

const SHIPROCKET_API_URL =
  process.env.SHIPROCKET_API_URL || "https://apiv2.shiprocket.in/v1/external";

interface ShiprocketAuthResponse {
  token: string;
}

interface ShiprocketPickupRequest {
  order_id: string[];
  pickup_date: string;
}

interface ShiprocketPickupResponse {
  pickup_scheduled_date: string;
  pickup_token_number: string;
  status: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  shopId: string;
  userId: string;
  totalAmount: number;
  shipping: {
    awbCode?: string;
    pickupScheduled?: boolean;
    pickupDate?: string;
    pickupToken?: string;
  };
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

/**
 * Get Shiprocket authentication token
 */
async function getShiprocketToken(): Promise<string> {
  try {
    const response = await axios.post<ShiprocketAuthResponse>(
      `${SHIPROCKET_API_URL}/auth/login`,
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );
    return response.data.token;
  } catch (error) {
    console.error("Failed to authenticate with Shiprocket:", error);
    throw new Error("Shiprocket authentication failed");
  }
}

/**
 * Get orders ready for pickup
 */
async function getOrdersReadyForPickup(): Promise<OrderData[]> {
  try {
    const snapshot = await adminDb
      .collection("orders")
      .where("status", "==", "confirmed")
      .where("shipping.pickupScheduled", "==", false)
      .where("shipping.awbCode", "!=", null)
      .limit(50) // Process max 50 orders per run
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<OrderData, "id">),
    }));
  } catch (error) {
    console.error("Failed to fetch orders ready for pickup:", error);
    throw error;
  }
}

/**
 * Schedule pickup with Shiprocket
 */
async function schedulePickup(
  orderNumbers: string[]
): Promise<ShiprocketPickupResponse> {
  const token = await getShiprocketToken();

  // Calculate pickup date (next business day)
  const pickupDate = getNextBusinessDay();

  try {
    const response = await axios.post<ShiprocketPickupResponse>(
      `${SHIPROCKET_API_URL}/courier/assign/pickup`,
      {
        order_id: orderNumbers,
        pickup_date: pickupDate,
      } as ShiprocketPickupRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to schedule pickup:", error);
    throw new Error("Pickup scheduling failed");
  }
}

/**
 * Get next business day (excluding weekends)
 */
function getNextBusinessDay(): string {
  const today = new Date();
  let nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  // Skip weekends (Saturday = 6, Sunday = 0)
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  // Format as YYYY-MM-DD
  return nextDay.toISOString().split("T")[0];
}

/**
 * Update orders with pickup information
 */
async function updateOrdersWithPickup(
  orderIds: string[],
  pickupData: ShiprocketPickupResponse
): Promise<void> {
  const batch = adminDb.batch();

  orderIds.forEach((orderId) => {
    const orderRef = adminDb.collection("orders").doc(orderId);
    batch.update(orderRef, {
      "shipping.pickupScheduled": true,
      "shipping.pickupDate": pickupData.pickup_scheduled_date,
      "shipping.pickupToken": pickupData.pickup_token_number,
      "shipping.pickupStatus": pickupData.status,
      updatedAt: new Date().toISOString(),
    });
  });

  try {
    await batch.commit();
    console.log(
      `Successfully updated ${orderIds.length} orders with pickup information`
    );
  } catch (error) {
    console.error("Failed to update orders:", error);
    throw error;
  }
}

/**
 * Create pickup notifications for customers
 */
async function createPickupNotifications(
  orders: OrderData[],
  pickupDate: string
): Promise<void> {
  const batch = adminDb.batch();

  orders.forEach((order) => {
    const notificationRef = adminDb.collection("notifications").doc();
    batch.set(notificationRef, {
      userId: order.userId,
      type: "pickup_scheduled",
      title: "Pickup Scheduled",
      message: `Pickup has been scheduled for your order #${
        order.orderNumber
      } on ${formatDate(pickupDate)}`,
      data: { orderId: order.id, pickupDate },
      read: false,
      createdAt: new Date().toISOString(),
    });
  });

  try {
    await batch.commit();
    console.log(`Created pickup notifications for ${orders.length} orders`);
  } catch (error) {
    console.error("Failed to create notifications:", error);
    // Don't throw - notification failure shouldn't stop the process
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Group orders by shop for batch processing
 */
function groupOrdersByShop(orders: OrderData[]): Map<string, OrderData[]> {
  const shopGroups = new Map<string, OrderData[]>();

  orders.forEach((order) => {
    const shopOrders = shopGroups.get(order.shopId) || [];
    shopOrders.push(order);
    shopGroups.set(order.shopId, shopOrders);
  });

  return shopGroups;
}

/**
 * Firebase Scheduled Function: Auto-schedule pickups daily at 10 AM IST
 * Cron expression: "0 10 * * *" (10:00 AM every day)
 * Timezone: Asia/Kolkata (IST)
 */
export const autoSchedulePickups = functions.pubsub
  .schedule("0 10 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    console.log("Starting auto-pickup scheduling...");

    try {
      // Fetch orders ready for pickup
      const orders = await getOrdersReadyForPickup();

      if (orders.length === 0) {
        console.log("No orders ready for pickup");
        return;
      }

      console.log(`Found ${orders.length} orders ready for pickup`);

      // Group orders by shop
      const shopGroups = groupOrdersByShop(orders);

      let totalScheduled = 0;
      const errors: Array<{ shopId: string; error: string }> = [];

      // Process each shop group
      for (const [shopId, shopOrders] of shopGroups) {
        try {
          console.log(
            `Processing ${shopOrders.length} orders for shop ${shopId}`
          );

          // Extract order numbers
          const orderNumbers = shopOrders.map((o) => o.orderNumber);

          // Schedule pickup with Shiprocket
          const pickupResponse = await schedulePickup(orderNumbers);

          // Update orders with pickup information
          const orderIds = shopOrders.map((o) => o.id);
          await updateOrdersWithPickup(orderIds, pickupResponse);

          // Create notifications
          await createPickupNotifications(
            shopOrders,
            pickupResponse.pickup_scheduled_date
          );

          totalScheduled += shopOrders.length;
          console.log(
            `Successfully scheduled pickup for ${shopOrders.length} orders from shop ${shopId}`
          );
        } catch (error) {
          console.error(`Failed to schedule pickup for shop ${shopId}:`, error);
          errors.push({
            shopId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      console.log(
        `Auto-pickup scheduling completed: ${totalScheduled} orders scheduled`
      );

      if (errors.length > 0) {
        console.error("Errors during pickup scheduling:", errors);
      }
    } catch (error) {
      console.error("Fatal error in auto-pickup scheduling:", error);
      throw error;
    }
  });
