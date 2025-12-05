/**
 * Welcome Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

export interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  verificationLink?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  userEmail,
  verificationLink,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to JustForView.in!</title>
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
              padding: "32px 24px",
              textAlign: "center",
              borderBottom: "4px solid #8b5cf6",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#ede9fe",
                borderRadius: "50%",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "40px" }}>🎉</span>
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
                marginBottom: "8px",
              }}
            >
              Welcome to JustForView.in!
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#6b7280",
                margin: 0,
              }}
            >
              We're excited to have you on board, {userName}!
            </p>
          </div>

          {/* Main Content */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "32px 24px",
            }}
          >
            {/* Welcome Message */}
            <p
              style={{
                fontSize: "16px",
                color: "#1f2937",
                lineHeight: "1.6",
                marginTop: 0,
                marginBottom: "24px",
              }}
            >
              Hi {userName},
            </p>

            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.6",
                marginBottom: "24px",
              }}
            >
              Thank you for joining JustForView.in, India's premier auction and
              e-commerce platform. You're now part of a vibrant community of
              buyers and sellers!
            </p>

            {/* Verification */}
            {verificationLink && (
              <div
                style={{
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fcd34d",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#78350f",
                    marginTop: 0,
                    marginBottom: "12px",
                  }}
                >
                  🔐 Verify Your Email
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#92400e",
                    lineHeight: "1.5",
                    marginBottom: "16px",
                  }}
                >
                  Please verify your email address to activate your account and
                  start shopping or selling.
                </p>
                <div style={{ textAlign: "center" }}>
                  <a
                    href={verificationLink}
                    style={{
                      display: "inline-block",
                      backgroundColor: "#eab308",
                      color: "#1f2937",
                      fontSize: "14px",
                      fontWeight: "600",
                      padding: "12px 24px",
                      borderRadius: "6px",
                      textDecoration: "none",
                    }}
                  >
                    Verify Email Address
                  </a>
                </div>
              </div>
            )}

            {/* Features */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginTop: 0,
                  marginBottom: "16px",
                }}
              >
                What You Can Do:
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      marginRight: "12px",
                      lineHeight: "1",
                    }}
                  >
                    🛍️
                  </span>
                  <div>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#1f2937",
                        margin: 0,
                        marginBottom: "4px",
                      }}
                    >
                      Shop Thousands of Products
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      Browse and buy from verified sellers across India
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      marginRight: "12px",
                      lineHeight: "1",
                    }}
                  >
                    ⚡
                  </span>
                  <div>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#1f2937",
                        margin: 0,
                        marginBottom: "4px",
                      }}
                    >
                      Participate in Live Auctions
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      Bid on unique items and win great deals
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      marginRight: "12px",
                      lineHeight: "1",
                    }}
                  >
                    💰
                  </span>
                  <div>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#1f2937",
                        margin: 0,
                        marginBottom: "4px",
                      }}
                    >
                      Become a Seller
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      Create your shop and reach millions of buyers
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      marginRight: "12px",
                      lineHeight: "1",
                    }}
                  >
                    🔔
                  </span>
                  <div>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#1f2937",
                        margin: 0,
                        marginBottom: "4px",
                      }}
                    >
                      Get Personalized Recommendations
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      Discover products tailored to your interests
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginTop: 0,
                  marginBottom: "16px",
                }}
              >
                Ready to start exploring?
              </p>
              <a
                href="https://justforview.in"
                style={{
                  display: "inline-block",
                  backgroundColor: "#8b5cf6",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                  padding: "12px 32px",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Start Shopping
              </a>
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
              Need help getting started?{" "}
              <a
                href="https://justforview.in/help"
                style={{ color: "#8b5cf6", textDecoration: "none" }}
              >
                Visit our Help Center
              </a>{" "}
              or{" "}
              <a
                href="mailto:support@justforview.in"
                style={{ color: "#8b5cf6", textDecoration: "none" }}
              >
                contact support
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
              This email was sent to {userEmail}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default WelcomeEmail;
