/**
 * @fileoverview React Component
 * @module src/templates/email/OrderConfirmation
 * @description This file contains the OrderConfirmation component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Order Confirmation Email Template
 * Task 1.5.2 - Email Templates
 *
 * React email template for order confirmation
 * Sent when a customer places an order
 */

import React from "react";

/**
 * OrderConfirmationProps interface
 * 
 * @interface
 * @description Defines the structure and contract for OrderConfirmationProps
 */
export interface OrderConfirmationProps {
  /** Customer Name */
  customerName: string;
  /** Order Id */
  orderId: string;
  /** Order Date */
  orderDate: string;
  /** Items */
  items: Array<{
    /** Name */
    name: string;
    /** Quantity */
    quantity: number;
    /** Price */
    price: number;
    /** Image */
    image?: string;
  }>;
  /** Subtotal */
  subtotal: number;
  /** Shipping */
  shipping: number;
  /** Tax */
  tax: number;
  /** Total */
  total: number;
  /** Shipping Address */
  shippingAddress: {
    /** Name */
    name: string;
    /** Address Line1 */
    addressLine1: string;
    /** Address Line2 */
    addressLine2?: string;
    /** City */
    city: string;
    /** State */
    state: string;
    /** Postal Code */
    postalCode: string;
    /** Country */
    country: string;
  };
  /** Estimated Delivery */
  estimatedDelivery?: string;
  /** Tracking Url */
  trackingUrl?: string;
}

/**
 * Performs order confirmation operation
 *
 * @returns {any} The orderconfirmation result
 *
 * @example
 * OrderConfirmation();
 */

/**
 * O
 * @constant
 */
/**
 * Performs order confirmation operation
 *
 * @returns {any} The orderconfirmation result
 *
 * @example
 * OrderConfirmation();
 */

/**
 * O
 * @constant
 */
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
    padding: "30px 20px",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Logo */
  logo: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "28px",
    /** Font Weight */
    fontWeight: "bold",
  },
  /** Tagline */
  tagline: {
    /** Margin */
    margin: "5px 0 0 0",
    /** Font Size */
    fontSize: "14px",
    /** Opacity */
    opacity: 0.9,
  },
  /** Success Box */
  successBox: {
    /** Background Color */
    backgroundColor: "#10b981",
    /** Color */
    color: "#ffffff",
    /** Padding */
    padding: "20px",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Success Title */
  successTitle: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "24px",
  },
  /** Success Text */
  successText: {
    /** Margin */
    margin: "10px 0 0 0",
    /** Font Size */
    fontSize: "16px",
  },
  /** Section */
  section: {
    /** Padding */
    padding: "20px",
    /** Border Bottom */
    borderBottom: "1px solid #e5e7eb",
  },
  /** Section Title */
  sectionTitle: {
    /** Margin */
    margin: "0 0 15px 0",
    /** Font Size */
    fontSize: "18px",
    /** Color */
    color: "#1f2937",
  },
  /** Details Table */
  detailsTable: {
    /** Width */
    width: "100%",
  },
  /** Label Cell */
  labelCell: {
    /** Padding */
    padding: "8px 0",
    /** Color */
    color: "#6b7280",
    /** Font Size */
    fontSize: "14px",
  },
  /** Value Cell */
  valueCell: {
    /** Padding */
    padding: "8px 0",
    /** Color */
    color: "#1f2937",
    /** Font Size */
    fontSize: "14px",
    /** Font Weight */
    fontWeight: "600",
    /** Text Align */
    textAlign: "right" as const,
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
    width: "60px",
    /** Height */
    height: "60px",
    /** Object Fit */
    objectFit: "cover" as const,
    /** Border Radius */
    borderRadius: "8px",
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
  /** Item Price */
  itemPrice: {
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#1f2937",
    /** Font Weight */
    fontWeight: "600",
  },
  /** Summary Table */
  summaryTable: {
    /** Width */
    width: "100%",
    /** Margin Top */
    marginTop: "10px",
  },
  /** Summary Label */
  summaryLabel: {
    /** Padding */
    padding: "8px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
  },
  /** Summary Value */
  summaryValue: {
    /** Padding */
    padding: "8px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#1f2937",
    /** Text Align */
    textAlign: "right" as const,
  },
  /** Total Row */
  totalRow: {
    /** Border Top */
    borderTop: "2px solid #e5e7eb",
  },
  /** Total Label */
  totalLabel: {
    /** Padding */
    padding: "12px 0",
    /** Font Size */
    fontSize: "16px",
    /** Color */
    color: "#1f2937",
    /** Font Weight */
    fontWeight: "bold",
  },
  /** Total Value */
  totalValue: {
    /** Padding */
    padding: "12px 0",
    /** Font Size */
    fontSize: "18px",
    /** Color */
    color: "#2563eb",
    /** Font Weight */
    fontWeight: "bold",
    /** Text Align */
    textAlign: "right" as const,
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
  /** Footer */
  footer: {
    /** Background Color */
    backgroundColor: "#f9fafb",
    /** Padding */
    padding: "20px",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Footer Text */
  footerText: {
    /** Margin */
    margin: "10px 0",
    /** Font Size */
    fontSize: "12px",
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
};

export default OrderConfirmation;
