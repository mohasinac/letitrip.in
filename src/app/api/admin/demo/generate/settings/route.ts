/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/generate/settings/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * DEMO_PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for demo prefix
 */
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
/**
 * Performs p o s t operation
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * const result = POST();
 */
/**
 * Performs p o s t operation
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST();
 */

/**
 * Performs p o s t operation
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST();
 */

export async function POST() {
  try {
    const db = getFirestoreAdmin();
    const timestamp = new Date();

    const counts = {
      /** Site Settings */
      siteSettings: 0,
      /** Payment Settings */
      paymentSettings: 0,
      /** Shipping Zones */
      shippingZones: 0,
      /** Email Templates */
      emailTemplates: 0,
      /** Notification Settings */
      notificationSettings: 0,
      /** Feature Flags */
      featureFlags: 0,
      /** Settings */
      settings: 0,
    };

    // 1. Site Settings (General)
    await db
      .collection(COLLECTIONS.SITE_SETTINGS)
      .doc("general")
      .set({
        /** Site Name */
        siteName: "LET IT RIP - Letitrip.in",
        /** Site Description */
        siteDescription:
          "India's Premier Platform for Beyblades, Trading Cards & Collectibles",
        /** Site Tagline */
        siteTagline: "Your Gateway to Authentic Collectibles",
        /** Logo Light */
        logoLight: "/images/logo-light.png",
        /** Logo Dark */
        logoDark: "/images/logo-dark.png",
        /** Favicon */
        favicon: "/favicon.ico",
        /** Contact Email */
        contactEmail: `${DEMO_PREFIX.toLowerCase()}contact@letitrip.in`,
        /** Contact Phone */
        contactPhone: "+91-9876543210",
        /** Support Email */
        supportEmail: `${DEMO_PREFIX.toLowerCase()}support@letitrip.in`,
        /** Address */
        address: {
          /** Street */
          street: "123 Collector's Avenue",
          /** City */
          city: "Mumbai",
          /** State */
          state: "Maharashtra",
          /** Pincode */
          pincode: "400001",
          /** Country */
          country: "India",
        },
        /** Social Links */
        socialLinks: {
          facebook: "https://facebook.com/letitrip",
          twitter: "https://twitter.com/letitrip",
          instagram: "https://instagram.com/letitrip",
          youtube: "https://youtube.com/@letitrip",
          linkedin: "https://linkedin.com/company/letitrip",
        },
        /** Business Hours */
        businessHours: {
          /** Monday */
          monday: "9:00 AM - 6:00 PM",
          /** Tuesday */
          tuesday: "9:00 AM - 6:00 PM",
          /** Wednesday */
          wednesday: "9:00 AM - 6:00 PM",
          /** Thursday */
          thursday: "9:00 AM - 6:00 PM",
          /** Friday */
          friday: "9:00 AM - 6:00 PM",
          /** Saturday */
          saturday: "10:00 AM - 4:00 PM",
          /** Sunday */
          sunday: "Closed",
        },
        /** Currency */
        currency: "INR",
        /** Timezone */
        timezone: "Asia/Kolkata",
        /** Date Format */
        dateFormat: "DD/MM/YYYY",
        /** Time Format */
        timeFormat: "12h",
        /** Locale */
        locale: "en-IN",
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
        /** Updated By */
        updatedBy: "Mohsin",
      });
    counts.siteSettings++;

    // 2. SEO Settings
    await db
      .collection(COLLECTIONS.SITE_SETTINGS)
      .doc("seo")
      .set({
        /** Default Title */
        defaultTitle:
          "LET IT RIP - Buy Beyblades, TCG Cards & Collectibles in India",
        /** Default Description */
        defaultDescription:
          "India's most trusted platform for authentic Beyblades, Trading Card Games, and collectibles. Shop, auction, and trade with verified sellers.",
        /** Default Keywords */
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
        /** Og Image */
        ogImage: "/images/og-image.jpg",
        /** Twitter Card */
        twitterCard: "summary_large_image",
        /** Twitter Site */
        twitterSite: "@letitrip",
        /** Google Analytics Id */
        googleAnalyticsId: `${DEMO_PREFIX}GA-XXXXXXXXX`,
        /** Google Tag Manager Id */
        googleTagManagerId: `${DEMO_PREFIX}GTM-XXXXXXX`,
        /** Facebook Pixel Id */
        facebookPixelId: `${DEMO_PREFIX}FB-XXXXXXXXXXXXX`,
        /** Google Site Verification */
        googleSiteVerification: `${DEMO_PREFIX}google-site-verification-code`,
        /** Bing Site Verification */
        bingSiteVerification: `${DEMO_PREFIX}bing-site-verification-code`,
        robotsTxt: `User-agent: *\nAllow: /\nSitemap: https://letitrip.in/sitemap.xml`,
        /** Structured Data Enabled */
        structuredDataEnabled: true,
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.siteSettings++;

    // 3. Maintenance Mode Settings
    await db
      .collection(COLLECTIONS.SITE_SETTINGS)
      .doc("maintenance")
      .set({
        /** Enabled */
        enabled: false,
        /** Message */
        message:
          "We're upgrading our platform to serve you better! We'll be back soon.",
        /** Title */
        title: "Site Under Maintenance",
        /** Allowed Ips */
        allowedIps: ["127.0.0.1", "::1"],
        /** Estimated End Time */
        estimatedEndTime: null,
        /** Show Countdown */
        showCountdown: false,
        /** Contact Info */
        contactInfo: true,
        /** Social Links */
        socialLinks: true,
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.siteSettings++;

    // 4. Payment Settings - Razorpay
    await db
      .collection(COLLECTIONS.PAYMENT_SETTINGS)
      .doc("razorpay")
      .set({
        /** Enabled */
        enabled: true,
        /** Display Name */
        displayName: "Razorpay",
        /** Api Key */
        apiKey: `${DEMO_PREFIX}rzp_test_xxxxxxxxxxxxxxxx`,
        /** Api Secret */
        apiSecret: `${DEMO_PREFIX}encrypted_secret_key`,
        /** Webhook Secret */
        webhookSecret: `${DEMO_PREFIX}encrypted_webhook_secret`,
        /** Test Mode */
        testMode: true,
        /** Supported Methods */
        supportedMethods: ["card", "upi", "netbanking", "wallet"],
        /** Accepted Cards */
        acceptedCards: ["visa", "mastercard", "rupay", "amex"],
        /** Min Amount */
        minAmount: 100,
        /** Max Amount */
        maxAmount: 1000000,
        /** Processing Fee */
        processingFee: {
          /** Type */
          type: "percentage",
          /** Value */
          value: 2.0,
          /** Gst */
          gst: 18,
        },
        /** Auto Capture */
        autoCapture: true,
        /** Refund Speed */
        refundSpeed: "normal",
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.paymentSettings++;

    // 5. Payment Settings - Cash on Delivery
    await db
      .collection(COLLECTIONS.PAYMENT_SETTINGS)
      .doc("cod")
      .set({
        /** Enabled */
        enabled: true,
        /** Display Name */
        displayName: "Cash on Delivery",
        /** Min Order Amount */
        minOrderAmount: 500,
        /** Max Order Amount */
        maxOrderAmount: 50000,
        /** Cod Fee */
        codFee: 50,
        excludedPincodes: ["110001", "400001"], // Demo excluded pincodes
        /** Excluded Categories */
        excludedCategories: ["electronics-high-value"],
        /** Verification Required */
        verificationRequired: true,
        /** Otp Verification */
        otpVerification: true,
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.paymentSettings++;

    // 6. Shipping Zones (India Coverage)
    const shippingZones = [
      {
        /** Name */
        name: "Mumbai Metropolitan",
        /** States */
        states: ["Maharashtra"],
        /** Cities */
        cities: ["Mumbai", "Navi Mumbai", "Thane"],
        /** Pincode Ranges */
        pincodeRanges: ["400001-400097"],
        /** Base Rate */
        baseRate: 50,
        /** Free Shipping Threshold */
        freeShippingThreshold: 999,
        /** Estimated Days */
        estimatedDays: "1-2",
        /** Priority */
        priority: 1,
      },
      {
        /** Name */
        name: "Delhi NCR",
        /** States */
        states: ["Delhi", "Haryana", "Uttar Pradesh"],
        /** Cities */
        cities: ["Delhi", "Gurgaon", "Noida", "Ghaziabad", "Faridabad"],
        /** Pincode Ranges */
        pincodeRanges: ["110001-110096", "201301-201318"],
        /** Base Rate */
        baseRate: 60,
        /** Free Shipping Threshold */
        freeShippingThreshold: 999,
        /** Estimated Days */
        estimatedDays: "1-2",
        /** Priority */
        priority: 2,
      },
      {
        /** Name */
        name: "Metro Cities",
        /** States */
        states: ["Karnataka", "Tamil Nadu", "West Bengal", "Telangana"],
        /** Cities */
        cities: ["Bangalore", "Chennai", "Kolkata", "Hyderabad"],
        /** Pincode Ranges */
        pincodeRanges: [
          "560001-560100",
          "600001-600100",
          "700001-700100",
          "500001-500100",
        ],
        /** Base Rate */
        baseRate: 80,
        /** Free Shipping Threshold */
        freeShippingThreshold: 1499,
        /** Estimated Days */
        estimatedDays: "2-4",
        /** Priority */
        priority: 3,
      },
      {
        /** Name */
        name: "Tier 1 Cities",
        /** States */
        states: ["Gujarat", "Rajasthan", "Maharashtra", "Uttar Pradesh"],
        /** Cities */
        cities: ["Ahmedabad", "Pune", "Jaipur", "Lucknow", "Kanpur"],
        /** Pincode Ranges */
        pincodeRanges: ["380001-390000", "411001-413999", "302001-304000"],
        /** Base Rate */
        baseRate: 100,
        /** Free Shipping Threshold */
        freeShippingThreshold: 1999,
        /** Estimated Days */
        estimatedDays: "3-5",
        /** Priority */
        priority: 4,
      },
      {
        /** Name */
        name: "Rest of India",
        /** States */
        states: ["All"],
        /** Cities */
        cities: [],
        /** Pincode Ranges */
        pincodeRanges: [],
        /** Base Rate */
        baseRate: 150,
        /** Free Shipping Threshold */
        freeShippingThreshold: 2499,
        /** Estimated Days */
        estimatedDays: "5-7",
        /** Priority */
        priority: 5,
      },
    ];

    for (const zone of shippingZones) {
      await db
        .collection(COLLECTIONS.SHIPPING_ZONES)
        .doc()
        .set({
          ...zone,
          /** Is Active */
          isActive: true,
          /** Weight Slabs */
          weightSlabs: [
            { upTo: 0.5, rate: zone.baseRate },
            { upTo: 1.0, rate: zone.baseRate + 20 },
            { upTo: 2.0, rate: zone.baseRate + 40 },
            { upTo: 5.0, rate: zone.baseRate + 80 },
          ],
          /** Created At */
          createdAt: timestamp,
          /** Updated At */
          updatedAt: timestamp,
        });
      counts.shippingZones++;
    }

    // 7. Shipping Carriers
    const carriers = [
      {
        /** Name */
        name: "Delhivery",
        /** Code */
        code: "DELHIVERY",
        trackingUrl: "https://www.delhivery.com/track/package/{trackingNumber}",
        /** Api Enabled */
        apiEnabled: true,
      },
      {
        /** Name */
        name: "Blue Dart",
        /** Code */
        code: "BLUEDART",
        trackingUrl: "https://www.bluedart.com/tracking/{trackingNumber}",
        /** Api Enabled */
        apiEnabled: true,
      },
      {
        /** Name */
        name: "DTDC",
        /** Code */
        code: "DTDC",
        /** Tracking Url */
        trackingUrl:
          "https://www.dtdc.in/tracking.asp?trackingNumber={trackingNumber}",
        /** Api Enabled */
        apiEnabled: true,
      },
      {
        /** Name */
        name: "India Post",
        /** Code */
        code: "INDIAPOST",
        /** Tracking Url */
        trackingUrl:
          "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?cno={trackingNumber}",
        /** Api Enabled */
        apiEnabled: false,
      },
    ];

    for (const carrier of carriers) {
      await db
        .collection(COLLECTIONS.SHIPPING_CARRIERS)
        .doc(carrier.code)
        .set({
          ...carrier,
          /** Is Active */
          isActive: true,
          /** Created At */
          createdAt: timestamp,
          /** Updated At */
          updatedAt: timestamp,
        });
    }

    // 8. Email Templates
    const emailTemplates = [
      {
        /** Id */
        id: "welcome",
        /** Name */
        name: "Welcome Email",
        /** Subject */
        subject: "Welcome to Letitrip - Let It Rip! 🌀",
        /** Template */
        template: `<h1>Welcome {{name}}!</h1><p>Thanks for joining India's premier collectibles platform.</p>`,
      },
      {
        /** Id */
        id: "order_confirmation",
        /** Name */
        name: "Order Confirmation",
        /** Subject */
        subject: "Order Confirmed - {{orderNumber}}",
        /** Template */
        template: `<h1>Order Confirmed!</h1><p>Hi {{name}}, your order {{orderNumber}} has been confirmed.</p>`,
      },
      {
        /** Id */
        id: "order_shipped",
        /** Name */
        name: "Order Shipped",
        /** Subject */
        subject: "Your Order is On the Way! 📦",
        /** Template */
        template: `<h1>Order Shipped!</h1><p>Your order {{orderNumber}} has been shipped. Track: {{trackingNumber}}</p>`,
      },
      {
        /** Id */
        id: "order_delivered",
        /** Name */
        name: "Order Delivered",
        /** Subject */
        subject: "Order Delivered ✅",
        /** Template */
        template: `<h1>Delivered!</h1><p>Your order {{orderNumber}} has been delivered. Enjoy!</p>`,
      },
      {
        /** Id */
        id: "auction_won",
        /** Name */
        name: "Auction Won",
        /** Subject */
        subject: "Congratulations! You Won the Auction 🏆",
        /** Template */
        template: `<h1>You Won!</h1><p>Congrats {{name}}, you won the auction for {{itemName}}!</p>`,
      },
      {
        /** Id */
        id: "bid_outbid",
        /** Name */
        name: "Bid Outbid",
        /** Subject */
        subject: "You've Been Outbid! ⚠️",
        /** Template */
        template: `<h1>Outbid Alert</h1><p>Someone outbid you on {{itemName}}. Place a higher bid!</p>`,
      },
      {
        /** Id */
        id: "payout_processed",
        /** Name */
        name: "Payout Processed",
        /** Subject */
        subject: "Payout Processed - ₹{{amount}}",
        /** Template */
        template: `<h1>Payout Processed</h1><p>Your payout of ₹{{amount}} has been processed.</p>`,
      },
      {
        /** Id */
        id: "password_reset",
        /** Name */
        name: "Password Reset",
        /** Subject */
        subject: "Reset Your Password",
        /** Template */
        template: `<h1>Password Reset</h1><p>Click here to reset: {{resetLink}}</p>`,
      },
    ];

    for (const template of emailTemplates) {
      await db
        .collection(COLLECTIONS.EMAIL_TEMPLATES)
        .doc(template.id)
        .set({
          ...template,
          /** Is Active */
          isActive: true,
          /** Created At */
          createdAt: timestamp,
          /** Updated At */
          updatedAt: timestamp,
        });
      counts.emailTemplates++;
    }

    // 9. Email Settings (Resend)
    await db
      .collection(COLLECTIONS.EMAIL_SETTINGS)
      .doc("resend")
      .set({
        /** Provider */
        provider: "resend",
        /** Api Key */
        apiKey: `${DEMO_PREFIX}re_demo_api_key_xxxxxxxxxxxx`,
        /** From Email */
        fromEmail: `${DEMO_PREFIX.toLowerCase()}noreply@letitrip.in`,
        /** From Name */
        fromName: "LET IT RIP - Letitrip",
        /** Reply To Email */
        replyToEmail: `${DEMO_PREFIX.toLowerCase()}support@letitrip.in`,
        /** Test Mode */
        testMode: true,
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.emailTemplates++;

    // 10. Notification Settings - Push
    await db
      .collection(COLLECTIONS.NOTIFICATION_SETTINGS)
      .doc("push")
      .set({
        /** Enabled */
        enabled: true,
        /** Provider */
        provider: "firebase",
        /** Firebase Config */
        firebaseConfig: {
          /** Api Key */
          apiKey: `${DEMO_PREFIX}AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`,
          /** Project Id */
          projectId: `${DEMO_PREFIX}letitrip-demo`,
          /** Messaging Sender Id */
          messagingSenderId: `${DEMO_PREFIX}123456789`,
          /** App Id */
          appId: `${DEMO_PREFIX}1:123456789:web:xxxxxxxxxxxxx`,
        },
        /** Vapid Key */
        vapidKey: `${DEMO_PREFIX}BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`,
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.notificationSettings++;

    // 11. Notification Settings - In-App
    await db
      .collection(COLLECTIONS.NOTIFICATION_SETTINGS)
      .doc("in_app")
      .set({
        /** Enabled */
        enabled: true,
        /** Retention Days */
        retentionDays: 30,
        /** Notification Types */
        notificationTypes: {
          order_updates: { enabled: true, sound: true, badge: true },
          auction_updates: { enabled: true, sound: true, badge: true },
          /** Messages */
          messages: { enabled: true, sound: true, badge: true },
          /** Promotions */
          promotions: { enabled: true, sound: false, badge: false },
          price_drops: { enabled: true, sound: false, badge: true },
          back_in_stock: { enabled: true, sound: false, badge: true },
        },
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.notificationSettings++;

    // 12. Notification Settings - SMS
    await db
      .collection(COLLECTIONS.NOTIFICATION_SETTINGS)
      .doc("sms")
      .set({
        /** Enabled */
        enabled: false,
        /** Provider */
        provider: "twilio",
        /** Credentials */
        credentials: {
          /** Account Sid */
          accountSid: `${DEMO_PREFIX}ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`,
          /** Auth Token */
          authToken: `${DEMO_PREFIX}encrypted_auth_token`,
          /** From Number */
          fromNumber: "+911234567890",
        },
        /** Templates */
        templates: {
          order_confirmation:
            "Your order {{orderNumber}} has been confirmed. Track: {{link}}",
          order_shipped:
            "Your order {{orderNumber}} is shipped! Track: {{trackingNumber}}",
          otp_verification: "Your OTP is {{otp}}. Valid for 10 minutes.",
        },
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.notificationSettings++;

    // 13. Feature Flags
    await db.collection(COLLECTIONS.FEATURE_FLAGS).doc("current").set({
      /** Auctions */
      auctions: true,
      /** Reviews */
      reviews: true,
      /** Cod */
      cod: true,
      /** Guest Checkout */
      guestCheckout: false,
      /** Wishlist */
      wishlist: true,
      /** Blog */
      blog: true,
      /** Seller Registration */
      sellerRegistration: true,
      /** Messaging */
      messaging: true,
      /** Riplimit */
      riplimit: true,
      /** Auto Renewal */
      autoRenewal: true,
      /** Social Login */
      socialLogin: true,
      /** Two Factor Auth */
      twoFactorAuth: false,
      /** Advanced Search */
      advancedSearch: true,
      /** Product Comparison */
      productComparison: true,
      /** Viewing History */
      viewingHistory: true,
      /** Recommendations */
      recommendations: true,
      /** Live Chat */
      liveChat: false,
      /** Affiliate Program */
      affiliateProgram: false,
      /** Subscriptions */
      subscriptions: false,
      /** Multi Currency */
      multiCurrency: false,
      /** International Shipping */
      internationalShipping: false,
      /** Created At */
      createdAt: timestamp,
      /** Updated At */
      updatedAt: timestamp,
    });
    counts.featureFlags++;

    // 14. Business Rules
    await db.collection(COLLECTIONS.BUSINESS_RULES).doc("current").set({
      /** Min Product Price */
      minProductPrice: 100,
      /** Max Product Price */
      maxProductPrice: 10000000,
      /** Min Auction Price */
      minAuctionPrice: 500,
      /** Max Auction Price */
      maxAuctionPrice: 10000000,
      /** Min Bid Increment */
      minBidIncrement: 50,
      /** Auction Extension Minutes */
      auctionExtensionMinutes: 5,
      /** Auction Extension Trigger Minutes */
      auctionExtensionTriggerMinutes: 2,
      /** Max Bids Per User */
      maxBidsPerUser: 100,
      /** Max Images Per Product */
      maxImagesPerProduct: 10,
      /** Max Videos Per Product */
      maxVideosPerProduct: 3,
      /** Max Product Title Length */
      maxProductTitleLength: 200,
      /** Max Product Description Length */
      maxProductDescriptionLength: 5000,
      /** Max Review Length */
      maxReviewLength: 1000,
      /** Min Review Length */
      minReviewLength: 10,
      platformCommission: 10, // percentage
      /** Seller Verification Required */
      sellerVerificationRequired: true,
      /** Buyer Verification Required */
      buyerVerificationRequired: false,
      /** Auto Approve Reviews */
      autoApproveReviews: false,
      /** Auto Approve Shops */
      autoApproveShops: false,
      defaultReturnWindow: 7, // days
      /** Max Return Window */
      maxReturnWindow: 30,
      /** Created At */
      createdAt: timestamp,
      /** Updated At */
      updatedAt: timestamp,
    });

    // 15. RipLimit Settings (E028)
    await db.collection(COLLECTIONS.RIPLIMIT_SETTINGS).doc("current").set({
      /** Enabled */
      enabled: true,
      conversionRate: 100, // 1 INR = 100 RipLimit
      minPurchase: 100, // 100 RipLimit = ₹1
      maxPurchase: 1000000, // 1M RipLimit = ₹10,000
      bidBlockAmount: 5000, // RipLimit blocked per bid
      /** Refund On Outbid */
      refundOnOutbid: true,
      refundDelay: 0, // instant
      /** Expiry Days */
      expiryDays: 365,
      /** Bonus On First Purchase */
      bonusOnFirstPurchase: 1000,
      /** Bonus On Referral */
      bonusOnReferral: 500,
      /** Created At */
      createdAt: timestamp,
      /** Updated At */
      updatedAt: timestamp,
    });

    // 16. Analytics Settings (E017)
    await db.collection(COLLECTIONS.ANALYTICS_SETTINGS).doc("current").set({
      /** Enabled */
      enabled: true,
      /** Data Retention Days */
      dataRetentionDays: 90,
      /** Track Page Views */
      trackPageViews: true,
      /** Track Events */
      trackEvents: true,
      /** Track User Behavior */
      trackUserBehavior: true,
      /** Track Conversions */
      trackConversions: true,
      /** Anonymize Ip */
      anonymizeIp: true,
      /** Export Enabled */
      exportEnabled: true,
      /** Realtime Enabled */
      realtimeEnabled: true,
      /** Created At */
      createdAt: timestamp,
      /** Updated At */
      updatedAt: timestamp,
    });

    // 17. Homepage Featured Sections Settings (E014)
    await db
      .collection(COLLECTIONS.HOMEPAGE_SETTINGS)
      .doc("current")
      .set({
        /** Hero Carousel */
        heroCarousel: {
          /** Enabled */
          enabled: true,
          /** Auto Play */
          autoPlay: true,
          /** Interval */
          interval: 5000,
          /** Show Arrows */
          showArrows: true,
          /** Show Dots */
          showDots: true,
          /** Transition */
          transition: "slide",
        },
        /** Sections */
        sections: {
          /** Value Proposition */
          valueProposition: {
            /** Enabled */
            enabled: true,
            /** Order */
            order: 1,
          },
          /** Categories */
          categories: {
            /** Enabled */
            enabled: true,
            /** Order */
            order: 2,
            /** Display Count */
            displayCount: 8,
            /** Layout */
            layout: "grid",
            /** Title */
            title: "Shop by Category",
            /** Subtitle */
            subtitle:
              "Browse our extensive collection of Beyblades and collectibles",
          },
          /** Products */
          products: {
            /** Enabled */
            enabled: true,
            /** Order */
            order: 3,
            /** Display Count */
            displayCount: 8,
            /** Layout */
            layout: "grid",
            /** Title */
            title: "Products",
            /** Subtitle */
            subtitle:
              "Discover our handpicked selection of authentic collectibles",
            /** Show Latest */
            showLatest: true,
            /** Show Featured */
            showFeatured: true,
          },
          /** Auctions */
          auctions: {
            /** Enabled */
            enabled: true,
            /** Order */
            order: 4,
            /** Display Count */
            displayCount: 6,
            /** Layout */
            layout: "grid",
            /** Title */
            title: "Live Auctions",
            /** Subtitle */
            subtitle: "Bid on exclusive collectibles and rare finds",
            /** Show Hot */
            showHot: true,
            /** Show Featured */
            showFeatured: true,
          },
          /** Shops */
          shops: {
            /** Enabled */
            enabled: true,
            /** Order */
            order: 5,
            /** Display Count */
            displayCount: 8,
            /** Layout */
            layout: "carousel",
            /** Title */
            title: "Featured Shops",
            /** Subtitle */
            subtitle: "Shop from our trusted verified sellers",
          },
          /** Reviews */
          reviews: {
            /** Enabled */
            enabled: true,
            /** Order */
            order: 6,
            /** Display Count */
            displayCount: 6,
            /** Layout */
            layout: "carousel",
            /** Title */
            title: "Customer Reviews",
            /** Subtitle */
            subtitle: "See what our customers say about their purchases",
          },
          /** Blogs */
          blogs: {
            /** Enabled */
            enabled: true,
            /** Order */
            order: 7,
            /** Display Count */
            displayCount: 3,
            /** Layout */
            layout: "grid",
            /** Title */
            title: "Latest from Our Blog",
            /** Subtitle */
            subtitle: "Collecting tips, news, and insights",
          },
        },
        /** Section Order */
        sectionOrder: [
          "valueProposition",
          "categories",
          "products",
          "auctions",
          "shops",
          "reviews",
          "blogs",
        ],
        /** Created At */
        createdAt: timestamp,
        /** Updated At */
        updatedAt: timestamp,
      });
    counts.settings++;

    return NextResponse.json({
      /** Success */
      success: true,
      /** Step */
      step: "settings",
      /** Data */
      data: counts,
      /** Message */
      message: "Admin content settings generated successfully",
    });
  } catch (error: unknown) {
    console.error("Demo settings error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate settings";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
