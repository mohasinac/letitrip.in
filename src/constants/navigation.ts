/**
 * Navigation Constants for JustForView Application
 * Centralized navigation menu definitions
 */

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  isExternal?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string; // Icon name or component
}

// Main Navigation Menu
export const MAIN_NAVIGATION: NavItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Return to homepage"
  },
  {
    label: "Products",
    href: "/products",
    description: "Browse our product catalog"
  },
 {
    label: "Auctions",
    href: "/auctions",
    description: "Browse live and upcoming auctions"
  },
   {
    label: "Games",
    href: "/game",
    description: "Play Beyblade games and demos"
  },

 

 
];

// Footer Navigation Sections
export const FOOTER_NAVIGATION = {
  categories: {
    title: "Categories",
    links: [
      { label: "Electronics", href: "/categories/electronics" },
      { label: "Home & Garden", href: "/categories/home-garden" },
      { label: "Fashion", href: "/categories/fashion" },
      { label: "Sports & Outdoors", href: "/categories/sports" },
      { label: "Collectibles", href: "/categories/collectibles" }
    ]
  },
  shopping: {
    title: "Shopping",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Live Auctions", href: "/auctions" },
      { label: "Featured Stores", href: "/stores" },
      { label: "New Arrivals", href: "/products/new" },
      { label: "Best Sellers", href: "/products/bestsellers" }
    ]
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "FAQ", href: "/faq" }
    ]
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Return Policy", href: "/returns" }
    ]
  }
};

// Social Media Links
export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "Facebook",
    url: "https://facebook.com/justforview",
    icon: "facebook"
  },
  {
    platform: "Twitter",
    url: "https://twitter.com/justforview",
    icon: "twitter"
  },
  {
    platform: "Instagram",
    url: "https://instagram.com/justforview",
    icon: "instagram"
  },
  {
    platform: "LinkedIn",
    url: "https://linkedin.com/company/justforview",
    icon: "linkedin"
  }
];

// Sitemap Structure
export const SITEMAP = {
  public: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Help", href: "/help" },
    { label: "FAQ", href: "/faq" }
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" }
  ],
  auth: [
    { label: "Sign In", href: "/auth/login" },
    { label: "Sign Up", href: "/auth/register" }
  ]
};

export default {
  MAIN_NAVIGATION,
  FOOTER_NAVIGATION,
  SOCIAL_LINKS,
  SITEMAP
};
