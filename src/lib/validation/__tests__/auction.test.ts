/**
 * Tests for Auction Validation Schemas
 */

import {
  auctionQuerySchema,
  AuctionStatus,
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

describe("Auction Validation Schemas", () => {
  describe("AuctionStatus", () => {
    it("should accept valid statuses", () => {
      expect(AuctionStatus.parse("draft")).toBe("draft");
      expect(AuctionStatus.parse("scheduled")).toBe("scheduled");
      expect(AuctionStatus.parse("live")).toBe("live");
      expect(AuctionStatus.parse("ended")).toBe("ended");
      expect(AuctionStatus.parse("cancelled")).toBe("cancelled");
    });

    it("should reject invalid status", () => {
      expect(() => AuctionStatus.parse("active")).toThrow();
    });
  });

  describe("createAuctionSchema", () => {
    const baseAuction = {
      name: "Test Auction Item",
      slug: "test-auction-item",
      description: "A".repeat(50),
      shopId: "shop123",
      startingBid: 1000,
      startTime: new Date(Date.now() + 86400000), // Tomorrow
      endTime: new Date(Date.now() + 86400000 * 2), // Day after tomorrow
      images: ["https://example.com/image.jpg"],
    };

    it("should validate valid auction", () => {
      const result = createAuctionSchema.parse(baseAuction);

      expect(result.name).toBe(baseAuction.name);
      expect(result.startingBid).toBe(1000);
    });

    it("should reject name less than 10 chars", () => {
      const auction = { ...baseAuction, name: "Short" };

      expect(() => createAuctionSchema.parse(auction)).toThrow();
    });

    it("should reject name exceeding 200 chars", () => {
      const auction = { ...baseAuction, name: "a".repeat(201) };

      expect(() => createAuctionSchema.parse(auction)).toThrow();
    });

    it("should validate slug pattern", () => {
      const validSlugs = ["auction-item", "item123", "test-123-auction"];

      validSlugs.forEach((slug) => {
        const auction = { ...baseAuction, slug };
        expect(() => createAuctionSchema.parse(auction)).not.toThrow();
      });
    });

    it("should reject invalid slug patterns", () => {
      const invalidSlugs = ["Auction Item", "auction_item", "AUCTION-ITEM"];

      invalidSlugs.forEach((slug) => {
        const auction = { ...baseAuction, slug };
        expect(() => createAuctionSchema.parse(auction)).toThrow();
      });
    });

    it("should reject description less than 50 chars", () => {
      const auction = { ...baseAuction, description: "Short" };

      expect(() => createAuctionSchema.parse(auction)).toThrow();
    });

    it("should reject starting bid less than 1", () => {
      const auction = { ...baseAuction, startingBid: 0 };

      expect(() => createAuctionSchema.parse(auction)).toThrow();
    });

    it("should reject starting bid exceeding 1 Crore", () => {
      const auction = { ...baseAuction, startingBid: 10000001 };

      expect(() => createAuctionSchema.parse(auction)).toThrow();
    });

    it("should reject endTime before startTime", () => {
      const auction = {
        ...baseAuction,
        startTime: new Date(Date.now() + 86400000 * 2),
        endTime: new Date(Date.now() + 86400000),
      };

      expect(() => createAuctionSchema.parse(auction)).toThrow(
        /End time must be after start time/
      );
    });

    it("should reject reserve price less than starting bid", () => {
      const auction = {
        ...baseAuction,
        startingBid: 1000,
        reservePrice: 500,
      };

      expect(() => createAuctionSchema.parse(auction)).toThrow(
        /Reserve price must be greater than or equal/
      );
    });

    it("should accept reserve price equal to starting bid", () => {
      const auction = {
        ...baseAuction,
        startingBid: 1000,
        reservePrice: 1000,
      };

      const result = createAuctionSchema.parse(auction);
      expect(result.reservePrice).toBe(1000);
    });

    it("should reject auction duration less than 1 hour", () => {
      const startTime = new Date(Date.now() + 86400000);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes

      const auction = {
        ...baseAuction,
        startTime,
        endTime,
      };

      expect(() => createAuctionSchema.parse(auction)).toThrow(
        /duration must be between 1 hour and 30 days/
      );
    });

    it("should reject auction duration exceeding 30 days", () => {
      const startTime = new Date(Date.now() + 86400000);
      const endTime = new Date(startTime.getTime() + 31 * 24 * 60 * 60 * 1000); // 31 days

      const auction = {
        ...baseAuction,
        startTime,
        endTime,
      };

      expect(() => createAuctionSchema.parse(auction)).toThrow(
        /duration must be between 1 hour and 30 days/
      );
    });

    it("should require at least one image", () => {
      const auction = { ...baseAuction, images: [] };

      expect(() => createAuctionSchema.parse(auction)).toThrow();
    });

    it("should reject more than 10 images", () => {
      const auction = {
        ...baseAuction,
        images: Array(11).fill("https://example.com/image.jpg"),
      };

      expect(() => createAuctionSchema.parse(auction)).toThrow();
    });

    it("should reject more than 3 videos", () => {
      const auction = {
        ...baseAuction,
        videos: Array(4).fill("https://example.com/video.mp4"),
      };

      expect(() => createAuctionSchema.parse(auction)).toThrow();
    });

    it("should default status to draft", () => {
      const result = createAuctionSchema.parse(baseAuction);

      expect(result.status).toBe("draft");
    });

    it("should default condition to used", () => {
      const result = createAuctionSchema.parse(baseAuction);

      expect(result.condition).toBe("used");
    });

    it("should require returnWindowDays if returns accepted", () => {
      const auction = {
        ...baseAuction,
        returnsAccepted: true,
      };

      expect(() => createAuctionSchema.parse(auction)).toThrow(
        /Return window must be specified/
      );
    });

    it("should accept returnWindowDays when returns accepted", () => {
      const auction = {
        ...baseAuction,
        returnsAccepted: true,
        returnWindowDays: 7,
      };

      const result = createAuctionSchema.parse(auction);
      expect(result.returnWindowDays).toBe(7);
    });
  });

  describe("updateAuctionSchema", () => {
    it("should allow partial updates", () => {
      const update = { name: "Updated Auction Name" };

      const result = updateAuctionSchema.parse(update);

      expect(result.name).toBe("Updated Auction Name");
    });

    it("should allow empty updates with defaults", () => {
      const result = updateAuctionSchema.parse({});

      // Schema has default values even when partial
      expect(result).toBeDefined();
    });
  });

  describe("placeBidSchema", () => {
    it("should validate valid bid", () => {
      const bid = {
        auctionId: "auction123",
        bidAmount: 1500,
      };

      const result = placeBidSchema.parse(bid);

      expect(result.auctionId).toBe("auction123");
      expect(result.bidAmount).toBe(1500);
    });

    it("should reject bid amount less than 1", () => {
      const bid = {
        auctionId: "auction123",
        bidAmount: 0,
      };

      expect(() => placeBidSchema.parse(bid)).toThrow();
    });

    it("should accept auto-bid with valid maxAutoBid", () => {
      const bid = {
        auctionId: "auction123",
        bidAmount: 1500,
        isAutoBid: true,
        maxAutoBid: 2000,
      };

      const result = placeBidSchema.parse(bid);

      expect(result.isAutoBid).toBe(true);
      expect(result.maxAutoBid).toBe(2000);
    });

    it("should reject auto-bid without maxAutoBid", () => {
      const bid = {
        auctionId: "auction123",
        bidAmount: 1500,
        isAutoBid: true,
      };

      expect(() => placeBidSchema.parse(bid)).toThrow(
        /Max auto-bid must be greater/
      );
    });

    it("should reject maxAutoBid less than bidAmount", () => {
      const bid = {
        auctionId: "auction123",
        bidAmount: 2000,
        isAutoBid: true,
        maxAutoBid: 1500,
      };

      expect(() => placeBidSchema.parse(bid)).toThrow(
        /Max auto-bid must be greater/
      );
    });
  });

  describe("auctionQuerySchema", () => {
    it("should validate query with defaults", () => {
      const result = auctionQuerySchema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe("endTime");
      expect(result.sortOrder).toBe("asc");
    });

    it("should parse string numbers", () => {
      const query = { page: "2", limit: "50" };

      const result = auctionQuerySchema.parse(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it("should handle filter options", () => {
      const query = {
        shopId: "shop123",
        categoryId: "cat123",
        status: "live",
        featured: "true",
        condition: "new",
        endingSoon: "true",
      };

      const result = auctionQuerySchema.parse(query);

      expect(result.shopId).toBe("shop123");
      expect(result.status).toBe("live");
      expect(result.featured).toBe(true);
      expect(result.endingSoon).toBe(true);
    });
  });

  describe("featureAuctionSchema", () => {
    it("should validate feature auction data", () => {
      const data = {
        featured: true,
        featuredPriority: 75,
      };

      const result = featureAuctionSchema.parse(data);

      expect(result.featured).toBe(true);
      expect(result.featuredPriority).toBe(75);
    });

    it("should reject priority exceeding 100", () => {
      const data = {
        featured: true,
        featuredPriority: 101,
      };

      expect(() => featureAuctionSchema.parse(data)).toThrow();
    });
  });

  describe("extendAuctionSchema", () => {
    it("should validate auction extension", () => {
      const extension = {
        additionalHours: 12,
        reason: "Technical issues with bidding system",
      };

      const result = extendAuctionSchema.parse(extension);

      expect(result.additionalHours).toBe(12);
      expect(result.reason).toBe("Technical issues with bidding system");
    });

    it("should reject extension exceeding 24 hours", () => {
      const extension = {
        additionalHours: 25,
        reason: "Technical issues",
      };

      expect(() => extendAuctionSchema.parse(extension)).toThrow();
    });

    it("should require reason of at least 10 chars", () => {
      const extension = {
        additionalHours: 12,
        reason: "Short",
      };

      expect(() => extendAuctionSchema.parse(extension)).toThrow();
    });
  });

  describe("cancelAuctionSchema", () => {
    it("should validate cancellation", () => {
      const cancellation = {
        reason: "Item no longer available for auction",
        refundBidders: true,
      };

      const result = cancelAuctionSchema.parse(cancellation);

      expect(result.reason).toBe("Item no longer available for auction");
      expect(result.refundBidders).toBe(true);
    });

    it("should require reason of at least 10 chars", () => {
      const cancellation = {
        reason: "Short",
      };

      expect(() => cancelAuctionSchema.parse(cancellation)).toThrow();
    });
  });

  describe("watchAuctionSchema", () => {
    it("should validate watchlist addition", () => {
      const watch = {
        auctionId: "auction123",
        notifyBeforeEnd: 30,
      };

      const result = watchAuctionSchema.parse(watch);

      expect(result.auctionId).toBe("auction123");
      expect(result.notifyBeforeEnd).toBe(30);
    });

    it("should default notifyBeforeEnd to 60", () => {
      const watch = {
        auctionId: "auction123",
      };

      const result = watchAuctionSchema.parse(watch);

      expect(result.notifyBeforeEnd).toBe(60);
    });
  });

  describe("bidHistoryQuerySchema", () => {
    it("should validate bid history query", () => {
      const query = {
        auctionId: "auction123",
        page: "1",
        limit: "50",
      };

      const result = bidHistoryQuerySchema.parse(query);

      expect(result.auctionId).toBe("auction123");
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });
  });

  describe("Utility Functions", () => {
    describe("calculateEndTime", () => {
      it("should calculate end time correctly", () => {
        const startTime = new Date("2024-01-01T00:00:00Z");
        const durationHours = 24;

        const endTime = calculateEndTime(startTime, durationHours);

        expect(endTime.getTime()).toBe(
          startTime.getTime() + 24 * 60 * 60 * 1000
        );
      });

      it("should handle fractional hours", () => {
        const startTime = new Date("2024-01-01T00:00:00Z");
        const durationHours = 1.5;

        const endTime = calculateEndTime(startTime, durationHours);

        expect(endTime.getTime()).toBe(
          startTime.getTime() + 1.5 * 60 * 60 * 1000
        );
      });
    });

    describe("getTimeRemaining", () => {
      it("should calculate time remaining", () => {
        const now = Date.now();
        const endTime = new Date(
          now + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
        ); // 2 days 3 hours from now

        const remaining = getTimeRemaining(endTime);

        expect(remaining.days).toBe(2);
        // Hours can be 2 or 3 depending on timing
        expect(remaining.hours).toBeGreaterThanOrEqual(2);
        expect(remaining.hours).toBeLessThanOrEqual(3);
        expect(remaining.isEnded).toBe(false);
      });

      it("should return ended state for past time", () => {
        const endTime = new Date(Date.now() - 1000);

        const remaining = getTimeRemaining(endTime);

        expect(remaining.isEnded).toBe(true);
        expect(remaining.totalMs).toBe(0);
      });

      it("should handle null endTime", () => {
        const remaining = getTimeRemaining(null);

        expect(remaining.isEnded).toBe(true);
        expect(remaining.totalMs).toBe(0);
      });

      it("should handle undefined endTime", () => {
        const remaining = getTimeRemaining(undefined);

        expect(remaining.isEnded).toBe(true);
      });
    });

    describe("isEndingSoon", () => {
      it("should return true for auction ending in 12 hours", () => {
        const endTime = new Date(Date.now() + 12 * 60 * 60 * 1000);

        expect(isEndingSoon(endTime)).toBe(true);
      });

      it("should return false for auction ending in 25 hours", () => {
        const endTime = new Date(Date.now() + 25 * 60 * 60 * 1000);

        expect(isEndingSoon(endTime)).toBe(false);
      });

      it("should return false for ended auction", () => {
        const endTime = new Date(Date.now() - 1000);

        expect(isEndingSoon(endTime)).toBe(false);
      });
    });

    describe("isValidBidAmount", () => {
      it("should accept bid meeting increment", () => {
        expect(isValidBidAmount(1100, 1000, 100)).toBe(true);
      });

      it("should reject bid below increment", () => {
        expect(isValidBidAmount(1050, 1000, 100)).toBe(false);
      });

      it("should accept bid exceeding increment", () => {
        expect(isValidBidAmount(1500, 1000, 100)).toBe(true);
      });
    });

    describe("getNextMinimumBid", () => {
      it("should calculate next minimum bid from current bid", () => {
        expect(getNextMinimumBid(1000, 500, 100)).toBe(1100);
      });

      it("should use starting bid if current bid is zero", () => {
        expect(getNextMinimumBid(0, 500, 100)).toBe(600);
      });

      it("should default increment to 10", () => {
        expect(getNextMinimumBid(1000, 500)).toBe(1010);
      });
    });

    describe("canBid", () => {
      it("should allow bidding during auction", () => {
        const startTime = new Date(Date.now() - 1000);
        const endTime = new Date(Date.now() + 10000);

        const result = canBid(startTime, endTime);

        expect(result.canBid).toBe(true);
      });

      it("should reject bidding before auction starts", () => {
        const startTime = new Date(Date.now() + 10000);
        const endTime = new Date(Date.now() + 20000);

        const result = canBid(startTime, endTime);

        expect(result.canBid).toBe(false);
        expect(result.reason).toContain("not started");
      });

      it("should reject bidding after auction ends", () => {
        const startTime = new Date(Date.now() - 20000);
        const endTime = new Date(Date.now() - 10000);

        const result = canBid(startTime, endTime);

        expect(result.canBid).toBe(false);
        expect(result.reason).toContain("ended");
      });
    });
  });
});
