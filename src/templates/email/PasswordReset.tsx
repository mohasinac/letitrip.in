/**
 * @fileoverview React Component
 * @module src/templates/email/PasswordReset
 * @description This file contains the PasswordReset component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Password Reset Email Template
 * Task 1.5.2 - Email Templates
 */

import React from "react";

/**
 * PasswordResetProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PasswordResetProps
 */
export interface PasswordResetProps {
  /** User Name */
  userName: string;
  /** Reset Url */
  resetUrl: string;
  /** Expiry Time */
  expiryTime: string;
}

/**
 * Performs password reset operation
 *
 * @param {any} {
  userName,
  resetUrl,
  expiryTime,
} - The {
  user name,
  reset url,
  expiry time,
}
 *
 * @returns {any} The passwordreset result
 *
 * @example
 * PasswordReset({
  userName,
  resetUrl,
  expiryTime,
});
 */

/**
 * P
 * @constant
 */
/**
 * Performs password reset operation
 *
 * @param {any} {
  userName,
  resetUrl,
  expiryTime,
} - The {
  user name,
  reset url,
  expiry time,
}
 *
 * @returns {any} The passwordreset result
 *
 * @example
 * PasswordReset({
  userName,
  resetUrl,
  expiryTime,
});
 */

/**
 * P
 * @constant
 */
export const PasswordReset: React.FC<PasswordResetProps> = ({
  userName,
  resetUrl,
  expiryTime,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Reset Your Password</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.logo}>Letitrip.in</h1>
          </div>

          <div style={styles.content}>
            <h2 style={styles.title}>Reset Your Password</h2>

            <p style={styles.text}>Hi {userName},</p>

            <p style={styles.text}>
              We received a request to reset your password. Click the button
              below to create a new password:
            </p>

            <div style={styles.buttonContainer}>
              <a href={resetUrl} style={styles.button}>
                Reset Password
              </a>
            </div>

            <p style={styles.text}>
              This link will expire in <strong>{expiryTime}</strong>.
            </p>

            <div style={styles.warningBox}>
              <p style={styles.warningText}>
                <strong>Security Note:</strong> If you didn't request this
                password reset, please ignore this email. Your password will
                remain unchanged.
              </p>
            </div>

            <p style={styles.text}>
              For security reasons, this link can only be used once.
            </p>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Need help? Contact us at{" "}
              <a href="mailto:support@letitrip.in" style={styles.link}>
                support@letitrip.in
              </a>
            </p>
            <p style={styles.footerText}>
              © {new Date().getFullYear()} Letitrip.in
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
    fontFamily: "Arial, sans-serif",
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
  },
  /** Content */
  content: {
    /** Padding */
    padding: "40px 20px",
  },
  /** Title */
  title: {
    /** Margin */
    margin: "0 0 20px 0",
    /** Font Size */
    fontSize: "24px",
    /** Color */
    color: "#1f2937",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Text */
  text: {
    /** Margin */
    margin: "15px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
    /** Line Height */
    lineHeight: "1.6",
  },
  /** Button Container */
  buttonContainer: {
    /** Text Align */
    textAlign: "center" as const,
    /** Margin */
    margin: "30px 0",
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
    fontWeight: "600" as const,
  },
  /** Warning Box */
  warningBox: {
    /** Background Color */
    backgroundColor: "#fef3c7",
    /** Border */
    border: "1px solid #f59e0b",
    /** Padding */
    padding: "15px",
    /** Border Radius */
    borderRadius: "6px",
    /** Margin */
    margin: "20px 0",
  },
  /** Warning Text */
  warningText: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#92400e",
  },
  /** Footer */
  footer: {
    /** Padding */
    padding: "20px",
    /** Text Align */
    textAlign: "center" as const,
    /** Background Color */
    backgroundColor: "#f9fafb",
    /** Border Top */
    borderTop: "1px solid #e5e7eb",
  },
  /** Footer Text */
  footerText: {
    /** Margin */
    margin: "10px 0",
    /** Font Size */
    fontSize: "12px",
    /** Color */
    color: "#9ca3af",
  },
  /** Link */
  link: {
    /** Color */
    color: "#2563eb",
    /** Text Decoration */
    textDecoration: "none",
  },
};

export default PasswordReset;
