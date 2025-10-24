import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";

// Mock settings data
const mockSettings = {
  siteName: "JustForView",
  siteDescription: "Premium Beyblade marketplace with authentic products and competitive battles",
  contactEmail: "support@justforview.in",
  phoneNumber: "+1-555-0123",
  address: "123 Gaming Street, Battle City, BC 12345",
  isLive: true,
  maintenanceMessage: "We're currently performing scheduled maintenance. Please check back soon!",
  currency: "USD",
  taxRate: 8.5,
  shippingCost: 9.99,
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
          subtitle: "Don't miss out on exclusive deals",
          button: { text: "View Sale Items", link: "/deals" },
          carousel: true
        }
      }
    },
    {
      id: "features",
      type: "features",
      title: "Features Section",
      enabled: true,
      order: 2,
      content: {}
    },
    {
      id: "categories",
      type: "categories",
      title: "Shop by Category",
      enabled: true,
      order: 3,
      content: {
        showOnHomepage: ["beyblades", "launchers", "stadiums", "accessories"]
      }
    },
    {
      id: "featured-products",
      type: "featured-products",
      title: "Featured Products",
      enabled: true,
      order: 4,
      content: {
        type: "most-visited", // "most-visited", "wishlisted", "newest"
        limit: 8
      }
    },
    {
      id: "auctions",
      type: "auctions",
      title: "Live Auctions",
      enabled: true,
      order: 5,
      content: {
        showLive: true,
        showClosed: true,
        limit: 3
      }
    },
    {
      id: "newsletter",
      type: "newsletter",
      title: "Newsletter Subscription",
      enabled: true,
      order: 6,
      content: {}
    }
  ],
  heroImages: [
    "/images/hero-banner-1.jpg",
    "/images/hero-banner-2.jpg"
  ],
  policies: {
    privacy: "Privacy policy content...",
    terms: "Terms of service content...",
    returnPolicy: "Return policy content...",
    shippingPolicy: "Shipping policy content...",
  },
  paymentSettings: {
    stripeEnabled: true,
    paypalEnabled: true,
    codEnabled: true,
    stripePublicKey: "pk_test_...",
    paypalClientId: "client_id_...",
  },
  firebaseConfig: {
    projectId: "justforview-project",
    storageBucket: "justforview-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
  },
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(mockSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await request.json();
    
    // In production, save settings to database
    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
