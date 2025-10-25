import { NextRequest, NextResponse } from "next/server";

// Public settings data (no admin authorization required)
const publicSettings = {
  siteName: "JustForView",
  siteDescription: "Premium Beyblade marketplace with authentic products and competitive battles",
  contactEmail: "support@justforview.in",
  phoneNumber: "+1-555-0123",
  address: "123 Gaming Street, Battle City, BC 12345",
  currency: "USD",
  homePageSections: [
    {
      id: "hero",
      type: "hero",
      title: "Hero Section",
      enabled: true,
      order: 1,
      content: {
        mainBanner: {
          title: "Discover Premium Hobby Products",
          subtitle: "Your one-stop shop for authentic Beyblades, collectibles, and premium hobby items",
          shopButton: { text: "Shop Now", link: "/products" },
          auctionButton: { text: "View Auctions", link: "/auctions" }
        },
        sideBanner: {
          title: "Special Sales & Events",
          subtitle: "Don't miss out on exclusive offers",
          button: { text: "View Sale Items", link: "/products" },
          carousel: true
        }
      }
    },
    {
      id: "features",
      type: "features",
      title: "Why Choose Us",
      enabled: true,
      order: 2,
      content: {}
    },
    {
      id: "sale-carousel",
      type: "sale-carousel",
      title: "Special Offers",
      enabled: true,
      order: 3,
      content: {
        items: [
          {
            id: "sale-1",
            title: "Flash Sale",
            subtitle: "Up to 70% off on selected items",
            image: "/images/sale-1.jpg",
            button: { text: "Shop Sale", link: "/products?filter=sale" },
            sortOrder: "price_asc"
          },
          {
            id: "new-2",
            title: "New Arrivals",
            subtitle: "Latest Beyblade releases this week",
            image: "/images/new-arrivals.jpg",
            button: { text: "Shop New", link: "/products?filter=newest" },
            sortOrder: "newest"
          },
          {
            id: "popular-3",
            title: "Most Popular",
            subtitle: "Bestselling items loved by customers",
            image: "/images/popular.jpg",
            button: { text: "Shop Popular", link: "/products?filter=popular" },
            sortOrder: "popularity"
          }
        ]
      }
    },
    {
      id: "categories",
      type: "categories",
      title: "Shop by Category",
      enabled: true,
      order: 4,
      content: {
        showOnHomepage: ["beyblades", "launchers", "stadiums", "accessories", "limited-edition", "tournament"],
        categoryIcons: {
          "beyblades": "⚡",
          "launchers": "🎯",
          "stadiums": "🏟️",
          "accessories": "🔧",
          "limited-edition": "💎",
          "tournament": "🏆"
        }
      }
    },
    {
      id: "featured-products",
      type: "featured-products",
      title: "Featured Products",
      enabled: true,
      order: 5,
      content: {
        type: "most-visited", // "most-visited", "wishlisted", "newest", "admin-selected"
        limit: 6,
        displayCount: 3, // Show 3 at a time in carousel
        adminSelected: [] // Array of product IDs when type is "admin-selected"
      }
    },
    {
      id: "auctions",
      type: "auctions",
      title: "Live Auctions",
      enabled: true,
      order: 6,
      content: {
        showLive: true,
        showClosed: true,
        limit: 6,
        displayCount: 3, // Show 3 at a time
        featuredAuctions: [] // Admin selected featured auction IDs
      }
    },
    {
      id: "newsletter-reviews",
      type: "newsletter-reviews",
      title: "Stay Updated & Reviews",
      enabled: true,
      order: 7,
      content: {
        showReviews: true,
        showNewsletter: true,
        reviews: [
          {
            id: "1",
            name: "Arjun Patel",
            text: "Amazing quality Beyblades! Fast delivery and authentic products.",
            rating: 5,
            avatar: "/images/avatar-1.jpg"
          },
          {
            id: "2", 
            name: "Priya Sharma",
            text: "Great customer service and competitive prices. Highly recommended!",
            rating: 5,
            avatar: "/images/avatar-2.jpg"
          },
          {
            id: "3",
            name: "Rohan Kumar",
            text: "Best place for Beyblade enthusiasts. Genuine products guaranteed!",
            rating: 5,
            avatar: "/images/avatar-3.jpg"
          }
        ]
      }
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
