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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shops, buyers, users, products } = body;

    const db = getFirestoreAdmin();
    const timestamp = new Date();

    const counts = {
      heroSlides: 0,
      featuredSections: 0,
      featuredShops: 0,
      featuredCategories: 0,
      carts: 0,
      favorites: 0,
      notifications: 0,
      tickets: 0,
      returns: 0,
      conversations: 0,
      messages: 0,
      coupons: 0,
      settings: 0,
      featureFlags: 0,
    };

    // Hero Slides (10) with Beyblade-themed content
    const heroSlideData = [
      {
        title: "Beyblade X Launch Sale",
        subtitle: "Up to 50% off on the latest X series",
        cta: "Shop Now",
        ctaLink: "/categories/beyblade-x",
      },
      {
        title: "Rare Vintage Collection",
        subtitle: "Original series Beyblades in stock",
        cta: "Explore",
        ctaLink: "/categories/vintage-beyblades",
      },
      {
        title: "Tournament Ready Gear",
        subtitle: "Pro launchers and stadiums",
        cta: "Shop Gear",
        ctaLink: "/categories/launchers-gear",
      },
      {
        title: "Metal Fight Masters",
        subtitle: "Galaxy Pegasus & L-Drago available",
        cta: "View Collection",
        ctaLink: "/categories/metal-fight",
      },
      {
        title: "Gold Edition Release",
        subtitle: "Limited gold plated Beyblades",
        cta: "Grab Now",
        ctaLink: "/categories/gold-series",
      },
      {
        title: "Flash Sale - 24 Hours",
        subtitle: "Attack types at lowest prices",
        cta: "Shop Sale",
        ctaLink: "/categories/attack-types",
      },
      {
        title: "Collector's Paradise",
        subtitle: "Sealed boxes and rare finds",
        cta: "Browse",
        ctaLink: "/categories/collector-items",
      },
      {
        title: "Free Shipping Week",
        subtitle: "On orders above ₹2000",
        cta: "Shop Now",
        ctaLink: "/products",
      },
      {
        title: "Live Auctions",
        subtitle: "Bid on rare collectible Beyblades",
        cta: "Join Auction",
        ctaLink: "/auctions",
      },
      {
        title: "Blader Membership",
        subtitle: "Exclusive deals for members",
        cta: "Join Now",
        ctaLink: "/membership",
      },
    ];

    for (let i = 0; i < 10; i++) {
      const hasVideo = i < 2; // First 2 slides have video
      await db
        .collection(COLLECTIONS.HERO_SLIDES)
        .doc()
        .set({
          title: `${DEMO_PREFIX}${heroSlideData[i].title}`,
          subtitle: heroSlideData[i].subtitle,
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
          overlay: true,
          overlay_opacity: 0.4,
          position: i + 1,
          is_active: i < 8,
          start_date: timestamp,
          end_date: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
          analytics: {
            views: Math.floor(Math.random() * 10000) + 1000,
            clicks: Math.floor(Math.random() * 500) + 50,
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
        type: "featured_products",
        title: "Featured Beyblades",
        subtitle: "Hand-picked for bladers",
        displayCount: 8,
      },
      {
        type: "new_arrivals",
        title: "New Arrivals",
        subtitle: "Just landed",
        displayCount: 12,
      },
      {
        type: "best_sellers",
        title: "Top Sellers",
        subtitle: "Fan favorites this week",
        displayCount: 8,
      },
      {
        type: "on_sale",
        title: "Hot Deals",
        subtitle: "Limited time offers",
        displayCount: 10,
      },
      {
        type: "featured_auctions",
        title: "Live Auctions",
        subtitle: "Bid on rare Beyblades",
        displayCount: 6,
      },
      {
        type: "featured_shops",
        title: "Top Sellers",
        subtitle: "Verified Beyblade shops",
        displayCount: 6,
      },
      {
        type: "featured_categories",
        title: "Shop by Type",
        subtitle: "Attack, Defense, Stamina",
        displayCount: 8,
      },
      {
        type: "vintage_collection",
        title: "Vintage & Rare",
        subtitle: "Classic Beyblades",
        displayCount: 8,
      },
    ];

    for (let i = 0; i < sectionTypes.length; i++) {
      await db
        .collection(COLLECTIONS.FEATURED_SECTIONS)
        .doc()
        .set({
          type: sectionTypes[i].type,
          title: `${DEMO_PREFIX}${sectionTypes[i].title}`,
          subtitle: sectionTypes[i].subtitle,
          background_image:
            i % 2 === 0 ? HERO_IMAGES[i % HERO_IMAGES.length] : null,
          background_color: i % 2 !== 0 ? "#f8f9fa" : null,
          sort_order: i + 1,
          is_active: true,
          display_count: sectionTypes[i].displayCount,
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
        code: "LETITBEY10",
        discount: 10,
        type: "percentage",
        minOrder: 500,
        maxDiscount: 200,
      },
      {
        code: "BURST100",
        discount: 100,
        type: "fixed",
        minOrder: 1000,
        maxDiscount: 100,
      },
      {
        code: "FIRSTSPIN20",
        discount: 20,
        type: "percentage",
        minOrder: 800,
        maxDiscount: 500,
      },
      {
        code: "FREESHIP",
        discount: 0,
        type: "free_shipping",
        minOrder: 1500,
        maxDiscount: 100,
      },
      {
        code: "GOLDRUSH30",
        discount: 30,
        type: "percentage",
        minOrder: 2000,
        maxDiscount: 1000,
      },
    ];

    for (const coupon of couponData) {
      await db
        .collection(COLLECTIONS.COUPONS)
        .doc()
        .set({
          code: `${DEMO_PREFIX}${coupon.code}`,
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
            quantity: 1 + Math.floor(Math.random() * 2),
            price: Math.round(price),
            image: PRODUCT_IMAGES[i % PRODUCT_IMAGES.length],
          });
          subtotal += price;
        }

        await db
          .collection(COLLECTIONS.CARTS)
          .doc()
          .set({
            user_id: buyer.id,
            items: cartItems,
            item_count: cartItems.length,
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
          type: "order_shipped",
          title: "Your order is on the way!",
          icon: "truck",
        },
        {
          type: "price_drop",
          title: "Price dropped on your wishlist item!",
          icon: "tag",
        },
        {
          type: "auction_ending",
          title: "Auction ending soon!",
          icon: "clock",
        },
        {
          type: "new_message",
          title: "You have a new message",
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
            userId: user.id,
            type: notif.type,
            title: notif.title,
            message: `Hey ${user.name}, ${notif.title.toLowerCase()}`,
            icon: notif.icon,
            image: PRODUCT_IMAGES[users.indexOf(user) % PRODUCT_IMAGES.length],
            actionUrl: "/orders",
            isRead: Math.random() > 0.6,
            createdAt: timestamp,
          });
        counts.notifications++;
      }
    }

    // Support Tickets with Beyblade-related issues
    if (buyers) {
      const ticketCategories = [
        {
          category: "order_issue",
          subject: "Beyblade order not received",
          priority: "high",
        },
        {
          category: "payment",
          subject: "Payment failed for launcher purchase",
          priority: "high",
        },
        {
          category: "shipping",
          subject: "Wrong tracking for stadium order",
          priority: "medium",
        },
        {
          category: "product_inquiry",
          subject: "Is this Beyblade authentic Takara Tomy?",
          priority: "low",
        },
        {
          category: "return_request",
          subject: "Want to return damaged Beyblade",
          priority: "medium",
        },
        {
          category: "refund",
          subject: "Refund not processed for cancelled order",
          priority: "high",
        },
        {
          category: "account",
          subject: "Cannot login to my blader account",
          priority: "medium",
        },
        {
          category: "technical",
          subject: "Product images not loading",
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
            ticketNumber: `${DEMO_PREFIX}TKT-${String(t + 1).padStart(5, "0")}`,
            userId: buyers[t % buyers.length].id,
            userName: buyers[t % buyers.length].name,
            userEmail: `${buyers[t % buyers.length].name.toLowerCase().replace(/\s/g, ".")}@demo.letitrip.in`,
            category: ticketData.category,
            subject: ticketData.subject,
            description: `I need help with: ${ticketData.subject}. Please assist me as soon as possible.`,
            priority: ticketData.priority,
            status: [
              "open",
              "in_progress",
              "waiting_on_customer",
              "resolved",
              "closed",
            ][t % 5],
            attachments: hasAttachment
              ? [
                  {
                    type: "image",
                    url: TICKET_ATTACHMENTS[t % TICKET_ATTACHMENTS.length],
                    name: "screenshot.jpg",
                  },
                ]
              : [],
            videos: hasVideo
              ? [
                  {
                    url: TICKET_VIDEOS[t % TICKET_VIDEOS.length],
                    name: "screen_recording.mp4",
                  },
                ]
              : [],
            assignedTo: t % 3 === 0 ? "support_agent_1" : null,
            tags: [ticketData.category, ticketData.priority],
            responseTime:
              t % 2 === 0 ? Math.floor(Math.random() * 24) + 1 : null, // hours
            satisfaction:
              t % 5 === 4 ? Math.floor(Math.random() * 2) + 4 : null, // 4-5 stars
            createdAt: new Date(
              timestamp.getTime() -
                Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000,
            ),
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
            reason: returnReasons[r % returnReasons.length],
            description: `${returnReasons[r % returnReasons.length]}. Please process my return request.`,
            status: ["pending", "approved", "rejected", "completed"][r % 4],
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
            participants: [buyer.id, shop.ownerId],
            participantNames: [buyer.name, shop.name],
            type: "buyer_seller",
            shopId: shop.id,
            lastMessage: "Thanks for your query!",
            lastMessageAt: timestamp,
            unreadCount: { [buyer.id]: 0, [shop.ownerId]: 1 },
            createdAt: timestamp,
          });
        counts.conversations++;

        // Add messages to conversation
        const messages = [
          { sender: buyer.id, text: "Hi, is this item available?" },
          {
            sender: shop.ownerId,
            text: "Yes, it's available! Would you like to purchase?",
          },
          { sender: buyer.id, text: "What's the best price you can offer?" },
          {
            sender: shop.ownerId,
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
              senderId: messages[m].sender,
              text: messages[m].text,
              type: "text",
              isRead: m < messages.length - 1,
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
      success: true,
      step: "extras",
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
