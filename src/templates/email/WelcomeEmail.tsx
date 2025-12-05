/**
 * @fileoverview React Component
 * @module src/templates/email/WelcomeEmail
 * @description This file contains the WelcomeEmail component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Welcome Email Template
 * Task 1.5.2 - Email Templates
 */

import React from "react";

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
  /** Verification Url */
  verificationUrl?: string;
}

/**
 * Performs welcome email operation
 *
 * @param {any} {
  userName,
  userEmail,
  verificationUrl,
} - The {
  user name,
  user email,
  verification url,
}
 *
 * @returns {any} The welcomeemail result
 *
 * @example
 * WelcomeEmail({
  userName,
  userEmail,
  verificationUrl,
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
  verificationUrl,
} - The {
  user name,
  user email,
  verification url,
}
 *
 * @returns {any} The welcomeemail result
 *
 * @example
 * WelcomeEmail({
  userName,
  userEmail,
  verificationUrl,
});
 */

/**
 * W
 * @constant
 */
export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  userEmail,
  verificationUrl,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Welcome to Letitrip.in</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.logo}>Welcome to Letitrip.in! 🎉</h1>
          </div>

          <div style={styles.content}>
            <h2 style={styles.title}>Hi {userName}!</h2>

            <p style={styles.text}>
              Thank you for joining Letitrip.in - India's most trusted auction
              and e-commerce marketplace.
            </p>

            {verificationUrl && (
              <>
                <p style={styles.text}>
                  To get started, please verify your email address:
                </p>

                <div style={styles.buttonContainer}>
                  <a href={verificationUrl} style={styles.button}>
                    Verify Email
                  </a>
                </div>
              </>
            )}

            <div style={styles.featuresSection}>
              <h3 style={styles.featuresTitle}>What You Can Do:</h3>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>🛍️</div>
                <div>
                  <h4 style={styles.featureName}>Shop Products</h4>
                  <p style={styles.featureDesc}>
                    Browse thousands of products from verified sellers
                  </p>
                </div>
              </div>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>🎯</div>
                <div>
                  <h4 style={styles.featureName}>Join Auctions</h4>
                  <p style={styles.featureDesc}>
                    Bid on unique items and win great deals
                  </p>
                </div>
              </div>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>🏪</div>
                <div>
                  <h4 style={styles.featureName}>Open Your Shop</h4>
                  <p style={styles.featureDesc}>
                    Start selling and reach millions of customers
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                <strong>Your Account:</strong>
              </p>
              <p style={styles.infoText}>{userEmail}</p>
            </div>
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
    backgroundColor: "#10b981",
    /** Color */
    color: "#ffffff",
    /** Padding */
    padding: "30px 20px",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Logo */
  logo: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "28px",
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
    backgroundColor: "#10b981",
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
  /** Features Section */
  featuresSection: {
    /** Margin */
    margin: "30px 0",
  },
  /** Features Title */
  featuresTitle: {
    /** Margin */
    margin: "0 0 20px 0",
    /** Font Size */
    fontSize: "18px",
    /** Color */
    color: "#1f2937",
  },
  /** Feature */
  feature: {
    /** Display */
    display: "flex",
    /** Padding */
    padding: "15px 0",
    /** Border Bottom */
    borderBottom: "1px solid #e5e7eb",
  },
  /** Feature Icon */
  featureIcon: {
    /** Font Size */
    fontSize: "32px",
    /** Margin Right */
    marginRight: "15px",
  },
  /** Feature Name */
  featureName: {
    /** Margin */
    margin: "0 0 5px 0",
    /** Font Size */
    fontSize: "16px",
    /** Color */
    color: "#1f2937",
  },
  /** Feature Desc */
  featureDesc: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
  },
  /** Info Box */
  infoBox: {
    /** Background Color */
    backgroundColor: "#f9fafb",
    /** Padding */
    padding: "15px",
    /** Border Radius */
    borderRadius: "6px",
    /** Margin */
    margin: "20px 0",
  },
  /** Info Text */
  infoText: {
    /** Margin */
    margin: "5px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#1f2937",
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
    color: "#10b981",
    /** Text Decoration */
    textDecoration: "none",
  },
};

export default WelcomeEmail;
