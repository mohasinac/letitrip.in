/**
 * Password Reset Email Template
 * Task 1.5.2 - Email Templates
 */

import React from "react";

export interface PasswordResetProps {
  userName: string;
  resetUrl: string;
  expiryTime: string;
}

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
  body: {
    margin: 0,
    padding: 0,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "20px",
    textAlign: "center" as const,
  },
  logo: {
    margin: 0,
    fontSize: "24px",
  },
  content: {
    padding: "40px 20px",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "24px",
    color: "#1f2937",
    textAlign: "center" as const,
  },
  text: {
    margin: "15px 0",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "30px 0",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "12px 30px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600" as const,
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    padding: "15px",
    borderRadius: "6px",
    margin: "20px 0",
  },
  warningText: {
    margin: 0,
    fontSize: "14px",
    color: "#92400e",
  },
  footer: {
    padding: "20px",
    textAlign: "center" as const,
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
  },
  footerText: {
    margin: "10px 0",
    fontSize: "12px",
    color: "#9ca3af",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default PasswordReset;
