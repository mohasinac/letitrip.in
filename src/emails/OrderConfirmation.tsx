/**
 * @fileoverview React Component
 * @module src/emails/OrderConfirmation
 * @description This file contains the OrderConfirmation component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Order Confirmation Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

/**
 * OrderConfirmationEmailProps interface
 * 
 * @interface
 * @description Defines the structure and contract for OrderConfirmationEmailProps
 */
export interface OrderConfirmationEmailProps {
  /** Customer Name */
  customerName: string;
  /** Order Id */
  orderId: string;
  /** Order Date */
  orderDate: string;
  /** Order Total */
  orderTotal: number;
  /** Order Items */
  orderItems: Array<{
    /** Name */
    name: string;
    /** Quantity */
    quantity: number;
    /** Price */
    price: number;
    /** Image */
    image?: string;
  }>;
  /** Shipping Address */
  shippingAddress: {
    /** Street */
    street: string;
    /** City */
    city: string;
    /** State */
    state: string;
    /** Pincode */
    pincode: string;
  };
  /** Tracking Url */
  trackingUrl?: string;
}

/**
 * Performs order confirmation email operation
 *
 * @returns {any} The orderconfirmationemail result
 *
 * @example
 * OrderConfirmationEmail();
 */

/**
 * O
 * @constant
 */
/**
 * Performs order confirmation email operation
 *
 * @returns {any} The orderconfirmationemail result
 *
 * @example
 * OrderConfirmationEmail();
 */

/**
 * O
 * @constant
 */
export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  orderId,
  orderDate,
  orderTotal,
  orderItems,
  shippingAddress,
  trackingUrl,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
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
              borderBottom: "4px solid #3b82f6",
            }}
          >
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
              JustForView.in
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
            <h2
              style={{
                /** Font Size */
                fontSize: "20px",
                /** Font Weight */
                fontWeight: "bold",
                /** Color */
                color: "#1f2937",
                /** Margin Top */
                marginTop: 0,
                /** Margin Bottom */
                marginBottom: "16px",
              }}
            >
              Thank you for your order, {customerName}!
            </h2>

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
              We've received your order and are getting it ready. You'll receive
              a shipping confirmation email with tracking details once your
              order is on its way.
            </p>

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
                Order Details
              </h3>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                  Order ID:{" "}
                </span>
                <span
                  style={{
                    /** Font Size */
                    fontSize: "14px",
                    /** Font Weight */
                    fontWeight: "600",
                    /** Color */
                    color: "#1f2937",
                  }}
                >
                  {orderId}
                </span>
              </div>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                  Order Date:{" "}
                </span>
                <span style={{ fontSize: "14px", color: "#1f2937" }}>
                  {orderDate}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: "24px" }}>
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
                  marginBottom: "16px",
                }}
              >
                Order Items
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
                    padding: "12px 0",
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
                        width: "60px",
                        /** Height */
                        height: "60px",
                        /** Object Fit */
                        objectFit: "cover",
                        /** Border Radius */
                        borderRadius: "4px",
                        /** Margin Right */
                        marginRight: "12px",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        /** Font Size */
                        fontSize: "14px",
                        /** Font Weight */
                        fontWeight: "600",
                        /** Color */
                        color: "#1f2937",
                        /** Margin Bottom */
                        marginBottom: "4px",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        /** Font Size */
                        fontSize: "12px",
                        /** Color */
                        color: "#6b7280",
                      }}
                    >
                      /** Quantity */
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div
                    style={{
                      /** Font Size */
                      fontSize: "14px",
                      /** Font Weight */
                      fontWeight: "600",
                      /** Color */
                      color: "#1f2937",
                    }}
                  >
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
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
              <div
                style={{
                  /** Display */
                  display: "flex",
                  /** Justify Content */
                  justifyContent: "space-between",
                  /** Align Items */
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    /** Font Size */
                    fontSize: "16px",
                    /** Font Weight */
                    fontWeight: "600",
                    /** Color */
                    color: "#1f2937",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    /** Font Size */
                    fontSize: "18px",
                    /** Font Weight */
                    fontWeight: "bold",
                    /** Color */
                    color: "#3b82f6",
                  }}
                >
                  ₹{orderTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
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
                Shipping Address
              </h3>
              <div
                style={{
                  /** Font Size */
                  fontSize: "14px",
                  /** Color */
                  color: "#1f2937",
                  /** Line Height */
                  lineHeight: "1.6",
                }}
              >
                <div>{customerName}</div>
                <div>{shippingAddress.street}</div>
                <div>
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.pincode}
                </div>
              </div>
            </div>

            {/* Track Order Button */}
            {trackingUrl && (
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <a
                  href={trackingUrl}
                  style={{
                    /** Display */
                    display: "inline-block",
                    /** Background Color */
                    backgroundColor: "#3b82f6",
                    /** Color */
                    color: "#ffffff",
                    /** Font Size */
                    fontSize: "14px",
                    /** Font Weight */
                    fontWeight: "600",
                    /** Padding */
                    padding: "12px 24px",
                    /** Border Radius */
                    borderRadius: "6px",
                    /** Text Decoration */
                    textDecoration: "none",
                  }}
                >
                  Track Your Order
                </a>
              </div>
            )}

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
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@justforview.in"
                style={{ color: "#3b82f6", textDecoration: "none" }}
              >
                support@justforview.in
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

export default OrderConfirmationEmail;
