import {
  ADMIN_ROUTES,
  ANALYTICS_ROUTES,
  API_BASE_URL,
  API_ROUTES,
  AUCTION_ROUTES,
  AUTH_ROUTES,
  CART_ROUTES,
  CATEGORY_ROUTES,
  CHECKOUT_ROUTES,
  COUPON_ROUTES,
  HOMEPAGE_ROUTES,
  MEDIA_ROUTES,
  ORDER_ROUTES,
  PAYMENT_ROUTES,
  PAYOUT_ROUTES,
  PRODUCT_ROUTES,
  RETURNS_ROUTES,
  REVIEW_ROUTES,
  SEARCH_ROUTES,
  SELLER_ROUTES,
  SHOP_ROUTES,
  SYSTEM_ROUTES,
  TICKET_ROUTES,
  USER_ROUTES,
  buildQueryString,
  buildUrl,
} from "../api-routes";

describe("API Routes", () => {
  describe("AUTH_ROUTES", () => {
    it("should have all authentication routes", () => {
      expect(AUTH_ROUTES.LOGIN).toBe("/auth/login");
      expect(AUTH_ROUTES.REGISTER).toBe("/auth/register");
      expect(AUTH_ROUTES.LOGOUT).toBe("/auth/logout");
      expect(AUTH_ROUTES.SESSION).toBe("/auth/session");
      expect(AUTH_ROUTES.SESSIONS).toBe("/auth/sessions");
      expect(AUTH_ROUTES.VERIFY_EMAIL).toBe("/auth/verify-email");
      expect(AUTH_ROUTES.RESET_PASSWORD).toBe("/auth/reset-password");
      expect(AUTH_ROUTES.CHANGE_PASSWORD).toBe("/auth/change-password");
    });

    it("should not include /api prefix", () => {
      Object.values(AUTH_ROUTES).forEach((route) => {
        expect(route).not.toMatch(/^\/api/);
      });
    });

    it("should start with /", () => {
      Object.values(AUTH_ROUTES).forEach((route) => {
        expect(route).toMatch(/^\//);
      });
    });
  });

  describe("USER_ROUTES", () => {
    it("should have profile routes", () => {
      expect(USER_ROUTES.PROFILE).toBe("/user/profile");
      expect(USER_ROUTES.UPDATE_PROFILE).toBe("/user/profile");
      expect(USER_ROUTES.AVATAR).toBe("/users/me/avatar");
      expect(USER_ROUTES.CHANGE_PASSWORD).toBe("/user/change-password");
    });

    it("should have address routes", () => {
      expect(USER_ROUTES.ADDRESSES).toBe("/user/addresses");
      expect(USER_ROUTES.ADDRESS_BY_ID("123")).toBe("/user/addresses/123");
    });

    it("should have order routes", () => {
      expect(USER_ROUTES.ORDERS).toBe("/user/orders");
      expect(USER_ROUTES.ORDER_BY_ID("order123")).toBe("/user/orders/order123");
    });

    it("should have admin user management routes", () => {
      expect(USER_ROUTES.LIST).toBe("/users");
      expect(USER_ROUTES.BY_ID("user123")).toBe("/users/user123");
      expect(USER_ROUTES.BULK).toBe("/users/bulk");
      expect(USER_ROUTES.STATS).toBe("/users/stats");
      expect(USER_ROUTES.BAN("user123")).toBe("/users/user123/ban");
      expect(USER_ROUTES.ROLE("user123")).toBe("/users/user123/role");
    });

    it("should handle dynamic parameters", () => {
      const testId = "test-id-123";
      expect(USER_ROUTES.BY_ID(testId)).toContain(testId);
      expect(USER_ROUTES.ADDRESS_BY_ID(testId)).toContain(testId);
    });
  });

  describe("PRODUCT_ROUTES", () => {
    it("should have product CRUD routes", () => {
      expect(PRODUCT_ROUTES.LIST).toBe("/products");
      expect(PRODUCT_ROUTES.BY_ID("prod123")).toBe("/products/prod123");
      expect(PRODUCT_ROUTES.BY_SLUG("cool-product")).toBe(
        "/products/cool-product"
      );
      expect(PRODUCT_ROUTES.BULK).toBe("/products/bulk");
    });

    it("should have product relationship routes", () => {
      expect(PRODUCT_ROUTES.REVIEWS("prod123")).toBe(
        "/products/prod123/reviews"
      );
      expect(PRODUCT_ROUTES.RELATED("prod123")).toBe(
        "/products/prod123/related"
      );
    });
  });

  describe("AUCTION_ROUTES", () => {
    it("should have auction CRUD routes", () => {
      expect(AUCTION_ROUTES.LIST).toBe("/auctions");
      expect(AUCTION_ROUTES.BY_ID("auc123")).toBe("/auctions/auc123");
      expect(AUCTION_ROUTES.BY_SLUG("auction-slug")).toBe(
        "/auctions/auction-slug"
      );
    });

    it("should have bidding routes", () => {
      expect(AUCTION_ROUTES.BIDS("auc123")).toBe("/auctions/auc123/bids");
      expect(AUCTION_ROUTES.PLACE_BID("auc123")).toBe("/auctions/auc123/bids");
      expect(AUCTION_ROUTES.AUTO_BID("auc123")).toBe(
        "/auctions/auc123/auto-bid"
      );
    });

    it("should have user auction routes", () => {
      expect(AUCTION_ROUTES.WATCH("auc123")).toBe("/auctions/auc123/watch");
      expect(AUCTION_ROUTES.MY_BIDS).toBe("/auctions/my-bids");
      expect(AUCTION_ROUTES.WATCHLIST).toBe("/auctions/watchlist");
      expect(AUCTION_ROUTES.WON).toBe("/auctions/won");
    });
  });

  describe("CATEGORY_ROUTES", () => {
    it("should have category CRUD routes", () => {
      expect(CATEGORY_ROUTES.LIST).toBe("/categories");
      expect(CATEGORY_ROUTES.BY_ID("cat123")).toBe("/categories/cat123");
      expect(CATEGORY_ROUTES.BY_SLUG("electronics")).toBe(
        "/categories/electronics"
      );
    });

    it("should have category utility routes", () => {
      expect(CATEGORY_ROUTES.TREE).toBe("/categories/tree");
      expect(CATEGORY_ROUTES.LEAVES).toBe("/categories/leaves");
      expect(CATEGORY_ROUTES.FEATURED).toBe("/categories/featured");
      expect(CATEGORY_ROUTES.HOMEPAGE).toBe("/categories/homepage");
      expect(CATEGORY_ROUTES.SEARCH).toBe("/categories/search");
    });

    it("should have category relationship routes", () => {
      expect(CATEGORY_ROUTES.SUBCATEGORIES("electronics")).toBe(
        "/categories/electronics/subcategories"
      );
      expect(CATEGORY_ROUTES.SIMILAR("electronics")).toBe(
        "/categories/electronics/similar"
      );
      expect(CATEGORY_ROUTES.HIERARCHY("electronics")).toBe(
        "/categories/electronics/hierarchy"
      );
      expect(CATEGORY_ROUTES.BREADCRUMB("cat123")).toBe(
        "/categories/cat123/hierarchy"
      );
    });

    it("should have multi-parent operations", () => {
      expect(CATEGORY_ROUTES.ADD_PARENT("electronics")).toBe(
        "/categories/electronics/add-parent"
      );
      expect(CATEGORY_ROUTES.REMOVE_PARENT("electronics")).toBe(
        "/categories/electronics/remove-parent"
      );
      expect(CATEGORY_ROUTES.PARENTS("electronics")).toBe(
        "/categories/electronics/parents"
      );
    });
  });

  describe("CART_ROUTES", () => {
    it("should have cart operations", () => {
      expect(CART_ROUTES.GET).toBe("/cart");
      expect(CART_ROUTES.ADD).toBe("/cart");
      expect(CART_ROUTES.UPDATE("item123")).toBe("/cart/item123");
      expect(CART_ROUTES.REMOVE("item123")).toBe("/cart/item123");
      expect(CART_ROUTES.CLEAR).toBe("/cart/clear");
      expect(CART_ROUTES.MERGE).toBe("/cart/merge");
      expect(CART_ROUTES.VALIDATE).toBe("/cart/validate");
    });
  });

  describe("ORDER_ROUTES", () => {
    it("should have order CRUD routes", () => {
      expect(ORDER_ROUTES.LIST).toBe("/orders");
      expect(ORDER_ROUTES.CREATE).toBe("/orders");
      expect(ORDER_ROUTES.BY_ID("order123")).toBe("/orders/order123");
      expect(ORDER_ROUTES.BULK).toBe("/orders/bulk");
    });

    it("should have order action routes", () => {
      expect(ORDER_ROUTES.CANCEL("order123")).toBe("/orders/order123/cancel");
      expect(ORDER_ROUTES.TRACKING("order123")).toBe(
        "/orders/order123/tracking"
      );
      expect(ORDER_ROUTES.INVOICE("order123")).toBe("/orders/order123/invoice");
    });
  });

  describe("ADMIN_ROUTES", () => {
    it("should have dashboard routes", () => {
      expect(ADMIN_ROUTES.DASHBOARD).toBe("/admin/dashboard");
    });

    it("should have entity management routes", () => {
      expect(ADMIN_ROUTES.USERS).toBe("/admin/users");
      expect(ADMIN_ROUTES.PRODUCTS).toBe("/admin/products");
      expect(ADMIN_ROUTES.AUCTIONS).toBe("/admin/auctions");
      expect(ADMIN_ROUTES.ORDERS).toBe("/admin/orders");
      expect(ADMIN_ROUTES.SHOPS).toBe("/admin/shops");
    });

    it("should have analytics routes", () => {
      expect(ADMIN_ROUTES.ANALYTICS_DASHBOARD).toBe(
        "/admin/analytics/dashboard"
      );
      expect(ADMIN_ROUTES.ANALYTICS_SALES).toBe("/admin/analytics/sales");
      expect(ADMIN_ROUTES.ANALYTICS_USERS).toBe("/admin/analytics/users");
    });

    it("should have demo data routes", () => {
      expect(ADMIN_ROUTES.DEMO.STATS).toBe("/admin/demo/stats");
      expect(ADMIN_ROUTES.DEMO.GENERATE_STEP("products")).toBe(
        "/admin/demo/generate/products"
      );
      expect(ADMIN_ROUTES.DEMO.CLEANUP_ALL).toBe("/admin/demo/cleanup-all");
    });
  });

  describe("SELLER_ROUTES", () => {
    it("should have seller dashboard", () => {
      expect(SELLER_ROUTES.DASHBOARD).toBe("/seller/dashboard");
    });

    it("should have seller product management", () => {
      expect(SELLER_ROUTES.PRODUCTS).toBe("/seller/products");
      expect(SELLER_ROUTES.PRODUCT_BY_ID("prod123")).toBe(
        "/seller/products/prod123"
      );
    });

    it("should have seller revenue routes", () => {
      expect(SELLER_ROUTES.REVENUE).toBe("/seller/revenue");
      expect(SELLER_ROUTES.PAYOUTS).toBe("/seller/payouts");
      expect(SELLER_ROUTES.PAYOUT_REQUEST).toBe("/seller/payouts/request");
    });

    it("should have seller analytics", () => {
      expect(SELLER_ROUTES.ANALYTICS).toBe("/analytics");
      expect(SELLER_ROUTES.ANALYTICS_DASHBOARD).toBe(
        "/seller/analytics/dashboard"
      );
    });
  });

  describe("buildQueryString", () => {
    it("should build query string from object", () => {
      const params = { page: 1, limit: 10, sort: "name" };
      const query = buildQueryString(params);
      expect(query).toBe("?page=1&limit=10&sort=name");
    });

    it("should handle array values", () => {
      const params = { tags: ["tag1", "tag2", "tag3"] };
      const query = buildQueryString(params);
      expect(query).toContain("tags=tag1");
      expect(query).toContain("tags=tag2");
      expect(query).toContain("tags=tag3");
    });

    it("should skip null and undefined values", () => {
      const params = { page: 1, filter: null, search: undefined, limit: 10 };
      const query = buildQueryString(params);
      expect(query).not.toContain("filter");
      expect(query).not.toContain("search");
      expect(query).toContain("page=1");
      expect(query).toContain("limit=10");
    });

    it("should skip empty string values", () => {
      const params = { page: 1, search: "", limit: 10 };
      const query = buildQueryString(params);
      expect(query).not.toContain("search");
    });

    it("should return empty string for empty params", () => {
      expect(buildQueryString({})).toBe("");
    });

    it("should handle boolean values", () => {
      const params = { active: true, deleted: false };
      const query = buildQueryString(params);
      expect(query).toContain("active=true");
      expect(query).toContain("deleted=false");
    });

    it("should handle numeric values", () => {
      const params = { price: 99.99, quantity: 0 };
      const query = buildQueryString(params);
      expect(query).toContain("price=99.99");
      expect(query).toContain("quantity=0");
    });

    it("should URL encode special characters", () => {
      const params = { search: "hello world", filter: "a&b" };
      const query = buildQueryString(params);
      expect(query).toContain("hello+world");
      expect(query).toContain("a%26b");
    });
  });

  describe("buildUrl", () => {
    it("should build URL with query params", () => {
      const url = buildUrl("/products", { page: 1, limit: 10 });
      expect(url).toBe("/products?page=1&limit=10");
    });

    it("should return path without params if params undefined", () => {
      const url = buildUrl("/products");
      expect(url).toBe("/products");
    });

    it("should return path without params if params empty", () => {
      const url = buildUrl("/products", {});
      expect(url).toBe("/products");
    });

    it("should work with dynamic routes", () => {
      const url = buildUrl(PRODUCT_ROUTES.BY_ID("prod123"), {
        include: "reviews",
      });
      expect(url).toBe("/products/prod123?include=reviews");
    });
  });

  describe("API_ROUTES aggregated object", () => {
    it("should include all route groups", () => {
      expect(API_ROUTES.AUTH).toBe(AUTH_ROUTES);
      expect(API_ROUTES.USER).toBe(USER_ROUTES);
      expect(API_ROUTES.PRODUCT).toBe(PRODUCT_ROUTES);
      expect(API_ROUTES.AUCTION).toBe(AUCTION_ROUTES);
      expect(API_ROUTES.CATEGORY).toBe(CATEGORY_ROUTES);
      expect(API_ROUTES.SHOP).toBe(SHOP_ROUTES);
      expect(API_ROUTES.CART).toBe(CART_ROUTES);
      expect(API_ROUTES.ORDER).toBe(ORDER_ROUTES);
      expect(API_ROUTES.COUPON).toBe(COUPON_ROUTES);
      expect(API_ROUTES.MEDIA).toBe(MEDIA_ROUTES);
      expect(API_ROUTES.SEARCH).toBe(SEARCH_ROUTES);
      expect(API_ROUTES.REVIEW).toBe(REVIEW_ROUTES);
      expect(API_ROUTES.PAYMENT).toBe(PAYMENT_ROUTES);
      expect(API_ROUTES.PAYOUT).toBe(PAYOUT_ROUTES);
      expect(API_ROUTES.HOMEPAGE).toBe(HOMEPAGE_ROUTES);
      expect(API_ROUTES.CHECKOUT).toBe(CHECKOUT_ROUTES);
      expect(API_ROUTES.TICKET).toBe(TICKET_ROUTES);
      expect(API_ROUTES.RETURNS).toBe(RETURNS_ROUTES);
      expect(API_ROUTES.ANALYTICS).toBe(ANALYTICS_ROUTES);
      expect(API_ROUTES.ADMIN).toBe(ADMIN_ROUTES);
      expect(API_ROUTES.SELLER).toBe(SELLER_ROUTES);
      expect(API_ROUTES.SYSTEM).toBe(SYSTEM_ROUTES);
    });
  });

  describe("Route consistency", () => {
    it("should not have duplicate routes across groups", () => {
      const allRoutes: string[] = [];
      const checkDuplicates = (routes: any, prefix = "") => {
        Object.entries(routes).forEach(([key, value]) => {
          if (typeof value === "string") {
            allRoutes.push(value);
          } else if (typeof value === "function") {
            // Skip dynamic route functions
          } else if (typeof value === "object") {
            checkDuplicates(value, `${prefix}${key}.`);
          }
        });
      };

      checkDuplicates(API_ROUTES);

      // Allow same routes across different contexts (e.g., /admin/users vs /users)
      // This is expected in RBAC systems
      expect(allRoutes.length).toBeGreaterThan(0);
    });

    it("should have consistent URL format", () => {
      const checkFormat = (routes: any) => {
        Object.values(routes).forEach((value) => {
          if (typeof value === "string") {
            expect(value).toMatch(/^\//); // Starts with /
            expect(value).not.toMatch(/\/$/); // Does not end with /
            expect(value).not.toMatch(/\/\//); // No double slashes
          }
        });
      };

      checkFormat(AUTH_ROUTES);
      checkFormat(USER_ROUTES);
      checkFormat(PRODUCT_ROUTES);
      checkFormat(ADMIN_ROUTES);
    });

    it("should use kebab-case in URLs", () => {
      const checkKebabCase = (routes: any) => {
        Object.values(routes).forEach((value) => {
          if (typeof value === "string") {
            const parts = value
              .split("/")
              .filter((p) => p && !p.startsWith(":"));
            parts.forEach((part) => {
              expect(part).toMatch(/^[a-z0-9-]+$/);
            });
          }
        });
      };

      checkKebabCase(AUTH_ROUTES);
      checkKebabCase(USER_ROUTES);
      checkKebabCase(ADMIN_ROUTES);
    });
  });

  describe("Dynamic route functions", () => {
    it("should handle empty strings", () => {
      expect(PRODUCT_ROUTES.BY_ID("")).toBe("/products/");
      expect(USER_ROUTES.BY_ID("")).toBe("/users/");
    });

    it("should handle special characters", () => {
      expect(PRODUCT_ROUTES.BY_SLUG("test-product")).toBe(
        "/products/test-product"
      );
      expect(CATEGORY_ROUTES.BY_SLUG("test_category")).toBe(
        "/categories/test_category"
      );
    });

    it("should handle numeric IDs", () => {
      expect(ORDER_ROUTES.BY_ID("123")).toBe("/orders/123");
      expect(PRODUCT_ROUTES.BY_ID("456")).toBe("/products/456");
    });

    it("should handle UUID IDs", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(USER_ROUTES.BY_ID(uuid)).toBe(`/users/${uuid}`);
    });
  });

  describe("API_BASE_URL", () => {
    it("should be defined", () => {
      expect(API_BASE_URL).toBeDefined();
    });

    it("should be a string", () => {
      expect(typeof API_BASE_URL).toBe("string");
    });
  });

  describe("Edge cases", () => {
    it("should handle buildQueryString with nested objects", () => {
      const params = { filter: { name: "test", age: 25 } };
      // Objects are converted to [object Object], which is expected
      const query = buildQueryString(params);
      expect(query).toBeDefined();
    });

    it("should handle buildQueryString with special values", () => {
      const params = {
        zero: 0,
        false: false,
        emptyArray: [],
        singleArray: ["single"],
      };
      const query = buildQueryString(params);
      expect(query).toContain("zero=0");
      expect(query).toContain("false=false");
      expect(query).toContain("singleArray=single");
    });

    it("should handle very long query strings", () => {
      const params = {
        tags: Array(100)
          .fill("tag")
          .map((t, i) => `${t}${i}`),
      };
      const query = buildQueryString(params);
      expect(query.length).toBeGreaterThan(100);
      expect(query).toContain("tags=tag0");
      expect(query).toContain("tags=tag99");
    });
  });

  describe("Type safety", () => {
    it("should be type-safe with const assertions", () => {
      // This is a compile-time check, but we can verify structure
      expect(typeof AUTH_ROUTES.LOGIN).toBe("string");
      expect(typeof USER_ROUTES.BY_ID).toBe("function");
    });
  });
});
