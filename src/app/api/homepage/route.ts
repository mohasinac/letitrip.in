/**
 * @fileoverview TypeScript Module
 * @module src/app/api/homepage/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  requireRole,
  getUserFromRequest,
} from "@/app/api/middleware/rbac-auth";

/**
 * HOMEPAGE_SETTINGS_DOC constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for homepage settings doc
 */
const HOMEPAGE_SETTINGS_DOC = "homepage_config";
const SETTINGS_COLLECTION = "site_settings";

/**
 * FeaturedItem interface
 * 
 * @interface
 * @description Defines the structure and contract for FeaturedItem
 */
interface FeaturedItem {
  /** Id */
  id: string;
  /** Type */
  type: "product" | "auction" | "shop" | "category";
  /** Item Id */
  itemId: string;
  /** Name */
  name: string;
  /** Image */
  image?: string;
  /** Position */
  position: number;
  /** Section */
  section: string;
  /** Active */
  active: boolean;
  /** Created At */
  createdAt: string;
}

/**
 * HomepageSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for HomepageSettings
 */
interface HomepageSettings {
  /** Special Event Banner */
  specialEventBanner: {
    /** Enabled */
    enabled: boolean;
    /** Title */
    title: string;
    /** Content */
    content: string;
    /** Link */
    link?: string;
    /** Background Color */
    backgroundColor?: string;
    /** Text Color */
    textColor?: string;
  };
  /** Hero Carousel */
  heroCarousel: {
    /** Enabled */
    enabled: boolean;
    /** Auto Play Interval */
    autoPlayInterval: number;
  };
  /** Sections */
  sections: {
    /** Value Proposition */
    valueProposition: { enabled: boolean };
    /** Latest Products */
    latestProducts: { enabled: boolean; maxProducts: number };
    /** Hot Auctions */
    hotAuctions: { enabled: boolean; maxAuctions: number };
    /** Featured Categories */
    featuredCategories: {
      /** Enabled */
      enabled: boolean;
      /** Max Categories */
      maxCategories: number;
      /** Products Per Category */
      productsPerCategory: number;
    };
    /** Featured Shops */
    featuredShops: {
      /** Enabled */
      enabled: boolean;
      /** Max Shops */
      maxShops: number;
      /** Products Per Shop */
      productsPerShop: number;
    };
    /** Featured Products */
    featuredProducts: { enabled: boolean; maxProducts: number };
    /** Featured Auctions */
    featuredAuctions: { enabled: boolean; maxAuctions: number };
    /** Recent Reviews */
    recentReviews: { enabled: boolean; maxReviews: number };
    /** Featured Blogs */
    featuredBlogs: { enabled: boolean; maxBlogs: number };
  };
  /** Section Order */
  sectionOrder: string[];
  /** Featured Items /**
 * DEFAULT_SETTINGS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for default settings
 */
*/
  /** FeaturedItems */
  featuredItems?: Record<string, FeaturedItem[]>;
  /** Updated At */
  updatedAt: string;
  /** Updated By */
  updatedBy?: string;
}

const DEFAULT_SETTINGS: HomepageSettings = {
  /** Special Event Banner */
  specialEventBanner: {
    /** Enabled */
    enabled: true,
    /** Title */
    title: "Special Event",
    /** Content */
    content:
      "<p>⭐ <strong>Featured Sites:</strong> International Fleemarket • Purchase Fees • Coupon week end!</p>",
    /** Link */
    link: "/special-offers",
    /** Background Color */
    backgroundColor: "#2563eb",
    /** Text Color */
    textColor: "#ffffff",
  },
  /** Hero Carousel */
  heroCarousel: {
    /** Enabled */
    enabled: true,
    /** Auto Play Interval */
    autoPlayInterval: 5000,
  },
  /** Sections */
  sections: {
    /** Value Proposition */
    valueProposition: { enabled: true },
    /** Latest Products */
    latestProducts: { enabled: true, maxProducts: 10 },
    /** Hot Auctions */
    hotAuctions: { enabled: true, maxAuctions: 10 },
    /** Featured Categories */
    featuredCategories: {
      /** Enabled */
      enabled: true,
      /** Max Categories */
      maxCategories: 6,
      /** Products Per Category */
      productsPerCategory: 10,
    },
    /** Featured Shops */
    featuredShops: {
      /** Enabled */
      enabled: true,
      /** Max Shops */
      maxShops: 4,
      /** Products Per Shop */
      productsPerShop: 10,
    },
    /** Featured Products */
    featuredProducts: { enabled: true, maxProducts: 10 },
    /** Featured Auctions */
    featuredAuctions: { enabled: true, maxAuctions: 10 },
    /** Recent Reviews */
    recentReviews: { enabled: true, maxReviews: 10 },
    /** Featured Blogs */
    featuredBlogs: { enabled: true, maxBlogs: 10 },
  },
  /** Section Order */
  sectionOrder: [
    "valueProposition",
    "latestProducts",
    "hotAuctions",
    "featuredCategories",
    "featuredShops",
    "featuredProducts",
    "featuredAuctions",
    "recentReviews",
    "featuredBlogs",
  ],
  /** Updated At */
  updatedAt: new Date().toISOString(),
};

/**
 * GET /api/homepage
 * Get homepage configuration
 * - Public: Can view settings
 * - Admin: Can view all settings
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
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
        /** Success */
        success: true,
        /** Data */
        data: DEFAULT_SETTINGS,
        /** Is Default */
        isDefault: true,
      });
    }

    const data = doc.data();

    const settings: HomepageSettings = {
      ...DEFAULT_SETTINGS,
      ...data,
      /** Special Event Banner */
      specialEventBanner: {
        ...DEFAULT_SETTINGS.specialEventBanner,
        ...(data?.specialEventBanner || {}),
      },
      /** Sections */
      sections: {
        ...DEFAULT_SETTINGS.sections,
        ...(data?.sections || {}),
      },
      /** Featured Items */
      featuredItems: data?.featuredItems || {},
    } as HomepageSettings;

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: settings,
      /** Is Default */
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
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(req);
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(req);
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
      /** Updated At */
      updatedAt: new Date().toISOString(),
      /** Updated By */
      updatedBy: user.uid,
    };

    await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .set(settings, { merge: true });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Homepage settings updated successfully",
      /** Data */
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
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ["admin"]);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const db = getFirestoreAdmin();

    const settings: HomepageSettings = {
      ...DEFAULT_SETTINGS,
      /** Updated At */
      updatedAt: new Date().toISOString(),
      /** Updated By */
      updatedBy: user.uid,
    };

    await db
      .collection(SETTINGS_COLLECTION)
      .doc(HOMEPAGE_SETTINGS_DOC)
      .set(settings);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Homepage settings reset to defaults",
      /** Data */
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
