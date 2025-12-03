import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

/**
 * Generate Admin Settings Data
 * POST /api/admin/demo/generate/settings
 *
 * Creates comprehensive test data for E021 System Configuration:
 * - Site settings (general, SEO, maintenance)
 * - Payment gateway settings
 * - Shipping settings
 * - Email/Resend settings
 * - Notification settings
 * - Feature flags
 */
export async function POST() {
  try {
    const db = getFirestoreAdmin();
    const timestamp = new Date();

    const counts = {
      siteSettings: 0,
      paymentSettings: 0,
      shippingZones: 0,
      emailTemplates: 0,
      notificationSettings: 0,
      featureFlags: 0,
      settings: 0,
    };

    // 1. Site Settings (General)
    await db
      .collection(COLLECTIONS.SITE_SETTINGS)
      .doc("general")
      .set({
        siteName: "LET IT RIP - Letitrip.in",
        siteDescription:
          "India's Premier Platform for Beyblades, Trading Cards & Collectibles",
        siteTagline: "Your Gateway to Authentic Collectibles",
        logoLight: "/images/logo-light.png",
        logoDark: "/images/logo-dark.png",
        favicon: "/favicon.ico",
        contactEmail: `${DEMO_PREFIX.toLowerCase()}contact@letitrip.in`,
        contactPhone: "+91-9876543210",
        supportEmail: `${DEMO_PREFIX.toLowerCase()}support@letitrip.in`,
        address: {
          street: "123 Collector's Avenue",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
        socialLinks: {
          facebook: "https://facebook.com/letitrip",
          twitter: "https://twitter.com/letitrip",
          instagram: "https://instagram.com/letitrip",
          youtube: "https://youtube.com/@letitrip",
          linkedin: "https://linkedin.com/company/letitrip",
        },
        businessHours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed",
        },
        currency: "INR",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "12h",
        locale: "en-IN",
        createdAt: timestamp,
        updatedAt: timestamp,
        updatedBy: "Mohsin",
      });
    counts.siteSettings++;

    // 2. SEO Settings
    await db
      .collection(COLLECTIONS.SITE_SETTINGS)
      .doc("seo")
      .set({
        defaultTitle:
          "LET IT RIP - Buy Beyblades, TCG Cards & Collectibles in India",
        defaultDescription:
          "India's most trusted platform for authentic Beyblades, Trading Card Games, and collectibles. Shop, auction, and trade with verified sellers.",
        defaultKeywords: [
          "beyblades",
          "tcg",
          "trading cards",
          "collectibles",
          "auction",
          "india",
          "beyblade burst",
          "beyblade x",
        ],
        ogImage: "/images/og-image.jpg",
        twitterCard: "summary_large_image",
        twitterSite: "@letitrip",
        googleAnalyticsId: `${DEMO_PREFIX}GA-XXXXXXXXX`,
        googleTagManagerId: `${DEMO_PREFIX}GTM-XXXXXXX`,
        facebookPixelId: `${DEMO_PREFIX}FB-XXXXXXXXXXXXX`,
        googleSiteVerification: `${DEMO_PREFIX}google-site-verification-code`,
        bingSiteVerification: `${DEMO_PREFIX}bing-site-verification-code`,
        robotsTxt: `User-agent: *\nAllow: /\nSitemap: https://letitrip.in/sitemap.xml`,
        structuredDataEnabled: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.siteSettings++;

    // 3. Maintenance Mode Settings
    await db
      .collection(COLLECTIONS.SITE_SETTINGS)
      .doc("maintenance")
      .set({
        enabled: false,
        message:
          "We're upgrading our platform to serve you better! We'll be back soon.",
        title: "Site Under Maintenance",
        allowedIps: ["127.0.0.1", "::1"],
        estimatedEndTime: null,
        showCountdown: false,
        contactInfo: true,
        socialLinks: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.siteSettings++;

    // 4. Payment Settings - Razorpay
    await db
      .collection(COLLECTIONS.PAYMENT_SETTINGS)
      .doc("razorpay")
      .set({
        enabled: true,
        displayName: "Razorpay",
        apiKey: `${DEMO_PREFIX}rzp_test_xxxxxxxxxxxxxxxx`,
        apiSecret: `${DEMO_PREFIX}encrypted_secret_key`,
        webhookSecret: `${DEMO_PREFIX}encrypted_webhook_secret`,
        testMode: true,
        supportedMethods: ["card", "upi", "netbanking", "wallet"],
        acceptedCards: ["visa", "mastercard", "rupay", "amex"],
        minAmount: 100,
        maxAmount: 1000000,
        processingFee: {
          type: "percentage",
          value: 2.0,
          gst: 18,
        },
        autoCapture: true,
        refundSpeed: "normal",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.paymentSettings++;

    // 5. Payment Settings - Cash on Delivery
    await db
      .collection(COLLECTIONS.PAYMENT_SETTINGS)
      .doc("cod")
      .set({
        enabled: true,
        displayName: "Cash on Delivery",
        minOrderAmount: 500,
        maxOrderAmount: 50000,
        codFee: 50,
        excludedPincodes: ["110001", "400001"], // Demo excluded pincodes
        excludedCategories: ["electronics-high-value"],
        verificationRequired: true,
        otpVerification: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.paymentSettings++;

    // 6. Shipping Zones (India Coverage)
    const shippingZones = [
      {
        name: "Mumbai Metropolitan",
        states: ["Maharashtra"],
        cities: ["Mumbai", "Navi Mumbai", "Thane"],
        pincodeRanges: ["400001-400097"],
        baseRate: 50,
        freeShippingThreshold: 999,
        estimatedDays: "1-2",
        priority: 1,
      },
      {
        name: "Delhi NCR",
        states: ["Delhi", "Haryana", "Uttar Pradesh"],
        cities: ["Delhi", "Gurgaon", "Noida", "Ghaziabad", "Faridabad"],
        pincodeRanges: ["110001-110096", "201301-201318"],
        baseRate: 60,
        freeShippingThreshold: 999,
        estimatedDays: "1-2",
        priority: 2,
      },
      {
        name: "Metro Cities",
        states: ["Karnataka", "Tamil Nadu", "West Bengal", "Telangana"],
        cities: ["Bangalore", "Chennai", "Kolkata", "Hyderabad"],
        pincodeRanges: [
          "560001-560100",
          "600001-600100",
          "700001-700100",
          "500001-500100",
        ],
        baseRate: 80,
        freeShippingThreshold: 1499,
        estimatedDays: "2-4",
        priority: 3,
      },
      {
        name: "Tier 1 Cities",
        states: ["Gujarat", "Rajasthan", "Maharashtra", "Uttar Pradesh"],
        cities: ["Ahmedabad", "Pune", "Jaipur", "Lucknow", "Kanpur"],
        pincodeRanges: ["380001-390000", "411001-413999", "302001-304000"],
        baseRate: 100,
        freeShippingThreshold: 1999,
        estimatedDays: "3-5",
        priority: 4,
      },
      {
        name: "Rest of India",
        states: ["All"],
        cities: [],
        pincodeRanges: [],
        baseRate: 150,
        freeShippingThreshold: 2499,
        estimatedDays: "5-7",
        priority: 5,
      },
    ];

    for (const zone of shippingZones) {
      await db
        .collection(COLLECTIONS.SHIPPING_ZONES)
        .doc()
        .set({
          ...zone,
          isActive: true,
          weightSlabs: [
            { upTo: 0.5, rate: zone.baseRate },
            { upTo: 1.0, rate: zone.baseRate + 20 },
            { upTo: 2.0, rate: zone.baseRate + 40 },
            { upTo: 5.0, rate: zone.baseRate + 80 },
          ],
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      counts.shippingZones++;
    }

    // 7. Shipping Carriers
    const carriers = [
      {
        name: "Delhivery",
        code: "DELHIVERY",
        trackingUrl: "https://www.delhivery.com/track/package/{trackingNumber}",
        apiEnabled: true,
      },
      {
        name: "Blue Dart",
        code: "BLUEDART",
        trackingUrl: "https://www.bluedart.com/tracking/{trackingNumber}",
        apiEnabled: true,
      },
      {
        name: "DTDC",
        code: "DTDC",
        trackingUrl:
          "https://www.dtdc.in/tracking.asp?trackingNumber={trackingNumber}",
        apiEnabled: true,
      },
      {
        name: "India Post",
        code: "INDIAPOST",
        trackingUrl:
          "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?cno={trackingNumber}",
        apiEnabled: false,
      },
    ];

    for (const carrier of carriers) {
      await db
        .collection(COLLECTIONS.SHIPPING_CARRIERS)
        .doc(carrier.code)
        .set({
          ...carrier,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
    }

    // 8. Email Templates
    const emailTemplates = [
      {
        id: "welcome",
        name: "Welcome Email",
        subject: "Welcome to Letitrip - Let It Rip! 🌀",
        template: `<h1>Welcome {{name}}!</h1><p>Thanks for joining India's premier collectibles platform.</p>`,
      },
      {
        id: "order_confirmation",
        name: "Order Confirmation",
        subject: "Order Confirmed - {{orderNumber}}",
        template: `<h1>Order Confirmed!</h1><p>Hi {{name}}, your order {{orderNumber}} has been confirmed.</p>`,
      },
      {
        id: "order_shipped",
        name: "Order Shipped",
        subject: "Your Order is On the Way! 📦",
        template: `<h1>Order Shipped!</h1><p>Your order {{orderNumber}} has been shipped. Track: {{trackingNumber}}</p>`,
      },
      {
        id: "order_delivered",
        name: "Order Delivered",
        subject: "Order Delivered ✅",
        template: `<h1>Delivered!</h1><p>Your order {{orderNumber}} has been delivered. Enjoy!</p>`,
      },
      {
        id: "auction_won",
        name: "Auction Won",
        subject: "Congratulations! You Won the Auction 🏆",
        template: `<h1>You Won!</h1><p>Congrats {{name}}, you won the auction for {{itemName}}!</p>`,
      },
      {
        id: "bid_outbid",
        name: "Bid Outbid",
        subject: "You've Been Outbid! ⚠️",
        template: `<h1>Outbid Alert</h1><p>Someone outbid you on {{itemName}}. Place a higher bid!</p>`,
      },
      {
        id: "payout_processed",
        name: "Payout Processed",
        subject: "Payout Processed - ₹{{amount}}",
        template: `<h1>Payout Processed</h1><p>Your payout of ₹{{amount}} has been processed.</p>`,
      },
      {
        id: "password_reset",
        name: "Password Reset",
        subject: "Reset Your Password",
        template: `<h1>Password Reset</h1><p>Click here to reset: {{resetLink}}</p>`,
      },
    ];

    for (const template of emailTemplates) {
      await db
        .collection(COLLECTIONS.EMAIL_TEMPLATES)
        .doc(template.id)
        .set({
          ...template,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      counts.emailTemplates++;
    }

    // 9. Email Settings (Resend)
    await db
      .collection(COLLECTIONS.EMAIL_SETTINGS)
      .doc("resend")
      .set({
        provider: "resend",
        apiKey: `${DEMO_PREFIX}re_demo_api_key_xxxxxxxxxxxx`,
        fromEmail: `${DEMO_PREFIX.toLowerCase()}noreply@letitrip.in`,
        fromName: "LET IT RIP - Letitrip",
        replyToEmail: `${DEMO_PREFIX.toLowerCase()}support@letitrip.in`,
        testMode: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.emailTemplates++;

    // 10. Notification Settings - Push
    await db
      .collection(COLLECTIONS.NOTIFICATION_SETTINGS)
      .doc("push")
      .set({
        enabled: true,
        provider: "firebase",
        firebaseConfig: {
          apiKey: `${DEMO_PREFIX}AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`,
          projectId: `${DEMO_PREFIX}letitrip-demo`,
          messagingSenderId: `${DEMO_PREFIX}123456789`,
          appId: `${DEMO_PREFIX}1:123456789:web:xxxxxxxxxxxxx`,
        },
        vapidKey: `${DEMO_PREFIX}BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.notificationSettings++;

    // 11. Notification Settings - In-App
    await db
      .collection(COLLECTIONS.NOTIFICATION_SETTINGS)
      .doc("in_app")
      .set({
        enabled: true,
        retentionDays: 30,
        notificationTypes: {
          order_updates: { enabled: true, sound: true, badge: true },
          auction_updates: { enabled: true, sound: true, badge: true },
          messages: { enabled: true, sound: true, badge: true },
          promotions: { enabled: true, sound: false, badge: false },
          price_drops: { enabled: true, sound: false, badge: true },
          back_in_stock: { enabled: true, sound: false, badge: true },
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.notificationSettings++;

    // 12. Notification Settings - SMS
    await db
      .collection(COLLECTIONS.NOTIFICATION_SETTINGS)
      .doc("sms")
      .set({
        enabled: false,
        provider: "twilio",
        credentials: {
          accountSid: `${DEMO_PREFIX}ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`,
          authToken: `${DEMO_PREFIX}encrypted_auth_token`,
          fromNumber: "+911234567890",
        },
        templates: {
          order_confirmation:
            "Your order {{orderNumber}} has been confirmed. Track: {{link}}",
          order_shipped:
            "Your order {{orderNumber}} is shipped! Track: {{trackingNumber}}",
          otp_verification: "Your OTP is {{otp}}. Valid for 10 minutes.",
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.notificationSettings++;

    // 13. Feature Flags
    await db.collection(COLLECTIONS.FEATURE_FLAGS).doc("current").set({
      auctions: true,
      reviews: true,
      cod: true,
      guestCheckout: false,
      wishlist: true,
      blog: true,
      sellerRegistration: true,
      messaging: true,
      riplimit: true,
      autoRenewal: true,
      socialLogin: true,
      twoFactorAuth: false,
      advancedSearch: true,
      productComparison: true,
      viewingHistory: true,
      recommendations: true,
      liveChat: false,
      affiliateProgram: false,
      subscriptions: false,
      multiCurrency: false,
      internationalShipping: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    counts.featureFlags++;

    // 14. Business Rules
    await db.collection(COLLECTIONS.BUSINESS_RULES).doc("current").set({
      minProductPrice: 100,
      maxProductPrice: 10000000,
      minAuctionPrice: 500,
      maxAuctionPrice: 10000000,
      minBidIncrement: 50,
      auctionExtensionMinutes: 5,
      auctionExtensionTriggerMinutes: 2,
      maxBidsPerUser: 100,
      maxImagesPerProduct: 10,
      maxVideosPerProduct: 3,
      maxProductTitleLength: 200,
      maxProductDescriptionLength: 5000,
      maxReviewLength: 1000,
      minReviewLength: 10,
      platformCommission: 10, // percentage
      sellerVerificationRequired: true,
      buyerVerificationRequired: false,
      autoApproveReviews: false,
      autoApproveShops: false,
      defaultReturnWindow: 7, // days
      maxReturnWindow: 30,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // 15. RipLimit Settings (E028)
    await db.collection(COLLECTIONS.RIPLIMIT_SETTINGS).doc("current").set({
      enabled: true,
      conversionRate: 100, // 1 INR = 100 RipLimit
      minPurchase: 100, // 100 RipLimit = ₹1
      maxPurchase: 1000000, // 1M RipLimit = ₹10,000
      bidBlockAmount: 5000, // RipLimit blocked per bid
      refundOnOutbid: true,
      refundDelay: 0, // instant
      expiryDays: 365,
      bonusOnFirstPurchase: 1000,
      bonusOnReferral: 500,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // 16. Analytics Settings (E017)
    await db.collection(COLLECTIONS.ANALYTICS_SETTINGS).doc("current").set({
      enabled: true,
      dataRetentionDays: 90,
      trackPageViews: true,
      trackEvents: true,
      trackUserBehavior: true,
      trackConversions: true,
      anonymizeIp: true,
      exportEnabled: true,
      realtimeEnabled: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // 17. Homepage Featured Sections Settings (E014)
    await db
      .collection(COLLECTIONS.HOMEPAGE_SETTINGS)
      .doc("current")
      .set({
        heroCarousel: {
          enabled: true,
          autoPlay: true,
          interval: 5000,
          showArrows: true,
          showDots: true,
          transition: "slide",
        },
        sections: {
          valueProposition: {
            enabled: true,
            order: 1,
          },
          categories: {
            enabled: true,
            order: 2,
            displayCount: 8,
            layout: "grid",
            title: "Shop by Category",
            subtitle:
              "Browse our extensive collection of Beyblades and collectibles",
          },
          products: {
            enabled: true,
            order: 3,
            displayCount: 8,
            layout: "grid",
            title: "Products",
            subtitle:
              "Discover our handpicked selection of authentic collectibles",
            showLatest: true,
            showFeatured: true,
          },
          auctions: {
            enabled: true,
            order: 4,
            displayCount: 6,
            layout: "grid",
            title: "Live Auctions",
            subtitle: "Bid on exclusive collectibles and rare finds",
            showHot: true,
            showFeatured: true,
          },
          shops: {
            enabled: true,
            order: 5,
            displayCount: 8,
            layout: "carousel",
            title: "Featured Shops",
            subtitle: "Shop from our trusted verified sellers",
          },
          reviews: {
            enabled: true,
            order: 6,
            displayCount: 6,
            layout: "carousel",
            title: "Customer Reviews",
            subtitle: "See what our customers say about their purchases",
          },
          blogs: {
            enabled: true,
            order: 7,
            displayCount: 3,
            layout: "grid",
            title: "Latest from Our Blog",
            subtitle: "Collecting tips, news, and insights",
          },
        },
        sectionOrder: [
          "valueProposition",
          "categories",
          "products",
          "auctions",
          "shops",
          "reviews",
          "blogs",
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    counts.settings++;

    return NextResponse.json({
      success: true,
      step: "settings",
      data: counts,
      message: "Admin content settings generated successfully",
    });
  } catch (error: unknown) {
    console.error("Demo settings error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate settings";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
