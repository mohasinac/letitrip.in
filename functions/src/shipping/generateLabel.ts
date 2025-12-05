/**
 * Firebase Function: Generate Shipping Labels
 *
 * Triggered when order status changes to 'confirmed'
 * Generates shipping label PDF and stores in Firebase Storage
 * Updates Firestore order document with label URL
 */

import axios from "axios";
import * as functions from "firebase-functions/v1";
import { adminDb, adminStorage } from "../config/firebase-admin";

const SHIPROCKET_API_URL =
  process.env.SHIPROCKET_API_URL || "https://apiv2.shiprocket.in/v1/external";

interface ShiprocketAuthResponse {
  token: string;
}

interface ShiprocketLabelResponse {
  label_url: string;
  awb_code: string;
  courier_name: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  shipping?: {
    awbCode?: string;
    courierName?: string;
    trackingUrl?: string;
    labelUrl?: string;
  };
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  userId: string;
  shopId: string;
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
 * Generate shipping label via Shiprocket API
 */
async function generateLabel(
  orderId: string,
  orderData: OrderData
): Promise<ShiprocketLabelResponse> {
  const token = await getShiprocketToken();

  try {
    const response = await axios.post<ShiprocketLabelResponse>(
      `${SHIPROCKET_API_URL}/orders/create/label`,
      {
        order_id: orderData.orderNumber,
        awb_code: orderData.shipping?.awbCode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to generate label for order ${orderId}:`, error);
    throw new Error("Label generation failed");
  }
}

/**
 * Download label PDF and upload to Firebase Storage
 */
async function uploadLabelToStorage(
  labelUrl: string,
  orderId: string
): Promise<string> {
  try {
    // Download label PDF
    const response = await axios.get(labelUrl, {
      responseType: "arraybuffer",
    });
    const labelBuffer = Buffer.from(response.data);

    // Upload to Firebase Storage
    const bucket = adminStorage.bucket();
    const fileName = `shipping-labels/${orderId}-${Date.now()}.pdf`;
    const file = bucket.file(fileName);

    await file.save(labelBuffer, {
      metadata: {
        contentType: "application/pdf",
        metadata: {
          orderId,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    // Return public URL
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  } catch (error) {
    console.error(
      `Failed to upload label to storage for order ${orderId}:`,
      error
    );
    throw new Error("Label upload failed");
  }
}

/**
 * Update order document with label information
 */
async function updateOrderWithLabel(
  orderId: string,
  labelData: {
    labelUrl: string;
    awbCode: string;
    courierName: string;
  }
): Promise<void> {
  try {
    await adminDb.collection("orders").doc(orderId).update({
      "shipping.labelUrl": labelData.labelUrl,
      "shipping.awbCode": labelData.awbCode,
      "shipping.courierName": labelData.courierName,
      "shipping.labelGeneratedAt": new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`Successfully updated order ${orderId} with label information`);
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Create notification for label generation
 */
async function createLabelNotification(
  userId: string,
  orderId: string,
  orderNumber: string
): Promise<void> {
  try {
    await adminDb.collection("notifications").add({
      userId,
      type: "shipping_label_generated",
      title: "Shipping Label Generated",
      message: `Shipping label has been generated for order #${orderNumber}`,
      data: { orderId },
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Failed to create notification for order ${orderId}:`, error);
    // Don't throw - notification failure shouldn't stop the process
  }
}

/**
 * Firebase Firestore Trigger: Generate label when order is confirmed
 */
export const generateLabelOnConfirmation = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const orderId = context.params.orderId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if status changed to 'confirmed'
    if (
      beforeData.status !== "confirmed" &&
      afterData.status === "confirmed" &&
      !afterData.shipping?.labelUrl
    ) {
      console.log(`Generating label for order ${orderId}`);

      try {
        const orderData = afterData as OrderData;

        // Check if AWB code exists
        if (!orderData.shipping?.awbCode) {
          console.log(
            `Order ${orderId} does not have AWB code yet. Skipping label generation.`
          );
          return;
        }

        // Generate label via Shiprocket
        const labelResponse = await generateLabel(orderId, orderData);

        // Download and upload to Firebase Storage
        const storageUrl = await uploadLabelToStorage(
          labelResponse.label_url,
          orderId
        );

        // Update order document
        await updateOrderWithLabel(orderId, {
          labelUrl: storageUrl,
          awbCode: labelResponse.awb_code,
          courierName: labelResponse.courier_name,
        });

        // Create notification
        await createLabelNotification(
          orderData.userId,
          orderId,
          orderData.orderNumber
        );

        console.log(`Successfully generated label for order ${orderId}`);
      } catch (error) {
        console.error(
          `Failed to process label generation for order ${orderId}:`,
          error
        );

        // Create error notification
        try {
          await adminDb.collection("notifications").add({
            userId: afterData.userId,
            type: "shipping_label_error",
            title: "Label Generation Failed",
            message: `Failed to generate shipping label for order #${afterData.orderNumber}. Our team has been notified.`,
            data: { orderId },
            read: false,
            createdAt: new Date().toISOString(),
          });
        } catch (notifError) {
          console.error("Failed to create error notification:", notifError);
        }
      }
    }
  });
