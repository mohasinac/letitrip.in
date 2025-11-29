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
interface GeneralSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  faviconUrl: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

interface PaymentSettings {
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret?: string;
    testMode: boolean;
  };
  payu: {
    enabled: boolean;
    merchantKey: string;
    merchantSalt?: string;
    testMode: boolean;
  };
  cod: {
    enabled: boolean;
    maxOrderValue: number;
    minOrderValue: number;
  };
  currency: string;
  currencySymbol: string;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  defaultShippingCharge: number;
  expressShippingCharge: number;
  expressShippingEnabled: boolean;
  estimatedDeliveryDays: {
    standard: { min: number; max: number };
    express: { min: number; max: number };
  };
  restrictedPincodes: string[];
}

interface FeatureSettings {
  auctionsEnabled: boolean;
  buyNowEnabled: boolean;
  reviewsEnabled: boolean;
  wishlistEnabled: boolean;
  comparisonsEnabled: boolean;
  chatEnabled: boolean;
  multiVendorEnabled: boolean;
}

interface AllSettings {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  features: FeatureSettings;
}

// Default settings structure
const DEFAULT_SETTINGS: AllSettings = {
  general: {
    siteName: "JustForView",
    siteTagline: "India's Premier Auction Platform",
    siteDescription: "Buy and sell unique items through live auctions",
    contactEmail: "contact@justforview.in",
    supportEmail: "support@justforview.in",
    contactPhone: "",
    address: "",
    logoUrl: "",
    faviconUrl: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
    maintenanceMode: false,
    maintenanceMessage: "We are currently undergoing scheduled maintenance. Please check back soon.",
  },
  payment: {
    razorpay: {
      enabled: false,
      keyId: "",
      keySecret: "",
      testMode: true,
    },
    payu: {
      enabled: false,
      merchantKey: "",
      merchantSalt: "",
      testMode: true,
    },
    cod: {
      enabled: true,
      maxOrderValue: 50000,
      minOrderValue: 0,
    },
    currency: "INR",
    currencySymbol: "₹",
  },
  shipping: {
    freeShippingThreshold: 999,
    defaultShippingCharge: 99,
    expressShippingCharge: 199,
    expressShippingEnabled: true,
    estimatedDeliveryDays: {
      standard: { min: 5, max: 7 },
      express: { min: 2, max: 3 },
    },
    restrictedPincodes: [],
  },
  features: {
    auctionsEnabled: true,
    buyNowEnabled: true,
    reviewsEnabled: true,
    wishlistEnabled: true,
    comparisonsEnabled: true,
    chatEnabled: false,
    multiVendorEnabled: true,
  },
};

type SettingsCategory = "general" | "payment" | "shipping" | "features";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as SettingsCategory | null;

    const db = getFirestoreAdmin();
    const settingsDoc = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).get();

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
        success: true,
        category,
        settings: maskedSettings[category],
      });
    }

    return NextResponse.json({
      success: true,
      settings: maskedSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, settings } = body;

    if (!category || !settings) {
      return NextResponse.json(
        { error: "Category and settings are required" },
        { status: 400 }
      );
    }

    if (!["general", "payment", "shipping", "features"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid settings category" },
        { status: 400 }
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
      if (settings.razorpay && !settings.razorpay.keySecret && currentSettings.payment?.razorpay?.keySecret) {
        updatedCategory.razorpay.keySecret = currentSettings.payment.razorpay.keySecret;
      }
      if (settings.payu && !settings.payu.merchantSalt && currentSettings.payment?.payu?.merchantSalt) {
        updatedCategory.payu.merchantSalt = currentSettings.payment.payu.merchantSalt;
      }
    }

    await settingsRef.set(
      {
        [category]: updatedCategory,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: user.id,
      },
      { merge: true }
    );

    // Fetch updated settings and mask
    const updatedDoc = await settingsRef.get();
    const updatedSettings = deepMerge(DEFAULT_SETTINGS, updatedDoc.data() || {});
    const maskedUpdated = maskSensitiveFields(updatedSettings);

    return NextResponse.json({
      success: true,
      message: `${category} settings updated successfully`,
      settings: maskedUpdated[category as keyof AllSettings],
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { path, value } = body;

    if (!path || value === undefined) {
      return NextResponse.json(
        { error: "Path and value are required" },
        { status: 400 }
      );
    }

    // Validate path format (e.g., "general.siteName" or "payment.razorpay.enabled")
    const pathParts = path.split(".");
    if (pathParts.length < 2 || pathParts.length > 3) {
      return NextResponse.json(
        { error: "Invalid path format. Use 'category.field' or 'category.subcategory.field'" },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    const settingsRef = db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);

    await settingsRef.set(
      {
        [pathParts[0]]: pathParts.length === 2
          ? { [pathParts[1]]: value }
          : { [pathParts[1]]: { [pathParts[2]]: value } },
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: user.id,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: `Setting ${path} updated successfully`,
    });
  } catch (error) {
    console.error("Error patching setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

// Helper: Deep merge objects - preserves structure of target, overrides with source values
function deepMerge(target: AllSettings, source: Record<string, unknown>): AllSettings {
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
      output.payment.razorpay = { ...output.payment.razorpay, ...(paymentSource.razorpay as object) };
    }
    if (paymentSource.payu && typeof paymentSource.payu === "object") {
      output.payment.payu = { ...output.payment.payu, ...(paymentSource.payu as object) };
    }
    if (paymentSource.cod && typeof paymentSource.cod === "object") {
      output.payment.cod = { ...output.payment.cod, ...(paymentSource.cod as object) };
    }
  }
  
  if (source.shipping && typeof source.shipping === "object") {
    const shippingSource = source.shipping as Record<string, unknown>;
    output.shipping = { ...output.shipping, ...(shippingSource as object) };
    if (shippingSource.estimatedDeliveryDays && typeof shippingSource.estimatedDeliveryDays === "object") {
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
