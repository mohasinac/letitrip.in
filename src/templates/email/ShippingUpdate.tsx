/**
 * @fileoverview React Component
 * @module src/templates/email/ShippingUpdate
 * @description This file contains the ShippingUpdate component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Shipping Update Email Template
 * Task 1.5.2 - Email Templates
 *
 * React email template for shipping status updates
 * Sent when order is shipped or tracking status changes
 */

import React from "react";

/**
 * ShippingUpdateProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShippingUpdateProps
 */
export interface ShippingUpdateProps {
  /** Customer Name */
  customerName: string;
  /** Order Id */
  orderId: string;
  /** Status */
  status: "shipped" | "in_transit" | "out_for_delivery" | "delivered";
  /** Courier */
  courier: string;
  /** Tracking Number */
  trackingNumber: string;
  /** Tracking Url */
  trackingUrl: string;
  /** Estimated Delivery */
  estimatedDelivery?: string;
  /** Delivery Address */
  deliveryAddress: {
    /** Name */
    name: string;
    /** Address Line1 */
    addressLine1: string;
    /** City */
    city: string;
    /** State */
    state: string;
    /** Postal Code */
    postalCode: string;
  };
  /** Items */
  items: Array<{
    /** Name */
    name: string;
    /** Quantity */
    quantity: number;
    /** Image */
    image?: string;
  }>;
}

const statusConfig = {
  /** Shipped */
  shipped: {
    /** Title */
    title: "Your Order Has Shipped! 📦",
    /** Icon */
    icon: "📦",
    /** Color */
    color: "#2563eb",
    /** Message */
    message: "Your order is on its way!",
  },
  in_transit: {
    /** Title */
    title: "Your Order Is In Transit 🚚",
    /** Icon */
    icon: "🚚",
    /** Color */
    color: "#f59e0b",
    /** Message */
    message: "Your package is moving through our delivery network.",
  },
  out_for_delivery: {
    /** Title */
    title: "Out for Delivery Today! 🏃",
    /** Icon */
    icon: "🏃",
    /** Color */
    color: "#10b981",
    /** Message */
    message: "Your order will be delivered today.",
  },
  /** Delivered */
  delivered: {
    /** Title */
    title: "Delivered Successfully! ✅",
    /** Icon */
    icon: "✅",
    /** Color */
    color: "#10b981",
    /** Message */
    message: "Your order has been delivered.",
  },
};

/**
 * Performs shipping update operation
 *
 * @returns {any} The shippingupdate result
 *
 * @example
 * ShippingUpdate();
 */

/**
 * S
 * @constant
 */
/**
 * Performs shipping update operation
 *
 * @returns {any} The shippingupdate result
 *
 * @example
 * ShippingUpdate();
 */

/**
 * S
 * @constant
 */
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
  /** Body */
  body: {
    /** Margin */
    margin: 0,
    /** Padding */
    padding: 0,
    /** Font Family */
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    /** Background Color */
    backgroundColor: "#f5f5f5",
  },
  /** Container */
  container: {
    /** Max Width */
    maxWidth: "600px",
    /** Margin */
    margin: "0 auto",
    /** Background Color */
    backgroundColor: "#ffffff",
  },
  /** Header */
  header: {
    /** Background Color */
    backgroundColor: "#2563eb",
    /** Color */
    color: "#ffffff",
    /** Padding */
    padding: "20px",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Logo */
  logo: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "24px",
    /** Font Weight */
    fontWeight: "bold",
  },
  /** Status Box */
  statusBox: {
    /** Padding */
    padding: "30px 20px",
    /** Text Align */
    textAlign: "center" as const,
    /** Color */
    color: "#ffffff",
  },
  /** Status Icon */
  statusIcon: {
    /** Font Size */
    fontSize: "48px",
    /** Margin Bottom */
    marginBottom: "10px",
  },
  /** Status Title */
  statusTitle: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "24px",
    /** Font Weight */
    fontWeight: "bold",
  },
  /** Status Message */
  statusMessage: {
    /** Margin */
    margin: "10px 0 0 0",
    /** Font Size */
    fontSize: "16px",
    /** Opacity */
    opacity: 0.9,
  },
  /** Section */
  section: {
    /** Padding */
    padding: "20px",
    /** Border Bottom */
    borderBottom: "1px solid #e5e7eb",
  },
  /** Greeting */
  greeting: {
    /** Margin */
    margin: "0 0 15px 0",
    /** Font Size */
    fontSize: "16px",
    /** Color */
    color: "#1f2937",
  },
  /** Text */
  text: {
    /** Margin */
    margin: "0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
    /** Line Height */
    lineHeight: "1.6",
  },
  /** Section Title */
  sectionTitle: {
    /** Margin */
    margin: "0 0 15px 0",
    /** Font Size */
    fontSize: "18px",
    /** Color */
    color: "#1f2937",
    /** Font Weight */
    fontWeight: "600",
  },
  /** Tracking Box */
  trackingBox: {
    /** Background Color */
    backgroundColor: "#f9fafb",
    /** Padding */
    padding: "15px",
    /** Border Radius */
    borderRadius: "8px",
  },
  /** Tracking Row */
  trackingRow: {
    /** Display */
    display: "flex",
    /** Justify Content */
    justifyContent: "space-between",
    /** Padding */
    padding: "8px 0",
  },
  /** Tracking Label */
  trackingLabel: {
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
  },
  /** Tracking Value */
  trackingValue: {
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#1f2937",
    /** Font Weight */
    fontWeight: "600",
  },
  /** Button Container */
  buttonContainer: {
    /** Padding */
    padding: "30px 20px",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Button */
  button: {
    /** Display */
    display: "inline-block",
    /** Background Color */
    backgroundColor: "#2563eb",
    /** Color */
    color: "#ffffff",
    /** Padding */
    padding: "12px 30px",
    /** Border Radius */
    borderRadius: "6px",
    /** Text Decoration */
    textDecoration: "none",
    /** Font Size */
    fontSize: "16px",
    /** Font Weight */
    fontWeight: "600",
  },
  /** Address */
  address: {
    /** Background Color */
    backgroundColor: "#f9fafb",
    /** Padding */
    padding: "15px",
    /** Border Radius */
    borderRadius: "8px",
  },
  /** Address Line */
  addressLine: {
    /** Margin */
    margin: "5px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#1f2937",
  },
  /** Item Row */
  itemRow: {
    /** Display */
    display: "flex",
    /** Align Items */
    alignItems: "center",
    /** Padding */
    padding: "15px 0",
    /** Border Bottom */
    borderBottom: "1px solid #f3f4f6",
  },
  /** Item Image */
  itemImage: {
    /** Width */
    width: "50px",
    /** Height */
    height: "50px",
    /** Object Fit */
    objectFit: "cover" as const,
    /** Border Radius */
    borderRadius: "6px",
    /** Margin Right */
    marginRight: "15px",
  },
  /** Item Details */
  itemDetails: {
    /** Flex */
    flex: 1,
  },
  /** Item Name */
  itemName: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#1f2937",
    /** Font Weight */
    fontWeight: "500",
  },
  /** Item Quantity */
  itemQuantity: {
    /** Margin */
    margin: "5px 0 0 0",
    /** Font Size */
    fontSize: "12px",
    /** Color */
    color: "#6b7280",
  },
  /** Help Section */
  helpSection: {
    /** Padding */
    padding: "20px",
    /** Background Color */
    backgroundColor: "#f9fafb",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Help Title */
  helpTitle: {
    /** Margin */
    margin: "0 0 10px 0",
    /** Font Size */
    fontSize: "16px",
    /** Color */
    color: "#1f2937",
  },
  /** Help Text */
  helpText: {
    /** Margin */
    margin: "10px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
  },
  /** Link */
  link: {
    /** Color */
    color: "#2563eb",
    /** Text Decoration */
    textDecoration: "none",
  },
  /** Footer */
  footer: {
    /** Padding */
    padding: "20px",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Footer Text */
  footerText: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "12px",
    /** Color */
    color: "#9ca3af",
  },
};

export default ShippingUpdate;
