import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

// Settings document ID (singleton)
const SETTINGS_DOC_ID = "site_settings";

// GET /api/admin/settings - Get all settings
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection("settings").doc(SETTINGS_DOC_ID).get();

    if (!settingsDoc.exists) {
      // Return default settings if none exist
      const defaultSettings = {
        general: {
          siteName: "JustForView",
          siteDescription: "Your trusted online marketplace",
          siteUrl: "https://justforview.in",
          contactEmail: "contact@justforview.in",
          supportEmail: "support@justforview.in",
          phoneNumber: "+91 9876543210",
          address: "",
          timezone: "Asia/Kolkata",
          currency: "INR",
          language: "en",
        },
        email: {
          smtpHost: "",
          smtpPort: 587,
          smtpUser: "",
          smtpPassword: "",
          fromEmail: "noreply@justforview.in",
          fromName: "JustForView",
          templates: {
            orderConfirmation: {
              subject: "Order Confirmation - {{orderNumber}}",
              enabled: true,
            },
            orderShipped: {
              subject: "Your Order Has Been Shipped - {{orderNumber}}",
              enabled: true,
            },
            orderDelivered: {
              subject: "Your Order Has Been Delivered - {{orderNumber}}",
              enabled: true,
            },
            passwordReset: {
              subject: "Reset Your Password",
              enabled: true,
            },
            welcomeEmail: {
              subject: "Welcome to {{siteName}}",
              enabled: true,
            },
          },
        },
        payment: {
          razorpay: {
            enabled: false,
            keyId: "",
            keySecret: "",
            webhookSecret: "",
          },
          stripe: {
            enabled: false,
            publishableKey: "",
            secretKey: "",
            webhookSecret: "",
          },
          paypal: {
            enabled: false,
            clientId: "",
            clientSecret: "",
            mode: "sandbox",
          },
          cod: {
            enabled: true,
            maxAmount: 10000,
            instructions: "Pay cash upon delivery of your order.",
          },
        },
        shipping: {
          freeShippingThreshold: 500,
          standardShippingCost: 50,
          expressShippingCost: 100,
          internationalShipping: false,
          estimatedDeliveryDays: {
            domestic: 5,
            international: 15,
          },
          shiprocket: {
            enabled: false,
            email: "",
            password: "",
            channelId: "",
          },
        },
        tax: {
          gstEnabled: true,
          gstNumber: "",
          gstPercentage: 18,
          internationalTaxEnabled: false,
          internationalTaxPercentage: 0,
        },
        features: {
          reviews: true,
          wishlist: true,
          compareProducts: true,
          socialLogin: false,
          guestCheckout: true,
          multiVendor: true,
          chatSupport: false,
          newsletter: true,
        },
        maintenance: {
          enabled: false,
          message: "We're currently performing scheduled maintenance. We'll be back shortly!",
          allowedIPs: [],
        },
        seo: {
          metaTitle: "JustForView - Your Trusted Online Marketplace",
          metaDescription: "Shop the latest products at competitive prices",
          metaKeywords: "ecommerce, online shopping, marketplace",
          googleAnalyticsId: "",
          facebookPixelId: "",
          googleTagManagerId: "",
        },
        social: {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          whatsapp: "",
        },
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(defaultSettings);
    }

    const settings = settingsDoc.data();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: "Section and data are required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const settingsRef = db.collection("settings").doc(SETTINGS_DOC_ID);
    const settingsDoc = await settingsRef.get();

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Update specific section
    updateData[section] = data;

    if (settingsDoc.exists) {
      await settingsRef.update(updateData);
    } else {
      await settingsRef.set(updateData);
    }

    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully`,
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Partial update settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const db = getAdminDb();
    const settingsRef = db.collection("settings").doc(SETTINGS_DOC_ID);

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await settingsRef.set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
