/**
 * Welcome Email Template
 * Task 1.5.2 - Email Templates
 */

import React from "react";

export interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  verificationUrl?: string;
}

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
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: "30px 20px",
    textAlign: "center" as const,
  },
  logo: {
    margin: 0,
    fontSize: "28px",
  },
  content: {
    padding: "40px 20px",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "24px",
    color: "#1f2937",
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
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: "12px 30px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600" as const,
  },
  featuresSection: {
    margin: "30px 0",
  },
  featuresTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    color: "#1f2937",
  },
  feature: {
    display: "flex",
    padding: "15px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  featureIcon: {
    fontSize: "32px",
    marginRight: "15px",
  },
  featureName: {
    margin: "0 0 5px 0",
    fontSize: "16px",
    color: "#1f2937",
  },
  featureDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "6px",
    margin: "20px 0",
  },
  infoText: {
    margin: "5px 0",
    fontSize: "14px",
    color: "#1f2937",
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
    color: "#10b981",
    textDecoration: "none",
  },
};

export default WelcomeEmail;
