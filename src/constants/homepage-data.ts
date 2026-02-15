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
  video?: string; // Optional video URL
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
    thumbnail:
      "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&q=80",
    video:
      "https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4",
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
    thumbnail:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
    video:
      "https://videos.pexels.com/video-files/4622183/4622183-uhd_2560_1440_24fps.mp4",
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
    thumbnail:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    video:
      "https://videos.pexels.com/video-files/7579951/7579951-uhd_2560_1440_25fps.mp4",
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
    thumbnail:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
    video:
      "https://videos.pexels.com/video-files/7621129/7621129-uhd_2560_1440_30fps.mp4",
    author: "David Park",
    publishedAt: "2026-01-28",
    readTime: 4,
    category: "Community",
  },
];
