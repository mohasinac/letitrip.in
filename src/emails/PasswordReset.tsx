/**
 * Password Reset Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

export interface PasswordResetEmailProps {
  userName: string;
  userEmail: string;
  resetLink: string;
  expiresIn: number; // minutes
}

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
              borderBottom: "4px solid #ef4444",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#fee2e2",
                borderRadius: "50%",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "40px" }}>🔐</span>
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
              }}
            >
              Reset Your Password
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
              We received a request to reset the password for your
              JustForView.in account. Click the button below to create a new
              password.
            </p>

            {/* Reset Button */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <a
                href={resetLink}
                style={{
                  display: "inline-block",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                  padding: "14px 32px",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Reset Password
              </a>
            </div>

            {/* Expiry Warning */}
            <div
              style={{
                backgroundColor: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "#92400e",
                  margin: 0,
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
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginTop: 0,
                  marginBottom: "8px",
                }}
              >
                If the button doesn't work, copy and paste this link into your
                browser:
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#3b82f6",
                  wordBreak: "break-all",
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                {resetLink}
              </p>
            </div>

            {/* Security Notice */}
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#991b1b",
                  marginTop: 0,
                  marginBottom: "8px",
                }}
              >
                🛡️ Security Notice
              </h4>
              <p
                style={{
                  fontSize: "13px",
                  color: "#991b1b",
                  margin: 0,
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
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.5",
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

export default PasswordResetEmail;
