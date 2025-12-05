/**
 * Newsletter Email Template
 * Task 1.5.2 - Email Templates
 */

import React from "react";

export interface NewsletterProps {
  recipientName: string;
  subject: string;
  featuredProducts?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    url: string;
  }>;
  featuredAuctions?: Array<{
    id: string;
    title: string;
    currentBid: number;
    image: string;
    url: string;
    endTime: string;
  }>;
  announcements?: Array<{
    title: string;
    description: string;
    link?: string;
  }>;
  unsubscribeUrl: string;
}

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
    padding: "30px 20px",
    textAlign: "center" as const,
  },
  logo: {
    margin: 0,
    fontSize: "28px",
  },
  tagline: {
    margin: "5px 0 0 0",
    fontSize: "14px",
    opacity: 0.9,
  },
  content: {
    padding: "20px",
  },
  greeting: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    color: "#1f2937",
  },
  subtitle: {
    margin: "0 0 30px 0",
    fontSize: "24px",
    color: "#1f2937",
    textAlign: "center" as const,
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    margin: "0 0 15px 0",
    fontSize: "20px",
    color: "#1f2937",
  },
  announcement: {
    padding: "15px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  announcementTitle: {
    margin: "0 0 10px 0",
    fontSize: "16px",
    color: "#1f2937",
  },
  announcementText: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },
  productCard: {
    textDecoration: "none",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "10px",
    textAlign: "center" as const,
  },
  productImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover" as const,
    borderRadius: "6px",
    marginBottom: "10px",
  },
  productName: {
    margin: "0 0 5px 0",
    fontSize: "14px",
    color: "#1f2937",
  },
  productPrice: {
    margin: 0,
    fontSize: "16px",
    color: "#2563eb",
    fontWeight: "bold" as const,
  },
  auctionCard: {
    display: "flex",
    textDecoration: "none",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
  },
  auctionImage: {
    width: "100px",
    height: "100px",
    objectFit: "cover" as const,
    borderRadius: "6px",
    marginRight: "15px",
  },
  auctionDetails: {
    flex: 1,
  },
  auctionTitle: {
    margin: "0 0 10px 0",
    fontSize: "16px",
    color: "#1f2937",
  },
  auctionBid: {
    margin: "5px 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  auctionTime: {
    margin: "5px 0",
    fontSize: "12px",
    color: "#f59e0b",
  },
  ctaSection: {
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
  link: {
    color: "#2563eb",
    textDecoration: "none",
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
};

export default Newsletter;
