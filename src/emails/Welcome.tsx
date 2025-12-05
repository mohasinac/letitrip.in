/**
 * @fileoverview React Component
 * @module src/emails/Welcome
 * @description This file contains the Welcome component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Welcome Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

/**
 * WelcomeEmailProps interface
 * 
 * @interface
 * @description Defines the structure and contract for WelcomeEmailProps
 */
export interface WelcomeEmailProps {
  /** User Name */
  userName: string;
  /** User Email */
  userEmail: string;
  /** Verification Link */
  verificationLink?: string;
}

/**
 * Performs welcome email operation
 *
 * @param {any} {
  userName,
  userEmail,
  verificationLink,
} - The {
  user name,
  user email,
  verification link,
}
 *
 * @returns {any} The welcomeemail result
 *
 * @example
 * WelcomeEmail({
  userName,
  userEmail,
  verificationLink,
});
 */

/**
 * W
 * @constant
 */
/**
 * Performs welcome email operation
 *
 * @param {any} {
  userName,
  userEmail,
  verificationLink,
} - The {
  user name,
  user email,
  verification link,
}
 *
 * @returns {any} The welcomeemail result
 *
 * @example
 * WelcomeEmail({
  userName,
  userEmail,
  verificationLink,
});
 */

/**
 * W
 * @constant
 */
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
              padding: "32px 24px",
              /** Text Align */
              textAlign: "center",
              /** Border Bottom */
              borderBottom: "4px solid #8b5cf6",
            }}
          >
            <div
              style={{
                /** Width */
                width: "80px",
                /** Height */
                height: "80px",
                /** Background Color */
                backgroundColor: "#ede9fe",
                /** Border Radius */
                borderRadius: "50%",
                /** Margin */
                margin: "0 auto 20px",
                /** Display */
                display: "flex",
                /** Align Items */
                alignItems: "center",
                /** Justify Content */
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "40px" }}>🎉</span>
            </div>
            <h1
              style={{
                /** Font Size */
                fontSize: "28px",
                /** Font Weight */
                fontWeight: "bold",
                /** Color */
                color: "#1f2937",
                /** Margin */
                margin: 0,
                /** Margin Bottom */
                marginBottom: "8px",
              }}
            >
              Welcome to JustForView.in!
            </h1>
            <p
              style={{
                /** Font Size */
                fontSize: "16px",
                /** Color */
                color: "#6b7280",
                /** Margin */
                margin: 0,
              }}
            >
              We're excited to have you on board, {userName}!
            </p>
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
            {/* Welcome Message */}
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
              Hi {userName},
            </p>

            <p
              style={{
                /** Font Size */
                fontSize: "14px",
                /** Color */
                color: "#6b7280",
                /** Line Height */
                lineHeight: "1.6",
                /** Margin Bottom */
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
                  /** Background Color */
                  backgroundColor: "#fef3c7",
                  /** Border */
                  border: "1px solid #fcd34d",
                  /** Border Radius */
                  borderRadius: "8px",
                  /** Padding */
                  padding: "20px",
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
                    color: "#78350f",
                    /** Margin Top */
                    marginTop: 0,
                    /** Margin Bottom */
                    marginBottom: "12px",
                  }}
                >
                  🔐 Verify Your Email
                </h3>
                <p
                  style={{
                    /** Font Size */
                    fontSize: "14px",
                    /** Color */
                    color: "#92400e",
                    /** Line Height */
                    lineHeight: "1.5",
                    /** Margin Bottom */
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
                      /** Display */
                      display: "inline-block",
                      /** Background Color */
                      backgroundColor: "#eab308",
                      /** Color */
                      color: "#1f2937",
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
                    Verify Email Address
                  </a>
                </div>
              </div>
            )}

            {/* Features */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  /** Font Size */
                  fontSize: "18px",
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
                What You Can Do:
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    /** Display */
                    display: "flex",
                    /** Align Items */
                    alignItems: "flex-start",
                    /** Margin Bottom */
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      /** Font Size */
                      fontSize: "24px",
                      /** Margin Right */
                      marginRight: "12px",
                      /** Line Height */
                      lineHeight: "1",
                    }}
                  >
                    🛍️
                  </span>
                  <div>
                    <h4
                      style={{
                        /** Font Size */
                        fontSize: "15px",
                        /** Font Weight */
                        fontWeight: "600",
                        /** Color */
                        color: "#1f2937",
                        /** Margin */
                        margin: 0,
                        /** Margin Bottom */
                        marginBottom: "4px",
                      }}
                    >
                      Shop Thousands of Products
                    </h4>
                    <p
                      style={{
                        /** Font Size */
                        fontSize: "13px",
                        /** Color */
                        color: "#6b7280",
                        /** Margin */
                        margin: 0,
                        /** Line Height */
                        lineHeight: "1.5",
                      }}
                    >
                      Browse and buy from verified sellers across India
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    /** Display */
                    display: "flex",
                    /** Align Items */
                    alignItems: "flex-start",
                    /** Margin Bottom */
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      /** Font Size */
                      fontSize: "24px",
                      /** Margin Right */
                      marginRight: "12px",
                      /** Line Height */
                      lineHeight: "1",
                    }}
                  >
                    ⚡
                  </span>
                  <div>
                    <h4
                      style={{
                        /** Font Size */
                        fontSize: "15px",
                        /** Font Weight */
                        fontWeight: "600",
                        /** Color */
                        color: "#1f2937",
                        /** Margin */
                        margin: 0,
                        /** Margin Bottom */
                        marginBottom: "4px",
                      }}
                    >
                      Participate in Live Auctions
                    </h4>
                    <p
                      style={{
                        /** Font Size */
                        fontSize: "13px",
                        /** Color */
                        color: "#6b7280",
                        /** Margin */
                        margin: 0,
                        /** Line Height */
                        lineHeight: "1.5",
                      }}
                    >
                      Bid on unique items and win great deals
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    /** Display */
                    display: "flex",
                    /** Align Items */
                    alignItems: "flex-start",
                    /** Margin Bottom */
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      /** Font Size */
                      fontSize: "24px",
                      /** Margin Right */
                      marginRight: "12px",
                      /** Line Height */
                      lineHeight: "1",
                    }}
                  >
                    💰
                  </span>
                  <div>
                    <h4
                      style={{
                        /** Font Size */
                        fontSize: "15px",
                        /** Font Weight */
                        fontWeight: "600",
                        /** Color */
                        color: "#1f2937",
                        /** Margin */
                        margin: 0,
                        /** Margin Bottom */
                        marginBottom: "4px",
                      }}
                    >
                      Become a Seller
                    </h4>
                    <p
                      style={{
                        /** Font Size */
                        fontSize: "13px",
                        /** Color */
                        color: "#6b7280",
                        /** Margin */
                        margin: 0,
                        /** Line Height */
                        lineHeight: "1.5",
                      }}
                    >
                      Create your shop and reach millions of buyers
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    /** Display */
                    display: "flex",
                    /** Align Items */
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      /** Font Size */
                      fontSize: "24px",
                      /** Margin Right */
                      marginRight: "12px",
                      /** Line Height */
                      lineHeight: "1",
                    }}
                  >
                    🔔
                  </span>
                  <div>
                    <h4
                      style={{
                        /** Font Size */
                        fontSize: "15px",
                        /** Font Weight */
                        fontWeight: "600",
                        /** Color */
                        color: "#1f2937",
                        /** Margin */
                        margin: 0,
                        /** Margin Bottom */
                        marginBottom: "4px",
                      }}
                    >
                      Get Personalized Recommendations
                    </h4>
                    <p
                      style={{
                        /** Font Size */
                        fontSize: "13px",
                        /** Color */
                        color: "#6b7280",
                        /** Margin */
                        margin: 0,
                        /** Line Height */
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
                /** Background Color */
                backgroundColor: "#f9fafb",
                /** Border Radius */
                borderRadius: "8px",
                /** Padding */
                padding: "20px",
                /** Text Align */
                textAlign: "center",
                /** Margin Bottom */
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  /** Font Size */
                  fontSize: "14px",
                  /** Color */
                  color: "#6b7280",
                  /** Margin Top */
                  marginTop: 0,
                  /** Margin Bottom */
                  marginBottom: "16px",
                }}
              >
                Ready to start exploring?
              </p>
              <a
                href="https://justforview.in"
                style={{
                  /** Display */
                  display: "inline-block",
                  /** Background Color */
                  backgroundColor: "#8b5cf6",
                  /** Color */
                  color: "#ffffff",
                  /** Font Size */
                  fontSize: "16px",
                  /** Font Weight */
                  fontWeight: "600",
                  /** Padding */
                  padding: "12px 32px",
                  /** Border Radius */
                  borderRadius: "6px",
                  /** Text Decoration */
                  textDecoration: "none",
                }}
              >
                Start Shopping
              </a>
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
              This email was sent to {userEmail}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default WelcomeEmail;
