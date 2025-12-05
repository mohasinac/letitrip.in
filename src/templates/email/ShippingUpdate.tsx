/**
 * Shipping Update Email Template
 * Task 1.5.2 - Email Templates
 *
 * React email template for shipping status updates
 * Sent when order is shipped or tracking status changes
 */

import React from "react";

export interface ShippingUpdateProps {
  customerName: string;
  orderId: string;
  status: "shipped" | "in_transit" | "out_for_delivery" | "delivered";
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery?: string;
  deliveryAddress: {
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    image?: string;
  }>;
}

const statusConfig = {
  shipped: {
    title: "Your Order Has Shipped! 📦",
    icon: "📦",
    color: "#2563eb",
    message: "Your order is on its way!",
  },
  in_transit: {
    title: "Your Order Is In Transit 🚚",
    icon: "🚚",
    color: "#f59e0b",
    message: "Your package is moving through our delivery network.",
  },
  out_for_delivery: {
    title: "Out for Delivery Today! 🏃",
    icon: "🏃",
    color: "#10b981",
    message: "Your order will be delivered today.",
  },
  delivered: {
    title: "Delivered Successfully! ✅",
    icon: "✅",
    color: "#10b981",
    message: "Your order has been delivered.",
  },
};

export const ShippingUpdate: React.FC<ShippingUpdateProps> = ({
  customerName,
  orderId,
  status,
  courier,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  deliveryAddress,
  items,
}) => {
  const config = statusConfig[status];

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Shipping Update - {orderId}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.logo}>Letitrip.in</h1>
          </div>

          {/* Status Badge */}
          <div style={{ ...styles.statusBox, backgroundColor: config.color }}>
            <div style={styles.statusIcon}>{config.icon}</div>
            <h2 style={styles.statusTitle}>{config.title}</h2>
            <p style={styles.statusMessage}>{config.message}</p>
          </div>

          {/* Order Info */}
          <div style={styles.section}>
            <p style={styles.greeting}>Hi {customerName},</p>
            <p style={styles.text}>Great news about your order #{orderId}!</p>
          </div>

          {/* Tracking Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Tracking Information</h3>
            <div style={styles.trackingBox}>
              <div style={styles.trackingRow}>
                <span style={styles.trackingLabel}>Courier:</span>
                <span style={styles.trackingValue}>{courier}</span>
              </div>
              <div style={styles.trackingRow}>
                <span style={styles.trackingLabel}>Tracking Number:</span>
                <span style={styles.trackingValue}>{trackingNumber}</span>
              </div>
              {estimatedDelivery && (
                <div style={styles.trackingRow}>
                  <span style={styles.trackingLabel}>Est. Delivery:</span>
                  <span style={styles.trackingValue}>{estimatedDelivery}</span>
                </div>
              )}
            </div>
          </div>

          {/* Track Button */}
          <div style={styles.buttonContainer}>
            <a href={trackingUrl} style={styles.button}>
              Track Your Package
            </a>
          </div>

          {/* Delivery Address */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Delivery Address</h3>
            <div style={styles.address}>
              <p style={styles.addressLine}>{deliveryAddress.name}</p>
              <p style={styles.addressLine}>{deliveryAddress.addressLine1}</p>
              <p style={styles.addressLine}>
                {deliveryAddress.city}, {deliveryAddress.state}{" "}
                {deliveryAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Items */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Package Contents</h3>
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
                  <p style={styles.itemQuantity}>Quantity: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div style={styles.helpSection}>
            <h3 style={styles.helpTitle}>Need Help?</h3>
            <p style={styles.helpText}>
              If you have any questions about your delivery, please contact us:
            </p>
            <p style={styles.helpText}>
              <a href="mailto:support@letitrip.in" style={styles.link}>
                support@letitrip.in
              </a>
            </p>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
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
    padding: "20px",
    textAlign: "center" as const,
  },
  logo: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
  },
  statusBox: {
    padding: "30px 20px",
    textAlign: "center" as const,
    color: "#ffffff",
  },
  statusIcon: {
    fontSize: "48px",
    marginBottom: "10px",
  },
  statusTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
  },
  statusMessage: {
    margin: "10px 0 0 0",
    fontSize: "16px",
    opacity: 0.9,
  },
  section: {
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
  },
  greeting: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    color: "#1f2937",
  },
  text: {
    margin: "0",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
  },
  sectionTitle: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    color: "#1f2937",
    fontWeight: "600",
  },
  trackingBox: {
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "8px",
  },
  trackingRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
  },
  trackingLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },
  trackingValue: {
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "600",
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
  itemRow: {
    display: "flex",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  itemImage: {
    width: "50px",
    height: "50px",
    objectFit: "cover" as const,
    borderRadius: "6px",
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
  helpSection: {
    padding: "20px",
    backgroundColor: "#f9fafb",
    textAlign: "center" as const,
  },
  helpTitle: {
    margin: "0 0 10px 0",
    fontSize: "16px",
    color: "#1f2937",
  },
  helpText: {
    margin: "10px 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  footer: {
    padding: "20px",
    textAlign: "center" as const,
  },
  footerText: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af",
  },
};

export default ShippingUpdate;
