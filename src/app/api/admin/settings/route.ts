/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/settings/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Admin Settings API
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Handles:
 * - GET: Get all settings or specific category
 * - PUT: Update settings
 * - PATCH: Partial update of settings
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { getCurrentUser } from "@/app/api/lib/session";
import { FieldValue } from "firebase-admin/firestore";

const SETTINGS_COLLECTION = "system_settings";
const SETTINGS_DOC_ID = "config";

// Settings type definitions
/**
 * GeneralSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for GeneralSettings
 */
interface GeneralSettings {
  /** Site Name */
  siteName: string;
  /** Site Tagline */
  siteTagline: string;
  /** Site Description */
  siteDescription: string;
  /** Contact Email */
  contactEmail: string;
  /** Support Email */
  supportEmail: string;
  /** Contact Phone */
  contactPhone: string;
  /** Address */
  address: string;
  /** Logo Url */
  logoUrl: string;
  /** Favicon Url */
  faviconUrl: string;
  /** Social Links */
  socialLinks: {
    /** Facebook */
    facebook: string;
    /** Twitter */
    twitter: string;
    /** Instagram */
    instagram: string;
    /** Linkedin */
    linkedin: string;
    /** Youtube */
    youtube: string;
  };
  /** Maintenance Mode */
  maintenanceMode: boolean;
  /** Maintenance Message */
  maintenanceMessage: string;
}

/**
 * PaymentSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for PaymentSettings
 */
interface PaymentSettings {
  /** Razorpay */
  razorpay: {
    /** Enabled */
    enabled: boolean;
    /** Key Id */
    keyId: string;
    /** Key Secret */
    keySecret?: string;
    /** Test Mode */
    testMode: boolean;
  };
  /** Payu */
  payu: {
    /** Enabled */
    enabled: boolean;
    /** Merchant Key */
    merchantKey: string;
    /** Merchant Salt */
    merchantSalt?: string;
    /** Test Mode */
    testMode: boolean;
  };
  /** Cod */
  cod: {
    /** Enabled */
    enabled: boolean;
    /** Max Order Value */
    maxOrderValue: number;
    /** Min Order Value */
    minOrderValue: number;
  };
  /** Currency */
  currency: string;
  /** Currency Symbol */
  currencySymbol: string;
}

/**
 * ShippingSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for ShippingSettings
 */
interface ShippingSettings {
  /** Free Shipping Threshold */
  freeShippingThreshold: number;
  /** Default Shipping Charge */
  defaultShippingCharge: number;
  /** Express Shipping Charge */
  expressShippingCharge: number;
  /** Express Shipping Enabled */
  expressShippingEnabled: boolean;
  /** Estimated Delivery Days */
  estimatedDeliveryDays: {
    /** Standard */
    standard: { min: number; max: number };
    /** Express */
    express: { min: number; max: number };
  };
  /** Restricted Pincodes */
  restrictedPincodes: string[];
}

/**
 * FeatureSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for FeatureSettings
 */
interface FeatureSettings {
  /** Auctions Enabled */
  auctionsEnabled: boolean;
  /** Buy Now Enabled */
  buyNowEnabled: boolean;
  /** Reviews Enabled */
  reviewsEnabled: boolean;
  /** Wishlist Enabled */
  wishlistEnabled: boolean;
  /** Comparisons Enabled */
  comparisonsEnabled: boolean;
  /** Chat Enabled */
  chatEnabled: boolean;
  /** Multi Vendor Enabled */
  multiVendorEnabled: boolean;
}

/**
 * AllSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for AllSettings
 */
interface AllSettings {
  /** General */
  general: GeneralSettings;
  /** Payment */
  payment: PaymentSettings;
  /** Shipping */
  shipping: ShippingSettings;
  /** Features */
  features: FeatureSettings;
}

// Default settings structure
const DEFAULT_SETTINGS: AllSettings = {
  /** General */
  general: {
    /** Site Name */
    siteName: "Letitrip",
    /** Site Tagline */
    siteTagline: "India's Premier Auction Platform",
    /** Site Description */
    siteDescription: "Buy and sell unique items through live auctions",
    /** Contact Email */
    contactEmail: "contact@letitrip.in",
    /** Support Email */
    supportEmail: "support@letitrip.in",
    /** Contact Phone */
    contactPhone: "",
    /** Address */
    address: "",
    /** Logo Url */
    logoUrl: "",
    /** Favicon Url */
    faviconUrl: "",
    /** Social Links */
    socialLinks: {
      /** Facebook */
      facebook: "",
      /** Twitter */
      twitter: "",
      /** Instagram */
      instagram: "",
      /** Linkedin */
      linkedin: "",
      /** Youtube */
      youtube: "",
    },
    /** Maintenance Mode */
    maintenanceMode: false,
    /** Maintenance Message */
    maintenanceMessage:
      "We are currently undergoing scheduled maintenance. Please check back soon.",
  },
  /** Payment */
  payment: {
    /** Razorpay */
    razorpay: {
      /** Enabled */
      enabled: false,
      /** Key Id */
      keyId: "",
      /** Key Secret */
      keySecret: "",
      /** Test Mode */
      testMode: true,
    },
    /** Payu */
    payu: {
      /** Enabled */
      enabled: false,
      /** Merchant Key */
      merchantKey: "",
      /** Merchant Salt */
      merchantSalt: "",
      /** Test Mode */
      testMode: true,
    },
    /** Cod */
    cod: {
      /** Enabled */
      enabled: true,
      /** Max Order Value */
      maxOrderValue: 50000,
      /** Min Order Value */
      minOrderValue: 0,
    },
    /** Currency */
    currency: "INR",
    /** Currency Symbol */
    currencySymbol: "₹",
  },
  /** Shipping */
  shipping: {
    /** Free Shipping Threshold */
    freeShippingThreshold: 999,
    /** Default Shipping Charge */
    defaultShippingCharge: 99,
    /** Express Shipping Charge */
    expressShippingCharge: 199,
    /** Express Shipping Enabled */
    expressShippingEnabled: true,
    /** Estimated Delivery Days */
    estimatedDeliveryDays: {
      /** Standard */
      standard: { min: 5, max: 7 },
      /** Express */
      express: { min: 2, max: 3 },
    },
    /** Restricted Pincodes */
    restrictedPincodes: [],
  },
  /** Features */
  features: {
    /** Auctions Enabled */
    auctionsEnabled: true,
    /** Buy Now Enabled */
    buyNowEnabled: true,
    /** Reviews Enabled */
    reviewsEnabled: true,
    /** Wishlist Enabled */
    wishlistEnabled: true,
    /** Comparisons Enabled */
    comparisonsEnabled: true,
    /** Chat Enabled */
    chatEnabled: false,
    /** Multi Vendor Enabled */
    multiVendorEnabled: true,
  },
};

/**
 * SettingsCategory type
 * 
 * @typedef {Object} SettingsCategory
 * @description Type definition for SettingsCategory
 */
type SettingsCategory = "general" | "payment" | "shipping" | "features";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as SettingsCategory | null;

    const db = getFirestoreAdmin();
    const settingsDoc = await db
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC_ID)
      .get();

    let settings = DEFAULT_SETTINGS;
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      // Deep merge with defaults to ensure all fields exist
      settings = deepMerge(DEFAULT_SETTINGS, data || {});
    }

    // Mask sensitive fields
    const maskedSettings = maskSensitiveFields(settings);

    if (category && category in maskedSettings) {
      return NextResponse.json({
        /** Success */
        success: true,
        category,
        /** Settings */
        settings: maskedSettings[category],
      });
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Settings */
      settings: maskedSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

/**
 * Function: P U T
 */
/**
 * Performs p u t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(request);
 */

/**
 * Performs p u t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(request);
 */

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { category, settings } = body;

    if (!category || !settings) {
      return NextResponse.json(
        { error: "Category and settings are required" },
        { status: 400 },
      );
    }

    if (!["general", "payment", "shipping", "features"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid settings category" },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    const settingsRef = db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);

    // Get current settings
    const currentDoc = await settingsRef.get();
    const currentData = currentDoc.exists ? currentDoc.data() : {};
    const currentSettings = deepMerge(DEFAULT_SETTINGS, currentData || {});

    // Prepare update - preserve sensitive fields that weren't provided
    const updatedCategory = {
      ...(currentSettings[category as keyof typeof currentSettings] || {}),
      ...settings,
    };

    // For payment settings, preserve secrets if not provided
    if (category === "payment") {
      if (
        settings.razorpay &&
        !settings.razorpay.keySecret &&
        currentSettings.payment?.razorpay?.keySecret
      ) {
        updatedCategory.razorpay.keySecret =
          currentSettings.payment.razorpay.keySecret;
      }
      if (
        settings.payu &&
        !settings.payu.merchantSalt &&
        currentSettings.payment?.payu?.merchantSalt
      ) {
        updatedCategory.payu.merchantSalt =
          currentSettings.payment.payu.merchantSalt;
      }
    }

    await settingsRef.set(
      {
        [category]: updatedCategory,
        /** Updated At */
        updatedAt: FieldValue.serverTimestamp(),
        /** Updated By */
        updatedBy: user.id,
      },
      { merge: true },
    );

    // Fetch updated settings and mask
    const updatedDoc = await settingsRef.get();
    const updatedSettings = deepMerge(
      DEFAULT_SETTINGS,
      updatedDoc.data() || {},
    );
    const maskedUpdated = maskSensitiveFields(updatedSettings);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: `${category} settings updated successfully`,
      /** Settings */
      settings: maskedUpdated[category as keyof AllSettings],
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}

/**
 * Function: P A T C H
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request);
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request);
 */

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { path, value } = body;

    if (!path || value === undefined) {
      return NextResponse.json(
        { error: "Path and value are required" },
        { status: 400 },
      );
    }

    // Validate path format (e.g., "general.siteName" or "payment.razorpay.enabled")
    const pathParts = path.split(".");
    if (pathParts.length < 2 || pathParts.length > 3) {
      return NextResponse.json(
        {
          /** Error */
          error:
            "Invalid path format. Use 'category.field' or 'category.subcategory.field'",
        },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    const settingsRef = db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);

    await settingsRef.set(
      {
        [pathParts[0]]:
          pathParts.length === 2
            ? { [pathParts[1]]: value }
            : { [pathParts[1]]: { [pathParts[2]]: value } },
        /** Updated At */
        updatedAt: FieldValue.serverTimestamp(),
        /** Updated By */
        updatedBy: user.id,
      },
      { merge: true },
    );

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: `Setting ${path} updated successfully`,
    });
  } catch (error) {
    console.error("Error patching setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 },
    );
  }
}

// Helper: Deep merge objects - preserves structure of target, overrides with source values
/**
 * Function: Deep Merge
 */
/**
 * Performs deep merge operation
 *
 * @param {AllSettings} target - The target
 * @param {Record<string, unknown>} source - The source
 *
 * @returns {any} The deepmerge result
 */

/**
 * Performs deep merge operation
 *
 * @returns {any} The deepmerge result
 */

function deepMerge(
  /** Target */
  target: AllSettings,
  /** Source */
  source: Record<string, unknown>,
): AllSettings {
  // Use JSON parse/stringify for deep clone and simple merge
  const output = JSON.parse(JSON.stringify(target)) as AllSettings;

  // Merge each top-level category
  if (source.general && typeof source.general === "object") {
    output.general = { ...output.general, ...(source.general as object) };
    if ((source.general as Record<string, unknown>).socialLinks) {
      output.general.socialLinks = {
        ...output.general.socialLinks,
        ...((source.general as Record<string, unknown>).socialLinks as object),
      };
    }
  }

  if (source.payment && typeof source.payment === "object") {
    const paymentSource = source.payment as Record<string, unknown>;
    output.payment = { ...output.payment, ...(paymentSource as object) };
    if (paymentSource.razorpay && typeof paymentSource.razorpay === "object") {
      output.payment.razorpay = {
        ...output.payment.razorpay,
        ...(paymentSource.razorpay as object),
      };
    }
    if (paymentSource.payu && typeof paymentSource.payu === "object") {
      output.payment.payu = {
        ...output.payment.payu,
        ...(paymentSource.payu as object),
      };
    }
    if (paymentSource.cod && typeof paymentSource.cod === "object") {
      output.payment.cod = {
        ...output.payment.cod,
        ...(paymentSource.cod as object),
      };
    }
  }

  if (source.shipping && typeof source.shipping === "object") {
    const shippingSource = source.shipping as Record<string, unknown>;
    output.shipping = { ...output.shipping, ...(shippingSource as object) };
    if (
      shippingSource.estimatedDeliveryDays &&
      typeof shippingSource.estimatedDeliveryDays === "object"
    ) {
      output.shipping.estimatedDeliveryDays = {
        ...output.shipping.estimatedDeliveryDays,
        ...(shippingSource.estimatedDeliveryDays as object),
      };
    }
  }

  if (source.features && typeof source.features === "object") {
    output.features = { ...output.features, ...(source.features as object) };
  }

  return output;
}

// Helper: Mask sensitive fields before sending to client
/**
 * Function: Mask Sensitive Fields
 */
/**
 * Performs mask sensitive fields operation
 *
 * @param {AllSettings} settings - The settings
 *
 * @returns {any} The masksensitivefields result
 */

/**
 * Performs mask sensitive fields operation
 *
 * @param {AllSettings} settings - The settings
 *
 * @returns {any} The masksensitivefields result
 */

function maskSensitiveFields(settings: AllSettings): AllSettings {
  const masked = JSON.parse(JSON.stringify(settings)) as AllSettings;

  // Mask payment secrets
  if (masked.payment?.razorpay?.keySecret) {
    masked.payment.razorpay.keySecret = "••••••••";
  }
  if (masked.payment?.payu?.merchantSalt) {
    masked.payment.payu.merchantSalt = "••••••••";
  }

  return masked;
}
