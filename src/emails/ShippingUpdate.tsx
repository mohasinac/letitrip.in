/**
 * Shipping Update Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

export interface ShippingUpdateEmailProps {
  customerName: string;
  orderId: string;
  trackingNumber: string;
  courierName: string;
  estimatedDelivery: string;
  trackingUrl: string;
  orderItems: Array<{
    name: string;
    image?: string;
  }>;
}

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
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: "#f3f4f6",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px 8px 0 0",
              padding: "24px",
              textAlign: "center",
              borderBottom: "4px solid #10b981",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#d1fae5",
                borderRadius: "50%",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "32px" }}>📦</span>
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
              }}
            >
              Your Order is on the Way!
            </h1>
          </div>

          {/* Main Content */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "32px 24px",
            }}
          >
            {/* Greeting */}
            <p
              style={{
                fontSize: "16px",
                color: "#1f2937",
                lineHeight: "1.6",
                marginTop: 0,
                marginBottom: "24px",
              }}
            >
              Hi {customerName},
            </p>

            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.5",
                marginBottom: "24px",
              }}
            >
              Great news! Your order has been shipped and is on its way to you.
              You can track your package using the details below.
            </p>

            {/* Tracking Info */}
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#065f46",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Tracking Number
                </span>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#047857",
                    marginTop: "4px",
                    letterSpacing: "0.025em",
                  }}
                >
                  {trackingNumber}
                </div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#065f46",
                    fontWeight: "600",
                  }}
                >
                  Courier:{" "}
                </span>
                <span style={{ fontSize: "14px", color: "#047857" }}>
                  {courierName}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#065f46",
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
                  display: "inline-block",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                  padding: "14px 32px",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Track Your Package
              </a>
            </div>

            {/* Order Details */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginTop: 0,
                  marginBottom: "12px",
                }}
              >
                Order #{orderId}
              </h3>
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
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
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        marginRight: "12px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: "14px",
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
                backgroundColor: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#78350f",
                  marginTop: 0,
                  marginBottom: "8px",
                }}
              >
                💡 Delivery Tips
              </h4>
              <ul
                style={{
                  fontSize: "13px",
                  color: "#92400e",
                  lineHeight: "1.6",
                  margin: 0,
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
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.5",
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
              backgroundColor: "#f9fafb",
              borderRadius: "0 0 8px 8px",
              padding: "24px",
              textAlign: "center",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: 0,
                marginBottom: "8px",
              }}
            >
              © 2025 JustForView.in. All rights reserved.
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
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
