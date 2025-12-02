import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  requireRole,
  getUserFromRequest,
} from "@/app/api/middleware/rbac-auth";

const HOMEPAGE_SETTINGS_DOC = "homepage_config";
const SETTINGS_COLLECTION = "site_settings";

interface FeaturedItem {
  id: string;
  type: "product" | "auction" | "shop" | "category";
  itemId: string;
  name: string;
  image?: string;
  position: number;
  section: string;
  active: boolean;
  createdAt: string;
}

interface HomepageSettings {
  specialEventBanner: {
    enabled: boolean;
    title: string;
    content: string;
    link?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  heroCarousel: {
    enabled: boolean;
    autoPlayInterval: number;
  };
  sections: {
    valueProposition: { enabled: boolean };
    featuredCategories: {
      enabled: boolean;
      maxCategories: number;
      productsPerCategory: number;
    };
    featuredProducts: { enabled: boolean; maxProducts: number };
    featuredAuctions: { enabled: boolean; maxAuctions: number };
    featuredShops: {
      enabled: boolean;
      maxShops: number;
      productsPerShop: number;
    };
    featuredBlogs: { enabled: boolean; maxBlogs: number };
    featuredReviews: { enabled: boolean; maxReviews: number };
  };
  sectionOrder: string[];
  featuredItems?: Record<string, FeaturedItem[]>;
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
    valueProposition: { enabled: true },
    featuredCategories: {
      enabled: true,
      maxCategories: 5,
      productsPerCategory: 10,
    },
    featuredProducts: { enabled: true, maxProducts: 10 },
    featuredAuctions: { enabled: true, maxAuctions: 10 },
    featuredShops: {
      enabled: true,
      maxShops: 5,
      productsPerShop: 10,
    },
    featuredBlogs: { enabled: true, maxBlogs: 10 },
    featuredReviews: { enabled: true, maxReviews: 10 },
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

/**
 * GET /api/homepage
 * Get homepage configuration
 * - Public: Can view settings
 * - Admin: Can view all settings
 */
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();

    const doc = await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .get();

    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_SETTINGS,
        isDefault: true,
      });
    }

    const data = doc.data();

    const settings: HomepageSettings = {
      ...DEFAULT_SETTINGS,
      ...data,
      specialEventBanner: {
        ...DEFAULT_SETTINGS.specialEventBanner,
        ...(data?.specialEventBanner || {}),
      },
      sections: {
        ...DEFAULT_SETTINGS.sections,
        ...(data?.sections || {}),
      },
      featuredItems: data?.featuredItems || {},
    } as HomepageSettings;

    return NextResponse.json({
      success: true,
      data: settings,
      isDefault: false,
    });
  } catch (error) {
    console.error("Error fetching homepage settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage settings" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/homepage
 * Update homepage configuration (admin only)
 */
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ["admin"]);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const db = getFirestoreAdmin();
    const body = await req.json();

    if (!body.settings && !body.data) {
      return NextResponse.json(
        { success: false, error: "Settings object is required" },
        { status: 400 },
      );
    }

    const settingsData = body.settings || body.data;

    const settings: HomepageSettings = {
      ...settingsData,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    };

    await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .set(settings, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Homepage settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating homepage settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update homepage settings" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/homepage/reset
 * Reset homepage configuration to defaults (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ["admin"]);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const db = getFirestoreAdmin();

    const settings: HomepageSettings = {
      ...DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    };

    await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .set(settings);

    return NextResponse.json({
      success: true,
      message: "Homepage settings reset to defaults",
      data: settings,
    });
  } catch (error) {
    console.error("Error resetting homepage settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset homepage settings" },
      { status: 500 },
    );
  }
}
