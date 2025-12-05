/**
 * @fileoverview React Component
 * @module src/templates/email/AuctionBidNotification
 * @description This file contains the AuctionBidNotification component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Auction Bid Notification Email Template
 * Task 1.5.2 - Email Templates
 */

import React from "react";

/**
 * AuctionBidNotificationProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AuctionBidNotificationProps
 */
export interface AuctionBidNotificationProps {
  /** Recipient Name */
  recipientName: string;
  /** Auction Title */
  auctionTitle: string;
  /** Auction Image */
  auctionImage?: string;
  /** Current Bid */
  currentBid: number;
  /** Your Bid */
  yourBid?: number;
  /** Bidder Name */
  bidderName?: string;
  /** Time Remaining */
  timeRemaining: string;
  /** Auction Url */
  auctionUrl: string;
  /** Notification Type */
  notificationType: "new_bid" | "outbid" | "winning" | "won" | "lost";
}

const notificationConfig = {
  new_bid: {
    /** Title */
    title: "New Bid on Your Auction",
    /** Color */
    color: "#2563eb",
    /** Icon */
    icon: "🔔",
  },
  /** Outbid */
  outbid: {
    /** Title */
    title: "You've Been Outbid!",
    /** Color */
    color: "#f59e0b",
    /** Icon */
    icon: "⚠️",
  },
  /** Winning */
  winning: {
    /** Title */
    title: "You're Winning!",
    /** Color */
    color: "#10b981",
    /** Icon */
    icon: "🏆",
  },
  /** Won */
  won: {
    /** Title */
    title: "Congratulations! You Won!",
    /** Color */
    color: "#10b981",
    /** Icon */
    icon: "🎉",
  },
  /** Lost */
  lost: {
    /** Title */
    title: "Auction Ended",
    /** Color */
    color: "#6b7280",
    /** Icon */
    icon: "📋",
  },
};

/**
 * Performs auction bid notification operation
 *
 * @returns {any} The auctionbidnotification result
 *
 * @example
 * AuctionBidNotification();
 */

/**
 * A
 * @constant
 */
/**
 * Performs auction bid notification operation
 *
 * @returns {any} The auctionbidnotification result
 *
 * @example
 * AuctionBidNotification();
 */

/**
 * A
 * @constant
 */
export const AuctionBidNotification: React.FC<AuctionBidNotificationProps> = ({
  recipientName,
  auctionTitle,
  auctionImage,
  currentBid,
  yourBid,
  bidderName,
  timeRemaining,
  auctionUrl,
  notificationType,
}) => {
  const config = notificationConfig[notificationType];

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{config.title}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.logo}>Letitrip.in</h1>
          </div>

          <div style={{ ...styles.statusBox, backgroundColor: config.color }}>
            <div style={styles.icon}>{config.icon}</div>
            <h2 style={styles.title}>{config.title}</h2>
          </div>

          <div style={styles.content}>
            <p style={styles.greeting}>Hi {recipientName},</p>

            {auctionImage && (
              <img
                src={auctionImage}
                alt={auctionTitle}
                style={styles.auctionImage}
              />
            )}

            <h3 style={styles.auctionTitle}>{auctionTitle}</h3>

            <div style={styles.bidInfo}>
              <div style={styles.bidRow}>
                <span style={styles.label}>Current Bid:</span>
                <span style={styles.value}>
                  ₹{currentBid.toLocaleString("en-IN")}
                </span>
              </div>

              {yourBid && (
                <div style={styles.bidRow}>
                  <span style={styles.label}>Your Bid:</span>
                  <span style={styles.value}>
                    ₹{yourBid.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {bidderName && (
                <div style={styles.bidRow}>
                  <span style={styles.label}>Bidder:</span>
                  <span style={styles.value}>{bidderName}</span>
                </div>
              )}

              <div style={styles.bidRow}>
                <span style={styles.label}>Time Remaining:</span>
                <span style={styles.value}>{timeRemaining}</span>
              </div>
            </div>

            {notificationType !== "won" && notificationType !== "lost" && (
              <div style={styles.buttonContainer}>
                <a href={auctionUrl} style={styles.button}>
                  {notificationType === "outbid" ? "Bid Again" : "View Auction"}
                </a>
              </div>
            )}

            {notificationType === "won" && (
              <p style={styles.message}>
                Please complete your payment within 24 hours to confirm your
                purchase.
              </p>
            )}
          </div>

          <div style={styles.footer}>
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
  /** Status Box */
  statusBox: {
    /** Padding */
    padding: "30px 20px",
    /** Text Align */
    textAlign: "center" as const,
    /** Color */
    color: "#ffffff",
  },
  /** Icon */
  icon: {
    /** Font Size */
    fontSize: "48px",
    /** Margin Bottom */
    marginBottom: "10px",
  },
  /** Title */
  title: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "24px",
  },
  /** Content */
  content: {
    /** Padding */
    padding: "20px",
  },
  /** Greeting */
  greeting: {
    /** Margin */
    margin: "0 0 20px 0",
    /** Font Size */
    fontSize: "16px",
    /** Color */
    color: "#1f2937",
  },
  /** Auction Image */
  auctionImage: {
    /** Width */
    width: "100%",
    /** Max Height */
    maxHeight: "300px",
    /** Object Fit */
    objectFit: "cover" as const,
    /** Border Radius */
    borderRadius: "8px",
    /** Margin Bottom */
    marginBottom: "15px",
  },
  /** Auction Title */
  auctionTitle: {
    /** Margin */
    margin: "0 0 20px 0",
    /** Font Size */
    fontSize: "20px",
    /** Color */
    color: "#1f2937",
  },
  /** Bid Info */
  bidInfo: {
    /** Background Color */
    backgroundColor: "#f9fafb",
    /** Padding */
    padding: "15px",
    /** Border Radius */
    borderRadius: "8px",
    /** Margin Bottom */
    marginBottom: "20px",
  },
  /** Bid Row */
  bidRow: {
    /** Display */
    display: "flex",
    /** Justify Content */
    justifyContent: "space-between",
    /** Padding */
    padding: "8px 0",
  },
  /** Label */
  label: {
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
  },
  /** Value */
  value: {
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#1f2937",
    /** Font Weight */
    fontWeight: "600" as const,
  },
  /** Button Container */
  buttonContainer: {
    /** Text Align */
    textAlign: "center" as const,
    /** Margin */
    margin: "20px 0",
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
  /** Message */
  message: {
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
    /** Text Align */
    textAlign: "center" as const,
    /** Margin */
    margin: "20px 0",
  },
  /** Footer */
  footer: {
    /** Padding */
    padding: "20px",
    /** Text Align */
    textAlign: "center" as const,
    /** Background Color */
    backgroundColor: "#f9fafb",
  },
  /** Footer Text */
  footerText: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "12px",
    /** Color */
    color: "#9ca3af",
  },
};

export default AuctionBidNotification;
