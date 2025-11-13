import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { faker } from "@faker-js/faker";

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

function getUnsplashImage(category: string, index: number): string {
  return `https://source.unsplash.com/800x600/?${category}&sig=${index}`;
}

export async function POST(req: NextRequest) {
  try {
    const config = await req.json();
    const db = getFirestoreAdmin();

    const stats = {
      users: 0,
      shops: 0,
      categories: 0,
      products: 0,
      auctions: 0,
      reviews: 0,
      orders: 0,
      tickets: 0,
      coupons: 0,
      heroSlides: 0,
      featuredProducts: 0,
      featuredAuctions: 0,
      featuredShops: 0,
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
        name: `${PREFIX}${name}`,
        slug: `${PREFIX}${name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${Date.now()}`,
        description: `Test category for ${name}`,
        parent_id: null,
        path: name.toLowerCase().replace(/\s+/g, "-"),
        level: 0,
        has_children: false,
        child_count: 0,
        is_active: true,
        is_featured: Math.random() < 0.3,
        show_on_homepage: Math.random() < config.homepagePercentage / 100,
        sort_order: categories.length,
        product_count: 0,
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
      const userData = {
        email: `${PREFIX}user${i + 1}_${Date.now()}@example.com`,
        name: `${PREFIX}${faker.person.fullName()}`,
        phone: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`,
        role: i === 0 ? "admin" : i < config.users * 0.3 ? "seller" : "user",
        is_banned: false,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          avatar: `https://ui-avatars.com/api/?name=${PREFIX}User${
            i + 1
          }&background=random`,
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
          name: shopName,
          slug: `${PREFIX}${shopName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${i}`,
          description: faker.company.catchPhrase(),
          email: `shop_${user.email}`,
          phone: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`,
          location: faker.location.city() + ", India",
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            shopName
          )}&background=random`,
          banner: getUnsplashImage("shop", shops.length),
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
          name: productName,
          slug: `${PREFIX}${productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${i}`,
          description: faker.commerce.productDescription(),
          price,
          original_price: price + faker.number.int({ min: 100, max: 5000 }),
          sku: `${PREFIX}SKU${Date.now()}${i}`,
          stock_count: faker.number.int({ min: 10, max: 100 }),
          low_stock_threshold: 5,
          status: Math.random() < 0.8 ? "published" : "draft",
          is_featured: Math.random() < config.featuredPercentage / 100,
          is_deleted: false,
          condition: faker.helpers.arrayElement([
            "new",
            "like-new",
            "good",
            "fair",
          ]),
          brand: faker.company.name(),
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
          name: auctionName,
          slug: `${PREFIX}${auctionName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${i}`,
          description: faker.commerce.productDescription(),
          starting_bid: startingBid,
          current_bid: startingBid,
          reserve_price:
            startingBid + faker.number.int({ min: 500, max: 5000 }),
          bid_count: 0,
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
          rating: faker.number.int({ min: 3, max: 5 }),
          title: `${PREFIX}${faker.lorem.sentence().slice(0, 50)}`,
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
          items: [
            {
              product_id: product.id,
              name: product.name,
              quantity,
              price: product.price,
              total: itemTotal,
            },
          ],
          subtotal: itemTotal,
          shipping: 50,
          tax: Math.floor(itemTotal * 0.18),
          discount: 0,
          total: itemTotal + 50 + Math.floor(itemTotal * 0.18),
          shipping_address: {
            name: user.name,
            phone: user.phone,
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            pincode: faker.location.zipCode("######"),
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
          subject: `${PREFIX}${faker.lorem.sentence().slice(0, 60)}`,
          description: faker.lorem.paragraphs(2),
          category: faker.helpers.arrayElement([
            "order-issue",
            "return-refund",
            "product-question",
            "account",
            "payment",
          ]),
          priority: faker.helpers.arrayElement(["low", "medium", "high"]),
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
          code: `${PREFIX}COUP${Date.now()}${i}`,
          description: `${faker.number.int({
            min: 10,
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
        title: "Summer Sale",
        subtitle: "Up to 50% off on fashion",
        link: "/products?category=fashion",
        cta: "Shop Now",
      },
      {
        title: "New Arrivals",
        subtitle: "Check out our latest products",
        link: "/products?sort=newest",
        cta: "Explore",
      },
      {
        title: "Hot Auctions",
        subtitle: "Bid on exclusive items today",
        link: "/auctions",
        cta: "View Auctions",
      },
      {
        title: "Featured Shops",
        subtitle: "Discover trusted sellers",
        link: "/shops",
        cta: "Browse Shops",
      },
      {
        title: "Electronics Deal",
        subtitle: "Best prices on gadgets",
        link: "/products?category=electronics",
        cta: "Shop Now",
      },
      {
        title: "Home & Kitchen",
        subtitle: "Transform your living space",
        link: "/products?category=home-kitchen",
        cta: "Learn More",
      },
      {
        title: "Flash Sale",
        subtitle: "Limited time offers ending soon",
        link: "/products?featured=true",
        cta: "Grab Now",
      },
      {
        title: "Clearance Sale",
        subtitle: "Huge discounts on select items",
        link: "/products?discount=high",
        cta: "Shop Now",
      },
    ];

    for (let i = 0; i < Math.min(8, slideCategories.length); i++) {
      const slide = slideCategories[i];
      const heroSlideData = {
        id: `${PREFIX}hero_slide_${i + 1}`,
        title: slide.title,
        subtitle: slide.subtitle,
        image_url: `https://source.unsplash.com/1920x600/?${slide.title
          .toLowerCase()
          .replace(/\s+/g, "-")},banner&sig=${i}`,
        link_url: slide.link,
        cta_text: slide.cta,
        position: i + 1,
        is_active: Math.random() < 0.8, // 80% active
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection(COLLECTIONS.HERO_SLIDES).add(heroSlideData);
      heroSlides.push(heroSlideData);
      stats.heroSlides++;
    }

    // Step 11: Build and return test data context for immediate use
    const context = {
      users: {
        admin: users.filter((u: any) => u.role === "admin"),
        sellers: users.filter((u: any) => u.role === "seller"),
        customers: users.filter((u: any) => u.role === "user"),
        all: users,
      },
      shops: {
        verified: shops.filter((s: any) => s.is_verified),
        unverified: shops.filter((s: any) => !s.is_verified),
        featured: shops.filter((s: any) => s.is_featured),
        all: shops,
        byOwnerId: shops.reduce((acc: any, shop: any) => {
          if (!acc[shop.owner_id]) acc[shop.owner_id] = [];
          acc[shop.owner_id].push(shop);
          return acc;
        }, {}),
      },
      categories: {
        root: categories.filter((c: any) => !c.parent_id),
        children: categories.filter((c: any) => c.parent_id),
        all: categories,
        byParentId: categories.reduce((acc: any, cat: any) => {
          if (cat.parent_id) {
            if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
            acc[cat.parent_id].push(cat);
          }
          return acc;
        }, {}),
      },
      products: {
        published: products.filter((p: any) => p.status === "published"),
        draft: products.filter((p: any) => p.status === "draft"),
        featured: products.filter((p: any) => p.is_featured),
        inStock: products.filter((p: any) => p.stock_count > 0),
        all: products,
        byShopId: products.reduce((acc: any, product: any) => {
          if (!acc[product.shop_id]) acc[product.shop_id] = [];
          acc[product.shop_id].push(product);
          return acc;
        }, {}),
        byCategoryId: products.reduce((acc: any, product: any) => {
          if (!acc[product.category_id]) acc[product.category_id] = [];
          acc[product.category_id].push(product);
          return acc;
        }, {}),
      },
      auctions: {
        live: auctions.filter((a: any) => a.status === "live"),
        scheduled: auctions.filter((a: any) => a.status === "scheduled"),
        draft: auctions.filter((a: any) => a.status === "draft"),
        featured: auctions.filter((a: any) => a.is_featured),
        all: auctions,
        byShopId: auctions.reduce((acc: any, auction: any) => {
          if (!acc[auction.shop_id]) acc[auction.shop_id] = [];
          acc[auction.shop_id].push(auction);
          return acc;
        }, {}),
      },
      coupons: {
        active: [], // Will be populated from DB
        inactive: [],
        all: [],
        byShopId: {},
      },
      orders: {
        pending: [],
        confirmed: [],
        shipped: [],
        delivered: [],
        all: [],
        byUserId: {},
        byShopId: {},
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        totalItems:
          users.length +
          shops.length +
          categories.length +
          products.length +
          auctions.length,
        prefix: PREFIX,
      },
    };

    return NextResponse.json({ success: true, stats, context });
  } catch (error: any) {
    console.error("Error generating complete data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate data" },
      { status: 500 }
    );
  }
}
