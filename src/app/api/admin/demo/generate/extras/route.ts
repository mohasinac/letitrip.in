/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/generate/extras/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { nanoid } from "nanoid";

const DEMO_PREFIX = "DEMO_";

// Beyblade-themed hero slide images
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1920&h=600&fit=crop",
];

// Hero slide mobile images
const HERO_MOBILE_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=750&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=750&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=750&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=750&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=750&h=1000&fit=crop",
];

// Hero slide videos
const HERO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
];

// Beyblade product images
const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop",
];

// Ticket attachment images
const TICKET_ATTACHMENTS = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop",
];

// Return/damage images
const RETURN_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=400&fit=crop",
];

// Ticket video attachments
const TICKET_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shops, buyers, users, products } = body;

    const db = getFirestoreAdmin();
    const timestamp = new Date();

    const counts = {
      /** Hero Slides */
      heroSlides: 0,
      /** Featured Sections */
      featuredSections: 0,
      /** Featured Shops */
      featuredShops: 0,
      /** Featured Categories */
      featuredCategories: 0,
      /** Carts */
      carts: 0,
      /** Favorites */
      favorites: 0,
      /** Notifications */
      notifications: 0,
      /** Tickets */
      tickets: 0,
      /** Returns */
      returns: 0,
      /** Conversations */
      conversations: 0,
      /** Messages */
      messages: 0,
      /** Coupons */
      coupons: 0,
      /** Settings */
      settings: 0,
      /** Feature Flags */
      featureFlags: 0,
    };

    // Hero Slides (10) with Beyblade-themed content
    const heroSlideData = [
      {
        /** Title */
        title: "Beyblade X Launch Sale",
        /** Subtitle */
        subtitle: "Up to 50% off on the latest X series",
        /** Cta */
        cta: "Shop Now",
        /** Cta Link */
        ctaLink: "/categories/beyblade-x",
      },
      {
        /** Title */
        title: "Rare Vintage Collection",
        /** Subtitle */
        subtitle: "Original series Beyblades in stock",
        /** Cta */
        cta: "Explore",
        /** Cta Link */
        ctaLink: "/categories/vintage-beyblades",
      },
      {
        /** Title */
        title: "Tournament Ready Gear",
        /** Subtitle */
        subtitle: "Pro launchers and stadiums",
        /** Cta */
        cta: "Shop Gear",
        /** Cta Link */
        ctaLink: "/categories/launchers-gear",
      },
      {
        /** Title */
        title: "Metal Fight Masters",
        /** Subtitle */
        subtitle: "Galaxy Pegasus & L-Drago available",
        /** Cta */
        cta: "View Collection",
        /** Cta Link */
        ctaLink: "/categories/metal-fight",
      },
      {
        /** Title */
        title: "Gold Edition Release",
        /** Subtitle */
        subtitle: "Limited gold plated Beyblades",
        /** Cta */
        cta: "Grab Now",
        /** Cta Link */
        ctaLink: "/categories/gold-series",
      },
      {
        /** Title */
        title: "Flash Sale - 24 Hours",
        /** Subtitle */
        subtitle: "Attack types at lowest prices",
        /** Cta */
        cta: "Shop Sale",
        /** Cta Link */
        ctaLink: "/categories/attack-types",
      },
      {
        /** Title */
        title: "Collector's Paradise",
        /** Subtitle */
        subtitle: "Sealed boxes and rare finds",
        /** Cta */
        cta: "Browse",
        /** Cta Link */
        ctaLink: "/categories/collector-items",
      },
      {
        /** Title */
        title: "Free Shipping Week",
        /** Subtitle */
        subtitle: "On orders above ₹2000",
        /** Cta */
        cta: "Shop Now",
        /** Cta Link */
        ctaLink: "/products",
      },
      {
        /** Title */
        title: "Live Auctions",
        /** Subtitle */
        subtitle: "Bid on rare collectible Beyblades",
        /** Cta */
        cta: "Join Auction",
        /** Cta Link */
        ctaLink: "/auctions",
      },
      {
        /** Title */
        title: "Blader Membership",
        /** Subtitle */
        subtitle: "Exclusive deals for members",
        /** Cta */
        cta: "Join Now",
        /** Cta Link */
        ctaLink: "/membership",
      },
    ];

    for (let i = 0; i < 10; i++) {
      const hasVideo = i < 2; // First 2 slides have video
      await db
        .collection(COLLECTIONS.HERO_SLIDES)
        .doc()
        .set({
          /** Title */
          title: `${DEMO_PREFIX}${heroSlideData[i].title}`,
          /** Subtitle */
          subtitle: heroSlideData[i].subtitle,
          /** Description */
          description: `Experience the best ${heroSlideData[i].title.toLowerCase()} at Letitrip`,
          image_url: HERO_IMAGES[i % HERO_IMAGES.length],
          mobile_image_url: HERO_MOBILE_IMAGES[i % HERO_MOBILE_IMAGES.length],
          video_url: hasVideo ? HERO_VIDEOS[i % HERO_VIDEOS.length] : null,
          cta_text: heroSlideData[i].cta,
          link_url: heroSlideData[i].ctaLink,
          secondary_cta_text: i % 2 === 0 ? "Learn More" : null,
          secondary_cta_link: i % 2 === 0 ? "/about" : null,
          background_color: [
            "#1a1a2e",
            "#16213e",
            "#0f3460",
            "#533483",
            "#e94560",
          ][i % 5],
          text_color: "#ffffff",
          /** Overlay */
          overlay: true,
          overlay_opacity: 0.4,
          /** Position */
          position: i + 1,
          is_active: i < 8,
          start_date: timestamp,
          end_date: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
          /** Analytics */
          analytics: {
            /** Views */
            views: Math.floor(Math.random() * 10000) + 1000,
            /** Clicks */
            clicks: Math.floor(Math.random() * 500) + 50,
            /** Ctr */
            ctr: (Math.random() * 5 + 1).toFixed(2),
          },
          created_at: timestamp,
          updated_at: timestamp,
        });
      counts.heroSlides++;
    }

    // Featured Sections for homepage - Beyblade focused
    const sectionTypes = [
      {
        /** Type */
        type: "featured_products",
        /** Title */
        title: "Featured Beyblades",
        /** Subtitle */
        subtitle: "Hand-picked for bladers",
        /** Display Count */
        displayCount: 8,
      },
      {
        /** Type */
        type: "new_arrivals",
        /** Title */
        title: "New Arrivals",
        /** Subtitle */
        subtitle: "Just landed",
        /** Display Count */
        displayCount: 12,
      },
      {
        /** Type */
        type: "best_sellers",
        /** Title */
        title: "Top Sellers",
        /** Subtitle */
        subtitle: "Fan favorites this week",
        /** Display Count */
        displayCount: 8,
      },
      {
        /** Type */
        type: "on_sale",
        /** Title */
        title: "Hot Deals",
        /** Subtitle */
        subtitle: "Limited time offers",
        /** Display Count */
        displayCount: 10,
      },
      {
        /** Type */
        type: "featured_auctions",
        /** Title */
        title: "Live Auctions",
        /** Subtitle */
        subtitle: "Bid on rare Beyblades",
        /** Display Count */
        displayCount: 6,
      },
      {
        /** Type */
        type: "featured_shops",
        /** Title */
        title: "Top Sellers",
        /** Subtitle */
        subtitle: "Verified Beyblade shops",
        /** Display Count */
        displayCount: 6,
      },
      {
        /** Type */
        type: "featured_categories",
        /** Title */
        title: "Shop by Type",
        /** Subtitle */
        subtitle: "Attack, Defense, Stamina",
        /** Display Count */
        displayCount: 8,
      },
      {
        /** Type */
        type: "vintage_collection",
        /** Title */
        title: "Vintage & Rare",
        /** Subtitle */
        subtitle: "Classic Beyblades",
        /** Display Count */
        displayCount: 8,
      },
    ];

    for (let i = 0; i < sectionTypes.length; i++) {
      await db
        .collection(COLLECTIONS.FEATURED_SECTIONS)
        .doc()
        .set({
          /** Type */
          type: sectionTypes[i].type,
          /** Title */
          title: `${DEMO_PREFIX}${sectionTypes[i].title}`,
          /** Subtitle */
          subtitle: sectionTypes[i].subtitle,
          background_image:
            i % 2 === 0 ? HERO_IMAGES[i % HERO_IMAGES.length] : null,
          background_color: i % 2 !== 0 ? "#f8f9fa" : null,
          sort_order: i + 1,
          is_active: true,
          display_count: sectionTypes[i].displayCount,
          /** Layout */
          layout: ["grid", "carousel", "list"][i % 3],
          show_view_all: true,
          view_all_link: `/products?section=${sectionTypes[i].type}`,
          product_ids: products ? products.slice(i * 5, (i + 1) * 5) : [],
          shop_ids: shops ? shops.slice(0, 6).map((s: any) => s.id) : [],
          created_at: timestamp,
          updated_at: timestamp,
        });
      counts.featuredSections++;
    }

    // Mark some shops as featured with Beyblade-related badges
    if (shops) {
      for (let i = 0; i < Math.min(10, shops.length); i++) {
        await db
          .collection(COLLECTIONS.SHOPS)
          .doc(shops[i].id)
          .update({
            /** Featured */
            featured: true,
            featured_order: i + 1,
            featured_badge: [
              "Pro Blader",
              "Authentic Seller",
              "Top Rated",
              "Fast Shipping",
              "Verified Collector",
            ][i % 5],
            featured_until: new Date(
              timestamp.getTime() + 30 * 24 * 60 * 60 * 1000,
            ),
          });
        counts.featuredShops++;
      }
    }

    // Coupons with Beyblade themed codes
    const couponData = [
      {
        /** Code */
        code: "LETITBEY10",
        /** Discount */
        discount: 10,
        /** Type */
        type: "percentage",
        /** Min Order */
        minOrder: 500,
        /** Max Discount */
        maxDiscount: 200,
      },
      {
        /** Code */
        code: "BURST100",
        /** Discount */
        discount: 100,
        /** Type */
        type: "fixed",
        /** Min Order */
        minOrder: 1000,
        /** Max Discount */
        maxDiscount: 100,
      },
      {
        /** Code */
        code: "FIRSTSPIN20",
        /** Discount */
        discount: 20,
        /** Type */
        type: "percentage",
        /** Min Order */
        minOrder: 800,
        /** Max Discount */
        maxDiscount: 500,
      },
      {
        /** Code */
        code: "FREESHIP",
        /** Discount */
        discount: 0,
        /** Type */
        type: "free_shipping",
        /** Min Order */
        minOrder: 1500,
        /** Max Discount */
        maxDiscount: 100,
      },
      {
        /** Code */
        code: "GOLDRUSH30",
        /** Discount */
        discount: 30,
        /** Type */
        type: "percentage",
        /** Min Order */
        minOrder: 2000,
        /** Max Discount */
        maxDiscount: 1000,
      },
    ];

    for (const coupon of couponData) {
      await db
        .collection(COLLECTIONS.COUPONS)
        .doc()
        .set({
          /** Code */
          code: `${DEMO_PREFIX}${coupon.code}`,
          /** Description */
          description: `Get ${coupon.type === "percentage" ? coupon.discount + "%" : "₹" + coupon.discount} off`,
          discount_type: coupon.type,
          discount_value: coupon.discount,
          min_order_amount: coupon.minOrder,
          max_discount: coupon.maxDiscount,
          usage_limit: 100,
          used_count: Math.floor(Math.random() * 50),
          is_active: true,
          valid_from: timestamp,
          valid_until: new Date(timestamp.getTime() + 60 * 24 * 60 * 60 * 1000),
          banner_image:
            HERO_IMAGES[couponData.indexOf(coupon) % HERO_IMAGES.length],
          applicable_categories: [],
          applicable_products: [],
          created_at: timestamp,
        });
      counts.coupons++;
    }

    // Carts with items (for first 20 buyers)
    if (buyers && products) {
      for (const buyer of buyers.slice(0, 20)) {
        const cartItems = [];
        const numItems = 1 + Math.floor(Math.random() * 3);
        let subtotal = 0;

        for (let i = 0; i < numItems; i++) {
          const price = 500 + Math.random() * 5000;
          cartItems.push({
            product_id: products[(buyers.indexOf(buyer) + i) % products.length],
            /** Quantity */
            quantity: 1 + Math.floor(Math.random() * 2),
            /** Price */
            price: Math.round(price),
            /** Image */
            image: PRODUCT_IMAGES[i % PRODUCT_IMAGES.length],
          });
          subtotal += price;
        }

        await db
          .collection(COLLECTIONS.CARTS)
          .doc()
          .set({
            user_id: buyer.id,
            /** Items */
            items: cartItems,
            item_count: cartItems.length,
            /** Subtotal */
            subtotal: Math.round(subtotal),
            updated_at: timestamp,
            created_at: timestamp,
          });
        counts.carts++;
      }
    }

    // Favorites with product details
    if (buyers && products) {
      for (const buyer of buyers) {
        const numFavorites = 2 + Math.floor(Math.random() * 4);
        for (let f = 0; f < numFavorites; f++) {
          await db
            .collection(COLLECTIONS.FAVORITES)
            .doc()
            .set({
              user_id: buyer.id,
              item_id:
                products[(buyers.indexOf(buyer) * 3 + f) % products.length],
              item_type: "product",
              created_at: timestamp,
            });
          counts.favorites++;
        }
        // Also add some auction favorites
        await db
          .collection(COLLECTIONS.FAVORITES)
          .doc()
          .set({
            user_id: buyer.id,
            item_id: `auction_${buyer.id}_fav`,
            item_type: "auction",
            created_at: timestamp,
          });
        counts.favorites++;
      }
    }

    // Notifications with rich content
    if (users) {
      const notificationTypes = [
        {
          /** Type */
          type: "order_shipped",
          /** Title */
          title: "Your order is on the way!",
          /** Icon */
          icon: "truck",
        },
        {
          /** Type */
          type: "price_drop",
          /** Title */
          title: "Price dropped on your wishlist item!",
          /** Icon */
          icon: "tag",
        },
        {
          /** Type */
          type: "auction_ending",
          /** Title */
          title: "Auction ending soon!",
          /** Icon */
          icon: "clock",
        },
        {
          /** Type */
          type: "new_message",
          /** Title */
          title: "You have a new message",
          /** Icon */
          icon: "message",
        },
        { type: "review_reminder", title: "Share your feedback", icon: "star" },
        { type: "promo", title: "Exclusive offer just for you!", icon: "gift" },
      ];

      for (const user of users.slice(0, 50)) {
        const notif =
          notificationTypes[users.indexOf(user) % notificationTypes.length];
        await db
          .collection(COLLECTIONS.NOTIFICATIONS)
          .doc()
          .set({
            /** User Id */
            userId: user.id,
            /** Type */
            type: notif.type,
            /** Title */
            title: notif.title,
            /** Message */
            message: `Hey ${user.name}, ${notif.title.toLowerCase()}`,
            /** Icon */
            icon: notif.icon,
            /** Image */
            image: PRODUCT_IMAGES[users.indexOf(user) % PRODUCT_IMAGES.length],
            /** Action Url */
            actionUrl: "/orders",
            /** Is Read */
            isRead: Math.random() > 0.6,
            /** Created At */
            createdAt: timestamp,
          });
        counts.notifications++;
      }
    }

    // Support Tickets with Beyblade-related issues
    if (buyers) {
      const ticketCategories = [
        {
          /** Category */
          category: "order_issue",
          /** Subject */
          subject: "Beyblade order not received",
          /** Priority */
          priority: "high",
        },
        {
          /** Category */
          category: "payment",
          /** Subject */
          subject: "Payment failed for launcher purchase",
          /** Priority */
          priority: "high",
        },
        {
          /** Category */
          category: "shipping",
          /** Subject */
          subject: "Wrong tracking for stadium order",
          /** Priority */
          priority: "medium",
        },
        {
          /** Category */
          category: "product_inquiry",
          /** Subject */
          subject: "Is this Beyblade authentic Takara Tomy?",
          /** Priority */
          priority: "low",
        },
        {
          /** Category */
          category: "return_request",
          /** Subject */
          subject: "Want to return damaged Beyblade",
          /** Priority */
          priority: "medium",
        },
        {
          /** Category */
          category: "refund",
          /** Subject */
          subject: "Refund not processed for cancelled order",
          /** Priority */
          priority: "high",
        },
        {
          /** Category */
          category: "account",
          /** Subject */
          subject: "Cannot login to my blader account",
          /** Priority */
          priority: "medium",
        },
        {
          /** Category */
          category: "technical",
          /** Subject */
          subject: "Product images not loading",
          /** Priority */
          priority: "low",
        },
      ];

      for (let t = 0; t < 40; t++) {
        const ticketData = ticketCategories[t % ticketCategories.length];
        const hasAttachment = Math.random() > 0.5;
        const hasVideo = Math.random() > 0.8;

        await db
          .collection(COLLECTIONS.SUPPORT_TICKETS)
          .doc()
          .set({
            /** Ticket Number */
            ticketNumber: `${DEMO_PREFIX}TKT-${String(t + 1).padStart(5, "0")}`,
            /** User Id */
            userId: buyers[t % buyers.length].id,
            /** User Name */
            userName: buyers[t % buyers.length].name,
            /** User Email */
            userEmail: `${buyers[t % buyers.length].name.toLowerCase().replace(/\s/g, ".")}@demo.letitrip.in`,
            /** Category */
            category: ticketData.category,
            /** Subject */
            subject: ticketData.subject,
            /** Description */
            description: `I need help with: ${ticketData.subject}. Please assist me as soon as possible.`,
            /** Priority */
            priority: ticketData.priority,
            /** Status */
            status: [
              "open",
              "in_progress",
              "waiting_on_customer",
              "resolved",
              "closed",
            ][t % 5],
            /** Attachments */
            attachments: hasAttachment
              ? [
                  {
                    /** Type */
                    type: "image",
                    /** Url */
                    url: TICKET_ATTACHMENTS[t % TICKET_ATTACHMENTS.length],
                    /** Name */
                    name: "screenshot.jpg",
                  },
                ]
              : [],
            /** Videos */
            videos: hasVideo
              ? [
                  {
                    /** Url */
                    url: TICKET_VIDEOS[t % TICKET_VIDEOS.length],
                    /** Name */
                    name: "screen_recording.mp4",
                  },
                ]
              : [],
            /** Assigned To */
            assignedTo: t % 3 === 0 ? "support_agent_1" : null,
            /** Tags */
            tags: [ticketData.category, ticketData.priority],
            /** Response Time */
            responseTime:
              t % 2 === 0 ? Math.floor(Math.random() * 24) + 1 : null, // hours
            /** Satisfaction */
            satisfaction:
              t % 5 === 4 ? Math.floor(Math.random() * 2) + 4 : null, // 4-5 stars
            /** Created At */
            createdAt: new Date(
              timestamp.getTime() -
                Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000,
            ),
            /** Updated At */
            updatedAt: timestamp,
          });
        counts.tickets++;
      }
    }

    // Returns with Beyblade-specific reasons
    if (buyers && products && shops) {
      const returnReasons = [
        "Beyblade tip damaged during shipping",
        "Wrong Beyblade type received",
        "Beyblade not spinning properly",
        "Missing launcher in the package",
        "Found authentic version at better price",
      ];

      for (let r = 0; r < 25; r++) {
        const buyer = buyers[r % buyers.length];
        const shop = shops[r % shops.length];
        const hasImages = Math.random() > 0.3;

        await db
          .collection(COLLECTIONS.RETURNS)
          .doc()
          .set({
            return_number: `${DEMO_PREFIX}RET-${String(r + 1).padStart(5, "0")}`,
            order_id: `order_${r}`,
            order_number: `${DEMO_PREFIX}ORD-${String(r + 1).padStart(6, "0")}`,
            user_id: buyer.id,
            user_name: buyer.name,
            shop_id: shop.id,
            product_id: products[r % products.length],
            /** Reason */
            reason: returnReasons[r % returnReasons.length],
            /** Description */
            description: `${returnReasons[r % returnReasons.length]}. Please process my return request.`,
            /** Status */
            status: ["pending", "approved", "rejected", "completed"][r % 4],
            /** Media */
            media: hasImages
              ? [
                  RETURN_IMAGES[r % RETURN_IMAGES.length],
                  RETURN_IMAGES[(r + 1) % RETURN_IMAGES.length],
                ]
              : [],
            refund_amount: Math.round(500 + Math.random() * 5000),
            refund_method: ["original_payment", "wallet", "bank_transfer"][
              r % 3
            ],
            pickup_scheduled: r % 3 === 0,
            pickup_date:
              r % 3 === 0
                ? new Date(timestamp.getTime() + 2 * 24 * 60 * 60 * 1000)
                : null,
            created_at: new Date(
              timestamp.getTime() -
                Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000,
            ),
            updated_at: timestamp,
          });
        counts.returns++;
      }
    }

    // Conversations and Messages
    if (buyers && shops) {
      for (let c = 0; c < 20; c++) {
        const buyer = buyers[c % buyers.length];
        const shop = shops[c % shops.length];
        const conversationId = `conv_${nanoid(10)}`;

        await db
          .collection(COLLECTIONS.CONVERSATIONS)
          .doc(conversationId)
          .set({
            /** Participants */
            participants: [buyer.id, shop.ownerId],
            /** Participant Names */
            participantNames: [buyer.name, shop.name],
            /** Type */
            type: "buyer_seller",
            /** Shop Id */
            shopId: shop.id,
            /** Last Message */
            lastMessage: "Thanks for your query!",
            /** Last Message At */
            lastMessageAt: timestamp,
            /** Unread Count */
            unreadCount: { [buyer.id]: 0, [shop.ownerId]: 1 },
            /** Created At */
            createdAt: timestamp,
          });
        counts.conversations++;

        // Add messages to conversation
        const messages = [
          { sender: buyer.id, text: "Hi, is this item available?" },
          {
            /** Sender */
            sender: shop.ownerId,
            /** Text */
            text: "Yes, it's available! Would you like to purchase?",
          },
          { sender: buyer.id, text: "What's the best price you can offer?" },
          {
            /** Sender */
            sender: shop.ownerId,
            /** Text */
            text: "I can offer 10% discount on this item.",
          },
          { sender: buyer.id, text: "Great, I'll place the order now!" },
          { sender: shop.ownerId, text: "Thanks for your query!" },
        ];

        for (let m = 0; m < messages.length; m++) {
          await db
            .collection(COLLECTIONS.MESSAGES)
            .doc()
            .set({
              conversationId,
              /** Sender Id */
              senderId: messages[m].sender,
              /** Text */
              text: messages[m].text,
              /** Type */
              type: "text",
              /** Is Read */
              isRead: m < messages.length - 1,
              /** Created At */
              createdAt: new Date(
                timestamp.getTime() - (messages.length - m) * 60 * 1000,
              ),
            });
          counts.messages++;
        }
      }
    }

    // Update shop counts
    if (shops) {
      for (const shop of shops) {
        await db.collection(COLLECTIONS.SHOPS).doc(shop.id).update({
          product_count: 20,
          total_products: 20,
          auction_count: 5,
        });
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Step */
      step: "extras",
      /** Data */
      data: counts,
    });
  } catch (error: unknown) {
    console.error("Demo extras error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate extras";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
