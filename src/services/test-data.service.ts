/**
 * Test Data Service
 * Generates test data with TEST_ prefix for development and testing
 */

import { apiService } from "./api.service";

// Unused but kept for future expansion
interface _TestDataConfig {
  count: number;
  userId: string;
  shopId?: string;
}

interface TestDataCounts {
  products: number;
  auctions: number;
  orders: number;
  reviews: number;
  tickets: number;
  shops: number;
  coupons: number;
  categories: number;
}

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
        slug: this.generateSlug(name),
        sku: this.generateSKU(),
        description: this.randomFromArray(this.productDescriptions),
        price,
        originalPrice: price + this.randomInt(100, 500),
        stockCount: this.randomInt(10, 100),
        lowStockThreshold: 5,
        categoryId: "test-category",
        shopId,
        sellerId: userId,
        status: this.randomFromArray(["draft", "published"]),
        featured: Math.random() > 0.7,
        images: [
          `https://via.placeholder.com/400x400?text=${encodeURIComponent(
            name
          )}`,
        ],
        brand: `${this.PREFIX}Brand`,
      };
      products.push(product);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/products",
      {
        products,
      }
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
        slug: this.generateSlug(name),
        description: this.randomFromArray(this.productDescriptions),
        startingBid,
        reservePrice: startingBid + this.randomInt(500, 2000),
        bidIncrement: this.randomInt(100, 500),
        buyNowPrice: startingBid + this.randomInt(3000, 5000),
        startTime: new Date(
          Date.now() + this.randomInt(1, 24) * 60 * 60 * 1000
        ).toISOString(),
        endTime: new Date(
          Date.now() + this.randomInt(48, 168) * 60 * 60 * 1000
        ).toISOString(),
        categoryId: "test-category",
        shopId,
        sellerId: userId,
        status: this.randomFromArray(["draft", "scheduled", "active"]),
        featured: Math.random() > 0.8,
        images: [
          `https://via.placeholder.com/400x400?text=${encodeURIComponent(
            name
          )}`,
        ],
        auctionType: this.randomFromArray(["regular", "reverse", "silent"]),
      };
      auctions.push(auction);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/auctions",
      {
        auctions,
      }
    );
    return response.data;
  }

  // Order generators
  async generateTestOrders(count: number, userId: string) {
    const orders = [];
    for (let i = 0; i < count; i++) {
      const totalAmount = this.randomPrice(500, 10000);
      const order = {
        orderId: `${this.PREFIX}ORD_${Date.now()}_${i}`,
        userId,
        totalAmount,
        subtotal: totalAmount - 100,
        shippingCost: 50,
        tax: 50,
        status: this.randomFromArray([
          "pending",
          "confirmed",
          "shipped",
          "delivered",
        ]),
        paymentStatus: this.randomFromArray(["pending", "paid", "failed"]),
        paymentMethod: this.randomFromArray(["cod", "card", "upi"]),
        items: [
          {
            productId: `${this.PREFIX}PROD_${i}`,
            name: `${this.PREFIX}Product ${i}`,
            quantity: this.randomInt(1, 3),
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
        rating: this.randomInt(3, 5),
        comment: this.randomFromArray(this.reviewComments),
        title: `${this.PREFIX}Review ${i + 1}`,
        isVerifiedPurchase: Math.random() > 0.5,
        status: this.randomFromArray(["pending", "approved"]),
      };
      reviews.push(review);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/reviews",
      {
        reviews,
      }
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
        subject: `${this.PREFIX}${this.randomFromArray(this.ticketSubjects)}`,
        description: `This is a test support ticket created for testing purposes. Ticket number ${
          i + 1
        }.`,
        category: this.randomFromArray([
          "order-issue",
          "return-refund",
          "product-question",
          "account",
          "payment",
        ]),
        priority: this.randomFromArray(["low", "medium", "high"]),
        status: "open",
      };
      tickets.push(ticket);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/tickets",
      {
        tickets,
      }
    );
    return response.data;
  }

  // Shop generator
  async generateTestShop(userId: string) {
    const shopName = `${this.PREFIX}Shop_${Date.now()}`;
    const shop = {
      name: shopName,
      slug: this.generateSlug(shopName),
      description:
        "This is a test shop created for development and testing purposes.",
      ownerId: userId,
      email: `testshop${Date.now()}@example.com`,
      phone: "+919876543210",
      location: "Mumbai, Maharashtra, India",
      address: "Test Address, Test Area, Mumbai - 400001",
      isActive: true,
      verified: false,
      featured: false,
      logo: "https://via.placeholder.com/200x200?text=TEST+SHOP",
      banner: "https://via.placeholder.com/1200x300?text=TEST+SHOP+BANNER",
    };

    const response: any = await apiService.post(
      "/admin/test-workflow/shop",
      shop
    );
    return response.data;
  }

  // Category generator
  async generateTestCategories() {
    const categories = [
      {
        name: `${this.PREFIX}Electronics`,
        slug: `${this.PREFIX}electronics-${Date.now()}`,
        description: "Test category for electronics",
        parentId: null,
        isActive: true,
        featured: true,
      },
      {
        name: `${this.PREFIX}Fashion`,
        slug: `${this.PREFIX}fashion-${Date.now()}`,
        description: "Test category for fashion",
        parentId: null,
        isActive: true,
        featured: false,
      },
      {
        name: `${this.PREFIX}Home & Kitchen`,
        slug: `${this.PREFIX}home-kitchen-${Date.now()}`,
        description: "Test category for home products",
        parentId: null,
        isActive: true,
        featured: false,
      },
    ];

    const response: any = await apiService.post(
      "/admin/test-workflow/categories",
      {
        categories,
      }
    );
    return response.data;
  }

  // Coupon generator
  async generateTestCoupons(count: number, shopId: string) {
    const coupons = [];
    for (let i = 0; i < count; i++) {
      const coupon = {
        code: `${this.PREFIX}COUP${i + 1}`,
        description: `Test coupon ${i + 1} - ${this.randomInt(10, 50)}% off`,
        discountType: this.randomFromArray(["percentage", "fixed"]),
        discountValue: this.randomInt(10, 500),
        minOrderValue: this.randomInt(500, 2000),
        maxDiscount: this.randomInt(100, 1000),
        usageLimit: this.randomInt(10, 100),
        usageCount: 0,
        validFrom: new Date().toISOString(),
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        shopId,
        isActive: true,
      };
      coupons.push(coupon);
    }

    const response: any = await apiService.post(
      "/admin/test-workflow/coupons",
      {
        coupons,
      }
    );
    return response.data;
  }

  // Cleanup test data
  async cleanupTestData(): Promise<TestDataCounts> {
    const response: any = await apiService.post(
      "/admin/test-workflow/cleanup",
      {}
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
      }
    );
    return response.data;
  }
}

export const testDataService = new TestDataService();
