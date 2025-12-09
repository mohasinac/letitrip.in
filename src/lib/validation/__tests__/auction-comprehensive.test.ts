/**
 * Comprehensive Auction Validation Tests
 *
 * Testing auction.ts validation schemas and utility functions
 * Coverage: schemas, refinements, edge cases, utilities
 */

import {
  auctionQuerySchema,
  bidHistoryQuerySchema,
  calculateEndTime,
  canBid,
  cancelAuctionSchema,
  createAuctionSchema,
  extendAuctionSchema,
  featureAuctionSchema,
  getNextMinimumBid,
  getTimeRemaining,
  isEndingSoon,
  isValidBidAmount,
  placeBidSchema,
  updateAuctionSchema,
  watchAuctionSchema,
} from "../auction";

describe("Auction Validation - Basic Schema", () => {
  const validBaseAuction = {
    name: "Vintage Camera from 1960s Japan",
    slug: "vintage-camera-1960s-japan",
    description:
      "A beautiful vintage camera in excellent condition with original case and manual.",
    shopId: "shop123",
    startingBid: 1000,
    startTime: new Date("2025-12-10T10:00:00Z"),
    endTime: new Date("2025-12-15T10:00:00Z"),
    images: ["https://example.com/image1.jpg"],
    condition: "used" as const,
  };

  describe("createAuctionSchema - Basic Fields", () => {
    test("should validate a valid auction", () => {
      const result = createAuctionSchema.safeParse(validBaseAuction);
      expect(result.success).toBe(true);
    });

    test("should require name with minimum 10 characters", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        name: "Short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Auction name must be at least 10 characters"
        );
      }
    });

    test("should reject name exceeding 200 characters", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        name: "A".repeat(201),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Auction name must not exceed 200 characters"
        );
      }
    });

    test("should trim name", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        name: "  Vintage Camera from 1960s  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Vintage Camera from 1960s");
      }
    });

    test("should validate slug format (lowercase, numbers, hyphens only)", () => {
      const validSlugs = [
        "vintage-camera",
        "item-123",
        "abc-def-ghi-123",
        "product-2025",
      ];

      validSlugs.forEach((slug) => {
        const result = createAuctionSchema.safeParse({
          ...validBaseAuction,
          slug,
        });
        expect(result.success).toBe(true);
      });
    });

    test("should reject invalid slug formats", () => {
      const invalidSlugs = [
        "Invalid_Slug",
        "has space",
        "HasCapitals",
        "has.dot",
        "has@symbol",
        "-starts-with-hyphen",
        "ends-with-hyphen-",
        "double--hyphen",
      ];

      invalidSlugs.forEach((slug) => {
        const result = createAuctionSchema.safeParse({
          ...validBaseAuction,
          slug,
        });
        expect(result.success).toBe(false);
      });
    });

    test("should require description with minimum 50 characters", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        description: "Short description",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Description must be at least 50 characters"
        );
      }
    });

    test("should reject description exceeding 5000 characters", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        description: "A".repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    test("should accept optional shortDescription up to 200 characters", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        shortDescription: "A vintage camera in excellent condition",
      });
      expect(result.success).toBe(true);
    });

    test("should reject shortDescription exceeding 200 characters", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        shortDescription: "A".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    test("should require shopId", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        shopId: "",
      });
      expect(result.success).toBe(false);
    });

    test("should accept optional categoryId", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        categoryId: "cat123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("createAuctionSchema - Bidding Fields", () => {
    test("should validate positive startingBid", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startingBid: 100,
      });
      expect(result.success).toBe(true);
    });

    test("should reject negative startingBid", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startingBid: -100,
      });
      expect(result.success).toBe(false);
    });

    test("should reject zero startingBid", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startingBid: 0,
      });
      expect(result.success).toBe(false);
    });

    test("should enforce minimum startingBid of ₹1", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startingBid: 0.5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Starting bid must be at least ₹1"
        );
      }
    });

    test("should enforce maximum startingBid of ₹1 Crore", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startingBid: 10000001,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Starting bid must not exceed ₹1 Crore"
        );
      }
    });

    test("should accept optional reservePrice", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        reservePrice: 5000,
      });
      expect(result.success).toBe(true);
    });

    test("should accept null reservePrice", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        reservePrice: null,
      });
      expect(result.success).toBe(true);
    });

    test("should reject negative reservePrice", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        reservePrice: -1000,
      });
      expect(result.success).toBe(false);
    });

    test("should accept optional bidIncrement with default 10", () => {
      const result = createAuctionSchema.safeParse(validBaseAuction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bidIncrement).toBe(10);
      }
    });

    test("should accept custom bidIncrement", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        bidIncrement: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bidIncrement).toBe(50);
      }
    });

    test("should reject negative bidIncrement", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        bidIncrement: -10,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createAuctionSchema - Timing Refinements", () => {
    test("should require endTime after startTime", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startTime: new Date("2025-12-15T10:00:00Z"),
        endTime: new Date("2025-12-10T10:00:00Z"),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "End time must be after start time"
        );
      }
    });

    test("should reject auction duration less than 1 hour", () => {
      const startTime = new Date("2025-12-10T10:00:00Z");
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes

      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startTime,
        endTime,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Auction duration must be between 1 hour and 30 days"
        );
      }
    });

    test("should reject auction duration more than 30 days", () => {
      const startTime = new Date("2025-12-10T10:00:00Z");
      const endTime = new Date(startTime.getTime() + 721 * 60 * 60 * 1000); // 721 hours

      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startTime,
        endTime,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Auction duration must be between 1 hour and 30 days"
        );
      }
    });

    test("should accept exactly 1 hour duration", () => {
      const startTime = new Date("2025-12-10T10:00:00Z");
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startTime,
        endTime,
      });
      expect(result.success).toBe(true);
    });

    test("should accept exactly 30 days duration", () => {
      const startTime = new Date("2025-12-10T10:00:00Z");
      const endTime = new Date(startTime.getTime() + 720 * 60 * 60 * 1000);

      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startTime,
        endTime,
      });
      expect(result.success).toBe(true);
    });

    test("should validate reservePrice >= startingBid", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startingBid: 1000,
        reservePrice: 500,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Reserve price must be greater than or equal to starting bid"
        );
      }
    });

    test("should accept reservePrice equal to startingBid", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startingBid: 1000,
        reservePrice: 1000,
      });
      expect(result.success).toBe(true);
    });

    test("should accept reservePrice greater than startingBid", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        startingBid: 1000,
        reservePrice: 2000,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("createAuctionSchema - Media Fields", () => {
    test("should require at least one image", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        images: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "At least one image is required"
        );
      }
    });

    test("should reject more than 10 images", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        images: Array(11).fill("https://example.com/image.jpg"),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Maximum 10 images allowed"
        );
      }
    });

    test("should validate image URLs", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        images: ["not-a-url"],
      });
      expect(result.success).toBe(false);
    });

    test("should accept optional videos up to 3", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        videos: [
          "https://example.com/video1.mp4",
          "https://example.com/video2.mp4",
        ],
      });
      expect(result.success).toBe(true);
    });

    test("should reject more than 3 videos", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        videos: Array(4).fill("https://example.com/video.mp4"),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Maximum 3 videos allowed");
      }
    });

    test("should validate video URLs", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        videos: ["invalid-url"],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createAuctionSchema - Item Details", () => {
    test("should accept valid condition values", () => {
      const conditions = ["new", "used", "refurbished"] as const;

      conditions.forEach((condition) => {
        const result = createAuctionSchema.safeParse({
          ...validBaseAuction,
          condition,
        });
        expect(result.success).toBe(true);
      });
    });

    test("should default condition to 'used'", () => {
      const { condition, ...auctionWithoutCondition } = validBaseAuction;
      const result = createAuctionSchema.safeParse(auctionWithoutCondition);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.condition).toBe("used");
      }
    });

    test("should accept optional brand up to 100 characters", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        brand: "Canon",
      });
      expect(result.success).toBe(true);
    });

    test("should reject brand exceeding 100 characters", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        brand: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    test("should accept optional manufacturer", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        manufacturer: "Canon Inc.",
      });
      expect(result.success).toBe(true);
    });

    test("should default countryOfOrigin to 'Japan'", () => {
      const result = createAuctionSchema.safeParse(validBaseAuction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.countryOfOrigin).toBe("Japan");
      }
    });

    test("should accept specifications array", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        specifications: [
          { name: "Sensor", value: "APS-C" },
          { name: "Megapixels", value: "24.1MP" },
        ],
      });
      expect(result.success).toBe(true);
    });

    test("should validate specification name and value", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        specifications: [{ name: "", value: "test" }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createAuctionSchema - Shipping & Returns", () => {
    test("should accept shippingCost with default 0", () => {
      const result = createAuctionSchema.safeParse(validBaseAuction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.shippingCost).toBe(0);
      }
    });

    test("should reject negative shippingCost", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        shippingCost: -10,
      });
      expect(result.success).toBe(false);
    });

    test("should accept valid shippingClass values", () => {
      const classes = ["standard", "express", "heavy", "fragile"] as const;

      classes.forEach((shippingClass) => {
        const result = createAuctionSchema.safeParse({
          ...validBaseAuction,
          shippingClass,
        });
        expect(result.success).toBe(true);
      });
    });

    test("should validate return window when returns accepted", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        returnsAccepted: true,
        // returnWindowDays not provided
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Return window must be specified if returns are accepted"
        );
      }
    });

    test("should accept valid returns configuration", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        returnsAccepted: true,
        returnWindowDays: 7,
        returnConditions: "Item must be unused",
      });
      expect(result.success).toBe(true);
    });

    test("should enforce maximum return window of 14 days", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        returnsAccepted: true,
        returnWindowDays: 15,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createAuctionSchema - Payment & Requirements", () => {
    test("should default paymentDueHours to 48", () => {
      const result = createAuctionSchema.safeParse(validBaseAuction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentDueHours).toBe(48);
      }
    });

    test("should accept valid payment methods", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        acceptedPaymentMethods: ["razorpay", "paypal", "cod"],
      });
      expect(result.success).toBe(true);
    });

    test("should require at least one payment method", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        acceptedPaymentMethods: [],
      });
      expect(result.success).toBe(false);
    });

    test("should accept optional minimumBidderRating", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        minimumBidderRating: 4.0,
      });
      expect(result.success).toBe(true);
    });

    test("should enforce minimumBidderRating between 0 and 5", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        minimumBidderRating: 6,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createAuctionSchema - Status & Tags", () => {
    test("should default status to 'draft'", () => {
      const result = createAuctionSchema.safeParse(validBaseAuction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("draft");
      }
    });

    test("should accept valid AuctionStatus values", () => {
      const statuses = ["draft", "scheduled", "live", "ended", "cancelled"];

      statuses.forEach((status) => {
        const result = createAuctionSchema.safeParse({
          ...validBaseAuction,
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    test("should accept tags up to 20", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        tags: Array(20).fill("tag"),
      });
      expect(result.success).toBe(true);
    });

    test("should reject more than 20 tags", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        tags: Array(21).fill("tag"),
      });
      expect(result.success).toBe(false);
    });

    test("should validate individual tag max length of 50", () => {
      const result = createAuctionSchema.safeParse({
        ...validBaseAuction,
        tags: ["A".repeat(51)],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Auction Validation - Place Bid Schema", () => {
  const validBid = {
    auctionId: "auction123",
    bidAmount: 1500,
    isAutoBid: false,
  };

  test("should validate a valid bid", () => {
    const result = placeBidSchema.safeParse(validBid);
    expect(result.success).toBe(true);
  });

  test("should require auctionId", () => {
    const result = placeBidSchema.safeParse({
      ...validBid,
      auctionId: "",
    });
    expect(result.success).toBe(false);
  });

  test("should require positive bidAmount", () => {
    const result = placeBidSchema.safeParse({
      ...validBid,
      bidAmount: 0,
    });
    expect(result.success).toBe(false);
  });

  test("should reject negative bidAmount", () => {
    const result = placeBidSchema.safeParse({
      ...validBid,
      bidAmount: -100,
    });
    expect(result.success).toBe(false);
  });

  test("should default isAutoBid to false", () => {
    const result = placeBidSchema.safeParse({
      auctionId: "auction123",
      bidAmount: 1500,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isAutoBid).toBe(false);
    }
  });

  test("should require maxAutoBid when isAutoBid is true", () => {
    const result = placeBidSchema.safeParse({
      ...validBid,
      isAutoBid: true,
      // maxAutoBid not provided
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Max auto-bid must be greater than current bid amount"
      );
    }
  });

  test("should require maxAutoBid > bidAmount for auto-bid", () => {
    const result = placeBidSchema.safeParse({
      ...validBid,
      isAutoBid: true,
      bidAmount: 1500,
      maxAutoBid: 1400,
    });
    expect(result.success).toBe(false);
  });

  test("should accept valid auto-bid configuration", () => {
    const result = placeBidSchema.safeParse({
      ...validBid,
      isAutoBid: true,
      bidAmount: 1500,
      maxAutoBid: 2000,
    });
    expect(result.success).toBe(true);
  });
});

describe("Auction Validation - Query & Filter Schemas", () => {
  test("should validate auctionQuerySchema with defaults", () => {
    const result = auctionQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("endTime");
      expect(result.data.sortOrder).toBe("asc");
    }
  });

  test("should accept valid sortBy values", () => {
    const sortByValues = [
      "name",
      "startTime",
      "endTime",
      "currentBid",
      "bidCount",
      "createdAt",
      "timeLeft",
    ];

    sortByValues.forEach((sortBy) => {
      const result = auctionQuerySchema.safeParse({ sortBy });
      expect(result.success).toBe(true);
    });
  });

  test("should accept bid range filters", () => {
    const result = auctionQuerySchema.safeParse({
      minCurrentBid: 100,
      maxCurrentBid: 1000,
    });
    expect(result.success).toBe(true);
  });

  test("should accept boolean flags", () => {
    const result = auctionQuerySchema.safeParse({
      featured: true,
      endingSoon: true,
      userBidding: true,
    });
    expect(result.success).toBe(true);
  });

  test("should validate bidHistoryQuerySchema", () => {
    const result = bidHistoryQuerySchema.safeParse({
      auctionId: "auction123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });
});

describe("Auction Validation - Admin Schemas", () => {
  test("should validate featureAuctionSchema", () => {
    const result = featureAuctionSchema.safeParse({
      featured: true,
      featuredPriority: 80,
    });
    expect(result.success).toBe(true);
  });

  test("should validate extendAuctionSchema", () => {
    const result = extendAuctionSchema.safeParse({
      additionalHours: 12,
      reason: "Technical issues during bidding",
    });
    expect(result.success).toBe(true);
  });

  test("should reject extension more than 24 hours", () => {
    const result = extendAuctionSchema.safeParse({
      additionalHours: 25,
      reason: "Technical issues",
    });
    expect(result.success).toBe(false);
  });

  test("should require reason for extension", () => {
    const result = extendAuctionSchema.safeParse({
      additionalHours: 12,
      reason: "Short",
    });
    expect(result.success).toBe(false);
  });

  test("should validate cancelAuctionSchema", () => {
    const result = cancelAuctionSchema.safeParse({
      reason: "Item no longer available for sale",
      refundBidders: true,
    });
    expect(result.success).toBe(true);
  });

  test("should default refundBidders to true", () => {
    const result = cancelAuctionSchema.safeParse({
      reason: "Item no longer available for sale",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.refundBidders).toBe(true);
    }
  });
});

describe("Auction Validation - Watchlist Schema", () => {
  test("should validate watchAuctionSchema with defaults", () => {
    const result = watchAuctionSchema.safeParse({
      auctionId: "auction123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notifyBeforeEnd).toBe(60);
    }
  });

  test("should accept custom notification time", () => {
    const result = watchAuctionSchema.safeParse({
      auctionId: "auction123",
      notifyBeforeEnd: 120,
    });
    expect(result.success).toBe(true);
  });
});

describe("Auction Utility Functions", () => {
  describe("calculateEndTime", () => {
    test("should calculate correct end time from duration", () => {
      const startTime = new Date("2025-12-10T10:00:00Z");
      const durationHours = 24;
      const endTime = calculateEndTime(startTime, durationHours);

      expect(endTime.getTime()).toBe(
        startTime.getTime() + durationHours * 60 * 60 * 1000
      );
    });

    test("should handle fractional hours", () => {
      const startTime = new Date("2025-12-10T10:00:00Z");
      const durationHours = 1.5;
      const endTime = calculateEndTime(startTime, durationHours);

      expect(endTime.getTime()).toBe(
        startTime.getTime() + 1.5 * 60 * 60 * 1000
      );
    });

    test("should handle zero duration", () => {
      const startTime = new Date("2025-12-10T10:00:00Z");
      const endTime = calculateEndTime(startTime, 0);

      expect(endTime.getTime()).toBe(startTime.getTime());
    });
  });

  describe("getTimeRemaining", () => {
    test("should calculate time remaining correctly", () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
      const result = getTimeRemaining(futureDate);

      expect(result.isEnded).toBe(false);
      expect(result.days).toBeGreaterThanOrEqual(1);
      expect(result.totalMs).toBeGreaterThan(0);
    });

    test("should return isEnded true for past dates", () => {
      const pastDate = new Date(Date.now() - 1000);
      const result = getTimeRemaining(pastDate);

      expect(result.isEnded).toBe(true);
      expect(result.totalMs).toBe(0);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    test("should handle null endTime", () => {
      const result = getTimeRemaining(null);

      expect(result.isEnded).toBe(true);
      expect(result.totalMs).toBe(0);
    });

    test("should handle undefined endTime", () => {
      const result = getTimeRemaining(undefined);

      expect(result.isEnded).toBe(true);
      expect(result.totalMs).toBe(0);
    });

    test("should handle invalid Date object", () => {
      const invalidDate = new Date("invalid");
      const result = getTimeRemaining(invalidDate);

      expect(result.isEnded).toBe(true);
      expect(result.totalMs).toBe(0);
    });

    test("should break down time correctly", () => {
      const futureDate = new Date(
        Date.now() +
          2 * 24 * 60 * 60 * 1000 + // 2 days
          3 * 60 * 60 * 1000 + // 3 hours
          15 * 60 * 1000 + // 15 minutes
          30 * 1000 // 30 seconds
      );
      const result = getTimeRemaining(futureDate);

      expect(result.isEnded).toBe(false);
      expect(result.days).toBe(2);
      expect(result.hours).toBe(3);
      expect(result.minutes).toBe(15);
      expect(result.seconds).toBeGreaterThanOrEqual(29); // Allow for execution time
    });
  });

  describe("isEndingSoon", () => {
    test("should return true for auctions ending within 24 hours", () => {
      const endTime = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
      expect(isEndingSoon(endTime)).toBe(true);
    });

    test("should return false for auctions ending after 24 hours", () => {
      const endTime = new Date(Date.now() + 25 * 60 * 60 * 1000); // 25 hours
      expect(isEndingSoon(endTime)).toBe(false);
    });

    test("should return false for ended auctions", () => {
      const endTime = new Date(Date.now() - 1000);
      expect(isEndingSoon(endTime)).toBe(false);
    });

    test("should return true for auction ending exactly in 24 hours", () => {
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isEndingSoon(endTime)).toBe(true);
    });

    test("should return true for auction ending in 1 minute", () => {
      const endTime = new Date(Date.now() + 60 * 1000);
      expect(isEndingSoon(endTime)).toBe(true);
    });
  });

  describe("isValidBidAmount", () => {
    test("should validate bid with default increment", () => {
      expect(isValidBidAmount(1500, 1000)).toBe(true);
    });

    test("should reject bid below minimum increment", () => {
      expect(isValidBidAmount(1005, 1000, 10)).toBe(false);
    });

    test("should accept bid exactly at minimum", () => {
      expect(isValidBidAmount(1010, 1000, 10)).toBe(true);
    });

    test("should validate with custom increment", () => {
      expect(isValidBidAmount(1050, 1000, 50)).toBe(true);
    });

    test("should reject bid equal to current bid", () => {
      expect(isValidBidAmount(1000, 1000, 10)).toBe(false);
    });

    test("should handle zero current bid (first bid)", () => {
      expect(isValidBidAmount(100, 0, 10)).toBe(true);
    });
  });

  describe("getNextMinimumBid", () => {
    test("should calculate next minimum bid from current bid", () => {
      expect(getNextMinimumBid(1000, 500, 10)).toBe(1010);
    });

    test("should use starting bid when current bid is 0", () => {
      expect(getNextMinimumBid(0, 500, 10)).toBe(510);
    });

    test("should use default increment of 10", () => {
      expect(getNextMinimumBid(1000, 500)).toBe(1010);
    });

    test("should work with custom increment", () => {
      expect(getNextMinimumBid(1000, 500, 50)).toBe(1050);
    });

    test("should use starting bid when current bid is negative", () => {
      expect(getNextMinimumBid(-100, 500, 10)).toBe(510);
    });
  });

  describe("canBid", () => {
    test("should allow bidding during auction", () => {
      const startTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const endTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      const result = canBid(startTime, endTime);
      expect(result.canBid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test("should reject bidding before auction starts", () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(Date.now() + 120 * 60 * 1000); // 2 hours from now

      const result = canBid(startTime, endTime);
      expect(result.canBid).toBe(false);
      expect(result.reason).toBe("Auction has not started yet");
    });

    test("should reject bidding after auction ends", () => {
      const startTime = new Date(Date.now() - 120 * 60 * 1000); // 2 hours ago
      const endTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      const result = canBid(startTime, endTime);
      expect(result.canBid).toBe(false);
      expect(result.reason).toBe("Auction has ended");
    });

    test("should reject bidding exactly at end time", () => {
      const startTime = new Date(Date.now() - 60 * 60 * 1000);
      const endTime = new Date(Date.now());

      const result = canBid(startTime, endTime);
      expect(result.canBid).toBe(false);
      expect(result.reason).toBe("Auction has ended");
    });

    test("should allow bidding exactly at start time", () => {
      const startTime = new Date(Date.now());
      const endTime = new Date(Date.now() + 60 * 60 * 1000);

      const result = canBid(startTime, endTime);
      expect(result.canBid).toBe(true);
    });
  });
});

describe("Auction Validation - Edge Cases", () => {
  test("should handle empty string fields", () => {
    const result = createAuctionSchema.safeParse({
      name: "",
      slug: "",
      description: "",
      shopId: "",
      startingBid: 1000,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      images: ["https://example.com/image.jpg"],
    });
    expect(result.success).toBe(false);
  });

  test("should trim whitespace from text fields", () => {
    const validBaseAuction = {
      name: "  Vintage Camera from 1960s Japan  ",
      slug: "vintage-camera-1960s-japan",
      description:
        "  A beautiful vintage camera in excellent condition with original case and manual.  ",
      shopId: "shop123",
      startingBid: 1000,
      startTime: new Date("2025-12-10T10:00:00Z"),
      endTime: new Date("2025-12-15T10:00:00Z"),
      images: ["https://example.com/image1.jpg"],
    };

    const result = createAuctionSchema.safeParse(validBaseAuction);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Vintage Camera from 1960s Japan");
      expect(result.data.slug).toBe("vintage-camera-1960s-japan");
      expect(result.data.description.startsWith("  ")).toBe(false);
    }
  });

  test("should handle date coercion", () => {
    const result = createAuctionSchema.safeParse({
      name: "Vintage Camera from 1960s Japan",
      slug: "vintage-camera-1960s-japan",
      description:
        "A beautiful vintage camera in excellent condition with original case and manual.",
      shopId: "shop123",
      startingBid: 1000,
      startTime: "2025-12-10T10:00:00Z",
      endTime: "2025-12-15T10:00:00Z",
      images: ["https://example.com/image1.jpg"],
    });
    expect(result.success).toBe(true);
  });

  test("should reject invalid date strings", () => {
    const result = createAuctionSchema.safeParse({
      name: "Vintage Camera from 1960s Japan",
      slug: "vintage-camera-1960s-japan",
      description:
        "A beautiful vintage camera in excellent condition with original case and manual.",
      shopId: "shop123",
      startingBid: 1000,
      startTime: "invalid-date",
      endTime: "2025-12-15T10:00:00Z",
      images: ["https://example.com/image1.jpg"],
    });
    expect(result.success).toBe(false);
  });

  test("should handle partial update schema", () => {
    const result = updateAuctionSchema.safeParse({
      name: "Updated Auction Name",
    });
    expect(result.success).toBe(true);
  });

  test("should allow empty partial update", () => {
    const result = updateAuctionSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
