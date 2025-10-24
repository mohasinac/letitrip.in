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
