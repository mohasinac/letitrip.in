import {
  ALLOWED_FILE_TYPES,
  API_URL,
  AUCTION_STATUS,
  BUSINESS_ADDRESS,
  BUSINESS_NAME,
  COLLECTIONS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  COUPON_LENGTH,
  COUPON_PREFIX,
  CURRENCY_SYMBOL,
  DATE_FORMAT,
  DATETIME_FORMAT,
  DEFAULT_CURRENCY,
  DEFAULT_OG_IMAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TWITTER_IMAGE,
  ENABLE_ANALYTICS,
  ENABLE_SOCKET,
  MAX_FILE_SIZE,
  MAX_PAGE_SIZE,
  NAV_LINKS,
  ORDER_STATUS,
  PRODUCT_STATUS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_DOMAIN,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  SOCKET_URL,
  TICKET_STATUS,
  TIME_FORMAT,
  USER_ROLES,
} from "../site";

describe("Site Configuration Constants", () => {
  // ============================================================================
  // Site Information Tests
  // ============================================================================
  describe("Site Information", () => {
    it("should export SITE_NAME", () => {
      expect(SITE_NAME).toBeDefined();
      expect(typeof SITE_NAME).toBe("string");
      expect(SITE_NAME.length).toBeGreaterThan(0);
    });

    it("should export SITE_DOMAIN", () => {
      expect(SITE_DOMAIN).toBeDefined();
      expect(typeof SITE_DOMAIN).toBe("string");
      expect(SITE_DOMAIN.length).toBeGreaterThan(0);
    });

    it("should export SITE_URL", () => {
      expect(SITE_URL).toBeDefined();
      expect(typeof SITE_URL).toBe("string");
      expect(SITE_URL).toMatch(/^https?:\/\//);
    });

    it("should export API_URL", () => {
      expect(API_URL).toBeDefined();
      expect(typeof API_URL).toBe("string");
      expect(API_URL).toMatch(/\/api$/);
    });

    it("should export SITE_DESCRIPTION", () => {
      expect(SITE_DESCRIPTION).toBeDefined();
      expect(typeof SITE_DESCRIPTION).toBe("string");
      expect(SITE_DESCRIPTION.length).toBeGreaterThan(0);
    });

    it("should export SITE_KEYWORDS", () => {
      expect(SITE_KEYWORDS).toBeDefined();
      expect(typeof SITE_KEYWORDS).toBe("string");
      expect(SITE_KEYWORDS.length).toBeGreaterThan(0);
    });

    it("should export SITE_AUTHOR", () => {
      expect(SITE_AUTHOR).toBeDefined();
      expect(typeof SITE_AUTHOR).toBe("string");
      expect(SITE_AUTHOR.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Social Media Tests
  // ============================================================================
  describe("Social Media", () => {
    it("should export SOCIAL_LINKS object", () => {
      expect(SOCIAL_LINKS).toBeDefined();
      expect(typeof SOCIAL_LINKS).toBe("object");
    });

    it("should have twitter link", () => {
      expect(SOCIAL_LINKS.twitter).toBeDefined();
      expect(typeof SOCIAL_LINKS.twitter).toBe("string");
      expect(SOCIAL_LINKS.twitter).toMatch(/^https?:\/\//);
    });

    it("should have facebook link", () => {
      expect(SOCIAL_LINKS.facebook).toBeDefined();
      expect(typeof SOCIAL_LINKS.facebook).toBe("string");
      expect(SOCIAL_LINKS.facebook).toMatch(/^https?:\/\//);
    });

    it("should have instagram link", () => {
      expect(SOCIAL_LINKS.instagram).toBeDefined();
      expect(typeof SOCIAL_LINKS.instagram).toBe("string");
      expect(SOCIAL_LINKS.instagram).toMatch(/^https?:\/\//);
    });

    it("should have linkedin link", () => {
      expect(SOCIAL_LINKS.linkedin).toBeDefined();
      expect(typeof SOCIAL_LINKS.linkedin).toBe("string");
      expect(SOCIAL_LINKS.linkedin).toMatch(/^https?:\/\//);
    });
  });

  // ============================================================================
  // Contact Information Tests
  // ============================================================================
  describe("Contact Information", () => {
    it("should export CONTACT_EMAIL", () => {
      expect(CONTACT_EMAIL).toBeDefined();
      expect(typeof CONTACT_EMAIL).toBe("string");
      expect(CONTACT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it("should export CONTACT_PHONE", () => {
      expect(CONTACT_PHONE).toBeDefined();
      expect(typeof CONTACT_PHONE).toBe("string");
      expect(CONTACT_PHONE.length).toBeGreaterThan(0);
    });

    it("should export BUSINESS_NAME", () => {
      expect(BUSINESS_NAME).toBeDefined();
      expect(typeof BUSINESS_NAME).toBe("string");
      expect(BUSINESS_NAME.length).toBeGreaterThan(0);
    });

    it("should export BUSINESS_ADDRESS", () => {
      expect(BUSINESS_ADDRESS).toBeDefined();
      expect(typeof BUSINESS_ADDRESS).toBe("string");
      expect(BUSINESS_ADDRESS.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // SEO Configuration Tests
  // ============================================================================
  describe("SEO Configuration", () => {
    it("should export DEFAULT_OG_IMAGE", () => {
      expect(DEFAULT_OG_IMAGE).toBeDefined();
      expect(typeof DEFAULT_OG_IMAGE).toBe("string");
      expect(DEFAULT_OG_IMAGE).toMatch(/\.(jpg|jpeg|png|webp)$/);
    });

    it("should export DEFAULT_TWITTER_IMAGE", () => {
      expect(DEFAULT_TWITTER_IMAGE).toBeDefined();
      expect(typeof DEFAULT_TWITTER_IMAGE).toBe("string");
      expect(DEFAULT_TWITTER_IMAGE).toMatch(/\.(jpg|jpeg|png|webp)$/);
    });
  });

  // ============================================================================
  // Feature Flags Tests
  // ============================================================================
  describe("Feature Flags", () => {
    it("should export ENABLE_ANALYTICS", () => {
      expect(typeof ENABLE_ANALYTICS).toBe("boolean");
    });

    it("should export ENABLE_SOCKET", () => {
      expect(ENABLE_SOCKET).toBeDefined();
      expect(typeof ENABLE_SOCKET).toBe("boolean");
    });

    it("should export SOCKET_URL", () => {
      expect(SOCKET_URL).toBeDefined();
      expect(typeof SOCKET_URL).toBe("string");
      expect(SOCKET_URL).toMatch(/^https?:\/\//);
    });
  });

  // ============================================================================
  // Application Configuration Tests
  // ============================================================================
  describe("Application Configuration", () => {
    it("should export COUPON_PREFIX", () => {
      expect(COUPON_PREFIX).toBeDefined();
      expect(typeof COUPON_PREFIX).toBe("string");
      expect(COUPON_PREFIX.length).toBeGreaterThan(0);
    });

    it("should export COUPON_LENGTH", () => {
      expect(COUPON_LENGTH).toBeDefined();
      expect(typeof COUPON_LENGTH).toBe("number");
      expect(COUPON_LENGTH).toBeGreaterThan(0);
    });

    it("should export MAX_FILE_SIZE", () => {
      expect(MAX_FILE_SIZE).toBeDefined();
      expect(typeof MAX_FILE_SIZE).toBe("number");
      expect(MAX_FILE_SIZE).toBeGreaterThan(0);
    });

    it("should export ALLOWED_FILE_TYPES", () => {
      expect(ALLOWED_FILE_TYPES).toBeDefined();
      expect(Array.isArray(ALLOWED_FILE_TYPES)).toBe(true);
      expect(ALLOWED_FILE_TYPES.length).toBeGreaterThan(0);
    });

    it("should have valid MIME types in ALLOWED_FILE_TYPES", () => {
      ALLOWED_FILE_TYPES.forEach((type) => {
        expect(type).toMatch(/^[a-z]+\/[a-z0-9+-]+$/);
      });
    });
  });

  // ============================================================================
  // Rate Limiting Tests
  // ============================================================================
  describe("Rate Limiting", () => {
    it("should export RATE_LIMIT_WINDOW_MS", () => {
      expect(RATE_LIMIT_WINDOW_MS).toBeDefined();
      expect(typeof RATE_LIMIT_WINDOW_MS).toBe("number");
      expect(RATE_LIMIT_WINDOW_MS).toBeGreaterThan(0);
    });

    it("should export RATE_LIMIT_MAX_REQUESTS", () => {
      expect(RATE_LIMIT_MAX_REQUESTS).toBeDefined();
      expect(typeof RATE_LIMIT_MAX_REQUESTS).toBe("number");
      expect(RATE_LIMIT_MAX_REQUESTS).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Pagination Tests
  // ============================================================================
  describe("Pagination", () => {
    it("should export DEFAULT_PAGE_SIZE", () => {
      expect(DEFAULT_PAGE_SIZE).toBeDefined();
      expect(typeof DEFAULT_PAGE_SIZE).toBe("number");
      expect(DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    });

    it("should export MAX_PAGE_SIZE", () => {
      expect(MAX_PAGE_SIZE).toBeDefined();
      expect(typeof MAX_PAGE_SIZE).toBe("number");
      expect(MAX_PAGE_SIZE).toBeGreaterThan(0);
    });

    it("should have MAX_PAGE_SIZE greater than DEFAULT_PAGE_SIZE", () => {
      expect(MAX_PAGE_SIZE).toBeGreaterThan(DEFAULT_PAGE_SIZE);
    });
  });

  // ============================================================================
  // Currency Tests
  // ============================================================================
  describe("Currency", () => {
    it("should export DEFAULT_CURRENCY", () => {
      expect(DEFAULT_CURRENCY).toBeDefined();
      expect(typeof DEFAULT_CURRENCY).toBe("string");
      expect(DEFAULT_CURRENCY).toBe("INR");
    });

    it("should export CURRENCY_SYMBOL", () => {
      expect(CURRENCY_SYMBOL).toBeDefined();
      expect(typeof CURRENCY_SYMBOL).toBe("string");
      expect(CURRENCY_SYMBOL).toBe("₹");
    });
  });

  // ============================================================================
  // Date/Time Format Tests
  // ============================================================================
  describe("Date/Time Format", () => {
    it("should export DATE_FORMAT", () => {
      expect(DATE_FORMAT).toBeDefined();
      expect(typeof DATE_FORMAT).toBe("string");
      expect(DATE_FORMAT.length).toBeGreaterThan(0);
    });

    it("should export TIME_FORMAT", () => {
      expect(TIME_FORMAT).toBeDefined();
      expect(typeof TIME_FORMAT).toBe("string");
      expect(TIME_FORMAT.length).toBeGreaterThan(0);
    });

    it("should export DATETIME_FORMAT", () => {
      expect(DATETIME_FORMAT).toBeDefined();
      expect(typeof DATETIME_FORMAT).toBe("string");
      expect(DATETIME_FORMAT.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Navigation Tests
  // ============================================================================
  describe("Navigation", () => {
    it("should export NAV_LINKS object", () => {
      expect(NAV_LINKS).toBeDefined();
      expect(typeof NAV_LINKS).toBe("object");
    });

    it("should have home link", () => {
      expect(NAV_LINKS.home).toBe("/");
    });

    it("should have auctions link", () => {
      expect(NAV_LINKS.auctions).toBe("/auctions");
    });

    it("should have products link", () => {
      expect(NAV_LINKS.products).toBe("/products");
    });

    it("should have categories link", () => {
      expect(NAV_LINKS.categories).toBe("/categories");
    });

    it("should have shops link", () => {
      expect(NAV_LINKS.shops).toBe("/shops");
    });

    it("should have about link", () => {
      expect(NAV_LINKS.about).toBe("/about");
    });

    it("should have contact link", () => {
      expect(NAV_LINKS.contact).toBe("/contact");
    });

    it("should have valid paths in NAV_LINKS", () => {
      Object.values(NAV_LINKS).forEach((link) => {
        expect(link).toMatch(/^\//);
      });
    });
  });

  // ============================================================================
  // User Roles Tests
  // ============================================================================
  describe("User Roles", () => {
    it("should export USER_ROLES object", () => {
      expect(USER_ROLES).toBeDefined();
      expect(typeof USER_ROLES).toBe("object");
    });

    it("should have ADMIN role", () => {
      expect(USER_ROLES.ADMIN).toBe("admin");
    });

    it("should have SELLER role", () => {
      expect(USER_ROLES.SELLER).toBe("seller");
    });

    it("should have BUYER role", () => {
      expect(USER_ROLES.BUYER).toBe("buyer");
    });

    it("should have exactly 3 roles", () => {
      expect(Object.keys(USER_ROLES).length).toBe(3);
    });
  });

  // ============================================================================
  // Order Status Tests
  // ============================================================================
  describe("Order Status", () => {
    it("should export ORDER_STATUS object", () => {
      expect(ORDER_STATUS).toBeDefined();
      expect(typeof ORDER_STATUS).toBe("object");
    });

    it("should have PENDING status", () => {
      expect(ORDER_STATUS.PENDING).toBe("pending");
    });

    it("should have CONFIRMED status", () => {
      expect(ORDER_STATUS.CONFIRMED).toBe("confirmed");
    });

    it("should have PROCESSING status", () => {
      expect(ORDER_STATUS.PROCESSING).toBe("processing");
    });

    it("should have SHIPPED status", () => {
      expect(ORDER_STATUS.SHIPPED).toBe("shipped");
    });

    it("should have DELIVERED status", () => {
      expect(ORDER_STATUS.DELIVERED).toBe("delivered");
    });

    it("should have CANCELLED status", () => {
      expect(ORDER_STATUS.CANCELLED).toBe("cancelled");
    });

    it("should have REFUNDED status", () => {
      expect(ORDER_STATUS.REFUNDED).toBe("refunded");
    });
  });

  // ============================================================================
  // Auction Status Tests
  // ============================================================================
  describe("Auction Status", () => {
    it("should export AUCTION_STATUS object", () => {
      expect(AUCTION_STATUS).toBeDefined();
      expect(typeof AUCTION_STATUS).toBe("object");
    });

    it("should have DRAFT status", () => {
      expect(AUCTION_STATUS.DRAFT).toBe("draft");
    });

    it("should have SCHEDULED status", () => {
      expect(AUCTION_STATUS.SCHEDULED).toBe("scheduled");
    });

    it("should have ACTIVE status", () => {
      expect(AUCTION_STATUS.ACTIVE).toBe("active");
    });

    it("should have ENDED status", () => {
      expect(AUCTION_STATUS.ENDED).toBe("ended");
    });

    it("should have CANCELLED status", () => {
      expect(AUCTION_STATUS.CANCELLED).toBe("cancelled");
    });
  });

  // ============================================================================
  // Product Status Tests
  // ============================================================================
  describe("Product Status", () => {
    it("should export PRODUCT_STATUS object", () => {
      expect(PRODUCT_STATUS).toBeDefined();
      expect(typeof PRODUCT_STATUS).toBe("object");
    });

    it("should have DRAFT status", () => {
      expect(PRODUCT_STATUS.DRAFT).toBe("draft");
    });

    it("should have ACTIVE status", () => {
      expect(PRODUCT_STATUS.ACTIVE).toBe("active");
    });

    it("should have INACTIVE status", () => {
      expect(PRODUCT_STATUS.INACTIVE).toBe("inactive");
    });

    it("should have OUT_OF_STOCK status", () => {
      expect(PRODUCT_STATUS.OUT_OF_STOCK).toBe("out_of_stock");
    });
  });

  // ============================================================================
  // Ticket Status Tests
  // ============================================================================
  describe("Ticket Status", () => {
    it("should export TICKET_STATUS object", () => {
      expect(TICKET_STATUS).toBeDefined();
      expect(typeof TICKET_STATUS).toBe("object");
    });

    it("should have OPEN status", () => {
      expect(TICKET_STATUS.OPEN).toBe("open");
    });

    it("should have IN_PROGRESS status", () => {
      expect(TICKET_STATUS.IN_PROGRESS).toBe("in_progress");
    });

    it("should have RESOLVED status", () => {
      expect(TICKET_STATUS.RESOLVED).toBe("resolved");
    });

    it("should have CLOSED status", () => {
      expect(TICKET_STATUS.CLOSED).toBe("closed");
    });
  });

  // ============================================================================
  // Collections Tests
  // ============================================================================
  describe("Collections", () => {
    it("should export COLLECTIONS object", () => {
      expect(COLLECTIONS).toBeDefined();
      expect(typeof COLLECTIONS).toBe("object");
    });

    it("should have USERS collection", () => {
      expect(COLLECTIONS.USERS).toBe("users");
    });

    it("should have PRODUCTS collection", () => {
      expect(COLLECTIONS.PRODUCTS).toBe("products");
    });

    it("should have AUCTIONS collection", () => {
      expect(COLLECTIONS.AUCTIONS).toBe("auctions");
    });

    it("should have BIDS collection", () => {
      expect(COLLECTIONS.BIDS).toBe("bids");
    });

    it("should have ORDERS collection", () => {
      expect(COLLECTIONS.ORDERS).toBe("orders");
    });

    it("should have SHOPS collection", () => {
      expect(COLLECTIONS.SHOPS).toBe("shops");
    });

    it("should have CATEGORIES collection", () => {
      expect(COLLECTIONS.CATEGORIES).toBe("categories");
    });

    it("should have COUPONS collection", () => {
      expect(COLLECTIONS.COUPONS).toBe("coupons");
    });

    it("should have CART collection", () => {
      expect(COLLECTIONS.CART).toBe("cart");
    });

    it("should have REVIEWS collection", () => {
      expect(COLLECTIONS.REVIEWS).toBe("reviews");
    });

    it("should have SUPPORT_TICKETS collection", () => {
      expect(COLLECTIONS.SUPPORT_TICKETS).toBe("support_tickets");
    });

    it("should have RETURNS collection", () => {
      expect(COLLECTIONS.RETURNS).toBe("returns");
    });

    it("should have SESSIONS collection", () => {
      expect(COLLECTIONS.SESSIONS).toBe("sessions");
    });

    it("should have HERO_SLIDES collection", () => {
      expect(COLLECTIONS.HERO_SLIDES).toBe("hero_slides");
    });

    it("should have FEATURED_SECTIONS collection", () => {
      expect(COLLECTIONS.FEATURED_SECTIONS).toBe("featured_sections");
    });

    it("should have BLOG_POSTS collection", () => {
      expect(COLLECTIONS.BLOG_POSTS).toBe("blog_posts");
    });

    it("should have STATIC_ASSETS collection", () => {
      expect(COLLECTIONS.STATIC_ASSETS).toBe("static_assets");
    });

    it("should have consistent naming for collections", () => {
      Object.values(COLLECTIONS).forEach((collection) => {
        expect(collection).toMatch(/^[a-z_]+$/);
      });
    });
  });
});
