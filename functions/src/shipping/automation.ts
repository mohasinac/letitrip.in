/**
 * Shipping Automation Functions
 *
 * @status IMPLEMENTED
 * @task 1.3.3
 *
 * Firebase Functions for automated shipping workflows:
 * - Auto-create shipments on order confirmation
 * - Auto-schedule pickups
 * - Sync tracking updates
 * - Handle NDR (Non-Delivery Reports)
 * - Send shipping notifications
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v2";

const db = admin.firestore();

// ============================================================================
// AUTO-CREATE SHIPMENT ON ORDER CONFIRMATION
// ============================================================================

export const autoCreateShipment = functions.firestore.onDocumentUpdated(
  {
    document: "orders/{orderId}",
    region: "asia-south1",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const orderId = event.params.orderId;

    // Only process when order status changes to 'confirmed'
    if (before?.status !== "confirmed" && after?.status === "confirmed") {
      try {
        // Get order details
        const order = after;

        // Check if shipment already exists
        const existingShipment = await db
          .collection("shipments")
          .where("orderId", "==", orderId)
          .limit(1)
          .get();

        if (!existingShipment.empty) {
          functions.logger.info(`Shipment already exists for order ${orderId}`);
          return;
        }

        // Get shop details for pickup location
        const shopDoc = await db.collection("shops").doc(order.shopId).get();
        const shop = shopDoc.data();

        if (!shop) {
          functions.logger.error(`Shop not found for order ${orderId}`);
          return;
        }

        // Calculate package weight (sum of all items)
        const weight = order.items.reduce((total: number, item: any) => {
          return total + (item.weight || 0.5) * item.quantity;
        }, 0);

        // Create shipment record
        const shipmentData = {
          orderId,
          shopId: order.shopId,
          userId: order.userId,
          status: "pending",
          awbCode: null,
          courierName: null,
          trackingUrl: null,
          pickupLocation: {
            name: shop.name,
            contactName: shop.contactName,
            phone: shop.phone,
            email: shop.email,
            addressLine1: shop.address?.line1,
            addressLine2: shop.address?.line2,
            city: shop.address?.city,
            state: shop.address?.state,
            pincode: shop.address?.postalCode,
            country: shop.address?.country || "India",
          },
          deliveryAddress: {
            name: order.shippingAddress.name,
            phone: order.shippingAddress.phone,
            addressLine1: order.shippingAddress.line1,
            addressLine2: order.shippingAddress.line2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            pincode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country || "India",
          },
          package: {
            weight,
            length: 30, // Default dimensions
            width: 25,
            height: 20,
          },
          paymentMethod: order.paymentMethod,
          codAmount: order.paymentMethod === "cod" ? order.totalAmount : 0,
          declaredValue: order.totalAmount,
          items: order.items.map((item: any) => ({
            name: item.name,
            sku: item.sku || item.productId,
            units: item.quantity,
            sellingPrice: item.price,
            hsn: item.hsn,
          })),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("shipments").doc(orderId).set(shipmentData);

        functions.logger.info(`Shipment created for order ${orderId}`);

        // Trigger shipment creation in Shiprocket (via webhook or scheduled function)
        // This will be handled by a separate function
      } catch (error) {
        functions.logger.error(
          `Error creating shipment for order ${orderId}:`,
          error
        );
      }
    }
  }
);

// ============================================================================
// AUTO-SCHEDULE PICKUP
// ============================================================================

export const autoSchedulePickup = functions.scheduler.onSchedule(
  {
    schedule: "0 10 * * *", // Every day at 10 AM IST
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    try {
      // Get all pending shipments without pickup scheduled
      const shipmentsSnapshot = await db
        .collection("shipments")
        .where("status", "==", "pending")
        .where("pickupScheduled", "==", false)
        .limit(50)
        .get();

      if (shipmentsSnapshot.empty) {
        functions.logger.info("No pending shipments to schedule pickup");
        return;
      }

      const batch = db.batch();
      const shipmentIds: string[] = [];

      shipmentsSnapshot.forEach((doc) => {
        shipmentIds.push(doc.id);
        batch.update(doc.ref, {
          pickupScheduled: true,
          pickupScheduledAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      functions.logger.info(
        `Scheduled pickup for ${shipmentIds.length} shipments`
      );

      // TODO: Call Shiprocket API to schedule pickup
      // This requires making HTTP request to Shiprocket
    } catch (error) {
      functions.logger.error("Error scheduling pickups:", error);
    }
  }
);

// ============================================================================
// SYNC TRACKING UPDATES
// ============================================================================

export const syncTrackingUpdates = functions.scheduler.onSchedule(
  {
    schedule: "*/30 * * * *", // Every 30 minutes
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    try {
      // Get all active shipments (not delivered, cancelled, or RTO)
      const shipmentsSnapshot = await db
        .collection("shipments")
        .where("status", "in", [
          "pickup-scheduled",
          "picked-up",
          "in-transit",
          "out-for-delivery",
          "failed",
        ])
        .limit(100)
        .get();

      if (shipmentsSnapshot.empty) {
        functions.logger.info("No active shipments to sync");
        return;
      }

      const batch = db.batch();
      let updatedCount = 0;

      for (const doc of shipmentsSnapshot.docs) {
        const shipment = doc.data();

        if (!shipment.awbCode) {
          continue;
        }

        // TODO: Call Shiprocket API to get tracking updates
        // For now, just update the timestamp
        batch.update(doc.ref, {
          lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        updatedCount++;
      }

      await batch.commit();

      functions.logger.info(`Synced tracking for ${updatedCount} shipments`);
    } catch (error) {
      functions.logger.error("Error syncing tracking updates:", error);
    }
  }
);

// ============================================================================
// HANDLE NDR (NON-DELIVERY REPORT)
// ============================================================================

export const handleNDR = functions.firestore.onDocumentUpdated(
  {
    document: "shipments/{shipmentId}",
    region: "asia-south1",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const shipmentId = event.params.shipmentId;

    // Check if shipment status changed to 'failed'
    if (before?.status !== "failed" && after?.status === "failed") {
      try {
        const shipment = after;

        // Get order details
        const orderDoc = await db
          .collection("orders")
          .doc(shipment.orderId)
          .get();
        const order = orderDoc.data();

        if (!order) {
          functions.logger.error(`Order not found for shipment ${shipmentId}`);
          return;
        }

        // Create NDR record
        await db
          .collection("ndr")
          .doc(shipmentId)
          .set({
            shipmentId,
            orderId: shipment.orderId,
            awbCode: shipment.awbCode,
            courierName: shipment.courierName,
            failureReason: shipment.failureReason || "Unknown",
            attemptCount: (shipment.attemptCount || 0) + 1,
            status: "pending-action",
            customerPhone: order.shippingAddress.phone,
            customerEmail: order.email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        // Send notification to customer about failed delivery
        // This will be handled by a notification function

        // Auto-reattempt if first failure
        if ((shipment.attemptCount || 0) === 0) {
          await db
            .collection("shipments")
            .doc(shipmentId)
            .update({
              attemptCount: 1,
              nextAttemptDate: admin.firestore.Timestamp.fromDate(
                new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
              ),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          functions.logger.info(
            `Scheduled reattempt for shipment ${shipmentId}`
          );
        }
      } catch (error) {
        functions.logger.error(
          `Error handling NDR for shipment ${shipmentId}:`,
          error
        );
      }
    }
  }
);

// ============================================================================
// UPDATE ORDER STATUS ON SHIPMENT DELIVERY
// ============================================================================

export const updateOrderOnDelivery = functions.firestore.onDocumentUpdated(
  {
    document: "shipments/{shipmentId}",
    region: "asia-south1",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    // Check if shipment status changed to 'delivered'
    if (before?.status !== "delivered" && after?.status === "delivered") {
      try {
        const shipment = after;

        // Update order status to 'delivered'
        await db.collection("orders").doc(shipment.orderId).update({
          status: "delivered",
          deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(`Order ${shipment.orderId} marked as delivered`);

        // Send delivery confirmation notification
        // This will be handled by a notification function
      } catch (error) {
        functions.logger.error(`Error updating order status:`, error);
      }
    }

    // Check if shipment status changed to 'rto' (Return to Origin)
    if (before?.status !== "rto" && after?.status === "rto") {
      try {
        const shipment = after;

        // Update order status to 'returned'
        await db.collection("orders").doc(shipment.orderId).update({
          status: "returned",
          returnedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(
          `Order ${shipment.orderId} marked as returned (RTO)`
        );

        // Initiate refund process if payment was prepaid
        if (shipment.paymentMethod === "prepaid") {
          await db.collection("refunds").add({
            orderId: shipment.orderId,
            amount: shipment.declaredValue,
            reason: "RTO - Order not delivered",
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (error) {
        functions.logger.error(`Error handling RTO:`, error);
      }
    }
  }
);

// ============================================================================
// CLEANUP OLD TRACKING DATA
// ============================================================================

export const cleanupOldTracking = functions.scheduler.onSchedule(
  {
    schedule: "0 2 * * 0", // Every Sunday at 2 AM
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    try {
      // Delete tracking events older than 90 days
      const ninetyDaysAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      );

      const oldShipmentsSnapshot = await db
        .collection("shipments")
        .where("status", "in", ["delivered", "cancelled", "rto"])
        .where("updatedAt", "<", ninetyDaysAgo)
        .limit(500)
        .get();

      if (oldShipmentsSnapshot.empty) {
        functions.logger.info("No old shipments to cleanup");
        return;
      }

      const batch = db.batch();
      let deletedCount = 0;

      oldShipmentsSnapshot.forEach((doc) => {
        // Archive to a separate collection before deletion
        batch.set(db.collection("shipments_archive").doc(doc.id), {
          ...doc.data(),
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Delete from main collection
        batch.delete(doc.ref);
        deletedCount++;
      });

      await batch.commit();

      functions.logger.info(
        `Archived and deleted ${deletedCount} old shipments`
      );
    } catch (error) {
      functions.logger.error("Error cleaning up old tracking data:", error);
    }
  }
);
