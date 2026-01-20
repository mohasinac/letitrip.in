/**
 * Order Confirmation Email Function
 * Phase 8.1 - Task 1/4
 *
 * Triggers when a new order is created in Firestore.
 * Sends confirmation email to customer with order details.
 *
 * Trigger: onCreate /orders/{orderId}
 *
 * Features:
 * - Order summary with items
 * - Payment confirmation
 * - Delivery details
 * - Order tracking link
 * - Branded HTML email template
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  createdAt: admin.firestore.Timestamp;
}

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snapshot, context) => {
    const orderId = context.params.orderId;
    const order = snapshot.data() as Order;

    try {
      // Log order creation
      console.log(`Processing order confirmation for order: ${orderId}`);

      // Generate email HTML
      const emailHtml = generateOrderEmailHtml(orderId, order);

      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      // For now, we'll log and store in a collection for testing
      await admin
        .firestore()
        .collection("emails")
        .add({
          to: order.userEmail,
          from: "orders@letitrip.in",
          subject: `Order Confirmation - #${orderId}`,
          html: emailHtml,
          orderId,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Update order with email sent status
      await snapshot.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Order confirmation email queued for ${order.userEmail}`);
      return { success: true, orderId };
    } catch (error) {
      console.error(`Error sending order confirmation for ${orderId}:`, error);

      // Log error but don't fail the function
      await admin
        .firestore()
        .collection("errorLogs")
        .add({
          type: "orderConfirmationEmail",
          orderId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return { success: false, orderId, error: String(error) };
    }
  });

/**
 * Generate HTML email template for order confirmation
 */
function generateOrderEmailHtml(orderId: string, order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${
          item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;" />`
            : ""
        }
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${item.price.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
        ₹${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - LetItRip</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Order Confirmed!</h1>
      <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 16px;">Thank you for your order</p>
    </div>

    <!-- Order Info -->
    <div style="padding: 32px 20px; border-bottom: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Order Number</p>
      <p style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600;">#${orderId}</p>
      
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Order Date</p>
      <p style="margin: 0 0 16px 0; color: #111827; font-size: 16px;">${order.createdAt
        .toDate()
        .toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
      
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Payment Status</p>
      <p style="margin: 0; color: #10b981; font-size: 16px; font-weight: 600;">✓ ${
        order.paymentStatus
      }</p>
    </div>

    <!-- Order Items -->
    <div style="padding: 32px 20px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px; font-weight: 500; border-bottom: 2px solid #e5e7eb;">Item</th>
            <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 14px; font-weight: 500; border-bottom: 2px solid #e5e7eb;">Qty</th>
            <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 500; border-bottom: 2px solid #e5e7eb;">Price</th>
            <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 500; border-bottom: 2px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Order Summary -->
    <div style="padding: 32px 20px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">Order Summary</h2>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
          <td style="padding: 8px 0; text-align: right; color: #111827;">₹${order.subtotal.toFixed(
            2,
          )}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
          <td style="padding: 8px 0; text-align: right; color: #111827;">₹${order.shipping.toFixed(
            2,
          )}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Tax</td>
          <td style="padding: 8px 0; text-align: right; color: #111827;">₹${order.tax.toFixed(
            2,
          )}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 16px 0 0 0; color: #111827; font-size: 18px; font-weight: 600;">Total</td>
          <td style="padding: 16px 0 0 0; text-align: right; color: #111827; font-size: 18px; font-weight: 700;">₹${order.total.toFixed(
            2,
          )}</td>
        </tr>
      </table>
    </div>

    <!-- Shipping Address -->
    <div style="padding: 32px 20px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">Shipping Address</h2>
      <p style="margin: 0; color: #6b7280; line-height: 1.6;">
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
    order.shippingAddress.pincode
  }<br>
        ${order.shippingAddress.country}
      </p>
    </div>

    <!-- CTA -->
    <div style="padding: 32px 20px; text-align: center;">
      <a href="https://letitrip.in/profile/orders/${orderId}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Track Your Order</a>
    </div>

    <!-- Footer -->
    <div style="padding: 32px 20px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Need help with your order?</p>
      <p style="margin: 0 0 16px 0;">
        <a href="mailto:support@letitrip.in" style="color: #667eea; text-decoration: none; font-weight: 500;">support@letitrip.in</a>
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} LetItRip. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
