import {
  auctionSchema,
  autoBidSchema,
  placeBidSchema,
} from "../auction.schema";

describe("Auction Validation Schemas", () => {
  describe("Auction Schema", () => {
    const validAuctionData = {
      title: "Vintage Camera for Sale",
      slug: "vintage-camera-sale",
      description:
        "This is a detailed description of the vintage camera being auctioned. It includes all necessary details.",
      categoryId: "cat_123",
      startingBid: 1000,
      bidIncrement: 50,
      startTime: new Date("2025-01-01T10:00:00Z"),
      endTime: new Date("2025-01-05T10:00:00Z"),
      images: ["https://example.com/image1.jpg"],
      condition: "like-new" as const,
      shippingCost: 100,
      shopId: "shop_123",
    };

    describe("Full auction validation", () => {
      it("should accept valid auction data", () => {
        const result = auctionSchema.safeParse(validAuctionData);
        expect(result.success).toBe(true);
      });

      it("should require all mandatory fields", () => {
        const result = auctionSchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it("should accept auction with all optional fields", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          reservePrice: 5000,
          buyNowPrice: 10000,
          shippingPolicy: "Free shipping",
          returnPolicy: "30-day returns",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Title validation", () => {
      it("should require title", () => {
        const { title, ...data } = validAuctionData;
        const result = auctionSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid titles", () => {
        const validTitles = [
          "Product",
          "Amazing Vintage Camera",
          "A".repeat(200),
        ];

        validTitles.forEach((title) => {
          const result = auctionSchema.safeParse({
            ...validAuctionData,
            title,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject too short titles", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          title: "AB",
        });
        expect(result.success).toBe(false);
      });

      it("should reject too long titles", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          title: "A".repeat(201),
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Slug validation", () => {
      it("should require slug", () => {
        const { slug, ...data } = validAuctionData;
        const result = auctionSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid slugs", () => {
        const validSlugs = ["auction-item", "vintage-camera-2024", "item-123"];

        validSlugs.forEach((slug) => {
          const result = auctionSchema.safeParse({
            ...validAuctionData,
            slug,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject slugs with spaces", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          slug: "my auction",
        });
        expect(result.success).toBe(false);
      });

      it("should reject slugs with uppercase", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          slug: "My-Auction",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Description validation", () => {
      it("should require description", () => {
        const { description, ...data } = validAuctionData;
        const result = auctionSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject too short descriptions", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          description: "Too short",
        });
        expect(result.success).toBe(false);
      });

      it("should reject too long descriptions", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          description: "A".repeat(5001),
        });
        expect(result.success).toBe(false);
      });

      it("should accept minimum length description", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          description: "A".repeat(20),
        });
        expect(result.success).toBe(true);
      });

      it("should accept maximum length description", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          description: "A".repeat(5000),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Starting bid validation", () => {
      it("should require starting bid", () => {
        const { startingBid, ...data } = validAuctionData;
        const result = auctionSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid starting bids", () => {
        const validBids = [1, 100, 1000, 100000];

        validBids.forEach((startingBid) => {
          const result = auctionSchema.safeParse({
            ...validAuctionData,
            startingBid,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject zero starting bid", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startingBid: 0,
        });
        expect(result.success).toBe(false);
      });

      it("should reject negative starting bid", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startingBid: -100,
        });
        expect(result.success).toBe(false);
      });

      it("should reject extremely high starting bid", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startingBid: 10000001,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Reserve price validation", () => {
      it("should handle optional reserve price", () => {
        const result = auctionSchema.safeParse(validAuctionData);
        expect(result.success).toBe(true);
      });

      it("should accept valid reserve price", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          reservePrice: 5000,
        });
        expect(result.success).toBe(true);
      });

      it("should reject reserve price below starting bid", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startingBid: 1000,
          reservePrice: 500,
        });
        expect(result.success).toBe(false);
      });

      it("should accept reserve price equal to starting bid", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startingBid: 1000,
          reservePrice: 1000,
        });
        expect(result.success).toBe(true);
      });

      it("should reject negative reserve price", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          reservePrice: -100,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Bid increment validation", () => {
      it("should default to 10", () => {
        const { bidIncrement, ...data } = validAuctionData;
        const result = auctionSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.bidIncrement).toBe(10);
        }
      });

      it("should accept valid increments", () => {
        const validIncrements = [1, 50, 100, 1000];

        validIncrements.forEach((bidIncrement) => {
          const result = auctionSchema.safeParse({
            ...validAuctionData,
            bidIncrement,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject zero increment", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          bidIncrement: 0,
        });
        expect(result.success).toBe(false);
      });

      it("should reject extremely high increment", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          bidIncrement: 100001,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Buy now price validation", () => {
      it("should handle optional buy now price", () => {
        const result = auctionSchema.safeParse(validAuctionData);
        expect(result.success).toBe(true);
      });

      it("should accept valid buy now price", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          buyNowPrice: 15000,
        });
        expect(result.success).toBe(true);
      });

      it("should reject buy now price below starting bid", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startingBid: 1000,
          buyNowPrice: 500,
        });
        expect(result.success).toBe(false);
      });

      it("should reject buy now price equal to starting bid", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startingBid: 1000,
          buyNowPrice: 1000,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Timing validation", () => {
      it("should require start and end times", () => {
        const { startTime, endTime, ...data } = validAuctionData;
        const result = auctionSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid time range", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startTime: new Date("2025-01-01T10:00:00Z"),
          endTime: new Date("2025-01-05T10:00:00Z"),
        });
        expect(result.success).toBe(true);
      });

      it("should reject end time before start time", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          startTime: new Date("2025-01-05T10:00:00Z"),
          endTime: new Date("2025-01-01T10:00:00Z"),
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Images validation", () => {
      it("should require at least one image", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          images: [],
        });
        expect(result.success).toBe(false);
      });

      it("should accept valid image URLs", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          images: [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
          ],
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid URLs", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          images: ["not-a-url"],
        });
        expect(result.success).toBe(false);
      });

      it("should reject too many images", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          images: Array(11).fill("https://example.com/image.jpg"),
        });
        expect(result.success).toBe(false);
      });

      it("should accept maximum allowed images", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          images: Array(10).fill("https://example.com/image.jpg"),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Condition validation", () => {
      it("should require condition", () => {
        const { condition, ...data } = validAuctionData;
        const result = auctionSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid conditions", () => {
        const validConditions = ["new", "like-new", "good", "fair"] as const;

        validConditions.forEach((condition) => {
          const result = auctionSchema.safeParse({
            ...validAuctionData,
            condition,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid conditions", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          condition: "excellent",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Shipping cost validation", () => {
      it("should default to 0", () => {
        const { shippingCost, ...data } = validAuctionData;
        const result = auctionSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.shippingCost).toBe(0);
        }
      });

      it("should accept valid shipping costs", () => {
        const validCosts = [0, 50, 100, 500];

        validCosts.forEach((shippingCost) => {
          const result = auctionSchema.safeParse({
            ...validAuctionData,
            shippingCost,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject negative shipping cost", () => {
        const result = auctionSchema.safeParse({
          ...validAuctionData,
          shippingCost: -50,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Place Bid Schema", () => {
    const validBidData = {
      amount: 1500,
      auctionId: "auction_123",
    };

    describe("Bid validation", () => {
      it("should accept valid bid", () => {
        const result = placeBidSchema.safeParse(validBidData);
        expect(result.success).toBe(true);
      });

      it("should require all fields", () => {
        const result = placeBidSchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it("should reject zero amount", () => {
        const result = placeBidSchema.safeParse({
          ...validBidData,
          amount: 0,
        });
        expect(result.success).toBe(false);
      });

      it("should reject negative amount", () => {
        const result = placeBidSchema.safeParse({
          ...validBidData,
          amount: -100,
        });
        expect(result.success).toBe(false);
      });

      it("should reject extremely high amount", () => {
        const result = placeBidSchema.safeParse({
          ...validBidData,
          amount: 10000001,
        });
        expect(result.success).toBe(false);
      });

      it("should reject empty auction ID", () => {
        const result = placeBidSchema.safeParse({
          ...validBidData,
          auctionId: "",
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Auto Bid Schema", () => {
    const validAutoBidData = {
      maxAmount: 5000,
      increment: 50,
    };

    describe("Auto bid validation", () => {
      it("should accept valid auto bid settings", () => {
        const result = autoBidSchema.safeParse(validAutoBidData);
        expect(result.success).toBe(true);
      });

      it("should require all fields", () => {
        const result = autoBidSchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it("should reject zero max amount", () => {
        const result = autoBidSchema.safeParse({
          ...validAutoBidData,
          maxAmount: 0,
        });
        expect(result.success).toBe(false);
      });

      it("should reject zero increment", () => {
        const result = autoBidSchema.safeParse({
          ...validAutoBidData,
          increment: 0,
        });
        expect(result.success).toBe(false);
      });

      it("should reject extremely high max amount", () => {
        const result = autoBidSchema.safeParse({
          ...validAutoBidData,
          maxAmount: 10000001,
        });
        expect(result.success).toBe(false);
      });

      it("should reject extremely high increment", () => {
        const result = autoBidSchema.safeParse({
          ...validAutoBidData,
          increment: 10001,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum valid auction", () => {
      const result = auctionSchema.safeParse({
        title: "ABC",
        slug: "abc",
        description: "A".repeat(20),
        categoryId: "cat_123",
        startingBid: 1,
        startTime: new Date("2025-01-01T10:00:00Z"),
        endTime: new Date("2025-01-02T10:00:00Z"),
        images: ["https://example.com/image.jpg"],
        condition: "new",
        shopId: "shop_123",
      });
      expect(result.success).toBe(true);
    });

    it("should handle maximum starting bid", () => {
      const result = auctionSchema.safeParse({
        ...{
          title: "Vintage Camera",
          slug: "vintage-camera",
          description: "A".repeat(20),
          categoryId: "cat_123",
          startingBid: 10000000,
          startTime: new Date("2025-01-01T10:00:00Z"),
          endTime: new Date("2025-01-02T10:00:00Z"),
          images: ["https://example.com/image.jpg"],
          condition: "new",
          shopId: "shop_123",
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
