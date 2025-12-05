/**
 * @fileoverview React Component
 * @module src/templates/email/Newsletter
 * @description This file contains the Newsletter component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Newsletter Email Template
 * Task 1.5.2 - Email Templates
 */

import React from "react";

/**
 * NewsletterProps interface
 * 
 * @interface
 * @description Defines the structure and contract for NewsletterProps
 */
export interface NewsletterProps {
  /** Recipient Name */
  recipientName: string;
  /** Subject */
  subject: string;
  /** Featured Products */
  featuredProducts?: Array<{
    /** Id */
    id: string;
    /** Name */
    name: string;
    /** Price */
    price: number;
    /** Image */
    image: string;
    /** Url */
    url: string;
  }>;
  /** Featured Auctions */
  featuredAuctions?: Array<{
    /** Id */
    id: string;
    /** Title */
    title: string;
    /** Current Bid */
    currentBid: number;
    /** Image */
    image: string;
    /** Url */
    url: string;
    /** End Time */
    endTime: string;
  }>;
  /** Announcements */
  announcements?: Array<{
    /** Title */
    title: string;
    /** Description */
    description: string;
    /** Link */
    link?: string;
  }>;
  /** Unsubscribe Url */
  unsubscribeUrl: string;
}

/**
 * Performs newsletter operation
 *
 * @returns {any} The newsletter result
 *
 * @example
 * Newsletter();
 */

/**
 * N
 * @constant
 */
/**
 * Performs newsletter operation
 *
 * @returns {any} The newsletter result
 *
 * @example
 * Newsletter();
 */

/**
 * N
 * @constant
 */
export const Newsletter: React.FC<NewsletterProps> = ({
  recipientName,
  subject,
  featuredProducts,
  featuredAuctions,
  announcements,
  unsubscribeUrl,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{subject}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.logo}>Letitrip.in</h1>
            <p style={styles.tagline}>Your Trusted Marketplace</p>
          </div>

          <div style={styles.content}>
            <p style={styles.greeting}>Hi {recipientName},</p>

            <h2 style={styles.subtitle}>{subject}</h2>

            {announcements && announcements.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📢 Latest News</h3>
                {announcements.map((announcement, index) => (
                  <div key={index} style={styles.announcement}>
                    <h4 style={styles.announcementTitle}>
                      {announcement.title}
                    </h4>
                    <p style={styles.announcementText}>
                      {announcement.description}
                    </p>
                    {announcement.link && (
                      <a href={announcement.link} style={styles.link}>
                        Read More →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {featuredProducts && featuredProducts.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🛍️ Featured Products</h3>
                <div style={styles.productGrid}>
                  {featuredProducts.map((product) => (
                    <a
                      key={product.id}
                      href={product.url}
                      style={styles.productCard}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={styles.productImage}
                      />
                      <h4 style={styles.productName}>{product.name}</h4>
                      <p style={styles.productPrice}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {featuredAuctions && featuredAuctions.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🎯 Hot Auctions</h3>
                {featuredAuctions.map((auction) => (
                  <a
                    key={auction.id}
                    href={auction.url}
                    style={styles.auctionCard}
                  >
                    <img
                      src={auction.image}
                      alt={auction.title}
                      style={styles.auctionImage}
                    />
                    <div style={styles.auctionDetails}>
                      <h4 style={styles.auctionTitle}>{auction.title}</h4>
                      <p style={styles.auctionBid}>
                        Current Bid:{" "}
                        <strong>
                          ₹{auction.currentBid.toLocaleString("en-IN")}
                        </strong>
                      </p>
                      <p style={styles.auctionTime}>Ends: {auction.endTime}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div style={styles.ctaSection}>
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL}/products`}
                style={styles.button}
              >
                Browse All Products
              </a>
            </div>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              You're receiving this because you subscribed to Letitrip.in
              newsletters.
            </p>
            <p style={styles.footerText}>
              <a href={unsubscribeUrl} style={styles.link}>
                Unsubscribe
              </a>{" "}
              |{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL}/settings`}
                style={styles.link}
              >
                Manage Preferences
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
  /** Tagline */
  tagline: {
    /** Margin */
    margin: "5px 0 0 0",
    /** Font Size */
    fontSize: "14px",
    /** Opacity */
    opacity: 0.9,
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
  /** Subtitle */
  subtitle: {
    /** Margin */
    margin: "0 0 30px 0",
    /** Font Size */
    fontSize: "24px",
    /** Color */
    color: "#1f2937",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Section */
  section: {
    /** Margin Bottom */
    marginBottom: "30px",
  },
  /** Section Title */
  sectionTitle: {
    /** Margin */
    margin: "0 0 15px 0",
    /** Font Size */
    fontSize: "20px",
    /** Color */
    color: "#1f2937",
  },
  /** Announcement */
  announcement: {
    /** Padding */
    padding: "15px",
    /** Background Color */
    backgroundColor: "#f9fafb",
    /** Border Radius */
    borderRadius: "8px",
    /** Margin Bottom */
    marginBottom: "15px",
  },
  /** Announcement Title */
  announcementTitle: {
    /** Margin */
    margin: "0 0 10px 0",
    /** Font Size */
    fontSize: "16px",
    /** Color */
    color: "#1f2937",
  },
  /** Announcement Text */
  announcementText: {
    /** Margin */
    margin: "0 0 10px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
    /** Line Height */
    lineHeight: "1.6",
  },
  /** Product Grid */
  productGrid: {
    /** Display */
    display: "grid",
    /** Grid Template Columns */
    gridTemplateColumns: "repeat(2, 1fr)",
    /** Gap */
    gap: "15px",
  },
  /** Product Card */
  productCard: {
    /** Text Decoration */
    textDecoration: "none",
    /** Border */
    border: "1px solid #e5e7eb",
    /** Border Radius */
    borderRadius: "8px",
    /** Padding */
    padding: "10px",
    /** Text Align */
    textAlign: "center" as const,
  },
  /** Product Image */
  productImage: {
    /** Width */
    width: "100%",
    /** Height */
    height: "150px",
    /** Object Fit */
    objectFit: "cover" as const,
    /** Border Radius */
    borderRadius: "6px",
    /** Margin Bottom */
    marginBottom: "10px",
  },
  /** Product Name */
  productName: {
    /** Margin */
    margin: "0 0 5px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#1f2937",
  },
  /** Product Price */
  productPrice: {
    /** Margin */
    margin: 0,
    /** Font Size */
    fontSize: "16px",
    /** Color */
    color: "#2563eb",
    /** Font Weight */
    fontWeight: "bold" as const,
  },
  /** Auction Card */
  auctionCard: {
    /** Display */
    display: "flex",
    /** Text Decoration */
    textDecoration: "none",
    /** Border */
    border: "1px solid #e5e7eb",
    /** Border Radius */
    borderRadius: "8px",
    /** Padding */
    padding: "15px",
    /** Margin Bottom */
    marginBottom: "15px",
  },
  /** Auction Image */
  auctionImage: {
    /** Width */
    width: "100px",
    /** Height */
    height: "100px",
    /** Object Fit */
    objectFit: "cover" as const,
    /** Border Radius */
    borderRadius: "6px",
    /** Margin Right */
    marginRight: "15px",
  },
  /** Auction Details */
  auctionDetails: {
    /** Flex */
    flex: 1,
  },
  /** Auction Title */
  auctionTitle: {
    /** Margin */
    margin: "0 0 10px 0",
    /** Font Size */
    fontSize: "16px",
    /** Color */
    color: "#1f2937",
  },
  /** Auction Bid */
  auctionBid: {
    /** Margin */
    margin: "5px 0",
    /** Font Size */
    fontSize: "14px",
    /** Color */
    color: "#6b7280",
  },
  /** Auction Time */
  auctionTime: {
    /** Margin */
    margin: "5px 0",
    /** Font Size */
    fontSize: "12px",
    /** Color */
    color: "#f59e0b",
  },
  /** Cta Section */
  ctaSection: {
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
  /** Link */
  link: {
    /** Color */
    color: "#2563eb",
    /** Text Decoration */
    textDecoration: "none",
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
};

export default Newsletter;
