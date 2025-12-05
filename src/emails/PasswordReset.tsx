/**
 * @fileoverview React Component
 * @module src/emails/PasswordReset
 * @description This file contains the PasswordReset component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Password Reset Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

/**
 * PasswordResetEmailProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PasswordResetEmailProps
 */
export interface PasswordResetEmailProps {
  /** User Name */
  userName: string;
  /** User Email */
  userEmail: string;
  /** Reset Link */
  resetLink: string;
  /** ExpiresIn */
  expiresIn: number; // minutes
}

/**
 * Performs password reset email operation
 *
 * @returns {any} The passwordresetemail result
 *
 * @example
 * PasswordResetEmail();
 */

/**
 * P
 * @constant
 */
/**
 * Performs password reset email operation
 *
 * @returns {any} The passwordresetemail result
 *
 * @example
 * PasswordResetEmail();
 */

/**
 * P
 * @constant
 */
export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  userEmail,
  resetLink,
  expiresIn,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
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
              borderBottom: "4px solid #ef4444",
            }}
          >
            <div
              style={{
                /** Width */
                width: "80px",
                /** Height */
                height: "80px",
                /** Background Color */
                backgroundColor: "#fee2e2",
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
              <span style={{ fontSize: "40px" }}>🔐</span>
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
              Reset Your Password
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
              We received a request to reset the password for your
              JustForView.in account. Click the button below to create a new
              password.
            </p>

            {/* Reset Button */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <a
                href={resetLink}
                style={{
                  /** Display */
                  display: "inline-block",
                  /** Background Color */
                  backgroundColor: "#ef4444",
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
                Reset Password
              </a>
            </div>

            {/* Expiry Warning */}
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
              <p
                style={{
                  /** Font Size */
                  fontSize: "13px",
                  /** Color */
                  color: "#92400e",
                  /** Margin */
                  margin: 0,
                  /** Line Height */
                  lineHeight: "1.5",
                }}
              >
                ⚠️ This link will expire in <strong>{expiresIn} minutes</strong>
                . If you don't reset your password within this time, you'll need
                to request a new link.
              </p>
            </div>

            {/* Alternative Link */}
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
              <p
                style={{
                  /** Font Size */
                  fontSize: "13px",
                  /** Color */
                  color: "#6b7280",
                  /** Margin Top */
                  marginTop: 0,
                  /** Margin Bottom */
                  marginBottom: "8px",
                }}
              >
                If the button doesn't work, copy and paste this link into your
                /** Browser */
                browser:
              </p>
              <p
                style={{
                  /** Font Size */
                  fontSize: "12px",
                  /** Color */
                  color: "#3b82f6",
                  /** Word Break */
                  wordBreak: "break-all",
                  /** Margin */
                  margin: 0,
                  /** Font Family */
                  fontFamily: "monospace",
                }}
              >
                {resetLink}
              </p>
            </div>

            {/* Security Notice */}
            <div
              style={{
                /** Background Color */
                backgroundColor: "#fef2f2",
                /** Border */
                border: "1px solid #fca5a5",
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
                  color: "#991b1b",
                  /** Margin Top */
                  marginTop: 0,
                  /** Margin Bottom */
                  marginBottom: "8px",
                }}
              >
                🛡️ Security Notice
              </h4>
              <p
                style={{
                  /** Font Size */
                  fontSize: "13px",
                  /** Color */
                  color: "#991b1b",
                  /** Margin */
                  margin: 0,
                  /** Line Height */
                  lineHeight: "1.5",
                }}
              >
                If you didn't request a password reset, please ignore this
                email. Your password will remain unchanged. For security
                reasons, never share this link with anyone.
              </p>
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
              Having trouble?{" "}
              <a
                href="mailto:support@justforview.in"
                style={{ color: "#ef4444", textDecoration: "none" }}
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
              This email was sent to {userEmail}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default PasswordResetEmail;
