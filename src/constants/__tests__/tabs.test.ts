import {
  ADMIN_AUCTIONS_TABS,
  ADMIN_BLOG_TABS,
  ADMIN_CONTENT_TABS,
  ADMIN_MARKETPLACE_TABS,
  ADMIN_SETTINGS_TABS,
  ADMIN_SUPPORT_TABS,
  ADMIN_TABS,
  ADMIN_TRANSACTIONS_TABS,
  SELLER_AUCTIONS_TABS,
  SELLER_ORDERS_TABS,
  SELLER_PRODUCTS_TABS,
  SELLER_SHOP_TABS,
  SELLER_TABS,
  Tab,
  USER_AUCTIONS_TABS,
  USER_ORDERS_TABS,
  USER_SETTINGS_TABS,
  USER_TABS,
} from "../tabs";

describe("Tab Navigation Constants", () => {
  // Helper function to validate tab structure
  const validateTabStructure = (tab: Tab) => {
    expect(tab).toHaveProperty("id");
    expect(tab).toHaveProperty("label");
    expect(tab).toHaveProperty("href");
    expect(typeof tab.id).toBe("string");
    expect(typeof tab.label).toBe("string");
    expect(typeof tab.href).toBe("string");
    expect(tab.id.length).toBeGreaterThan(0);
    expect(tab.label.length).toBeGreaterThan(0);
    expect(tab.href).toMatch(/^\//);
    if (tab.icon) {
      expect(typeof tab.icon).toBe("string");
    }
  };

  // ============================================================================
  // Admin Settings Tabs Tests
  // ============================================================================
  describe("ADMIN_SETTINGS_TABS", () => {
    it("should export ADMIN_SETTINGS_TABS array", () => {
      expect(ADMIN_SETTINGS_TABS).toBeDefined();
      expect(Array.isArray(ADMIN_SETTINGS_TABS)).toBe(true);
      expect(ADMIN_SETTINGS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      ADMIN_SETTINGS_TABS.forEach(validateTabStructure);
    });

    it("should have unique IDs", () => {
      const ids = ADMIN_SETTINGS_TABS.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have paths starting with /admin/settings", () => {
      ADMIN_SETTINGS_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/admin\/settings/);
      });
    });

    it("should include general tab", () => {
      const general = ADMIN_SETTINGS_TABS.find((t) => t.id === "general");
      expect(general).toBeDefined();
      expect(general?.href).toBe("/admin/settings");
    });

    it("should include payment tab", () => {
      const payment = ADMIN_SETTINGS_TABS.find((t) => t.id === "payment");
      expect(payment).toBeDefined();
      expect(payment?.href).toBe("/admin/settings/payment");
    });

    it("should include shipping tab", () => {
      const shipping = ADMIN_SETTINGS_TABS.find((t) => t.id === "shipping");
      expect(shipping).toBeDefined();
      expect(shipping?.href).toBe("/admin/settings/shipping");
    });

    it("should include email tab", () => {
      const email = ADMIN_SETTINGS_TABS.find((t) => t.id === "email");
      expect(email).toBeDefined();
      expect(email?.href).toBe("/admin/settings/email");
    });

    it("should include notifications tab", () => {
      const notifications = ADMIN_SETTINGS_TABS.find(
        (t) => t.id === "notifications"
      );
      expect(notifications).toBeDefined();
      expect(notifications?.href).toBe("/admin/settings/notifications");
    });
  });

  // ============================================================================
  // Admin Blog Tabs Tests
  // ============================================================================
  describe("ADMIN_BLOG_TABS", () => {
    it("should export ADMIN_BLOG_TABS array", () => {
      expect(ADMIN_BLOG_TABS).toBeDefined();
      expect(Array.isArray(ADMIN_BLOG_TABS)).toBe(true);
      expect(ADMIN_BLOG_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      ADMIN_BLOG_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /admin/blog", () => {
      ADMIN_BLOG_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/admin\/blog/);
      });
    });

    it("should include posts tab", () => {
      const posts = ADMIN_BLOG_TABS.find((t) => t.id === "posts");
      expect(posts).toBeDefined();
      expect(posts?.href).toBe("/admin/blog");
    });

    it("should include create tab", () => {
      const create = ADMIN_BLOG_TABS.find((t) => t.id === "create");
      expect(create).toBeDefined();
      expect(create?.href).toBe("/admin/blog/create");
    });
  });

  // ============================================================================
  // Admin Auctions Tabs Tests
  // ============================================================================
  describe("ADMIN_AUCTIONS_TABS", () => {
    it("should export ADMIN_AUCTIONS_TABS array", () => {
      expect(ADMIN_AUCTIONS_TABS).toBeDefined();
      expect(Array.isArray(ADMIN_AUCTIONS_TABS)).toBe(true);
      expect(ADMIN_AUCTIONS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      ADMIN_AUCTIONS_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /admin/auctions", () => {
      ADMIN_AUCTIONS_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/admin\/auctions/);
      });
    });
  });

  // ============================================================================
  // Admin Content Tabs Tests
  // ============================================================================
  describe("ADMIN_CONTENT_TABS", () => {
    it("should export ADMIN_CONTENT_TABS array", () => {
      expect(ADMIN_CONTENT_TABS).toBeDefined();
      expect(Array.isArray(ADMIN_CONTENT_TABS)).toBe(true);
      expect(ADMIN_CONTENT_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      ADMIN_CONTENT_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /admin", () => {
      ADMIN_CONTENT_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/admin/);
      });
    });

    it("should include homepage tab", () => {
      const homepage = ADMIN_CONTENT_TABS.find((t) => t.id === "homepage");
      expect(homepage).toBeDefined();
      expect(homepage?.href).toBe("/admin/homepage");
    });
  });

  // ============================================================================
  // Admin Marketplace Tabs Tests
  // ============================================================================
  describe("ADMIN_MARKETPLACE_TABS", () => {
    it("should export ADMIN_MARKETPLACE_TABS array", () => {
      expect(ADMIN_MARKETPLACE_TABS).toBeDefined();
      expect(Array.isArray(ADMIN_MARKETPLACE_TABS)).toBe(true);
      expect(ADMIN_MARKETPLACE_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      ADMIN_MARKETPLACE_TABS.forEach(validateTabStructure);
    });

    it("should include products tab", () => {
      const products = ADMIN_MARKETPLACE_TABS.find((t) => t.id === "products");
      expect(products).toBeDefined();
      expect(products?.href).toBe("/admin/products");
    });

    it("should include shops tab", () => {
      const shops = ADMIN_MARKETPLACE_TABS.find((t) => t.id === "shops");
      expect(shops).toBeDefined();
      expect(shops?.href).toBe("/admin/shops");
    });
  });

  // ============================================================================
  // Admin Transactions Tabs Tests
  // ============================================================================
  describe("ADMIN_TRANSACTIONS_TABS", () => {
    it("should export ADMIN_TRANSACTIONS_TABS array", () => {
      expect(ADMIN_TRANSACTIONS_TABS).toBeDefined();
      expect(Array.isArray(ADMIN_TRANSACTIONS_TABS)).toBe(true);
      expect(ADMIN_TRANSACTIONS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      ADMIN_TRANSACTIONS_TABS.forEach(validateTabStructure);
    });

    it("should include orders tab", () => {
      const orders = ADMIN_TRANSACTIONS_TABS.find((t) => t.id === "orders");
      expect(orders).toBeDefined();
      expect(orders?.href).toBe("/admin/orders");
    });

    it("should include payments tab", () => {
      const payments = ADMIN_TRANSACTIONS_TABS.find((t) => t.id === "payments");
      expect(payments).toBeDefined();
      expect(payments?.href).toBe("/admin/payments");
    });

    it("should include payouts tab", () => {
      const payouts = ADMIN_TRANSACTIONS_TABS.find((t) => t.id === "payouts");
      expect(payouts).toBeDefined();
      expect(payouts?.href).toBe("/admin/payouts");
    });
  });

  // ============================================================================
  // Admin Support Tabs Tests
  // ============================================================================
  describe("ADMIN_SUPPORT_TABS", () => {
    it("should export ADMIN_SUPPORT_TABS array", () => {
      expect(ADMIN_SUPPORT_TABS).toBeDefined();
      expect(Array.isArray(ADMIN_SUPPORT_TABS)).toBe(true);
      expect(ADMIN_SUPPORT_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      ADMIN_SUPPORT_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /admin/support", () => {
      ADMIN_SUPPORT_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/admin\/support/);
      });
    });
  });

  // ============================================================================
  // Seller Products Tabs Tests
  // ============================================================================
  describe("SELLER_PRODUCTS_TABS", () => {
    it("should export SELLER_PRODUCTS_TABS array", () => {
      expect(SELLER_PRODUCTS_TABS).toBeDefined();
      expect(Array.isArray(SELLER_PRODUCTS_TABS)).toBe(true);
      expect(SELLER_PRODUCTS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      SELLER_PRODUCTS_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /seller/products", () => {
      SELLER_PRODUCTS_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/seller\/products/);
      });
    });

    it("should include all tab", () => {
      const all = SELLER_PRODUCTS_TABS.find((t) => t.id === "all");
      expect(all).toBeDefined();
      expect(all?.href).toBe("/seller/products");
    });

    it("should include create tab", () => {
      const create = SELLER_PRODUCTS_TABS.find((t) => t.id === "create");
      expect(create).toBeDefined();
      expect(create?.href).toBe("/seller/products/create");
    });
  });

  // ============================================================================
  // Seller Auctions Tabs Tests
  // ============================================================================
  describe("SELLER_AUCTIONS_TABS", () => {
    it("should export SELLER_AUCTIONS_TABS array", () => {
      expect(SELLER_AUCTIONS_TABS).toBeDefined();
      expect(Array.isArray(SELLER_AUCTIONS_TABS)).toBe(true);
      expect(SELLER_AUCTIONS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      SELLER_AUCTIONS_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /seller/auctions", () => {
      SELLER_AUCTIONS_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/seller\/auctions/);
      });
    });
  });

  // ============================================================================
  // Seller Orders Tabs Tests
  // ============================================================================
  describe("SELLER_ORDERS_TABS", () => {
    it("should export SELLER_ORDERS_TABS array", () => {
      expect(SELLER_ORDERS_TABS).toBeDefined();
      expect(Array.isArray(SELLER_ORDERS_TABS)).toBe(true);
      expect(SELLER_ORDERS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      SELLER_ORDERS_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /seller/orders", () => {
      SELLER_ORDERS_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/seller\/orders/);
      });
    });
  });

  // ============================================================================
  // Seller Shop Tabs Tests
  // ============================================================================
  describe("SELLER_SHOP_TABS", () => {
    it("should export SELLER_SHOP_TABS array", () => {
      expect(SELLER_SHOP_TABS).toBeDefined();
      expect(Array.isArray(SELLER_SHOP_TABS)).toBe(true);
      expect(SELLER_SHOP_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      SELLER_SHOP_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /seller/my-shops", () => {
      SELLER_SHOP_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/seller\/my-shops/);
      });
    });
  });

  // ============================================================================
  // User Settings Tabs Tests
  // ============================================================================
  describe("USER_SETTINGS_TABS", () => {
    it("should export USER_SETTINGS_TABS array", () => {
      expect(USER_SETTINGS_TABS).toBeDefined();
      expect(Array.isArray(USER_SETTINGS_TABS)).toBe(true);
      expect(USER_SETTINGS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      USER_SETTINGS_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /user/settings", () => {
      USER_SETTINGS_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/user\/settings/);
      });
    });

    it("should include profile tab", () => {
      const profile = USER_SETTINGS_TABS.find((t) => t.id === "profile");
      expect(profile).toBeDefined();
      expect(profile?.href).toBe("/user/settings");
    });

    it("should include security tab", () => {
      const security = USER_SETTINGS_TABS.find((t) => t.id === "security");
      expect(security).toBeDefined();
      expect(security?.href).toBe("/user/settings/security");
    });

    it("should include notifications tab", () => {
      const notifications = USER_SETTINGS_TABS.find(
        (t) => t.id === "notifications"
      );
      expect(notifications).toBeDefined();
      expect(notifications?.href).toBe("/user/settings/notifications");
    });
  });

  // ============================================================================
  // User Orders Tabs Tests
  // ============================================================================
  describe("USER_ORDERS_TABS", () => {
    it("should export USER_ORDERS_TABS array", () => {
      expect(USER_ORDERS_TABS).toBeDefined();
      expect(Array.isArray(USER_ORDERS_TABS)).toBe(true);
      expect(USER_ORDERS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      USER_ORDERS_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /user/orders", () => {
      USER_ORDERS_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/user\/orders/);
      });
    });
  });

  // ============================================================================
  // User Auctions Tabs Tests
  // ============================================================================
  describe("USER_AUCTIONS_TABS", () => {
    it("should export USER_AUCTIONS_TABS array", () => {
      expect(USER_AUCTIONS_TABS).toBeDefined();
      expect(Array.isArray(USER_AUCTIONS_TABS)).toBe(true);
      expect(USER_AUCTIONS_TABS.length).toBeGreaterThan(0);
    });

    it("should have valid tab structure", () => {
      USER_AUCTIONS_TABS.forEach(validateTabStructure);
    });

    it("should have paths starting with /user", () => {
      USER_AUCTIONS_TABS.forEach((tab) => {
        expect(tab.href).toMatch(/^\/user/);
      });
    });

    it("should include bids tab", () => {
      const bids = USER_AUCTIONS_TABS.find((t) => t.id === "bids");
      expect(bids).toBeDefined();
      expect(bids?.href).toBe("/user/bids");
    });

    it("should include watchlist tab", () => {
      const watchlist = USER_AUCTIONS_TABS.find((t) => t.id === "watchlist");
      expect(watchlist).toBeDefined();
      expect(watchlist?.href).toBe("/user/watchlist");
    });

    it("should include won tab", () => {
      const won = USER_AUCTIONS_TABS.find((t) => t.id === "won");
      expect(won).toBeDefined();
      expect(won?.href).toBe("/user/won-auctions");
    });
  });

  // ============================================================================
  // ADMIN_TABS Aggregate Tests
  // ============================================================================
  describe("ADMIN_TABS", () => {
    it("should export ADMIN_TABS object", () => {
      expect(ADMIN_TABS).toBeDefined();
      expect(typeof ADMIN_TABS).toBe("object");
    });

    it("should contain SETTINGS", () => {
      expect(ADMIN_TABS.SETTINGS).toBe(ADMIN_SETTINGS_TABS);
    });

    it("should contain BLOG", () => {
      expect(ADMIN_TABS.BLOG).toBe(ADMIN_BLOG_TABS);
    });

    it("should contain AUCTIONS", () => {
      expect(ADMIN_TABS.AUCTIONS).toBe(ADMIN_AUCTIONS_TABS);
    });

    it("should contain CONTENT", () => {
      expect(ADMIN_TABS.CONTENT).toBe(ADMIN_CONTENT_TABS);
    });

    it("should contain SUPPORT", () => {
      expect(ADMIN_TABS.SUPPORT).toBe(ADMIN_SUPPORT_TABS);
    });

    it("should contain MARKETPLACE", () => {
      expect(ADMIN_TABS.MARKETPLACE).toBe(ADMIN_MARKETPLACE_TABS);
    });

    it("should contain TRANSACTIONS", () => {
      expect(ADMIN_TABS.TRANSACTIONS).toBe(ADMIN_TRANSACTIONS_TABS);
    });
  });

  // ============================================================================
  // SELLER_TABS Aggregate Tests
  // ============================================================================
  describe("SELLER_TABS", () => {
    it("should export SELLER_TABS object", () => {
      expect(SELLER_TABS).toBeDefined();
      expect(typeof SELLER_TABS).toBe("object");
    });

    it("should contain PRODUCTS", () => {
      expect(SELLER_TABS.PRODUCTS).toBe(SELLER_PRODUCTS_TABS);
    });

    it("should contain AUCTIONS", () => {
      expect(SELLER_TABS.AUCTIONS).toBe(SELLER_AUCTIONS_TABS);
    });

    it("should contain ORDERS", () => {
      expect(SELLER_TABS.ORDERS).toBe(SELLER_ORDERS_TABS);
    });

    it("should contain SHOPS", () => {
      expect(SELLER_TABS.SHOPS).toBe(SELLER_SHOP_TABS);
    });
  });

  // ============================================================================
  // USER_TABS Aggregate Tests
  // ============================================================================
  describe("USER_TABS", () => {
    it("should export USER_TABS object", () => {
      expect(USER_TABS).toBeDefined();
      expect(typeof USER_TABS).toBe("object");
    });

    it("should contain SETTINGS", () => {
      expect(USER_TABS.SETTINGS).toBe(USER_SETTINGS_TABS);
    });

    it("should contain ORDERS", () => {
      expect(USER_TABS.ORDERS).toBe(USER_ORDERS_TABS);
    });

    it("should contain AUCTIONS", () => {
      expect(USER_TABS.AUCTIONS).toBe(USER_AUCTIONS_TABS);
    });
  });
});
