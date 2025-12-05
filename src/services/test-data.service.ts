/**
 * @fileoverview Service Module
 * @module src/services/test-data.service
 * @description This file contains service functions for test-data operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Test Data Service
 * Generates test data with TEST_ prefix for development and testing
 */

import { apiService } from "./api.service";

// Unused but kept for future expansion
/**
 * _TestDataConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for _TestDataConfig
 */
interface _TestDataConfig {
  /** Count */
  count: number;
  /** User Id */
  userId: string;
  /** Shop Id */
  shopId?: string;
}

/**
 * TestDataCounts interface
 * 
 * @interface
 * @description Defines the structure and contract for TestDataCounts
 */
interface TestDataCounts {
  /** Products */
  products: number;
  /** Auctions */
  auctions: number;
  /** Orders */
  orders: number;
  /** Reviews */
  reviews: number;
  /** Tickets */
  tickets: number;
  /** Shops */
  shops: number;
  /** Coupons */
  coupons: number;
  /** Categories */
  categories: number;
}

/**
 * TestDataService class
 * 
 * @class
 * @description Description of TestDataService class functionality
 */
class TestDataService {
  private readonly PREFIX = "TEST_";

  // Random data generators
  private randomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomPrice(min: number = 100, max: number = 10000): number {
    return Math.floor((Math.random() * (max - min + 1)) / 100) * 100 + min;
  }

  private generateSKU(): string {
    return `${this.PREFIX}SKU_${Date.now()}_${this.randomInt(1000, 9999)}`;
  }

  private generateSlug(name: string): string {
    return `${this.PREFIX}${name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}`;
  }

  // Product generators
  private productNames = [
    "Premium Laptop",
    "Wireless Mouse",
    "Mechanical Keyboard",
    "Gaming Headset",
    "HD Webcam",
    "USB-C Hub",
    "Portable SSD",
    "Smart Watch",
    "Bluetooth Speaker",
    "Phone Stand",
  ];

  private productDescriptions = [
    "High-quality product with excellent features and durability.",
    "Perfect for everyday use with modern design and functionality.",
    "Premium build quality with advanced technology.",
    "Reliable performance with great value for money.",
    "Feature-rich product designed for professionals.",
  ];

  async generateTestProducts(count: number, userId: string, shopId: string) {
    const products = [];
    for (let i = 0; i < count; i++) {
      const name = `${this.PREFIX}${this.randomFromArray(this.productNames)} ${
        i + 1
      }`;
      const price = this.randomPrice(500, 5000);
      const product = {
        name,
        /** Slug */
        slug: this.generateSlug(name),
        /** Sku */
        sku: this.generateSKU(),
        /** Description */
        description: this.randomFromArray(this.productDescriptions),
        price,
        /** Original Price */
        originalPrice: price + this.randomInt(100, 500),
        /** Stock Count */
        stockCount: this.randomInt(10, 100),
        /** Low Stock Threshold */
        lowStockThreshold: 5,
        /** Category Id */
        categoryId: "test-category",
        shopId,
        /** Seller Id */
        sellerId: userId,
        /** Status */
        status: this.randomFromArray(["draft", "published"]),
        /** Featured */
        featured: Math.random() > 0.7,
        /** Images */
        images: [
          `https://via.placeholder.com/400x400?text=${encodeURIComponent(
            name,
          )}`,
        ],
        /** Brand */
        brand: `${this.PREFIX}Brand`,
      };
      products.push(product);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/products",
      {
        products,
      },
    );
    return response.data;
  }

  // Auction generators
  private auctionNames = [
    "Vintage Watch",
    "Collectible Coin",
    "Antique Furniture",
    "Limited Edition Art",
    "Rare Book",
    "Classic Guitar",
    "Designer Handbag",
    "Sports Memorabilia",
    "Jewelry Set",
    "Gaming Console",
  ];

  async generateTestAuctions(count: number, userId: string, shopId: string) {
    const auctions = [];
    for (let i = 0; i < count; i++) {
      const name = `${this.PREFIX}${this.randomFromArray(this.auctionNames)} ${
        i + 1
      }`;
      const startingBid = this.randomPrice(1000, 5000);
      const auction = {
        name,
        /** Slug */
        slug: this.generateSlug(name),
        /** Description */
        description: this.randomFromArray(this.productDescriptions),
        startingBid,
        /** Reserve Price */
        reservePrice: startingBid + this.randomInt(500, 2000),
        /** Bid Increment */
        bidIncrement: this.randomInt(100, 500),
        /** Buy Now Price */
        buyNowPrice: startingBid + this.randomInt(3000, 5000),
        /** Start Time */
        startTime: new Date(
          Date.now() + this.randomInt(1, 24) * 60 * 60 * 1000,
        ).toISOString(),
        /** End Time */
        endTime: new Date(
          Date.now() + this.randomInt(48, 168) * 60 * 60 * 1000,
        ).toISOString(),
        /** Category Id */
        categoryId: "test-category",
        shopId,
        /** Seller Id */
        sellerId: userId,
        /** Status */
        status: this.randomFromArray(["draft", "scheduled", "active"]),
        /** Featured */
        featured: Math.random() > 0.8,
        /** Images */
        images: [
          `https://via.placeholder.com/400x400?text=${encodeURIComponent(
            name,
          )}`,
        ],
        /** Auction Type */
        auctionType: this.randomFromArray(["regular", "reverse", "silent"]),
      };
      auctions.push(auction);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/auctions",
      {
        auctions,
      },
    );
    return response.data;
  }

  // Order generators
  async generateTestOrders(count: number, userId: string) {
    const orders = [];
    for (let i = 0; i < count; i++) {
      const totalAmount = this.randomPrice(500, 10000);
      const order = {
        /** Order Id */
        orderId: `${this.PREFIX}ORD_${Date.now()}_${i}`,
        userId,
        totalAmount,
        /** Subtotal */
        subtotal: totalAmount - 100,
        /** Shipping Cost */
        shippingCost: 50,
        /** Tax */
        tax: 50,
        /** Status */
        status: this.randomFromArray([
          "pending",
          "confirmed",
          "shipped",
          "delivered",
        ]),
        /** Payment Status */
        paymentStatus: this.randomFromArray(["pending", "paid", "failed"]),
        /** Payment Method */
        paymentMethod: this.randomFromArray(["cod", "card", "upi"]),
        /** Items */
        items: [
          {
            /** Product Id */
            productId: `${this.PREFIX}PROD_${i}`,
            /** Name */
            name: `${this.PREFIX}Product ${i}`,
            /** Quantity */
            quantity: this.randomInt(1, 3),
            /** Price */
            price: Math.floor(totalAmount / 2),
          },
        ],
      };
      orders.push(order);
    }

    const response: any = await apiService.post("/admin/test-workflow/orders", {
      orders,
    });
    return response.data;
  }

  // Review generators
  private reviewComments = [
    "Excellent product! Highly recommended.",
    "Good quality for the price.",
    "Fast delivery and great packaging.",
    "Works as expected. Satisfied with purchase.",
    "Amazing product! Will buy again.",
    "Not bad, but could be better.",
    "Perfect! Exactly what I needed.",
  ];

  async generateTestReviews(count: number, userId: string, productId: string) {
    const reviews = [];
    for (let i = 0; i < count; i++) {
      const review = {
        userId,
        productId,
        /** Rating */
        rating: this.randomInt(3, 5),
        /** Comment */
        comment: this.randomFromArray(this.reviewComments),
        /** Title */
        title: `${this.PREFIX}Review ${i + 1}`,
        /** Is Verified Purchase */
        isVerifiedPurchase: Math.random() > 0.5,
        /** Status */
        status: this.randomFromArray(["pending", "approved"]),
      };
      reviews.push(review);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/reviews",
      {
        reviews,
      },
    );
    return response.data;
  }

  // Support ticket generators
  private ticketSubjects = [
    "Product not received",
    "Refund request",
    "Payment issue",
    "Product quality concern",
    "Shipping delay",
    "Account access problem",
    "Order cancellation",
  ];

  async generateTestTickets(count: number, _userId: string) {
    const tickets = [];
    for (let i = 0; i < count; i++) {
      const ticket = {
        /** Subject */
        subject: `${this.PREFIX}${this.randomFromArray(this.ticketSubjects)}`,
        /** Description */
        description: `This is a test support ticket created for testing purposes. Ticket number ${
          i + 1
        }.`,
        /** Category */
        category: this.randomFromArray([
          "order-issue",
          "return-refund",
          "product-question",
          "account",
          "payment",
        ]),
        /** Priority */
        priority: this.randomFromArray(["low", "medium", "high"]),
        /** Status */
        status: "open",
      };
      tickets.push(ticket);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/tickets",
      {
        tickets,
      },
    );
    return response.data;
  }

  // Shop generator
  async generateTestShop(userId: string) {
    const shopName = `${this.PREFIX}Shop_${Date.now()}`;
    const shop = {
      /** Name */
      name: shopName,
      /** Slug */
      slug: this.generateSlug(shopName),
      /** Description */
      description:
        "This is a test shop created for development and testing purposes.",
      /** Owner Id */
      ownerId: userId,
      /** Email */
      email: `testshop${Date.now()}@example.com`,
      /** Phone */
      phone: "+919876543210",
      /** Location */
      location: "Mumbai, Maharashtra, India",
      /** Address */
      address: "Test Address, Test Area, Mumbai - 400001",
      /** Is Active */
      isActive: true,
      /** Verified */
      verified: false,
      /** Featured */
      featured: false,
      logo: "https://via.placeholder.com/200x200?text=TEST+SHOP",
      banner: "https://via.placeholder.com/1200x300?text=TEST+SHOP+BANNER",
    };

    const response: any = await apiService.post(
      "/admin/test-workflow/shop",
      shop,
    );
    return response.data;
  }

  // Category generator
  async generateTestCategories() {
    const categories = [
      {
        /** Name */
        name: `${this.PREFIX}Electronics`,
        /** Slug */
        slug: `${this.PREFIX}electronics-${Date.now()}`,
        /** Description */
        description: "Test category for electronics",
        /** Parent Id */
        parentId: null,
        /** Is Active */
        isActive: true,
        /** Featured */
        featured: true,
      },
      {
        /** Name */
        name: `${this.PREFIX}Fashion`,
        /** Slug */
        slug: `${this.PREFIX}fashion-${Date.now()}`,
        /** Description */
        description: "Test category for fashion",
        /** Parent Id */
        parentId: null,
        /** Is Active */
        isActive: true,
        /** Featured */
        featured: false,
      },
      {
        /** Name */
        name: `${this.PREFIX}Home & Kitchen`,
        /** Slug */
        slug: `${this.PREFIX}home-kitchen-${Date.now()}`,
        /** Description */
        description: "Test category for home products",
        /** Parent Id */
        parentId: null,
        /** Is Active */
        isActive: true,
        /** Featured */
        featured: false,
      },
    ];

    const response: any = await apiService.post(
      "/admin/test-workflow/categories",
      {
        categories,
      },
    );
    return response.data;
  }

  // Coupon generator
  async generateTestCoupons(count: number, shopId: string) {
    const coupons = [];
    for (let i = 0; i < count; i++) {
      const coupon = {
        /** Code */
        code: `${this.PREFIX}COUP${i + 1}`,
        /** Description */
        description: `Test coupon ${i + 1} - ${this.randomInt(10, 50)}% off`,
        /** Discount Type */
        discountType: this.randomFromArray(["percentage", "fixed"]),
        /** Discount Value */
        discountValue: this.randomInt(10, 500),
        /** Min Order Value */
        minOrderValue: this.randomInt(500, 2000),
        /** Max Discount */
        maxDiscount: this.randomInt(100, 1000),
        /** Usage Limit */
        usageLimit: this.randomInt(10, 100),
        /** Usage Count */
        usageCount: 0,
        /** Valid From */
        validFrom: new Date().toISOString(),
        /** Valid Until */
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        shopId,
        /** Is Active */
        isActive: true,
      };
      coupons.push(coupon);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/coupons",
      {
        coupons,
      },
    );
    return response.data;
  }

  // Cleanup test data
  async cleanupTestData(): Promise<TestDataCounts> {
    const response: any = await apiService.post(
      "/admin/test-workflow/cleanup",
      {},
    );
    return response.data;
  }

  // Get test data status
  async getTestDataStatus(): Promise<TestDataCounts> {
    const response: any = await apiService.get("/admin/test-workflow/status");
    return response.data;
  }

  // Execute complete workflow
  async executeWorkflow(workflowType: string, params: any = {}) {
    const response: any = await apiService.post(
      "/admin/test-workflow/execute",
      {
        workflowType,
        params,
      },
    );
    return response.data;
  }
}

export const testDataService = new TestDataService();
