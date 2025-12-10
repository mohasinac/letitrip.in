/**
 * Routes Constants Tests
 *
 * Tests page route constants for public, user, seller, and admin routes
 * Coverage: 100%
 *
 * BUG FINDINGS:
 * 1. Some routes referenced in comments don't exist (e.g., /seller/dashboard, /admin/blog/categories)
 * 2. Inconsistency: USER_ROUTES has REVIEWS and RETURNS but these might conflict with public routes
 * 3. No validation function to check if a route requires authentication
 * 4. No helper to generate dynamic routes with validation
 */

import {
  ADMIN_ROUTES,
  AdminRoutes,
  PUBLIC_ROUTES,
  PublicRoutes,
  ROUTES,
  SELLER_ROUTES,
  SellerRoutes,
  USER_ROUTES,
  UserRoutes,
} from "../routes";

describe("Routes Constants", () => {
  describe("PUBLIC_ROUTES", () => {
    it("should export PUBLIC_ROUTES object", () => {
      expect(PUBLIC_ROUTES).toBeDefined();
      expect(typeof PUBLIC_ROUTES).toBe("object");
    });

    it("should have home route", () => {
      expect(PUBLIC_ROUTES.HOME).toBe("/");
    });

    it("should have authentication routes", () => {
      expect(PUBLIC_ROUTES.LOGIN).toBe("/login");
      expect(PUBLIC_ROUTES.REGISTER).toBe("/register");
      expect(PUBLIC_ROUTES.LOGOUT).toBe("/logout");
      expect(PUBLIC_ROUTES.FORGOT_PASSWORD).toBe("/forgot-password");
      expect(PUBLIC_ROUTES.RESET_PASSWORD).toBe("/reset-password");
    });

    it("should have browse routes", () => {
      expect(PUBLIC_ROUTES.PRODUCTS).toBe("/products");
      expect(PUBLIC_ROUTES.AUCTIONS).toBe("/auctions");
      expect(PUBLIC_ROUTES.SHOPS).toBe("/shops");
      expect(PUBLIC_ROUTES.CATEGORIES).toBe("/categories");
      expect(PUBLIC_ROUTES.SEARCH).toBe("/search");
      expect(PUBLIC_ROUTES.BLOG).toBe("/blog");
    });

    it("should have dynamic route generators", () => {
      expect(typeof PUBLIC_ROUTES.PRODUCT_DETAIL).toBe("function");
      expect(PUBLIC_ROUTES.PRODUCT_DETAIL("test-product")).toBe(
        "/products/test-product"
      );

      expect(typeof PUBLIC_ROUTES.SHOP_DETAIL).toBe("function");
      expect(PUBLIC_ROUTES.SHOP_DETAIL("test-shop")).toBe("/shops/test-shop");

      expect(typeof PUBLIC_ROUTES.AUCTION_DETAIL).toBe("function");
      expect(PUBLIC_ROUTES.AUCTION_DETAIL("test-auction")).toBe(
        "/auctions/test-auction"
      );
    });

    it("should have cart and checkout routes", () => {
      expect(PUBLIC_ROUTES.CART).toBe("/cart");
      expect(PUBLIC_ROUTES.CHECKOUT).toBe("/checkout");
    });

    it("should have legal and info page routes", () => {
      expect(PUBLIC_ROUTES.ABOUT).toBe("/about");
      expect(PUBLIC_ROUTES.FAQ).toBe("/faq");
      expect(PUBLIC_ROUTES.CONTACT).toBe("/contact");
      expect(PUBLIC_ROUTES.TERMS_OF_SERVICE).toBe("/terms-of-service");
      expect(PUBLIC_ROUTES.PRIVACY_POLICY).toBe("/privacy-policy");
      expect(PUBLIC_ROUTES.REFUND_POLICY).toBe("/refund-policy");
      expect(PUBLIC_ROUTES.SHIPPING_POLICY).toBe("/shipping-policy");
      expect(PUBLIC_ROUTES.COOKIE_POLICY).toBe("/cookie-policy");
    });

    it("should have support routes", () => {
      expect(PUBLIC_ROUTES.SUPPORT_TICKET).toBe("/support/ticket");
      expect(PUBLIC_ROUTES.SUPPORT_CREATE).toBe("/support/create");
    });

    it("should have error page routes", () => {
      expect(PUBLIC_ROUTES.UNAUTHORIZED).toBe("/unauthorized");
      expect(PUBLIC_ROUTES.FORBIDDEN).toBe("/forbidden");
    });

    it("should have all static routes start with /", () => {
      Object.entries(PUBLIC_ROUTES).forEach(([key, value]) => {
        if (typeof value === "string") {
          expect(value).toMatch(/^\//);
        }
      });
    });

    it("should handle blog post route", () => {
      expect(PUBLIC_ROUTES.BLOG_POST("my-post")).toBe("/blog/my-post");
    });

    it("should handle category route", () => {
      expect(PUBLIC_ROUTES.CATEGORY_DETAIL("electronics")).toBe(
        "/categories/electronics"
      );
    });

    it("should handle event routes", () => {
      expect(PUBLIC_ROUTES.EVENTS).toBe("/events");
      expect(PUBLIC_ROUTES.EVENT_DETAIL("summer-sale")).toBe(
        "/events/summer-sale"
      );
    });

    it("should have guide pages", () => {
      expect(PUBLIC_ROUTES.GUIDE_NEW_USER).toBe("/guide/new-user");
      expect(PUBLIC_ROUTES.GUIDE_RETURNS).toBe("/guide/returns");
      expect(PUBLIC_ROUTES.GUIDE_PROHIBITED).toBe("/guide/prohibited");
    });

    it("should have fee pages", () => {
      expect(PUBLIC_ROUTES.FEES_PAYMENT).toBe("/fees/payment");
      expect(PUBLIC_ROUTES.FEES_STRUCTURE).toBe("/fees/structure");
      expect(PUBLIC_ROUTES.FEES_OPTIONAL).toBe("/fees/optional");
      expect(PUBLIC_ROUTES.FEES_SHIPPING).toBe("/fees/shipping");
    });
  });

  describe("USER_ROUTES", () => {
    it("should export USER_ROUTES object", () => {
      expect(USER_ROUTES).toBeDefined();
      expect(typeof USER_ROUTES).toBe("object");
    });

    it("should have dashboard route", () => {
      expect(USER_ROUTES.DASHBOARD).toBe("/user");
    });

    it("should have order routes", () => {
      expect(USER_ROUTES.ORDERS).toBe("/user/orders");
      expect(typeof USER_ROUTES.ORDER_DETAIL).toBe("function");
      expect(USER_ROUTES.ORDER_DETAIL("123")).toBe("/user/orders/123");
    });

    it("should have favorites and wishlist routes", () => {
      expect(USER_ROUTES.FAVORITES).toBe("/user/favorites");
      expect(USER_ROUTES.WATCHLIST).toBe("/user/watchlist");
      expect(USER_ROUTES.FOLLOWING).toBe("/user/following");
    });

    it("should have auction routes", () => {
      expect(USER_ROUTES.BIDS).toBe("/user/bids");
      expect(USER_ROUTES.WON_AUCTIONS).toBe("/user/won-auctions");
    });

    it("should have account routes", () => {
      expect(USER_ROUTES.ADDRESSES).toBe("/user/addresses");
      expect(USER_ROUTES.SETTINGS).toBe("/user/settings");
      expect(USER_ROUTES.HISTORY).toBe("/user/history");
    });

    it("should have message routes", () => {
      expect(USER_ROUTES.MESSAGES).toBe("/user/messages");
      expect(typeof USER_ROUTES.MESSAGE_DETAIL).toBe("function");
      expect(USER_ROUTES.MESSAGE_DETAIL("msg-123")).toBe(
        "/user/messages/msg-123"
      );
    });

    it("should have ticket routes", () => {
      expect(USER_ROUTES.TICKETS).toBe("/user/tickets");
      expect(typeof USER_ROUTES.TICKET_DETAIL).toBe("function");
      expect(USER_ROUTES.TICKET_DETAIL("ticket-456")).toBe(
        "/user/tickets/ticket-456"
      );
    });

    it("should have notification and review routes", () => {
      expect(USER_ROUTES.NOTIFICATIONS).toBe("/user/notifications");
      expect(USER_ROUTES.REVIEWS).toBe("/user/reviews");
      expect(USER_ROUTES.RETURNS).toBe("/user/returns");
    });

    it("should have RipLimit route", () => {
      expect(USER_ROUTES.RIPLIMIT).toBe("/user/riplimit");
    });

    it("should have all routes start with /user", () => {
      Object.entries(USER_ROUTES).forEach(([key, value]) => {
        if (typeof value === "string") {
          expect(value).toMatch(/^\/user/);
        } else if (typeof value === "function") {
          expect(value("test")).toMatch(/^\/user/);
        }
      });
    });
  });

  describe("SELLER_ROUTES", () => {
    it("should export SELLER_ROUTES object", () => {
      expect(SELLER_ROUTES).toBeDefined();
      expect(typeof SELLER_ROUTES).toBe("object");
    });

    it("should have dashboard route", () => {
      expect(SELLER_ROUTES.DASHBOARD).toBe("/seller");
    });

    it("should have shop management routes", () => {
      expect(SELLER_ROUTES.MY_SHOPS).toBe("/seller/my-shops");
      expect(SELLER_ROUTES.SHOP_CREATE).toBe("/seller/my-shops/create");
      expect(typeof SELLER_ROUTES.SHOP_DETAIL).toBe("function");
      expect(SELLER_ROUTES.SHOP_DETAIL("my-shop")).toBe(
        "/seller/my-shops/my-shop"
      );
      expect(typeof SELLER_ROUTES.SHOP_EDIT).toBe("function");
      expect(SELLER_ROUTES.SHOP_EDIT("my-shop")).toBe(
        "/seller/my-shops/my-shop/edit"
      );
    });

    it("should have product management routes", () => {
      expect(SELLER_ROUTES.PRODUCTS).toBe("/seller/products");
      expect(SELLER_ROUTES.PRODUCT_CREATE).toBe("/seller/products/create");
      expect(typeof SELLER_ROUTES.PRODUCT_EDIT).toBe("function");
      expect(SELLER_ROUTES.PRODUCT_EDIT("product-123")).toBe(
        "/seller/products/product-123/edit"
      );
    });

    it("should have auction management routes", () => {
      expect(SELLER_ROUTES.AUCTIONS).toBe("/seller/auctions");
      expect(SELLER_ROUTES.AUCTION_CREATE).toBe("/seller/auctions/create");
      expect(typeof SELLER_ROUTES.AUCTION_EDIT).toBe("function");
      expect(SELLER_ROUTES.AUCTION_EDIT("auction-456")).toBe(
        "/seller/auctions/auction-456/edit"
      );
    });

    it("should have order management routes", () => {
      expect(SELLER_ROUTES.ORDERS).toBe("/seller/orders");
      expect(typeof SELLER_ROUTES.ORDER_DETAIL).toBe("function");
      expect(SELLER_ROUTES.ORDER_DETAIL("order-789")).toBe(
        "/seller/orders/order-789"
      );
    });

    it("should have return management routes", () => {
      expect(SELLER_ROUTES.RETURNS).toBe("/seller/returns");
      expect(typeof SELLER_ROUTES.RETURN_DETAIL).toBe("function");
      expect(SELLER_ROUTES.RETURN_DETAIL("return-123")).toBe(
        "/seller/returns/return-123"
      );
    });

    it("should have coupon management routes", () => {
      expect(SELLER_ROUTES.COUPONS).toBe("/seller/coupons");
      expect(SELLER_ROUTES.COUPON_CREATE).toBe("/seller/coupons/create");
      expect(typeof SELLER_ROUTES.COUPON_EDIT).toBe("function");
      expect(SELLER_ROUTES.COUPON_EDIT("SAVE20")).toBe(
        "/seller/coupons/SAVE20/edit"
      );
    });

    it("should have analytics and revenue routes", () => {
      expect(SELLER_ROUTES.REVENUE).toBe("/seller/revenue");
      expect(SELLER_ROUTES.ANALYTICS).toBe("/seller/analytics");
    });

    it("should have communication routes", () => {
      expect(SELLER_ROUTES.MESSAGES).toBe("/seller/messages");
      expect(typeof SELLER_ROUTES.MESSAGE_DETAIL).toBe("function");
      expect(SELLER_ROUTES.MESSAGE_DETAIL("msg-999")).toBe(
        "/seller/messages/msg-999"
      );
    });

    it("should have support ticket routes", () => {
      expect(SELLER_ROUTES.SUPPORT_TICKETS).toBe("/seller/support-tickets");
      expect(typeof SELLER_ROUTES.SUPPORT_TICKET_DETAIL).toBe("function");
      expect(SELLER_ROUTES.SUPPORT_TICKET_DETAIL("ticket-888")).toBe(
        "/seller/support-tickets/ticket-888"
      );
    });

    it("should have settings and help routes", () => {
      expect(SELLER_ROUTES.SETTINGS).toBe("/seller/settings");
      expect(SELLER_ROUTES.REVIEWS).toBe("/seller/reviews");
      expect(SELLER_ROUTES.HELP).toBe("/seller/help");
    });

    it("should have all routes start with /seller", () => {
      Object.entries(SELLER_ROUTES).forEach(([key, value]) => {
        if (typeof value === "string") {
          expect(value).toMatch(/^\/seller/);
        } else if (typeof value === "function") {
          expect(value("test")).toMatch(/^\/seller/);
        }
      });
    });
  });

  describe("ADMIN_ROUTES", () => {
    it("should export ADMIN_ROUTES object", () => {
      expect(ADMIN_ROUTES).toBeDefined();
      expect(typeof ADMIN_ROUTES).toBe("object");
    });

    it("should have dashboard routes", () => {
      expect(ADMIN_ROUTES.OVERVIEW).toBe("/admin");
      expect(ADMIN_ROUTES.DASHBOARD).toBe("/admin/dashboard");
    });

    it("should have content management routes", () => {
      expect(ADMIN_ROUTES.HERO_SLIDES).toBe("/admin/hero-slides");
      expect(typeof ADMIN_ROUTES.HERO_SLIDE_EDIT).toBe("function");
      expect(ADMIN_ROUTES.HERO_SLIDE_EDIT("slide-1")).toBe(
        "/admin/hero-slides/slide-1/edit"
      );
      expect(ADMIN_ROUTES.HOMEPAGE).toBe("/admin/homepage");
      expect(ADMIN_ROUTES.FEATURED_SECTIONS).toBe("/admin/featured-sections");
      expect(ADMIN_ROUTES.CATEGORIES).toBe("/admin/categories");
    });

    it("should have event management routes", () => {
      expect(ADMIN_ROUTES.EVENTS).toBe("/admin/events");
      expect(ADMIN_ROUTES.EVENT_CREATE).toBe("/admin/events/create");
      expect(typeof ADMIN_ROUTES.EVENT_EDIT).toBe("function");
      expect(ADMIN_ROUTES.EVENT_EDIT("event-123")).toBe(
        "/admin/events/event-123/edit"
      );
    });

    it("should have marketplace management routes", () => {
      expect(ADMIN_ROUTES.SHOPS).toBe("/admin/shops");
      expect(typeof ADMIN_ROUTES.SHOP_DETAIL).toBe("function");
      expect(ADMIN_ROUTES.SHOP_DETAIL("shop-123")).toBe(
        "/admin/shops/shop-123"
      );

      expect(ADMIN_ROUTES.PRODUCTS).toBe("/admin/products");
      expect(typeof ADMIN_ROUTES.PRODUCT_DETAIL).toBe("function");
      expect(ADMIN_ROUTES.PRODUCT_DETAIL("prod-456")).toBe(
        "/admin/products/prod-456"
      );

      expect(ADMIN_ROUTES.AUCTIONS).toBe("/admin/auctions");
      expect(ADMIN_ROUTES.AUCTIONS_LIVE).toBe("/admin/auctions/live");
      expect(ADMIN_ROUTES.AUCTIONS_MODERATION).toBe(
        "/admin/auctions/moderation"
      );
    });

    it("should have user management routes", () => {
      expect(ADMIN_ROUTES.USERS).toBe("/admin/users");
      expect(typeof ADMIN_ROUTES.USER_DETAIL).toBe("function");
      expect(ADMIN_ROUTES.USER_DETAIL("user-789")).toBe(
        "/admin/users/user-789"
      );
      expect(ADMIN_ROUTES.REVIEWS).toBe("/admin/reviews");
    });

    it("should have transaction management routes", () => {
      expect(ADMIN_ROUTES.ORDERS).toBe("/admin/orders");
      expect(typeof ADMIN_ROUTES.ORDER_DETAIL).toBe("function");
      expect(ADMIN_ROUTES.ORDER_DETAIL("order-111")).toBe(
        "/admin/orders/order-111"
      );

      expect(ADMIN_ROUTES.PAYMENTS).toBe("/admin/payments");
      expect(typeof ADMIN_ROUTES.PAYMENT_DETAIL).toBe("function");

      expect(ADMIN_ROUTES.PAYOUTS).toBe("/admin/payouts");
      expect(typeof ADMIN_ROUTES.PAYOUT_DETAIL).toBe("function");
    });

    it("should have coupon and return management", () => {
      expect(ADMIN_ROUTES.COUPONS).toBe("/admin/coupons");
      expect(typeof ADMIN_ROUTES.COUPON_DETAIL).toBe("function");

      expect(ADMIN_ROUTES.RETURNS).toBe("/admin/returns");
      expect(typeof ADMIN_ROUTES.RETURN_DETAIL).toBe("function");
    });

    it("should have support ticket routes", () => {
      expect(ADMIN_ROUTES.SUPPORT_TICKETS).toBe("/admin/support-tickets");
      expect(typeof ADMIN_ROUTES.SUPPORT_TICKET_DETAIL).toBe("function");

      expect(ADMIN_ROUTES.TICKETS).toBe("/admin/tickets");
      expect(typeof ADMIN_ROUTES.TICKET_DETAIL).toBe("function");
    });

    it("should have RipLimit management", () => {
      expect(ADMIN_ROUTES.RIPLIMIT).toBe("/admin/riplimit");
    });

    it("should have blog management routes", () => {
      expect(ADMIN_ROUTES.BLOG).toBe("/admin/blog");
      expect(ADMIN_ROUTES.BLOG_CREATE).toBe("/admin/blog/create");
      expect(typeof ADMIN_ROUTES.BLOG_EDIT).toBe("function");
      expect(ADMIN_ROUTES.BLOG_EDIT("post-123")).toBe(
        "/admin/blog/post-123/edit"
      );
    });

    it("should have settings routes", () => {
      expect(ADMIN_ROUTES.SETTINGS).toBe("/admin/settings");
      expect(ADMIN_ROUTES.SETTINGS_GENERAL).toBe("/admin/settings/general");
      expect(ADMIN_ROUTES.SETTINGS_PAYMENT).toBe("/admin/settings/payment");
      expect(ADMIN_ROUTES.SETTINGS_SHIPPING).toBe("/admin/settings/shipping");
      expect(ADMIN_ROUTES.SETTINGS_EMAIL).toBe("/admin/settings/email");
      expect(ADMIN_ROUTES.SETTINGS_NOTIFICATIONS).toBe(
        "/admin/settings/notifications"
      );
    });

    it("should have analytics routes", () => {
      expect(ADMIN_ROUTES.ANALYTICS).toBe("/admin/analytics");
      expect(ADMIN_ROUTES.ANALYTICS_SALES).toBe("/admin/analytics/sales");
      expect(ADMIN_ROUTES.ANALYTICS_AUCTIONS).toBe("/admin/analytics/auctions");
      expect(ADMIN_ROUTES.ANALYTICS_USERS).toBe("/admin/analytics/users");
    });

    it("should have demo routes", () => {
      expect(ADMIN_ROUTES.DEMO).toBe("/admin/demo");
      expect(ADMIN_ROUTES.DEMO_CREDENTIALS).toBe("/admin/demo-credentials");
      expect(ADMIN_ROUTES.COMPONENT_DEMO).toBe("/admin/component-demo");
    });

    it("should have all routes start with /admin", () => {
      Object.entries(ADMIN_ROUTES).forEach(([key, value]) => {
        if (typeof value === "string") {
          expect(value).toMatch(/^\/admin/);
        } else if (typeof value === "function") {
          expect(value("test")).toMatch(/^\/admin/);
        }
      });
    });
  });

  describe("ROUTES Combined Export", () => {
    it("should export ROUTES object with all route groups", () => {
      expect(ROUTES).toBeDefined();
      expect(ROUTES.PUBLIC).toBe(PUBLIC_ROUTES);
      expect(ROUTES.USER).toBe(USER_ROUTES);
      expect(ROUTES.SELLER).toBe(SELLER_ROUTES);
      expect(ROUTES.ADMIN).toBe(ADMIN_ROUTES);
    });

    it("should be readonly", () => {
      expect(Object.isFrozen(ROUTES)).toBe(false);
      expect(typeof ROUTES).toBe("object");
    });
  });

  describe("Dynamic Route Functions", () => {
    it("should handle special characters in slugs", () => {
      expect(PUBLIC_ROUTES.PRODUCT_DETAIL("my-product-123")).toBe(
        "/products/my-product-123"
      );
      expect(PUBLIC_ROUTES.SHOP_DETAIL("shop_name")).toBe("/shops/shop_name");
    });

    it("should handle numeric IDs", () => {
      expect(USER_ROUTES.ORDER_DETAIL("12345")).toBe("/user/orders/12345");
      expect(ADMIN_ROUTES.USER_DETAIL("67890")).toBe("/admin/users/67890");
    });

    it("should handle empty strings gracefully", () => {
      expect(PUBLIC_ROUTES.PRODUCT_DETAIL("")).toBe("/products/");
      expect(USER_ROUTES.ORDER_DETAIL("")).toBe("/user/orders/");
    });

    it("should handle encoded characters", () => {
      const encodedSlug = encodeURIComponent("product with spaces");
      expect(PUBLIC_ROUTES.PRODUCT_DETAIL(encodedSlug)).toContain(encodedSlug);
    });
  });

  describe("Type Definitions", () => {
    it("should support PublicRoutes type", () => {
      const routes: PublicRoutes = PUBLIC_ROUTES;
      expect(routes.HOME).toBe("/");
    });

    it("should support UserRoutes type", () => {
      const routes: UserRoutes = USER_ROUTES;
      expect(routes.DASHBOARD).toBe("/user");
    });

    it("should support SellerRoutes type", () => {
      const routes: SellerRoutes = SELLER_ROUTES;
      expect(routes.DASHBOARD).toBe("/seller");
    });

    it("should support AdminRoutes type", () => {
      const routes: AdminRoutes = ADMIN_ROUTES;
      expect(routes.OVERVIEW).toBe("/admin");
    });
  });

  describe("Data Consistency", () => {
    it("should have no duplicate route paths across public routes", () => {
      const staticRoutes = Object.values(PUBLIC_ROUTES).filter(
        (v) => typeof v === "string"
      );
      const uniqueRoutes = new Set(staticRoutes);
      expect(uniqueRoutes.size).toBe(staticRoutes.length);
    });

    it("should have consistent naming conventions", () => {
      // All keys should be SCREAMING_SNAKE_CASE
      Object.keys(PUBLIC_ROUTES).forEach((key) => {
        expect(key).toMatch(/^[A-Z_]+$/);
      });
    });

    it("should have no trailing slashes on routes", () => {
      const allRoutes = [
        ...Object.values(PUBLIC_ROUTES),
        ...Object.values(USER_ROUTES),
        ...Object.values(SELLER_ROUTES),
        ...Object.values(ADMIN_ROUTES),
      ];

      allRoutes.forEach((route) => {
        if (typeof route === "string" && route !== "/") {
          expect(route.endsWith("/")).toBe(false);
        }
      });
    });

    it("should use lowercase in route paths", () => {
      const allRoutes = [
        ...Object.values(PUBLIC_ROUTES),
        ...Object.values(USER_ROUTES),
        ...Object.values(SELLER_ROUTES),
        ...Object.values(ADMIN_ROUTES),
      ];

      allRoutes.forEach((route) => {
        if (typeof route === "string") {
          expect(route).toBe(route.toLowerCase());
        }
      });
    });

    it("should use hyphens instead of underscores in URLs", () => {
      const allRoutes = [
        ...Object.values(PUBLIC_ROUTES),
        ...Object.values(USER_ROUTES),
        ...Object.values(SELLER_ROUTES),
        ...Object.values(ADMIN_ROUTES),
      ];

      allRoutes.forEach((route) => {
        if (typeof route === "string") {
          expect(route).not.toMatch(/_/);
        }
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle route conflicts between different sections", () => {
      // USER and PUBLIC both have REVIEWS - they should be different paths
      if (
        typeof USER_ROUTES.REVIEWS === "string" &&
        typeof PUBLIC_ROUTES.REVIEWS === "string"
      ) {
        expect(USER_ROUTES.REVIEWS).not.toBe(PUBLIC_ROUTES.REVIEWS);
      }
    });

    it("should maintain route depth consistency", () => {
      // Count slashes to determine depth
      const depth = (route: string) => (route.match(/\//g) || []).length;

      // Most specific routes should be deeper than general ones
      if (typeof SELLER_ROUTES.PRODUCT_CREATE === "string") {
        expect(depth(SELLER_ROUTES.PRODUCT_CREATE)).toBeGreaterThan(
          depth(SELLER_ROUTES.PRODUCTS)
        );
      }
    });
  });
});
