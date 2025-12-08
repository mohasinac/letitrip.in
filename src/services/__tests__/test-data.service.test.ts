import { apiService } from "../api.service";
import { testDataService } from "../test-data.service";

jest.mock("../api.service");

describe("TestDataService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateTestProducts", () => {
    it("should generate test products", async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 3,
          ids: ["prod1", "prod2", "prod3"],
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.generateTestProducts(
        3,
        "user1",
        "shop1"
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/products",
        expect.objectContaining({
          products: expect.arrayContaining([
            expect.objectContaining({
              name: expect.stringContaining("TEST_"),
              slug: expect.stringContaining("TEST_"),
              sku: expect.stringContaining("TEST_SKU_"),
              shopId: "shop1",
              sellerId: "user1",
              status: expect.any(String),
              featured: expect.any(Boolean),
            }),
          ]),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should generate correct number of products", async () => {
      const mockResponse = { data: { success: true, count: 5 } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestProducts(5, "user1", "shop1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      expect(callArgs.products).toHaveLength(5);
    });

    it("should generate products with random attributes", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestProducts(2, "user1", "shop1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const products = callArgs.products;

      // Verify all products have required fields
      products.forEach((product: any) => {
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("slug");
        expect(product).toHaveProperty("sku");
        expect(product).toHaveProperty("description");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("originalPrice");
        expect(product).toHaveProperty("stockCount");
        expect(product).toHaveProperty("images");
        expect(product.price).toBeGreaterThan(0);
        expect(product.originalPrice).toBeGreaterThan(product.price);
      });
    });
  });

  describe("generateTestAuctions", () => {
    it("should generate test auctions", async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 2,
          ids: ["auction1", "auction2"],
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.generateTestAuctions(
        2,
        "user1",
        "shop1"
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/auctions",
        expect.objectContaining({
          auctions: expect.arrayContaining([
            expect.objectContaining({
              name: expect.stringContaining("TEST_"),
              slug: expect.stringContaining("TEST_"),
              shopId: "shop1",
              sellerId: "user1",
              startingBid: expect.any(Number),
              reservePrice: expect.any(Number),
              bidIncrement: expect.any(Number),
              buyNowPrice: expect.any(Number),
              auctionType: expect.any(String),
            }),
          ]),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should generate auctions with valid time ranges", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestAuctions(1, "user1", "shop1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const auction = callArgs.auctions[0];

      const startTime = new Date(auction.startTime).getTime();
      const endTime = new Date(auction.endTime).getTime();
      const now = Date.now();

      // Start time should be in the future
      expect(startTime).toBeGreaterThan(now);
      // End time should be after start time
      expect(endTime).toBeGreaterThan(startTime);
    });

    it("should generate auctions with valid pricing", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestAuctions(3, "user1", "shop1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const auctions = callArgs.auctions;

      auctions.forEach((auction: any) => {
        // Reserve price should be higher than starting bid
        expect(auction.reservePrice).toBeGreaterThan(auction.startingBid);
        // Buy now price should be higher than starting bid
        expect(auction.buyNowPrice).toBeGreaterThan(auction.startingBid);
        // Bid increment should be positive
        expect(auction.bidIncrement).toBeGreaterThan(0);
      });
    });
  });

  describe("generateTestOrders", () => {
    it("should generate test orders", async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 3,
          ids: ["order1", "order2", "order3"],
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.generateTestOrders(3, "user1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/orders",
        expect.objectContaining({
          orders: expect.arrayContaining([
            expect.objectContaining({
              orderId: expect.stringContaining("TEST_ORD_"),
              userId: "user1",
              totalAmount: expect.any(Number),
              subtotal: expect.any(Number),
              shippingCost: expect.any(Number),
              tax: expect.any(Number),
              status: expect.any(String),
              paymentStatus: expect.any(String),
              paymentMethod: expect.any(String),
              items: expect.any(Array),
            }),
          ]),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should generate orders with valid amounts", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestOrders(2, "user1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const orders = callArgs.orders;

      orders.forEach((order: any) => {
        // Total should equal subtotal + shipping + tax
        expect(order.totalAmount).toBe(
          order.subtotal + order.shippingCost + order.tax
        );
        // All amounts should be positive
        expect(order.totalAmount).toBeGreaterThan(0);
        expect(order.subtotal).toBeGreaterThan(0);
      });
    });

    it("should generate orders with items", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestOrders(1, "user1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const order = callArgs.orders[0];

      expect(order.items).toBeDefined();
      expect(order.items.length).toBeGreaterThan(0);
      expect(order.items[0]).toHaveProperty("productId");
      expect(order.items[0]).toHaveProperty("name");
      expect(order.items[0]).toHaveProperty("quantity");
      expect(order.items[0]).toHaveProperty("price");
    });
  });

  describe("generateTestReviews", () => {
    it("should generate test reviews", async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 5,
          ids: ["rev1", "rev2", "rev3", "rev4", "rev5"],
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.generateTestReviews(
        5,
        "user1",
        "product1"
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/reviews",
        expect.objectContaining({
          reviews: expect.arrayContaining([
            expect.objectContaining({
              userId: "user1",
              productId: "product1",
              rating: expect.any(Number),
              comment: expect.any(String),
              title: expect.stringContaining("TEST_Review"),
              isVerifiedPurchase: expect.any(Boolean),
              status: expect.any(String),
            }),
          ]),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should generate reviews with valid ratings", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestReviews(10, "user1", "product1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const reviews = callArgs.reviews;

      reviews.forEach((review: any) => {
        // Rating should be between 3 and 5
        expect(review.rating).toBeGreaterThanOrEqual(3);
        expect(review.rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe("generateTestTickets", () => {
    it("should generate test support tickets", async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 3,
          ids: ["ticket1", "ticket2", "ticket3"],
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.generateTestTickets(3, "user1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/tickets",
        expect.objectContaining({
          tickets: expect.arrayContaining([
            expect.objectContaining({
              subject: expect.stringContaining("TEST_"),
              description: expect.any(String),
              category: expect.any(String),
              priority: expect.any(String),
              status: "open",
            }),
          ]),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should generate tickets with valid priorities", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestTickets(5, "user1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const tickets = callArgs.tickets;

      tickets.forEach((ticket: any) => {
        expect(["low", "medium", "high"]).toContain(ticket.priority);
      });
    });

    it("should generate tickets with valid categories", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestTickets(5, "user1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const tickets = callArgs.tickets;

      const validCategories = [
        "order-issue",
        "return-refund",
        "product-question",
        "account",
        "payment",
      ];

      tickets.forEach((ticket: any) => {
        expect(validCategories).toContain(ticket.category);
      });
    });
  });

  describe("generateTestShop", () => {
    it("should generate test shop", async () => {
      const mockResponse = {
        data: {
          success: true,
          shopId: "shop1",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.generateTestShop("user1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/shop",
        expect.objectContaining({
          name: expect.stringContaining("TEST_Shop_"),
          slug: expect.stringContaining("TEST_"),
          ownerId: "user1",
          email: expect.stringMatching(/^testshop\d+@example\.com$/),
          phone: expect.any(String),
          location: expect.any(String),
          address: expect.any(String),
          isActive: true,
          verified: false,
          featured: false,
          logo: expect.stringContaining("placeholder"),
          banner: expect.stringContaining("placeholder"),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should generate shop with unique identifiers", async () => {
      const mockResponse = { data: { success: true, shopId: "shop1" } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestShop("user1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];

      // Name should include timestamp for uniqueness
      expect(callArgs.name).toMatch(/TEST_Shop_\d+/);
      // Slug should include timestamp
      expect(callArgs.slug).toMatch(/TEST_.*\d+/);
      // Email should include timestamp
      expect(callArgs.email).toMatch(/testshop\d+@example\.com/);
    });
  });

  describe("generateTestCategories", () => {
    it("should generate test categories", async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 3,
          ids: ["cat1", "cat2", "cat3"],
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.generateTestCategories();

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/categories",
        expect.objectContaining({
          categories: expect.arrayContaining([
            expect.objectContaining({
              name: expect.stringContaining("TEST_"),
              slug: expect.stringContaining("TEST_"),
              description: expect.any(String),
              parentId: null,
              isActive: true,
            }),
          ]),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should generate categories with featured flags", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestCategories();

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const categories = callArgs.categories;

      // At least one category should be featured
      const hasFeatured = categories.some((cat: any) => cat.featured);
      expect(hasFeatured).toBe(true);
    });
  });

  describe("generateTestCoupons", () => {
    it("should generate test coupons", async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 3,
          ids: ["coup1", "coup2", "coup3"],
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.generateTestCoupons(3, "shop1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/coupons",
        expect.objectContaining({
          coupons: expect.arrayContaining([
            expect.objectContaining({
              code: expect.stringContaining("TEST_COUP"),
              description: expect.any(String),
              discountType: expect.any(String),
              discountValue: expect.any(Number),
              minOrderValue: expect.any(Number),
              maxDiscount: expect.any(Number),
              usageLimit: expect.any(Number),
              usageCount: 0,
              shopId: "shop1",
              isActive: true,
            }),
          ]),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should generate coupons with valid dates", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestCoupons(2, "shop1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const coupons = callArgs.coupons;

      coupons.forEach((coupon: any) => {
        const validFrom = new Date(coupon.validFrom).getTime();
        const validUntil = new Date(coupon.validUntil).getTime();

        // validUntil should be after validFrom
        expect(validUntil).toBeGreaterThan(validFrom);
        // validFrom should be around now
        expect(validFrom).toBeLessThanOrEqual(Date.now() + 1000);
      });
    });

    it("should generate coupons with valid discount types", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await testDataService.generateTestCoupons(5, "shop1");

      const callArgs = (apiService.post as jest.Mock).mock.calls[0][1];
      const coupons = callArgs.coupons;

      coupons.forEach((coupon: any) => {
        expect(["percentage", "fixed"]).toContain(coupon.discountType);
      });
    });
  });

  describe("cleanupTestData", () => {
    it("should cleanup test data", async () => {
      const mockResponse = {
        data: {
          products: 10,
          auctions: 5,
          orders: 15,
          reviews: 20,
          tickets: 8,
          shops: 2,
          coupons: 6,
          categories: 3,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.cleanupTestData();

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/cleanup",
        {}
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("getTestDataStatus", () => {
    it("should get test data status", async () => {
      const mockResponse = {
        data: {
          products: 25,
          auctions: 10,
          orders: 50,
          reviews: 100,
          tickets: 15,
          shops: 5,
          coupons: 12,
          categories: 8,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.getTestDataStatus();

      expect(apiService.get).toHaveBeenCalledWith(
        "/admin/test-workflow/status"
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("executeWorkflow", () => {
    it("should execute workflow", async () => {
      const mockResponse = {
        data: {
          success: true,
          workflowId: "wf123",
          status: "completed",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.executeWorkflow("full-setup", {
        productCount: 10,
        auctionCount: 5,
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/execute",
        {
          workflowType: "full-setup",
          params: {
            productCount: 10,
            auctionCount: 5,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should execute workflow without params", async () => {
      const mockResponse = {
        data: {
          success: true,
          workflowId: "wf124",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testDataService.executeWorkflow("basic-setup");

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/test-workflow/execute",
        {
          workflowType: "basic-setup",
          params: {},
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("Data Prefix", () => {
    it("should use TEST_ prefix for all generated data", async () => {
      const mockResponse = { data: { success: true } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      // Generate various types of test data
      await testDataService.generateTestProducts(1, "user1", "shop1");
      await testDataService.generateTestAuctions(1, "user1", "shop1");
      await testDataService.generateTestTickets(1, "user1");
      await testDataService.generateTestShop("user1");
      await testDataService.generateTestCategories();
      await testDataService.generateTestCoupons(1, "shop1");

      // Check all calls used TEST_ prefix
      (apiService.post as jest.Mock).mock.calls.forEach((call) => {
        const data = call[1];

        // Check for TEST_ in various data structures
        if (data.products) {
          data.products.forEach((p: any) => {
            expect(p.name).toContain("TEST_");
            expect(p.sku).toContain("TEST_SKU_");
          });
        }
        if (data.auctions) {
          data.auctions.forEach((a: any) => {
            expect(a.name).toContain("TEST_");
          });
        }
        if (data.tickets) {
          data.tickets.forEach((t: any) => {
            expect(t.subject).toContain("TEST_");
          });
        }
        if (data.name) {
          expect(data.name).toContain("TEST_");
        }
        if (data.categories) {
          data.categories.forEach((c: any) => {
            expect(c.name).toContain("TEST_");
          });
        }
        if (data.coupons) {
          data.coupons.forEach((c: any) => {
            expect(c.code).toContain("TEST_");
          });
        }
      });
    });
  });
});
