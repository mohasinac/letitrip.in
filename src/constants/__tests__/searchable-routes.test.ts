import {
  ALL_SEARCHABLE_ROUTES,
  AUTH_ROUTES,
  LEGAL_ROUTES,
  PUBLIC_ROUTES,
  searchNavigationRoutes,
  SELLER_ROUTES,
  SUPPORT_ROUTES,
  USER_ROUTES,
} from "../searchable-routes";

describe("Searchable Routes Constants", () => {
  // ============================================================================
  // PUBLIC_ROUTES Tests
  // ============================================================================
  describe("PUBLIC_ROUTES", () => {
    it("should export PUBLIC_ROUTES array", () => {
      expect(PUBLIC_ROUTES).toBeDefined();
      expect(Array.isArray(PUBLIC_ROUTES)).toBe(true);
      expect(PUBLIC_ROUTES.length).toBeGreaterThan(0);
    });

    it("should have valid route structure", () => {
      PUBLIC_ROUTES.forEach((route) => {
        expect(route).toHaveProperty("id");
        expect(route).toHaveProperty("name");
        expect(route).toHaveProperty("path");
        expect(route).toHaveProperty("description");
        expect(route).toHaveProperty("keywords");
        expect(route).toHaveProperty("icon");
        expect(route).toHaveProperty("category");
        expect(typeof route.id).toBe("string");
        expect(typeof route.name).toBe("string");
        expect(typeof route.path).toBe("string");
        expect(typeof route.description).toBe("string");
        expect(Array.isArray(route.keywords)).toBe(true);
        expect(typeof route.icon).toBe("string");
        expect(typeof route.category).toBe("string");
      });
    });

    it("should have category as 'main'", () => {
      PUBLIC_ROUTES.forEach((route) => {
        expect(route.category).toBe("main");
      });
    });

    it("should have unique IDs", () => {
      const ids = PUBLIC_ROUTES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid paths", () => {
      PUBLIC_ROUTES.forEach((route) => {
        expect(route.path).toMatch(/^\//);
      });
    });

    it("should have non-empty keywords", () => {
      PUBLIC_ROUTES.forEach((route) => {
        expect(route.keywords.length).toBeGreaterThan(0);
        route.keywords.forEach((kw) => {
          expect(typeof kw).toBe("string");
          expect(kw.length).toBeGreaterThan(0);
        });
      });
    });

    it("should include home route", () => {
      const homeRoute = PUBLIC_ROUTES.find((r) => r.id === "home");
      expect(homeRoute).toBeDefined();
      expect(homeRoute?.path).toBe("/");
    });

    it("should include auctions route", () => {
      const auctionsRoute = PUBLIC_ROUTES.find((r) => r.id === "auctions");
      expect(auctionsRoute).toBeDefined();
      expect(auctionsRoute?.path).toBe("/auctions");
    });

    it("should include products route", () => {
      const productsRoute = PUBLIC_ROUTES.find((r) => r.id === "products");
      expect(productsRoute).toBeDefined();
      expect(productsRoute?.path).toBe("/products");
    });
  });

  // ============================================================================
  // USER_ROUTES Tests
  // ============================================================================
  describe("USER_ROUTES", () => {
    it("should export USER_ROUTES array", () => {
      expect(USER_ROUTES).toBeDefined();
      expect(Array.isArray(USER_ROUTES)).toBe(true);
      expect(USER_ROUTES.length).toBeGreaterThan(0);
    });

    it("should have valid route structure", () => {
      USER_ROUTES.forEach((route) => {
        expect(route).toHaveProperty("id");
        expect(route).toHaveProperty("name");
        expect(route).toHaveProperty("path");
        expect(route).toHaveProperty("description");
        expect(route).toHaveProperty("keywords");
        expect(route).toHaveProperty("icon");
        expect(route).toHaveProperty("category");
      });
    });

    it("should have category as 'user'", () => {
      USER_ROUTES.forEach((route) => {
        expect(route.category).toBe("user");
      });
    });

    it("should have paths starting with /user", () => {
      USER_ROUTES.forEach((route) => {
        expect(route.path).toMatch(/^\/user/);
      });
    });

    it("should have unique IDs", () => {
      const ids = USER_ROUTES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should include user dashboard", () => {
      const dashboard = USER_ROUTES.find((r) => r.id === "user-dashboard");
      expect(dashboard).toBeDefined();
      expect(dashboard?.path).toBe("/user");
    });

    it("should include user orders", () => {
      const orders = USER_ROUTES.find((r) => r.id === "user-orders");
      expect(orders).toBeDefined();
      expect(orders?.path).toBe("/user/orders");
    });

    it("should include user bids", () => {
      const bids = USER_ROUTES.find((r) => r.id === "user-bids");
      expect(bids).toBeDefined();
      expect(bids?.path).toBe("/user/bids");
    });
  });

  // ============================================================================
  // SELLER_ROUTES Tests
  // ============================================================================
  describe("SELLER_ROUTES", () => {
    it("should export SELLER_ROUTES array", () => {
      expect(SELLER_ROUTES).toBeDefined();
      expect(Array.isArray(SELLER_ROUTES)).toBe(true);
      expect(SELLER_ROUTES.length).toBeGreaterThan(0);
    });

    it("should have valid route structure", () => {
      SELLER_ROUTES.forEach((route) => {
        expect(route).toHaveProperty("id");
        expect(route).toHaveProperty("name");
        expect(route).toHaveProperty("path");
        expect(route).toHaveProperty("description");
        expect(route).toHaveProperty("keywords");
        expect(route).toHaveProperty("icon");
        expect(route).toHaveProperty("category");
      });
    });

    it("should have category as 'seller'", () => {
      SELLER_ROUTES.forEach((route) => {
        expect(route.category).toBe("seller");
      });
    });

    it("should have paths starting with /seller", () => {
      SELLER_ROUTES.forEach((route) => {
        expect(route.path).toMatch(/^\/seller/);
      });
    });

    it("should have unique IDs", () => {
      const ids = SELLER_ROUTES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should include seller dashboard", () => {
      const dashboard = SELLER_ROUTES.find((r) => r.id === "seller-dashboard");
      expect(dashboard).toBeDefined();
      expect(dashboard?.path).toBe("/seller");
    });

    it("should include seller products", () => {
      const products = SELLER_ROUTES.find((r) => r.id === "seller-products");
      expect(products).toBeDefined();
      expect(products?.path).toBe("/seller/products");
    });
  });

  // ============================================================================
  // SUPPORT_ROUTES Tests
  // ============================================================================
  describe("SUPPORT_ROUTES", () => {
    it("should export SUPPORT_ROUTES array", () => {
      expect(SUPPORT_ROUTES).toBeDefined();
      expect(Array.isArray(SUPPORT_ROUTES)).toBe(true);
      expect(SUPPORT_ROUTES.length).toBeGreaterThan(0);
    });

    it("should have valid route structure", () => {
      SUPPORT_ROUTES.forEach((route) => {
        expect(route).toHaveProperty("id");
        expect(route).toHaveProperty("name");
        expect(route).toHaveProperty("path");
        expect(route).toHaveProperty("description");
        expect(route).toHaveProperty("keywords");
        expect(route).toHaveProperty("icon");
        expect(route).toHaveProperty("category");
      });
    });

    it("should have category as 'support'", () => {
      SUPPORT_ROUTES.forEach((route) => {
        expect(route.category).toBe("support");
      });
    });

    it("should have unique IDs", () => {
      const ids = SUPPORT_ROUTES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should include about route", () => {
      const about = SUPPORT_ROUTES.find((r) => r.id === "about");
      expect(about).toBeDefined();
      expect(about?.path).toBe("/about");
    });

    it("should include contact route", () => {
      const contact = SUPPORT_ROUTES.find((r) => r.id === "contact");
      expect(contact).toBeDefined();
      expect(contact?.path).toBe("/contact");
    });

    it("should include faq route", () => {
      const faq = SUPPORT_ROUTES.find((r) => r.id === "faq");
      expect(faq).toBeDefined();
      expect(faq?.path).toBe("/faq");
    });
  });

  // ============================================================================
  // LEGAL_ROUTES Tests
  // ============================================================================
  describe("LEGAL_ROUTES", () => {
    it("should export LEGAL_ROUTES array", () => {
      expect(LEGAL_ROUTES).toBeDefined();
      expect(Array.isArray(LEGAL_ROUTES)).toBe(true);
      expect(LEGAL_ROUTES.length).toBeGreaterThan(0);
    });

    it("should have valid route structure", () => {
      LEGAL_ROUTES.forEach((route) => {
        expect(route).toHaveProperty("id");
        expect(route).toHaveProperty("name");
        expect(route).toHaveProperty("path");
        expect(route).toHaveProperty("description");
        expect(route).toHaveProperty("keywords");
        expect(route).toHaveProperty("icon");
        expect(route).toHaveProperty("category");
      });
    });

    it("should have category as 'legal'", () => {
      LEGAL_ROUTES.forEach((route) => {
        expect(route.category).toBe("legal");
      });
    });

    it("should have unique IDs", () => {
      const ids = LEGAL_ROUTES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should include privacy policy", () => {
      const privacy = LEGAL_ROUTES.find((r) => r.id === "privacy");
      expect(privacy).toBeDefined();
      expect(privacy?.path).toBe("/privacy-policy");
    });

    it("should include terms of service", () => {
      const terms = LEGAL_ROUTES.find((r) => r.id === "terms");
      expect(terms).toBeDefined();
      expect(terms?.path).toBe("/terms-of-service");
    });
  });

  // ============================================================================
  // AUTH_ROUTES Tests
  // ============================================================================
  describe("AUTH_ROUTES", () => {
    it("should export AUTH_ROUTES array", () => {
      expect(AUTH_ROUTES).toBeDefined();
      expect(Array.isArray(AUTH_ROUTES)).toBe(true);
      expect(AUTH_ROUTES.length).toBeGreaterThan(0);
    });

    it("should have valid route structure", () => {
      AUTH_ROUTES.forEach((route) => {
        expect(route).toHaveProperty("id");
        expect(route).toHaveProperty("name");
        expect(route).toHaveProperty("path");
        expect(route).toHaveProperty("description");
        expect(route).toHaveProperty("keywords");
        expect(route).toHaveProperty("icon");
        expect(route).toHaveProperty("category");
      });
    });

    it("should have category as 'main'", () => {
      AUTH_ROUTES.forEach((route) => {
        expect(route.category).toBe("main");
      });
    });

    it("should include login route", () => {
      const login = AUTH_ROUTES.find((r) => r.id === "login");
      expect(login).toBeDefined();
      expect(login?.path).toBe("/login");
    });

    it("should include register route", () => {
      const register = AUTH_ROUTES.find((r) => r.id === "register");
      expect(register).toBeDefined();
      expect(register?.path).toBe("/register");
    });
  });

  // ============================================================================
  // ALL_SEARCHABLE_ROUTES Tests
  // ============================================================================
  describe("ALL_SEARCHABLE_ROUTES", () => {
    it("should export ALL_SEARCHABLE_ROUTES array", () => {
      expect(ALL_SEARCHABLE_ROUTES).toBeDefined();
      expect(Array.isArray(ALL_SEARCHABLE_ROUTES)).toBe(true);
    });

    it("should combine all route arrays", () => {
      const totalLength =
        PUBLIC_ROUTES.length +
        USER_ROUTES.length +
        SELLER_ROUTES.length +
        SUPPORT_ROUTES.length +
        LEGAL_ROUTES.length +
        AUTH_ROUTES.length;
      expect(ALL_SEARCHABLE_ROUTES.length).toBe(totalLength);
    });

    it("should have unique IDs across all routes", () => {
      const ids = ALL_SEARCHABLE_ROUTES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should contain routes from all categories", () => {
      const categories = new Set(ALL_SEARCHABLE_ROUTES.map((r) => r.category));
      expect(categories.has("main")).toBe(true);
      expect(categories.has("user")).toBe(true);
      expect(categories.has("seller")).toBe(true);
      expect(categories.has("support")).toBe(true);
      expect(categories.has("legal")).toBe(true);
    });
  });

  // ============================================================================
  // searchNavigationRoutes Function Tests
  // ============================================================================
  describe("searchNavigationRoutes", () => {
    it("should return popular routes when query is empty", () => {
      const results = searchNavigationRoutes("");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it("should return results when query matches route name", () => {
      const results = searchNavigationRoutes("home");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.name.toLowerCase().includes("home"))).toBe(
        true
      );
    });

    it("should return results when query matches keywords", () => {
      const results = searchNavigationRoutes("auction");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should respect maxResults parameter", () => {
      const results = searchNavigationRoutes("shop", 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it("should include user routes by default", () => {
      const results = searchNavigationRoutes("dashboard");
      const hasUserRoute = results.some((r) => r.category === "user");
      expect(hasUserRoute).toBe(true);
    });

    it("should exclude user routes when includeUser is false", () => {
      const results = searchNavigationRoutes("dashboard", 10, {
        includeUser: false,
      });
      const hasUserRoute = results.some((r) => r.category === "user");
      expect(hasUserRoute).toBe(false);
    });

    it("should include seller routes by default", () => {
      const results = searchNavigationRoutes("seller");
      const hasSellerRoute = results.some((r) => r.category === "seller");
      expect(hasSellerRoute).toBe(true);
    });

    it("should exclude seller routes when includeSeller is false", () => {
      const results = searchNavigationRoutes("seller", 10, {
        includeSeller: false,
      });
      const hasSellerRoute = results.some((r) => r.category === "seller");
      expect(hasSellerRoute).toBe(false);
    });

    it("should return empty array for non-matching query", () => {
      const results = searchNavigationRoutes("xyzabcnonexistent123");
      expect(results).toEqual([]);
    });

    it("should handle whitespace in query", () => {
      const results = searchNavigationRoutes("  home  ");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case insensitive", () => {
      const resultsLower = searchNavigationRoutes("home");
      const resultsUpper = searchNavigationRoutes("HOME");
      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsUpper.length).toBeGreaterThan(0);
    });

    it("should handle multi-word queries", () => {
      const results = searchNavigationRoutes("my orders");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should prioritize exact name matches", () => {
      const results = searchNavigationRoutes("home");
      if (results.length > 0) {
        const firstResult = results[0];
        expect(firstResult.name.toLowerCase()).toContain("home");
      }
    });
  });
});
