/**
 * Firebase Function: Shiprocket Tracking Updates Webhook
 *
 * Handles Shiprocket webhook callbacks for tracking status updates
 * Updates Firestore order documents with new tracking information
 * Creates notifications for customers
 */

import * as functions from "firebase-functions/v1";
import { adminDb } from "../config/firebase-admin";

interface ShiprocketWebhookPayload {
  awb: string;
  courier_name: string;
  order_id: string;
  current_status: string;
  current_timestamp: string;
  shipment_status: string;
  shipment_track: Array<{
    activity: string;
    date: string;
    location: string;
  }>;
  shipment_track_activities: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
    sr_status: string;
  }>;
  pickup_date?: string;
  delivered_date?: string;
  rto_initiated_date?: string;
  rto_delivered_date?: string;
}

const STATUS_MAPPING: Record<string, string> = {
  "1": "pending", // Pending Pickup
  "3": "in_transit", // In Transit
  "4": "out_for_delivery", // Out for Delivery
  "5": "delivered", // Delivered
  "6": "cancelled", // Cancelled
  "7": "rto_initiated", // RTO Initiated
  "8": "rto_delivered", // RTO Delivered
  "9": "lost", // Lost
  "10": "damaged", // Damaged
  "11": "pickup_scheduled", // Pickup Scheduled
  "12": "pickup_error", // Pickup Error
  "13": "undelivered", // Undelivered
  "14": "delayed", // Delayed
  "15": "pickup_exception", // Pickup Exception
  "16": "out_for_pickup", // Out for Pickup
  "17": "pickup_rescheduled", // Pickup Rescheduled
  "18": "rto_out_for_delivery", // RTO Out for Delivery
  "19": "shipment_picked", // Shipment Picked
};

const NOTIFICATION_MESSAGES: Record<
  string,
  { title: string; message: string }
> = {
  pickup_scheduled: {
    title: "Pickup Scheduled",
    message: "Your order has been scheduled for pickup.",
  },
  shipment_picked: {
    title: "Order Picked Up",
    message: "Your order has been picked up by the courier.",
  },
  in_transit: {
    title: "Order in Transit",
    message: "Your order is on its way to you.",
  },
  out_for_delivery: {
    title: "Out for Delivery",
    message: "Your order is out for delivery and will arrive soon.",
  },
  delivered: {
    title: "Order Delivered",
    message: "Your order has been delivered successfully.",
  },
  rto_initiated: {
    title: "Return Initiated",
    message: "Your order is being returned to the seller.",
  },
  rto_delivered: {
    title: "Return Completed",
    message: "Your order has been returned to the seller.",
  },
  cancelled: {
    title: "Order Cancelled",
    message: "Your order has been cancelled.",
  },
  delayed: {
    title: "Delivery Delayed",
    message:
      "Your order delivery has been delayed. We apologize for the inconvenience.",
  },
};

/**
 * Find order by AWB code or order number
 */
async function findOrderByAwbOrOrderNumber(
  awb: string,
  orderNumber: string
): Promise<{ id: string; data: FirebaseFirestore.DocumentData } | null> {
  try {
    // First try to find by AWB code
    const awbQuery = await adminDb
      .collection("orders")
      .where("shipping.awbCode", "==", awb)
      .limit(1)
      .get();

    if (!awbQuery.empty) {
      const doc = awbQuery.docs[0];
      return { id: doc.id, data: doc.data() };
    }

    // Fallback to order number
    const orderQuery = await adminDb
      .collection("orders")
      .where("orderNumber", "==", orderNumber)
      .limit(1)
      .get();

    if (!orderQuery.empty) {
      const doc = orderQuery.docs[0];
      return { id: doc.id, data: doc.data() };
    }

    return null;
  } catch (error) {
    console.error("Error finding order:", error);
    throw error;
  }
}

/**
 * Update order tracking information
 */
async function updateOrderTracking(
  orderId: string,
  payload: ShiprocketWebhookPayload
): Promise<void> {
  const status =
    STATUS_MAPPING[payload.shipment_status] || payload.current_status;

  try {
    const updateData: Record<string, unknown> = {
      "shipping.trackingStatus": status,
      "shipping.lastTrackingUpdate": payload.current_timestamp,
      "shipping.courierName": payload.courier_name,
      "shipping.trackingHistory": payload.shipment_track_activities || [],
      updatedAt: new Date().toISOString(),
    };

    // Update delivery-specific fields
    if (payload.delivered_date) {
      updateData["shipping.deliveredAt"] = payload.delivered_date;
      updateData.status = "delivered";
    }

    if (payload.pickup_date) {
      updateData["shipping.pickedUpAt"] = payload.pickup_date;
    }

    if (payload.rto_initiated_date) {
      updateData["shipping.rtoInitiatedAt"] = payload.rto_initiated_date;
    }

    if (payload.rto_delivered_date) {
      updateData["shipping.rtoDeliveredAt"] = payload.rto_delivered_date;
      updateData.status = "returned";
    }

    await adminDb.collection("orders").doc(orderId).update(updateData);

    console.log(`Successfully updated tracking for order ${orderId}`);
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Create tracking notification for customer
 */
async function createTrackingNotification(
  userId: string,
  orderId: string,
  orderNumber: string,
  status: string
): Promise<void> {
  const notification = NOTIFICATION_MESSAGES[status];

  if (!notification) {
    console.log(`No notification template for status: ${status}`);
    return;
  }

  try {
    await adminDb.collection("notifications").add({
      userId,
      type: "order_tracking_update",
      title: notification.title,
      message: `${notification.message} (Order #${orderNumber})`,
      data: { orderId, status },
      read: false,
      createdAt: new Date().toISOString(),
    });

    console.log(`Created tracking notification for order ${orderId}`);
  } catch (error) {
    console.error(`Failed to create notification for order ${orderId}:`, error);
    // Don't throw - notification failure shouldn't stop the process
  }
}

/**
 * Firebase HTTP Function: Shiprocket webhook handler
 */
export const shiprocketWebhook = functions.https.onRequest(async (req, res) => {
  // Verify request method
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const payload = req.body as ShiprocketWebhookPayload;

    console.log("Received Shiprocket webhook:", {
      awb: payload.awb,
      orderId: payload.order_id,
      status: payload.current_status,
    });

    // Validate payload
    if (!payload.awb || !payload.order_id) {
      console.error("Invalid webhook payload: missing AWB or order_id");
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    // Find order
    const orderDoc = await findOrderByAwbOrOrderNumber(
      payload.awb,
      payload.order_id
    );

    if (!orderDoc) {
      console.error(
        `Order not found: AWB ${payload.awb}, Order ${payload.order_id}`
      );
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Update order tracking
    await updateOrderTracking(orderDoc.id, payload);

    // Create notification
    const status =
      STATUS_MAPPING[payload.shipment_status] || payload.current_status;
    await createTrackingNotification(
      orderDoc.data.userId,
      orderDoc.id,
      orderDoc.data.orderNumber,
      status
    );

    res.status(200).json({ success: true, orderId: orderDoc.id });
  } catch (error) {
    console.error("Error processing Shiprocket webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
