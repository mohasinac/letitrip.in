/**
 * Order Confirmation Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

export interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  orderDate: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingUrl?: string;
}

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
              borderBottom: "4px solid #3b82f6",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
              }}
            >
              JustForView.in
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
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1f2937",
                marginTop: 0,
                marginBottom: "16px",
              }}
            >
              Thank you for your order, {customerName}!
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.5",
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
                Order Details
              </h3>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                  Order ID:{" "}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
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
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginTop: 0,
                  marginBottom: "16px",
                }}
              >
                Order Items
              </h3>
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 0",
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
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        marginRight: "12px",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1f2937",
                        marginBottom: "4px",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
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
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
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
                Shipping Address
              </h3>
              <div
                style={{
                  fontSize: "14px",
                  color: "#1f2937",
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
                    display: "inline-block",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "12px 24px",
                    borderRadius: "6px",
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
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.5",
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

export default OrderConfirmationEmail;
