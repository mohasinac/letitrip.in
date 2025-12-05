/**
 * Auction Bid Notification Email Template
 * Task 1.5.2 - Email Templates
 */

import React from "react";

export interface AuctionBidNotificationProps {
  recipientName: string;
  auctionTitle: string;
  auctionImage?: string;
  currentBid: number;
  yourBid?: number;
  bidderName?: string;
  timeRemaining: string;
  auctionUrl: string;
  notificationType: "new_bid" | "outbid" | "winning" | "won" | "lost";
}

const notificationConfig = {
  new_bid: {
    title: "New Bid on Your Auction",
    color: "#2563eb",
    icon: "🔔",
  },
  outbid: {
    title: "You've Been Outbid!",
    color: "#f59e0b",
    icon: "⚠️",
  },
  winning: {
    title: "You're Winning!",
    color: "#10b981",
    icon: "🏆",
  },
  won: {
    title: "Congratulations! You Won!",
    color: "#10b981",
    icon: "🎉",
  },
  lost: {
    title: "Auction Ended",
    color: "#6b7280",
    icon: "📋",
  },
};

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
  statusBox: {
    padding: "30px 20px",
    textAlign: "center" as const,
    color: "#ffffff",
  },
  icon: {
    fontSize: "48px",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
  },
  content: {
    padding: "20px",
  },
  greeting: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    color: "#1f2937",
  },
  auctionImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover" as const,
    borderRadius: "8px",
    marginBottom: "15px",
  },
  auctionTitle: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    color: "#1f2937",
  },
  bidInfo: {
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  bidRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
  },
  label: {
    fontSize: "14px",
    color: "#6b7280",
  },
  value: {
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "600" as const,
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "20px 0",
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
  message: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center" as const,
    margin: "20px 0",
  },
  footer: {
    padding: "20px",
    textAlign: "center" as const,
    backgroundColor: "#f9fafb",
  },
  footerText: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af",
  },
};

export default AuctionBidNotification;
