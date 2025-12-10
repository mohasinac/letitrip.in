/**
 * Navigation Constants Tests
 *
 * Tests for navigation menus and configuration
 * Coverage: 100%
 */

import {
  ADMIN_MENU_ITEMS,
  COMPANY_ALT_TEXT,
  COMPANY_NAME,
  DEFAULT_LOCATION,
  SELLER_MENU_ITEMS,
  USER_MENU_ITEMS,
  VIEWING_HISTORY_CONFIG,
  ViewingHistoryItem,
} from "../navigation";

describe("Navigation Constants", () => {
  describe("Company Information", () => {
    it("should export COMPANY_NAME", () => {
      expect(COMPANY_NAME).toBeDefined();
      expect(COMPANY_NAME).toBe("LET IT RIP");
      expect(typeof COMPANY_NAME).toBe("string");
    });

    it("should export COMPANY_ALT_TEXT", () => {
      expect(COMPANY_ALT_TEXT).toBeDefined();
      expect(COMPANY_ALT_TEXT).toBe("Let It Rip - Buy Collectibles in India");
      expect(typeof COMPANY_ALT_TEXT).toBe("string");
    });
  });

  describe("USER_MENU_ITEMS", () => {
    it("should export USER_MENU_ITEMS array", () => {
      expect(USER_MENU_ITEMS).toBeDefined();
      expect(Array.isArray(USER_MENU_ITEMS)).toBe(true);
      expect(USER_MENU_ITEMS.length).toBeGreaterThan(0);
    });

    it("should have overview section", () => {
      const overview = USER_MENU_ITEMS.find((item) => item.id === "overview");
      expect(overview).toBeDefined();
      expect(overview?.name).toBe("Overview");
      expect(overview?.icon).toBe("layout-dashboard");
      expect(overview?.children).toBeDefined();
    });

    it("should have dashboard in overview", () => {
      const overview = USER_MENU_ITEMS.find((item) => item.id === "overview");
      const dashboard = overview?.children?.find(
        (child) => child.id === "dashboard"
      );
      expect(dashboard).toBeDefined();
      expect(dashboard?.link).toBe("/user");
    });

    it("should have shopping section", () => {
      const shopping = USER_MENU_ITEMS.find((item) => item.id === "shopping");
      expect(shopping).toBeDefined();
      expect(shopping?.children).toBeDefined();
      expect(shopping?.children?.length).toBeGreaterThan(0);
    });

    it("should have auctions section", () => {
      const auctions = USER_MENU_ITEMS.find((item) => item.id === "auctions");
      expect(auctions).toBeDefined();
      expect(auctions?.children).toBeDefined();
    });

    it("should have account section", () => {
      const account = USER_MENU_ITEMS.find((item) => item.id === "account");
      expect(account).toBeDefined();
      expect(account?.children).toBeDefined();
    });

    it("should have logout item", () => {
      const logout = USER_MENU_ITEMS.find((item) => item.id === "logout");
      expect(logout).toBeDefined();
      expect(logout?.link).toBe("/logout");
      expect(logout?.icon).toBe("log-out");
    });

    it("should have all items with required properties", () => {
      USER_MENU_ITEMS.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("icon");
        if (item.children) {
          item.children.forEach((child) => {
            expect(child).toHaveProperty("id");
            expect(child).toHaveProperty("name");
            expect(child).toHaveProperty("link");
            expect(child).toHaveProperty("icon");
          });
        }
      });
    });
  });

  describe("SELLER_MENU_ITEMS", () => {
    it("should export SELLER_MENU_ITEMS array", () => {
      expect(SELLER_MENU_ITEMS).toBeDefined();
      expect(Array.isArray(SELLER_MENU_ITEMS)).toBe(true);
      expect(SELLER_MENU_ITEMS.length).toBeGreaterThan(0);
    });

    it("should have overview item", () => {
      const overview = SELLER_MENU_ITEMS.find((item) => item.id === "overview");
      expect(overview).toBeDefined();
      expect(overview?.link).toBe("/seller");
      expect(overview?.description).toBeDefined();
    });

    it("should have shop-management section", () => {
      const shopMgmt = SELLER_MENU_ITEMS.find(
        (item) => item.id === "shop-management"
      );
      expect(shopMgmt).toBeDefined();
      expect(shopMgmt?.children).toBeDefined();
      expect(shopMgmt?.children?.length).toBeGreaterThan(0);
    });

    it("should have catalog section", () => {
      const catalog = SELLER_MENU_ITEMS.find((item) => item.id === "catalog");
      expect(catalog).toBeDefined();
      expect(catalog?.children).toBeDefined();
    });

    it("should have sales section", () => {
      const sales = SELLER_MENU_ITEMS.find((item) => item.id === "sales");
      expect(sales).toBeDefined();
      expect(sales?.name).toBe("Sales & Orders");
    });

    it("should have performance section", () => {
      const performance = SELLER_MENU_ITEMS.find(
        (item) => item.id === "performance"
      );
      expect(performance).toBeDefined();
      expect(performance?.children).toBeDefined();
    });

    it("should have support section", () => {
      const support = SELLER_MENU_ITEMS.find((item) => item.id === "support");
      expect(support).toBeDefined();
      expect(support?.children).toBeDefined();
    });

    it("should have valid paths", () => {
      SELLER_MENU_ITEMS.forEach((item) => {
        if (item.link) {
          expect(item.link).toMatch(/^\/seller/);
        }
        if (item.children) {
          item.children.forEach((child) => {
            expect(child.link).toMatch(/^\/seller/);
          });
        }
      });
    });
  });

  describe("ADMIN_MENU_ITEMS", () => {
    it("should export ADMIN_MENU_ITEMS array", () => {
      expect(ADMIN_MENU_ITEMS).toBeDefined();
      expect(Array.isArray(ADMIN_MENU_ITEMS)).toBe(true);
      expect(ADMIN_MENU_ITEMS.length).toBeGreaterThan(0);
    });

    it("should have dashboard item", () => {
      const dashboard = ADMIN_MENU_ITEMS.find(
        (item) => item.id === "dashboard"
      );
      expect(dashboard).toBeDefined();
      expect(dashboard?.link).toBe("/admin/dashboard");
    });

    it("should have overview item", () => {
      const overview = ADMIN_MENU_ITEMS.find((item) => item.id === "overview");
      expect(overview).toBeDefined();
      expect(overview?.link).toBe("/admin");
    });

    it("should have content section", () => {
      const content = ADMIN_MENU_ITEMS.find((item) => item.id === "content");
      expect(content).toBeDefined();
      expect(content?.name).toBe("Content Management");
      expect(content?.children).toBeDefined();
    });

    it("should have marketplace section", () => {
      const marketplace = ADMIN_MENU_ITEMS.find(
        (item) => item.id === "marketplace"
      );
      expect(marketplace).toBeDefined();
      expect(marketplace?.children).toBeDefined();
    });

    it("should have user-management section", () => {
      const userMgmt = ADMIN_MENU_ITEMS.find(
        (item) => item.id === "user-management"
      );
      expect(userMgmt).toBeDefined();
      expect(userMgmt?.children).toBeDefined();
    });

    it("should have transactions section", () => {
      const transactions = ADMIN_MENU_ITEMS.find(
        (item) => item.id === "transactions"
      );
      expect(transactions).toBeDefined();
      expect(transactions?.children).toBeDefined();
    });

    it("should have support section", () => {
      const support = ADMIN_MENU_ITEMS.find((item) => item.id === "support");
      expect(support).toBeDefined();
      expect(support?.children).toBeDefined();
    });

    it("should have blog section", () => {
      const blog = ADMIN_MENU_ITEMS.find((item) => item.id === "blog");
      expect(blog).toBeDefined();
      expect(blog?.children).toBeDefined();
    });

    it("should have settings section", () => {
      const settings = ADMIN_MENU_ITEMS.find((item) => item.id === "settings");
      expect(settings).toBeDefined();
      expect(settings?.link).toBe("/admin/settings");
      expect(settings?.children).toBeDefined();
    });

    it("should have valid paths", () => {
      ADMIN_MENU_ITEMS.forEach((item) => {
        if (item.link) {
          expect(item.link).toMatch(/^\/admin/);
        }
        if (item.children) {
          item.children.forEach((child) => {
            expect(child.link).toMatch(/^\/admin/);
          });
        }
      });
    });
  });

  describe("DEFAULT_LOCATION", () => {
    it("should export DEFAULT_LOCATION object", () => {
      expect(DEFAULT_LOCATION).toBeDefined();
      expect(typeof DEFAULT_LOCATION).toBe("object");
    });

    it("should have country set to India", () => {
      expect(DEFAULT_LOCATION.country).toBe("India");
    });

    it("should have a pincode", () => {
      expect(DEFAULT_LOCATION.pincode).toBeDefined();
      expect(DEFAULT_LOCATION.pincode).toBe("110001");
    });
  });

  describe("VIEWING_HISTORY_CONFIG", () => {
    it("should export VIEWING_HISTORY_CONFIG object", () => {
      expect(VIEWING_HISTORY_CONFIG).toBeDefined();
      expect(typeof VIEWING_HISTORY_CONFIG).toBe("object");
    });

    it("should have MAX_ITEMS", () => {
      expect(VIEWING_HISTORY_CONFIG.MAX_ITEMS).toBeDefined();
      expect(VIEWING_HISTORY_CONFIG.MAX_ITEMS).toBe(50);
      expect(typeof VIEWING_HISTORY_CONFIG.MAX_ITEMS).toBe("number");
    });

    it("should have STORAGE_KEY", () => {
      expect(VIEWING_HISTORY_CONFIG.STORAGE_KEY).toBeDefined();
      expect(VIEWING_HISTORY_CONFIG.STORAGE_KEY).toBe("viewing_history");
      expect(typeof VIEWING_HISTORY_CONFIG.STORAGE_KEY).toBe("string");
    });

    it("should have EXPIRY_DAYS", () => {
      expect(VIEWING_HISTORY_CONFIG.EXPIRY_DAYS).toBeDefined();
      expect(VIEWING_HISTORY_CONFIG.EXPIRY_DAYS).toBe(30);
      expect(typeof VIEWING_HISTORY_CONFIG.EXPIRY_DAYS).toBe("number");
    });

    it("should have TYPES", () => {
      expect(VIEWING_HISTORY_CONFIG.TYPES).toBeDefined();
      expect(VIEWING_HISTORY_CONFIG.TYPES.PRODUCT).toBe("product");
      expect(VIEWING_HISTORY_CONFIG.TYPES.AUCTION).toBe("auction");
    });
  });

  describe("ViewingHistoryItem Interface", () => {
    it("should accept valid ViewingHistoryItem", () => {
      const item: ViewingHistoryItem = {
        id: "prod-123",
        name: "Test Product",
        slug: "test-product",
        image: "/images/test.jpg",
        price: 999,
        shopName: "Test Shop",
        inStock: true,
        viewed_at: Date.now(),
      };
      expect(item).toBeDefined();
      expect(item.id).toBe("prod-123");
      expect(item.name).toBe("Test Product");
      expect(item.inStock).toBe(true);
    });
  });

  describe("Menu Structure Validation", () => {
    it("should have unique IDs in USER_MENU_ITEMS", () => {
      const ids = USER_MENU_ITEMS.map((item) => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique IDs in SELLER_MENU_ITEMS", () => {
      const ids = SELLER_MENU_ITEMS.map((item) => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique IDs in ADMIN_MENU_ITEMS", () => {
      const ids = ADMIN_MENU_ITEMS.map((item) => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid icons", () => {
      const allItems = [
        ...USER_MENU_ITEMS,
        ...SELLER_MENU_ITEMS,
        ...ADMIN_MENU_ITEMS,
      ];
      allItems.forEach((item) => {
        expect(item.icon).toBeDefined();
        expect(typeof item.icon).toBe("string");
        expect(item.icon.length).toBeGreaterThan(0);
      });
    });

    it("should have valid names", () => {
      const allItems = [
        ...USER_MENU_ITEMS,
        ...SELLER_MENU_ITEMS,
        ...ADMIN_MENU_ITEMS,
      ];
      allItems.forEach((item) => {
        expect(item.name).toBeDefined();
        expect(typeof item.name).toBe("string");
        expect(item.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle menu items without children", () => {
      const itemsWithoutChildren = USER_MENU_ITEMS.filter(
        (item) => !item.children
      );
      expect(itemsWithoutChildren.length).toBeGreaterThan(0);
      itemsWithoutChildren.forEach((item) => {
        expect(item.link).toBeDefined();
      });
    });

    it("should handle menu items with children", () => {
      const itemsWithChildren = ADMIN_MENU_ITEMS.filter(
        (item) => item.children && item.children.length > 0
      );
      expect(itemsWithChildren.length).toBeGreaterThan(0);
      itemsWithChildren.forEach((item) => {
        expect(Array.isArray(item.children)).toBe(true);
        item.children?.forEach((child) => {
          expect(child.link).toBeDefined();
        });
      });
    });

    it("should have consistent link format", () => {
      const allItems = [
        ...USER_MENU_ITEMS,
        ...SELLER_MENU_ITEMS,
        ...ADMIN_MENU_ITEMS,
      ];
      allItems.forEach((item) => {
        if (item.link) {
          expect(item.link).toMatch(/^\//);
        }
        if (item.children) {
          item.children.forEach((child) => {
            expect(child.link).toMatch(/^\//);
          });
        }
      });
    });

    it("should handle MAX_ITEMS constraint", () => {
      expect(VIEWING_HISTORY_CONFIG.MAX_ITEMS).toBeGreaterThan(0);
      expect(VIEWING_HISTORY_CONFIG.MAX_ITEMS).toBeLessThanOrEqual(100);
    });

    it("should have valid EXPIRY_DAYS", () => {
      expect(VIEWING_HISTORY_CONFIG.EXPIRY_DAYS).toBeGreaterThan(0);
      expect(VIEWING_HISTORY_CONFIG.EXPIRY_DAYS).toBeLessThanOrEqual(365);
    });
  });
});
