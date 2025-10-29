/**
 * Homepage Content Constants
 * Centralized content definitions for homepage sections
 */

export interface HeroBanner {
  title: string;
  subtitle: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
  overlayOpacity?: number;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
  href?: string;
}

export interface ContactInfo {
  title: string;
  description: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  businessHours: {
    weekdays: string;
    weekends: string;
  };
}

// Hero Banner Section
export const HERO_BANNER: HeroBanner = {
  title: "Discover Amazing Products & Auctions",
  subtitle: "Your Gateway to Unique Collections",
  description: "Find rare items, participate in live auctions, and connect with sellers from around the world. From vintage collectibles to modern treasures.",
  primaryButton: {
    text: "Browse Products",
    href: "/products"
  },
  secondaryButton: {
    text: "Live Auctions",
    href: "/auctions"
  },
  backgroundImage: "/images/hero-bg.jpg",
  overlayOpacity: 0.6
};

// Website Features (Hard-coded as requested)
export const WEBSITE_FEATURES: Feature[] = [
  {
    icon: "🏆",
    title: "Authentic Products",
    description: "All items are verified authentic with detailed condition reports and provenance documentation."
  },
  {
    icon: "⚡",
    title: "Live Auctions",
    description: "Participate in real-time bidding on rare and unique items from trusted sellers worldwide."
  },
  {
    icon: "🌍",
    title: "Global Marketplace",
    description: "Connect with collectors and sellers from around the world in our international marketplace."
  },
  {
    icon: "🔒",
    title: "Secure Transactions",
    description: "Protected payments, escrow services, and buyer protection for worry-free transactions."
  },
  {
    icon: "🚚",
    title: "Fast Shipping",
    description: "Quick and reliable shipping with tracking, insurance, and careful packaging for all orders."
  },
  {
    icon: "💬",
    title: "Expert Support",
    description: "Get help from our knowledgeable team and connect with expert collectors in our community."
  }
];

// Contact Information
export const CONTACT_INFO: ContactInfo = {
  title: "Get in Touch",
  description: "Have questions about products, auctions, or need help with your order? We're here to help!",
  email: "support@justforview.in",
  phone: "+91 98765 43210",
  address: {
    street: "123 Marketplace Avenue",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400001",
    country: "India"
  },
  businessHours: {
    weekdays: "Monday - Friday: 9:00 AM - 7:00 PM IST",
    weekends: "Saturday - Sunday: 10:00 AM - 5:00 PM IST"
  }
};

// Meta Information
export const HOMEPAGE_META = {
  title: "JustForView - Discover Amazing Products & Auctions",
  description: "Find rare items, participate in live auctions, and connect with sellers worldwide. Your gateway to unique collections and authentic products.",
  keywords: ["marketplace", "auctions", "collectibles", "authentic products", "online shopping", "rare items"],
  ogImage: "/images/og-homepage.jpg"
};

export default {
  HERO_BANNER,
  WEBSITE_FEATURES,
  CONTACT_INFO,
  HOMEPAGE_META
};
