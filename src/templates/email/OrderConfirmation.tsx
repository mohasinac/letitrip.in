/**
 * Order Confirmation Email Template
 * Task 1.5.2 - Email Templates
 *
 * React email template for order confirmation
 * Sent when a customer places an order
 */

import React from "react";

export interface OrderConfirmationProps {
  customerName: string;
  orderId: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  customerName,
  orderId,
  orderDate,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  estimatedDelivery,
  trackingUrl,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation - {orderId}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.logo}>Letitrip.in</h1>
            <p style={styles.tagline}>Your trusted marketplace</p>
          </div>

          {/* Success Message */}
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>✓ Order Confirmed!</h2>
            <p style={styles.successText}>
              Thank you for your order, {customerName}!
            </p>
          </div>

          {/* Order Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Details</h3>
            <table style={styles.detailsTable}>
              <tbody>
                <tr>
                  <td style={styles.labelCell}>Order Number:</td>
                  <td style={styles.valueCell}>#{orderId}</td>
                </tr>
                <tr>
                  <td style={styles.labelCell}>Order Date:</td>
                  <td style={styles.valueCell}>{orderDate}</td>
                </tr>
                {estimatedDelivery && (
                  <tr>
                    <td style={styles.labelCell}>Est. Delivery:</td>
                    <td style={styles.valueCell}>{estimatedDelivery}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Items */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Items Ordered</h3>
            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={styles.itemImage}
                  />
                )}
                <div style={styles.itemDetails}>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={styles.itemQuantity}>Qty: {item.quantity}</p>
                </div>
                <div style={styles.itemPrice}>
                  ₹{item.price.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            <table style={styles.summaryTable}>
              <tbody>
                <tr>
                  <td style={styles.summaryLabel}>Subtotal:</td>
                  <td style={styles.summaryValue}>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td style={styles.summaryLabel}>Shipping:</td>
                  <td style={styles.summaryValue}>
                    ₹{shipping.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td style={styles.summaryLabel}>Tax:</td>
                  <td style={styles.summaryValue}>
                    ₹{tax.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr style={styles.totalRow}>
                  <td style={styles.totalLabel}>Total:</td>
                  <td style={styles.totalValue}>
                    ₹{total.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Shipping Address */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Shipping Address</h3>
            <div style={styles.address}>
              <p style={styles.addressLine}>{shippingAddress.name}</p>
              <p style={styles.addressLine}>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && (
                <p style={styles.addressLine}>{shippingAddress.addressLine2}</p>
              )}
              <p style={styles.addressLine}>
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.postalCode}
              </p>
              <p style={styles.addressLine}>{shippingAddress.country}</p>
            </div>
          </div>

          {/* Track Order Button */}
          {trackingUrl && (
            <div style={styles.buttonContainer}>
              <a href={trackingUrl} style={styles.button}>
                Track Your Order
              </a>
            </div>
          )}

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Questions? Contact us at{" "}
              <a href="mailto:support@letitrip.in" style={styles.link}>
                support@letitrip.in
              </a>
            </p>
            <p style={styles.footerText}>
              © {new Date().getFullYear()} Letitrip.in. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: "#f5f5f5",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "30px 20px",
    textAlign: "center" as const,
  },
  logo: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "bold",
  },
  tagline: {
    margin: "5px 0 0 0",
    fontSize: "14px",
    opacity: 0.9,
  },
  successBox: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: "20px",
    textAlign: "center" as const,
  },
  successTitle: {
    margin: 0,
    fontSize: "24px",
  },
  successText: {
    margin: "10px 0 0 0",
    fontSize: "16px",
  },
  section: {
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
  },
  sectionTitle: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    color: "#1f2937",
  },
  detailsTable: {
    width: "100%",
  },
  labelCell: {
    padding: "8px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  valueCell: {
    padding: "8px 0",
    color: "#1f2937",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "right" as const,
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  itemImage: {
    width: "60px",
    height: "60px",
    objectFit: "cover" as const,
    borderRadius: "8px",
    marginRight: "15px",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    margin: 0,
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "500",
  },
  itemQuantity: {
    margin: "5px 0 0 0",
    fontSize: "12px",
    color: "#6b7280",
  },
  itemPrice: {
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "600",
  },
  summaryTable: {
    width: "100%",
    marginTop: "10px",
  },
  summaryLabel: {
    padding: "8px 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  summaryValue: {
    padding: "8px 0",
    fontSize: "14px",
    color: "#1f2937",
    textAlign: "right" as const,
  },
  totalRow: {
    borderTop: "2px solid #e5e7eb",
  },
  totalLabel: {
    padding: "12px 0",
    fontSize: "16px",
    color: "#1f2937",
    fontWeight: "bold",
  },
  totalValue: {
    padding: "12px 0",
    fontSize: "18px",
    color: "#2563eb",
    fontWeight: "bold",
    textAlign: "right" as const,
  },
  address: {
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "8px",
  },
  addressLine: {
    margin: "5px 0",
    fontSize: "14px",
    color: "#1f2937",
  },
  buttonContainer: {
    padding: "30px 20px",
    textAlign: "center" as const,
  },
  button: {
    display: "inline-block",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "12px 30px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "#f9fafb",
    padding: "20px",
    textAlign: "center" as const,
  },
  footerText: {
    margin: "10px 0",
    fontSize: "12px",
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default OrderConfirmation;
