import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

const HOMEPAGE_SETTINGS_DOC = "homepage_config";
const SETTINGS_COLLECTION = "site_settings";

interface HomepageSettings {
  specialEventBanner: {
    enabled: boolean;
    title: string;
    content: string; // Rich text HTML
    link?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  heroCarousel: {
    enabled: boolean;
    autoPlayInterval: number; // milliseconds
  };
  sections: {
    valueProposition: {
      enabled: boolean;
    };
    featuredCategories: {
      enabled: boolean;
      maxCategories: number;
      productsPerCategory: number;
    };
    featuredProducts: {
      enabled: boolean;
      maxProducts: number;
    };
    featuredAuctions: {
      enabled: boolean;
      maxAuctions: number;
    };
    featuredShops: {
      enabled: boolean;
      maxShops: number;
      productsPerShop: number;
    };
    featuredBlogs: {
      enabled: boolean;
      maxBlogs: number;
    };
    featuredReviews: {
      enabled: boolean;
      maxReviews: number;
    };
  };
  sectionOrder: string[]; // Array of section IDs in display order
  updatedAt: string;
  updatedBy?: string;
}

const DEFAULT_SETTINGS: HomepageSettings = {
  specialEventBanner: {
    enabled: true,
    title: "Special Event",
    content:
      "<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>",
    link: "/special-offers",
    backgroundColor: "#2563eb",
    textColor: "#ffffff",
  },
  heroCarousel: {
    enabled: true,
    autoPlayInterval: 5000,
  },
  sections: {
    valueProposition: {
      enabled: true,
    },
    featuredCategories: {
      enabled: true,
      maxCategories: 5,
      productsPerCategory: 10,
    },
    featuredProducts: {
      enabled: true,
      maxProducts: 10,
    },
    featuredAuctions: {
      enabled: true,
      maxAuctions: 10,
    },
    featuredShops: {
      enabled: true,
      maxShops: 5,
      productsPerShop: 10,
    },
    featuredBlogs: {
      enabled: true,
      maxBlogs: 10,
    },
    featuredReviews: {
      enabled: true,
      maxReviews: 10,
    },
  },
  sectionOrder: [
    "hero-section",
    "value-proposition",
    "featured-categories-icons",
    "featured-categories",
    "featured-products",
    "featured-auctions",
    "shops-nav",
    "featured-shops",
    "featured-blogs",
    "featured-reviews",
    "faq-section",
  ],
  updatedAt: new Date().toISOString(),
};

// GET /api/admin/homepage - Get homepage configuration
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();

    const doc = await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .get();

    if (!doc.exists) {
      // Return default settings if not configured yet
      return NextResponse.json({
        settings: DEFAULT_SETTINGS,
        isDefault: true,
      });
    }

    const data = doc.data();

    // Ensure specialEventBanner exists for backward compatibility
    const settings: HomepageSettings = {
      ...DEFAULT_SETTINGS,
      ...data,
      specialEventBanner: {
        ...DEFAULT_SETTINGS.specialEventBanner,
        ...(data?.specialEventBanner || {}),
      },
    } as HomepageSettings;

    return NextResponse.json({
      settings,
      isDefault: false,
    });
  } catch (error) {
    console.error("Error fetching homepage settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage settings" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/homepage - Update homepage configuration
export async function PATCH(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();

    // Validate the structure
    if (!body.settings) {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 },
      );
    }

    const settings: HomepageSettings = {
      ...body.settings,
      updatedAt: new Date().toISOString(),
      updatedBy: body.userId || "admin",
    };

    // Update or create the settings document
    await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .set(settings, { merge: true });

    return NextResponse.json({
      message: "Homepage settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Error updating homepage settings:", error);
    return NextResponse.json(
      { error: "Failed to update homepage settings" },
      { status: 500 },
    );
  }
}
