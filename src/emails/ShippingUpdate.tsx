/**
 * @fileoverview React Component
 * @module src/emails/ShippingUpdate
 * @description This file contains the ShippingUpdate component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Shipping Update Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

/**
 * ShippingUpdateEmailProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShippingUpdateEmailProps
 */
export interface ShippingUpdateEmailProps {
  /** Customer Name */
  customerName: string;
  /** Order Id */
  orderId: string;
  /** Tracking Number */
  trackingNumber: string;
  /** Courier Name */
  courierName: string;
  /** Estimated Delivery */
  estimatedDelivery: string;
  /** Tracking Url */
  trackingUrl: string;
  /** Order Items */
  orderItems: Array<{
    /** Name */
    name: string;
    /** Image */
    image?: string;
  }>;
}

/**
 * Performs shipping update email operation
 *
 * @returns {any} The shippingupdateemail result
 *
 * @example
 * ShippingUpdateEmail();
 */

/**
 * S
 * @constant
 */
/**
 * Performs shipping update email operation
 *
 * @returns {any} The shippingupdateemail result
 *
 * @example
 * ShippingUpdateEmail();
 */

/**
 * S
 * @constant
 */
export const ShippingUpdateEmail: React.FC<ShippingUpdateEmailProps> = ({
  customerName,
  orderId,
  trackingNumber,
  courierName,
  estimatedDelivery,
  trackingUrl,
  orderItems,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Order is on the Way!</title>
      </head>
      <body
        style={{
          /** Font Family */
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          /** Background Color */
          backgroundColor: "#f3f4f6",
          /** Margin */
          margin: 0,
          /** Padding */
          padding: 0,
        }}
      >
        <div
          style={{
            /** Max Width */
            maxWidth: "600px",
            /** Margin */
            margin: "0 auto",
            /** Padding */
            padding: "20px",
          }}
        >
          {/* Header */}
          <div
            style={{
              /** Background Color */
              backgroundColor: "#ffffff",
              /** Border Radius */
              borderRadius: "8px 8px 0 0",
              /** Padding */
              padding: "24px",
              /** Text Align */
              textAlign: "center",
              /** Border Bottom */
              borderBottom: "4px solid #10b981",
            }}
          >
            <div
              style={{
                /** Width */
                width: "64px",
                /** Height */
                height: "64px",
                /** Background Color */
                backgroundColor: "#d1fae5",
                /** Border Radius */
                borderRadius: "50%",
                /** Margin */
                margin: "0 auto 16px",
                /** Display */
                display: "flex",
                /** Align Items */
                alignItems: "center",
                /** Justify Content */
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "32px" }}>📦</span>
            </div>
            <h1
              style={{
                /** Font Size */
                fontSize: "24px",
                /** Font Weight */
                fontWeight: "bold",
                /** Color */
                color: "#1f2937",
                /** Margin */
                margin: 0,
              }}
            >
              Your Order is on the Way!
            </h1>
          </div>

          {/* Main Content */}
          <div
            style={{
              /** Background Color */
              backgroundColor: "#ffffff",
              /** Padding */
              padding: "32px 24px",
            }}
          >
            {/* Greeting */}
            <p
              style={{
                /** Font Size */
                fontSize: "16px",
                /** Color */
                color: "#1f2937",
                /** Line Height */
                lineHeight: "1.6",
                /** Margin Top */
                marginTop: 0,
                /** Margin Bottom */
                marginBottom: "24px",
              }}
            >
              Hi {customerName},
            </p>

            <p
              style={{
                /** Font Size */
                fontSize: "14px",
                /** Color */
                color: "#6b7280",
                /** Line Height */
                lineHeight: "1.5",
                /** Margin Bottom */
                marginBottom: "24px",
              }}
            >
              Great news! Your order has been shipped and is on its way to you.
              You can track your package using the details below.
            </p>

            {/* Tracking Info */}
            <div
              style={{
                /** Background Color */
                backgroundColor: "#f0fdf4",
                /** Border */
                border: "1px solid #86efac",
                /** Border Radius */
                borderRadius: "8px",
                /** Padding */
                padding: "20px",
                /** Margin Bottom */
                marginBottom: "24px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    /** Font Size */
                    fontSize: "12px",
                    /** Color */
                    color: "#065f46",
                    /** Font Weight */
                    fontWeight: "600",
                    /** Text Transform */
                    textTransform: "uppercase",
                    /** Letter Spacing */
                    letterSpacing: "0.05em",
                  }}
                >
                  Tracking Number
                </span>
                <div
                  style={{
                    /** Font Size */
                    fontSize: "20px",
                    /** Font Weight */
                    fontWeight: "bold",
                    /** Color */
                    color: "#047857",
                    /** Margin Top */
                    marginTop: "4px",
                    /** Letter Spacing */
                    letterSpacing: "0.025em",
                  }}
                >
                  {trackingNumber}
                </div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    /** Font Size */
                    fontSize: "12px",
                    /** Color */
                    color: "#065f46",
                    /** Font Weight */
                    fontWeight: "600",
                  }}
                >
                  /** Courier */
                  Courier:{" "}
                </span>
                <span style={{ fontSize: "14px", color: "#047857" }}>
                  {courierName}
                </span>
              </div>
              <div>
                <span
                  style={{
                    /** Font Size */
                    fontSize: "12px",
                    /** Color */
                    color: "#065f46",
                    /** Font Weight */
                    fontWeight: "600",
                  }}
                >
                  Estimated Delivery:{" "}
                </span>
                <span style={{ fontSize: "14px", color: "#047857" }}>
                  {estimatedDelivery}
                </span>
              </div>
            </div>

            {/* Track Button */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <a
                href={trackingUrl}
                style={{
                  /** Display */
                  display: "inline-block",
                  /** Background Color */
                  backgroundColor: "#10b981",
                  /** Color */
                  color: "#ffffff",
                  /** Font Size */
                  fontSize: "16px",
                  /** Font Weight */
                  fontWeight: "600",
                  /** Padding */
                  padding: "14px 32px",
                  /** Border Radius */
                  borderRadius: "6px",
                  /** Text Decoration */
                  textDecoration: "none",
                }}
              >
                Track Your Package
              </a>
            </div>

            {/* Order Details */}
            <div
              style={{
                /** Background Color */
                backgroundColor: "#f9fafb",
                /** Border Radius */
                borderRadius: "8px",
                /** Padding */
                padding: "16px",
                /** Margin Bottom */
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  /** Font Size */
                  fontSize: "16px",
                  /** Font Weight */
                  fontWeight: "600",
                  /** Color */
                  color: "#1f2937",
                  /** Margin Top */
                  marginTop: 0,
                  /** Margin Bottom */
                  marginBottom: "12px",
                }}
              >
                Order #{orderId}
              </h3>
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    /** Display */
                    display: "flex",
                    /** Align Items */
                    alignItems: "center",
                    /** Padding */
                    padding: "8px 0",
                    /** Border Bottom */
                    borderBottom:
                      index < orderItems.length - 1
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        /** Width */
                        width: "50px",
                        /** Height */
                        height: "50px",
                        /** Object Fit */
                        objectFit: "cover",
                        /** Border Radius */
                        borderRadius: "4px",
                        /** Margin Right */
                        marginRight: "12px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      /** Font Size */
                      fontSize: "14px",
                      /** Color */
                      color: "#1f2937",
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Tips */}
            <div
              style={{
                /** Background Color */
                backgroundColor: "#fef3c7",
                /** Border */
                border: "1px solid #fcd34d",
                /** Border Radius */
                borderRadius: "8px",
                /** Padding */
                padding: "16px",
                /** Margin Bottom */
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  /** Font Size */
                  fontSize: "14px",
                  /** Font Weight */
                  fontWeight: "600",
                  /** Color */
                  color: "#78350f",
                  /** Margin Top */
                  marginTop: 0,
                  /** Margin Bottom */
                  marginBottom: "8px",
                }}
              >
                💡 Delivery Tips
              </h4>
              <ul
                style={{
                  /** Font Size */
                  fontSize: "13px",
                  /** Color */
                  color: "#92400e",
                  /** Line Height */
                  lineHeight: "1.6",
                  /** Margin */
                  margin: 0,
                  /** Padding Left */
                  paddingLeft: "20px",
                }}
              >
                <li>
                  Please ensure someone is available to receive the package
                </li>
                <li>A valid ID may be required for delivery</li>
                <li>Check your package upon delivery for any damage</li>
              </ul>
            </div>

            {/* Help Text */}
            <p
              style={{
                /** Font Size */
                fontSize: "14px",
                /** Color */
                color: "#6b7280",
                /** Line Height */
                lineHeight: "1.5",
                /** Text Align */
                textAlign: "center",
              }}
            >
              Questions about your order?{" "}
              <a
                href="mailto:support@justforview.in"
                style={{ color: "#10b981", textDecoration: "none" }}
              >
                Contact Support
              </a>
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              /** Background Color */
              backgroundColor: "#f9fafb",
              /** Border Radius */
              borderRadius: "0 0 8px 8px",
              /** Padding */
              padding: "24px",
              /** Text Align */
              textAlign: "center",
              /** Border Top */
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                /** Font Size */
                fontSize: "12px",
                /** Color */
                color: "#6b7280",
                /** Margin */
                margin: 0,
                /** Margin Bottom */
                marginBottom: "8px",
              }}
            >
              © 2025 JustForView.in. All rights reserved.
            </p>
            <p
              style={{
                /** Font Size */
                fontSize: "12px",
                /** Color */
                color: "#9ca3af",
                /** Margin */
                margin: 0,
              }}
            >
              This email was sent to {customerName} regarding order #{orderId}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default ShippingUpdateEmail;
