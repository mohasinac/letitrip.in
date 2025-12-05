/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/generate-complete/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { faker } from "@faker-js/faker";
import { NextRequest, NextResponse } from "next/server";

/**
 * PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for prefix
 */
const PREFIX = "TEST_";

// Unsplash image categories
const UNSPLASH_CATEGORIES = [
  "product",
  "technology",
  "fashion",
  "furniture",
  "food",
  "jewelry",
  "electronics",
  "sports",
  "books",
  "toys",
];

/**
 * Retrieves unsplash image
 */
/**
 * Retrieves unsplash image
 *
 * @param {string} category - The category
 * @param {number} index - The index
 *
 * @returns {string} The unsplashimage result
 */

/**
 * Retrieves unsplash image
 *
 * @param {string} category - The category
 * @param {number} index - The index
 *
 * @returns {string} The unsplashimage result
 */

function getUnsplashImage(category: string, index: number): string {
  return `https://source.unsplash.com/800x600/?${category}&sig=${index}`;
}

/**
 * Function: P O S T
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
    const config = await req.json();
    const db = getFirestoreAdmin();

    const stats = {
      /** Users */
      users: 0,
      /** Shops */
      shops: 0,
      /** Categories */
      categories: 0,
      /** Products */
      products: 0,
      /** Auctions */
      auctions: 0,
      /** Reviews */
      reviews: 0,
      /** Orders */
      orders: 0,
      /** Tickets */
      tickets: 0,
      /** Coupons */
      coupons: 0,
      /** Hero Slides */
      heroSlides: 0,
      /** Featured Products */
      featuredProducts: 0,
      /** Featured Auctions */
      featuredAuctions: 0,
      /** Featured Shops */
      featuredShops: 0,
      /** Homepage Items */
      homepageItems: 0,
    };

    // Step 1: Generate Categories First
    const categories = [];
    const categoryNames = [
      "Electronics",
      "Fashion",
      "Home & Kitchen",
      "Books",
      "Sports",
      "Toys",
      "Jewelry",
      "Beauty",
      "Automotive",
      "Garden",
    ];

    for (const name of categoryNames) {
      const categoryData: any = {
        /** Name */
        name: `${PREFIX}${name}`,
        /** Slug */
        slug: `${PREFIX}${name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${Date.now()}`,
        /** Description */
        description: `Test category for ${name}`,
        parent_id: null,
        /** Path */
        path: name.toLowerCase().replace(/\s+/g, "-"),
        /** Level */
        level: 0,
        has_children: false,
        child_count: 0,
        is_active: true,
        is_featured: Math.random() < 0.3,
        show_on_homepage: Math.random() < config.homepagePercentage / 100,
        sort_order: categories.length,
        product_count: 0,
        /** Image */
        image: getUnsplashImage(name.toLowerCase(), categories.length),
        commission_rate: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await db
        .collection(COLLECTIONS.CATEGORIES)
        .add(categoryData);
      categories.push({ id: docRef.id, ...categoryData });
      stats.categories++;
    }

    // Step 2: Generate Users
    const users = [];
    for (let i = 0; i < config.users; i++) {
      /**
       * Retrieves user role
       *
       * @param {number} index - The index
       * @param {number} total - The total
       *
       * @returns {number} The userrole result
       */

      /**
       * Retrieves user role
       *
       * @param {number} index - The index
       * @param {number} total - The total
       *
       * @returns {number} The userrole result
       */

      const getUserRole = (index: number, total: number) => {
        if (index === 0) return "admin";
        if (index < total * 0.3) return "seller";
        return "user";
      };
      const userData = {
        /** Email */
        email: `${PREFIX}user${i + 1}_${Date.now()}@example.com`,
        /** Name */
        name: `${PREFIX}${faker.person.fullName()}`,
        /** Phone */
        phone: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`,
        /** Role */
        role: getUserRole(i, config.users),
        is_banned: false,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        /** Profile */
        profile: {
          avatar: `https://ui-avatars.com/api/?name=${PREFIX}User${
            i + 1
          }&background=random`,
          /** Bio */
          bio: faker.lorem.sentence(),
        },
      };

      const docRef = await db.collection(COLLECTIONS.USERS).add(userData);
      users.push({ id: docRef.id, ...userData });
      stats.users++;
    }

    // Step 3: Generate Shops
    const shops = [];
    let shopIndex = 0;
    for (const user of users) {
      if (user.role !== "seller" && user.role !== "admin") continue;

      for (let i = 0; i < config.shopsPerUser; i++) {
        const shopName = `${PREFIX}${faker.company.name()} Shop`;

        // Ensure first 3 shops are featured and on homepage
        const shouldBeFeatured =
          shopIndex < 3 || Math.random() < config.featuredPercentage / 100;
        const shouldBeOnHomepage =
          shopIndex < 3 || Math.random() < config.homepagePercentage / 100;

        const shopData: any = {
          owner_id: user.id,
          /** Name */
          name: shopName,
          /** Slug */
          slug: `${PREFIX}${shopName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${i}`,
          /** Description */
          description: faker.company.catchPhrase(),
          /** Email */
          email: `shop_${user.email}`,
          /** Phone */
          phone: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`,
          /** Location */
          location: faker.location.city() + ", India",
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            shopName
          )}&background=random`,
          /** Banner */
          banner: getUnsplashImage("shop", shops.length),
          /** Rating */
          rating: parseFloat(
            faker.number
              .float({ min: 3.5, max: 5.0, fractionDigits: 1 })
              .toFixed(1)
          ),
          review_count: faker.number.int({ min: 0, max: 100 }),
          product_count: 0,
          is_verified: true, // Always verify for featured shops
          is_featured: shouldBeFeatured,
          show_on_homepage: shouldBeOnHomepage,
          is_banned: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (shopData.is_featured) stats.featuredShops++;
        if (shopData.show_on_homepage) stats.homepageItems++;

        shopIndex++;

        const docRef = await db.collection(COLLECTIONS.SHOPS).add(shopData);
        shops.push({ id: docRef.id, ...shopData });
        stats.shops++;
      }
    }

    // Step 4: Generate Products
    const products = [];
    for (const shop of shops) {
      for (let i = 0; i < config.productsPerShop; i++) {
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const productName = `${PREFIX}${faker.commerce.productName()}`;
        const price = faker.number.int({ min: 500, max: 50000 });

        const productData: any = {
          shop_id: shop.id,
          seller_id: shop.owner_id,
          category_id: category.id,
          /** Name */
          name: productName,
          /** Slug */
          slug: `${PREFIX}${productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${i}`,
          /** Description */
          description: faker.commerce.productDescription(),
          price,
          original_price: price + faker.number.int({ min: 100, max: 5000 }),
          /** Sku */
          sku: `${PREFIX}SKU${Date.now()}${i}`,
          stock_count: faker.number.int({ min: 10, max: 100 }),
          low_stock_threshold: 5,
          /** Status */
          status: Math.random() < 0.8 ? "published" : "draft",
          is_featured: Math.random() < config.featuredPercentage / 100,
          is_deleted: false,
          /** Condition */
          condition: faker.helpers.arrayElement([
            "new",
            "like-new",
            "good",
            "fair",
          ]),
          /** Brand */
          brand: faker.company.name(),
          /** Images */
          images: [
            getUnsplashImage(
              category.name.replace(PREFIX, "").toLowerCase(),
              products.length
            ),
            getUnsplashImage(
              category.name.replace(PREFIX, "").toLowerCase(),
              products.length + 1000
            ),
          ],
          /** Rating */
          rating: parseFloat(
            faker.number
              .float({ min: 3.0, max: 5.0, fractionDigits: 1 })
              .toFixed(1)
          ),
          review_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (productData.is_featured) stats.featuredProducts++;

        const docRef = await db
          .collection(COLLECTIONS.PRODUCTS)
          .add(productData);
        products.push({ id: docRef.id, ...productData });
        stats.products++;
      }
    }

    // Update category product counts
    /**
 * Performs category product counts operation
 *
 * @param {any} (product - The (product
 *
 * @returns {any} The categoryproductcounts result
 *
 */
const categoryProductCounts: { [key: string]: number } = {};
    products.forEach((product) => {
      if (product.category_id) {
        categoryProductCounts[product.category_id] =
          (categoryProductCounts[product.category_id] || 0) + 1;
      }
    });

    for (const [categoryId, count] of Object.entries(categoryProductCounts)) {
      await db.collection(COLLECTIONS.CATEGORIES).doc(categoryId).update({
        product_count: count,
      });
    }

    // Step 5: Generate Auctions
    const auctions = [];
    for (const shop of shops) {
      for (let i = 0; i < config.auctionsPerShop; i++) {
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const auctionName = `${PREFIX}${faker.commerce.productName()} Auction`;
        const startingBid = faker.number.int({ min: 1000, max: 10000 });

        const now = new Date();
        const startTime = new Date(
          now.getTime() + faker.number.int({ min: 0, max: 24 }) * 3600000
        );
        const endTime = new Date(
          startTime.getTime() +
            faker.number.int({ min: 48, max: 168 }) * 3600000
        );

        const auctionData: any = {
          shop_id: shop.id,
          seller_id: shop.owner_id,
          category_id: category.id,
          /** Name */
          name: auctionName,
          /** Slug */
          slug: `${PREFIX}${auctionName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${i}`,
          /** Description */
          description: faker.commerce.productDescription(),
          starting_bid: startingBid,
          current_bid: startingBid,
          reserve_price:
            startingBid + faker.number.int({ min: 500, max: 5000 }),
          bid_count: 0,
          /** Status */
          status:
            Math.random() < 0.5
              ? "live"
              : Math.random() < 0.5
              ? "scheduled"
              : "draft",
          is_featured: Math.random() < config.featuredPercentage / 100,
          show_on_homepage: Math.random() < config.homepagePercentage / 100,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          /** Images */
          images: [
            getUnsplashImage(
              category.name.replace(PREFIX, "").toLowerCase(),
              auctions.length + 5000
            ),
            getUnsplashImage(
              category.name.replace(PREFIX, "").toLowerCase(),
              auctions.length + 6000
            ),
          ],
          /** Condition */
          condition: faker.helpers.arrayElement([
            "new",
            "like-new",
            "good",
            "fair",
          ]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (auctionData.is_featured) stats.featuredAuctions++;
        if (auctionData.show_on_homepage) stats.homepageItems++;

        const docRef = await db
          .collection(COLLECTIONS.AUCTIONS)
          .add(auctionData);
        auctions.push({ id: docRef.id, ...auctionData });
        stats.auctions++;
      }
    }

    // Step 6: Generate Reviews
    for (const product of products.slice(0, Math.min(products.length, 50))) {
      const reviewCount = Math.min(config.reviewsPerProduct, 5);

      for (let i = 0; i < reviewCount; i++) {
        const reviewer = users[Math.floor(Math.random() * users.length)];
        const reviewData = {
          product_id: product.id,
          shop_id: product.shop_id,
          user_id: reviewer.id,
          /** Rating */
          rating: faker.number.int({ min: 3, max: 5 }),
          /** Title */
          title: `${PREFIX}${faker.lorem.sentence().slice(0, 50)}`,
          /** Comment */
          comment: faker.lorem.paragraph(),
          is_verified_purchase: Math.random() < 0.7,
          is_approved: Math.random() < 0.9,
          is_featured: Math.random() < config.featuredPercentage / 100,
          helpful_count: faker.number.int({ min: 0, max: 50 }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await db.collection(COLLECTIONS.REVIEWS).add(reviewData);
        stats.reviews++;
      }
    }

    // Step 7: Generate Orders
    for (const user of users) {
      for (let i = 0; i < config.ordersPerUser; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = faker.number.int({ min: 1, max: 3 });
        const itemTotal = product.price * quantity;

        const orderData = {
          user_id: user.id,
          shop_id: product.shop_id,
          order_number: `${PREFIX}ORD${Date.now()}${i}`,
          /** Status */
          status: faker.helpers.arrayElement([
            "pending",
            "confirmed",
            "shipped",
            "delivered",
          ]),
          payment_status: faker.helpers.arrayElement([
            "pending",
            "paid",
            "failed",
          ]),
          payment_method: faker.helpers.arrayElement([
            "cod",
            "card",
            "upi",
            "netbanking",
          ]),
          /** Items */
          items: [
            {
              product_id: product.id,
              /** Name */
              name: product.name,
              quantity,
              /** Price */
              price: product.price,
              /** Total */
              total: itemTotal,
            },
          ],
          /** Subtotal */
          subtotal: itemTotal,
          /** Shipping */
          shipping: 50,
          /** Tax */
          tax: Math.floor(itemTotal * 0.18),
          /** Discount */
          discount: 0,
          /** Total */
          total: itemTotal + 50 + Math.floor(itemTotal * 0.18),
          shipping_address: {
            /** Name */
            name: user.name,
            /** Phone */
            phone: user.phone,
            /** Address */
            address: faker.location.streetAddress(),
            /** City */
            city: faker.location.city(),
            /** State */
            state: faker.location.state(),
            /** Pincode */
            pincode: faker.location.zipCode("######"),
            /** Country */
            country: "India",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await db.collection(COLLECTIONS.ORDERS).add(orderData);
        stats.orders++;
      }
    }

    // Step 8: Generate Support Tickets
    for (const user of users.slice(
      0,
      Math.min(users.length, config.users * 0.5)
    )) {
      for (let i = 0; i < config.ticketsPerUser; i++) {
        const ticketData = {
          user_id: user.id,
          /** Subject */
          subject: `${PREFIX}${faker.lorem.sentence().slice(0, 60)}`,
          /** Description */
          description: faker.lorem.paragraphs(2),
          /** Category */
          category: faker.helpers.arrayElement([
            "order-issue",
            "return-refund",
            "product-question",
            "account",
            "payment",
          ]),
          /** Priority */
          priority: faker.helpers.arrayElement(["low", "medium", "high"]),
          /** Status */
          status: faker.helpers.arrayElement([
            "open",
            "in-progress",
            "resolved",
            "closed",
          ]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await db.collection(COLLECTIONS.SUPPORT_TICKETS).add(ticketData);
        stats.tickets++;
      }
    }

    // Step 9: Generate Coupons
    for (const shop of shops.slice(0, Math.min(shops.length, 10))) {
      for (let i = 0; i < config.couponsPerShop; i++) {
        const couponData = {
          shop_id: shop.id,
          /** Code */
          code: `${PREFIX}COUP${Date.now()}${i}`,
          /** Description */
          description: `${faker.number.int({
            /** Min */
            min: 10,
            /** Max */
            max: 50,
          })}% off on all products`,
          discount_type: faker.helpers.arrayElement(["percentage", "fixed"]),
          discount_value: faker.number.int({ min: 10, max: 500 }),
          min_order_value: faker.number.int({ min: 500, max: 2000 }),
          max_discount: faker.number.int({ min: 100, max: 1000 }),
          usage_limit: faker.number.int({ min: 10, max: 100 }),
          usage_count: 0,
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await db.collection(COLLECTIONS.COUPONS).add(couponData);
        stats.coupons++;
      }
    }

    // Step 10: Generate Hero Slides
    const heroSlides = [];
    const slideCategories = [
      {
        /** Title */
        title: "Summer Sale",
        /** Subtitle */
        subtitle: "Up to 50% off on fashion",
        /** Link */
        link: "/products?category=fashion",
        /** Cta */
        cta: "Shop Now",
      },
      {
        /** Title */
        title: "New Arrivals",
        /** Subtitle */
        subtitle: "Check out our latest products",
        /** Link */
        link: "/products?sort=newest",
        /** Cta */
        cta: "Explore",
      },
      {
        /** Title */
        title: "Hot Auctions",
        /** Subtitle */
        subtitle: "Bid on exclusive items today",
        /** Link */
        link: "/auctions",
        /** Cta */
        cta: "View Auctions",
      },
      {
        /** Title */
        title: "Featured Shops",
        /** Subtitle */
        subtitle: "Discover trusted sellers",
        /** Link */
        link: "/shops",
        /** Cta */
        cta: "Browse Shops",
      },
      {
        /** Title */
        title: "Electronics Deal",
        /** Subtitle */
        subtitle: "Best prices on gadgets",
        /** Link */
        link: "/products?category=electronics",
        /** Cta */
        cta: "Shop Now",
      },
      {
        /** Title */
        title: "Home & Kitchen",
        /** Subtitle */
        subtitle: "Transform your living space",
        /** Link */
        link: "/products?category=home-kitchen",
        /** Cta */
        cta: "Learn More",
      },
      {
        /** Title */
        title: "Flash Sale",
        /** Subtitle */
        subtitle: "Limited time offers ending soon",
        /** Link */
        link: "/products?featured=true",
        /** Cta */
        cta: "Grab Now",
      },
      {
        /** Title */
        title: "Clearance Sale",
        /** Subtitle */
        subtitle: "Huge discounts on select items",
        /** Link */
        link: "/products?discount=high",
        /** Cta */
        cta: "Shop Now",
      },
    ];

    for (let i = 0; i < Math.min(8, slideCategories.length); i++) {
      const slide = slideCategories[i];
      const heroSlideData = {
        /** Id */
        id: `${PREFIX}hero_slide_${i + 1}`,
        /** Title */
        title: slide.title,
        /** Subtitle */
        subtitle: slide.subtitle,
        image_url: `https://source.unsplash.com/1920x600/?${slide.title
          .toLowerCase()
          .replace(/\s+/g, "-")},banner&sig=${i}`,
        link_url: slide.link,
        cta_text: slide.cta,
        /** Position */
        position: i + 1,
        is_active: Math.random() < 0.8, // 80% active
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection(COLLECTIONS.HERO_SLIDES).add(heroSlideDat/**
 * Performs context operation
 *
 * @param {any} (u - The (u
 *
 * @returns {any} The context result
 *
 */
a);
      heroSlides.push(heroSlideData);
      stats.heroSlides++;
    }

    // Step 11: Build and return test data context for immediate use
    const context = {
      /** Users */
      users: {
        /** Admin */
        admin: users.filter((u: any) => u.role === "admin"),
        /** Sellers */
        sellers: users.filter((u: any) => u.role === "seller"),
        /** Customers */
        customers: users.filter((u: any) => u.role === "user"),
        /** All */
        all: users,
      },
      /** Shops */
      shops: {
        /** Verified */
        verified: shops.filter((s: any) => s.is_verified),
        /** Unverified */
        unverified: shops.filter((s: any) => !s.is_verified),
        /** Featured */
        featured: shops.filter((s: any) => s.is_featured),
        /** All */
        all: shops,
        /** By Owner Id */
        byOwnerId: shops.reduce((acc: any, shop: any) => {
          if (!acc[shop.owner_id]) acc[shop.owner_id] = [];
          acc[shop.owner_id].push(shop);
          return acc;
        }, {}),
      },
      /** Categories */
      categories: {
        /** Root */
        root: categories.filter((c: any) => !c.parent_id),
        /** Children */
        children: categories.filter((c: any) => c.parent_id),
        /** All */
        all: categories,
        /** By Parent Id */
        byParentId: categories.reduce((acc: any, cat: any) => {
          if (cat.parent_id) {
            if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
            acc[cat.parent_id].push(cat);
          }
          return acc;
        }, {}),
      },
      /** Products */
      products: {
        /** Published */
        published: products.filter((p: any) => p.status === "published"),
        /** Draft */
        draft: products.filter((p: any) => p.status === "draft"),
        /** Featured */
        featured: products.filter((p: any) => p.is_featured),
        /** In Stock */
        inStock: products.filter((p: any) => p.stock_count > 0),
        /** All */
        all: products,
        /** By Shop Id */
        byShopId: products.reduce((acc: any, product: any) => {
          if (!acc[product.shop_id]) acc[product.shop_id] = [];
          acc[product.shop_id].push(product);
          return acc;
        }, {}),
        /** By Category Id */
        byCategoryId: products.reduce((acc: any, product: any) => {
          if (!acc[product.category_id]) acc[product.category_id] = [];
          acc[product.category_id].push(product);
          return acc;
        }, {}),
      },
      /** Auctions */
      auctions: {
        /** Live */
        live: auctions.filter((a: any) => a.status === "live"),
        /** Scheduled */
        scheduled: auctions.filter((a: any) => a.status === "scheduled"),
        /** Draft */
        draft: auctions.filter((a: any) => a.status === "draft"),
        /** Featured */
        featured: auctions.filter((a: any) => a.is_featured),
        /** All */
        all: auctions,
        /** By Shop Id */
        byShopId: auctions.reduce((acc: any, auction: any) => {
          if (!acc[auction.shop_id]) acc[auction.shop_id] = [];
          acc[auction.shop_id].push(auction);
          return acc;
        }, {}),
      },
      /** Coupons */
      coupons: {
        active: [], // Will be populated from DB
        /** Inactive */
        inactive: [],
        /** All */
        all: [],
        /** By Shop Id */
        byShopId: {},
      },
      /** Orders */
      orders: {
        /** Pending */
        pending: [],
        /** Confirmed */
        confirmed: [],
        /** Shipped */
        shipped: [],
        /** Delivered */
        delivered: [],
        /** All */
        all: [],
        /** By User Id */
        byUserId: {},
        /** By Shop Id */
        byShopId: {},
      },
      /** Metadata */
      metadata: {
        /** Generated At */
        generatedAt: new Date().toISOString(),
        /** Total Items */
        totalItems:
          users.length +
          shops.length +
          categories.length +
          products.length +
          auctions.length,
        /** Prefix */
        prefix: PREFIX,
      },
    };

    return NextResponse.json({ success: true, stats, context });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.testData.generateComplete",
    });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate data" },
      { status: 500 }
    );
  }
}
