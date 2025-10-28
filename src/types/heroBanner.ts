// Hero Banner Slide Configuration
export interface HeroBannerSlide {
  id: string;
  title: string; // Display in generation selector
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundColor?: string; // Fallback color
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    textPrimary: string;
    textSecondary: string;
    overlay: string;
    cardBackground: string;
    borderColor: string;
  };
  featuredProductIds: string[]; // Min 3 required
  seoMeta?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeroBannerProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: "Popular" | "New"; // Removed "Sale"
  badgeColor?: "warning" | "success";
}

export const DEFAULT_HERO_SLIDES: HeroBannerSlide[] = [
  {
    id: "classic-plastic",
    title: "Classic Plastic Generation",
    description: "Discover the original Beyblades that started the legend",
    backgroundImage:
      "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=1920&q=80",
    backgroundColor: "#1a1a1a",
    theme: {
      primary: "#4A90E2",
      secondary: "#7BB3F0",
      accent: "#2E5BBA",
      gradient: "linear-gradient(135deg, #4A90E2 0%, #7BB3F0 100%)",
      textPrimary: "#FFFFFF",
      textSecondary: "#E3F2FD",
      overlay: "rgba(74, 144, 226, 0.15)",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      borderColor: "rgba(74, 144, 226, 0.3)",
    },
    featuredProductIds: ["dragoon-gt", "valkyrie-x", "spriggan-burst"],
    seoMeta: {
      metaTitle: "Classic Plastic Beyblades - Original Legend Collection",
      metaDescription:
        "Discover authentic classic plastic Beyblades from the original generation",
      metaKeywords: ["Beyblade", "Classic", "Plastic", "Original", "Beyblades"],
      ogTitle: "Classic Plastic Beyblades Collection",
      ogDescription: "Authentic Beyblades from the original generation",
    },
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
