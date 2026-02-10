/**
 * Homepage Data Constants
 *
 * Static data for homepage sections (trust indicators, features, mock blog articles).
 * These constants provide consistent data across the homepage components.
 */

export interface TrustIndicator {
  icon: string;
  title: string;
  description: string;
}

export interface SiteFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  publishedAt: string;
  readTime: number;
  category: string;
}

/**
 * Trust indicators displayed on homepage
 * Highlights key value propositions of the platform
 */
export const TRUST_INDICATORS: TrustIndicator[] = [
  {
    icon: "📦",
    title: "Wide Range",
    description: "10,000+ Products Across Categories",
  },
  {
    icon: "🚚",
    title: "Fast Shipping",
    description: "Delivery in 2-5 Business Days",
  },
  {
    icon: "✓",
    title: "Original Products",
    description: "100% Authentic & Verified",
  },
  {
    icon: "👥",
    title: "50,000+ Customers",
    description: "Trusted by Thousands Nationwide",
  },
];

/**
 * Site features highlighting key benefits
 * Used in "Why Shop With Us?" section
 */
export const SITE_FEATURES: SiteFeature[] = [
  {
    id: "secure-payment",
    icon: "🔒",
    title: "Secure Payments",
    description: "Multiple payment options with encrypted transactions",
  },
  {
    id: "easy-returns",
    icon: "↩️",
    title: "Easy Returns",
    description: "7-day hassle-free return policy on all products",
  },
  {
    id: "quality-check",
    icon: "✓",
    title: "Quality Check",
    description: "Every item verified before shipment",
  },
  {
    id: "customer-support",
    icon: "💬",
    title: "24/7 Support",
    description: "Round-the-clock customer service via chat and phone",
  },
  {
    id: "seller-protection",
    icon: "🛡️",
    title: "Seller Protection",
    description: "Safe and secure platform for sellers to grow business",
  },
  {
    id: "buyer-guarantee",
    icon: "⭐",
    title: "Buyer Guarantee",
    description: "Money-back guarantee if item not as described",
  },
];

/**
 * Mock blog articles for homepage display
 * TODO: Replace with actual API call when blog feature is implemented
 */
export const MOCK_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "1",
    title: "10 Tips for Finding Rare Collectibles",
    slug: "tips-finding-rare-collectibles",
    excerpt:
      "Discover expert strategies to spot and acquire hard-to-find items at great prices.",
    thumbnail: "/images/blog/collectibles.jpg",
    author: "Sarah Johnson",
    publishedAt: "2026-02-05",
    readTime: 5,
    category: "Collecting",
  },
  {
    id: "2",
    title: "How to Authenticate Original Products",
    slug: "authenticate-original-products",
    excerpt:
      "Learn the key signs to verify authenticity before making a purchase.",
    thumbnail: "/images/blog/authentication.jpg",
    author: "Mike Chen",
    publishedAt: "2026-02-03",
    readTime: 7,
    category: "Guides",
  },
  {
    id: "3",
    title: "Auction Strategies That Actually Work",
    slug: "auction-strategies-that-work",
    excerpt:
      "Master the art of winning auctions without overspending on your budget.",
    thumbnail: "/images/blog/auctions.jpg",
    author: "Emily Rodriguez",
    publishedAt: "2026-02-01",
    readTime: 6,
    category: "Auctions",
  },
  {
    id: "4",
    title: "Seller Spotlight: Success Stories",
    slug: "seller-success-stories",
    excerpt:
      "Meet sellers who turned their passion into thriving businesses on our platform.",
    thumbnail: "/images/blog/sellers.jpg",
    author: "David Park",
    publishedAt: "2026-01-28",
    readTime: 4,
    category: "Community",
  },
];
