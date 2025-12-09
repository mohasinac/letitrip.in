import { AUCTION_STATUS } from "@/constants/statuses";
import { logServiceError } from "@/lib/error-logger";
import { apiService } from "@/services/api.service";
import { auctionsService } from "@/services/auctions.service";
import { PlaceBidFormFE } from "@/types/frontend/auction.types";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/error-logger");

describe("AuctionsService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;
  const mockLogServiceError = logServiceError as jest.MockedFunction<
    typeof logServiceError
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const mockAuctionBE: any = {
    id: "auction_123",
    slug: "vintage-watch",
    productId: "product_456",
    productName: "Vintage Watch",
    productSlug: "vintage-watch",
    productImage: "image1.jpg",
    productDescription: "A beautiful vintage watch",
    sellerId: "seller_456",
    sellerName: "John Seller",
    shopId: "shop_789",
    shopName: "John's Shop",
    type: "standard",
    status: "active",
    startingPrice: 1000,
    currentPrice: 1500,
    reservePrice: 2000,
    bidIncrement: 100,
    startTime: "2024-01-01T00:00:00Z",
    endTime: "2024-01-31T23:59:59Z",
    images: ["image1.jpg", "image2.jpg"],
    featured: false,
    featuredPriority: null,
    totalBids: 5,
    watchers: 10,
    categoryId: "cat_111",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockBidBE: any = {
    id: "bid_123",
    auctionId: "auction_123",
    userId: "user_456",
    userName: "John Doe",
    userEmail: "john@example.com",
    amount: 1500,
    isAutoBid: false,
    maxAutoBidAmount: null,
    createdAt: "2024-01-15T12:00:00Z",
  };

  const mockAuctionFormFE: any = {
    productId: "product_456",
    slug: "vintage-watch",
    type: "standard",
    startingPrice: 1000,
    reservePrice: 2000,
    bidIncrement: 100,
    startTime: new Date("2024-01-01T00:00:00Z"),
    endTime: new Date("2024-01-31T23:59:59Z"),
    categoryId: "cat_111",
  };

  const mockPlaceBidForm: PlaceBidFormFE = {
    amount: 1600,
    isAutoBid: false,
  };

  // ============================================================================
  // LIST & RETRIEVAL TESTS
  // ============================================================================

  describe("list", () => {
    it("should list auctions with pagination", async () => {
      const mockResponse = {
        data: [mockAuctionBE],
        count: 1,
        pagination: { nextCursor: null, hasMore: false },
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await auctionsService.list();

      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(mockApiService.get).toHaveBeenCalled();
    });

    it("should apply filters correctly", async () => {
      const mockResponse = {
        data: [mockAuctionBE],
        count: 1,
        pagination: { nextCursor: null, hasMore: false },
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      await auctionsService.list({ status: "active" as any, limit: 10 });

      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=active")
      );
    });

    it("should handle empty results", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { nextCursor: null, hasMore: false },
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await auctionsService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("should handle API errors", async () => {
      const error = new Error("Network error");
      mockApiService.get.mockRejectedValue(error);

      await expect(auctionsService.list()).rejects.toThrow();
      expect(mockLogServiceError).toHaveBeenCalledWith(
        "AuctionsService",
        "list",
        error
      );
    });
  });

  describe("getById", () => {
    it("should get auction by ID", async () => {
      mockApiService.get.mockResolvedValue(mockAuctionBE);

      const result = await auctionsService.getById("auction_123");

      expect(result).toMatchObject({
        id: "auction_123",
        productName: "Vintage Watch",
      });
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("auction_123")
      );
    });

    it("should handle non-existent auction", async () => {
      const error = new Error("Auction not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(auctionsService.getById("invalid_id")).rejects.toThrow();
      expect(mockLogServiceError).toHaveBeenCalled();
    });
  });

  describe("getBySlug", () => {
    it("should get auction by slug", async () => {
      mockApiService.get.mockResolvedValue(mockAuctionBE);

      const result = await auctionsService.getBySlug("vintage-watch");

      expect(result.productSlug).toBe("vintage-watch");
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("vintage-watch")
      );
    });

    it("should handle invalid slug", async () => {
      const error = new Error("Auction not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(
        auctionsService.getBySlug("non-existent-slug")
      ).rejects.toThrow();
    });
  });

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  describe("create", () => {
    it("should create new auction", async () => {
      mockApiService.post.mockResolvedValue(mockAuctionBE);

      const result = await auctionsService.create(mockAuctionFormFE);

      expect(result.productName).toBe("Vintage Watch");
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything()
      );
    });

    it("should handle validation errors", async () => {
      const error = new Error("Invalid auction data");
      mockApiService.post.mockRejectedValue(error);

      await expect(auctionsService.create(mockAuctionFormFE)).rejects.toThrow();
      expect(mockLogServiceError).toHaveBeenCalled();
    });

    it("should handle duplicate slug", async () => {
      const error = new Error("Slug already exists");
      mockApiService.post.mockRejectedValue(error);

      await expect(auctionsService.create(mockAuctionFormFE)).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update auction", async () => {
      const updates = { name: "Updated Watch" };
      mockApiService.patch.mockResolvedValue({
        ...mockAuctionBE,
        productName: "Updated Watch",
      });

      const result = await auctionsService.update("auction_123", updates);

      expect(result.productName).toBe("Updated Watch");
      expect(mockApiService.patch).toHaveBeenCalledWith(
        expect.stringContaining("auction_123"),
        updates
      );
    });

    it("should handle partial updates", async () => {
      const updates = { description: "Updated description" };
      mockApiService.patch.mockResolvedValue({
        ...mockAuctionBE,
        productDescription: "Updated description",
      });

      const result = await auctionsService.update("auction_123", updates);

      expect(result.productDescription).toBe("Updated description");
    });

    it("should handle unauthorized updates", async () => {
      const error = new Error("Unauthorized");
      mockApiService.patch.mockRejectedValue(error);

      await expect(
        auctionsService.update("auction_123", { name: "New Name" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should delete auction", async () => {
      mockApiService.delete.mockResolvedValue({ message: "Deleted" });

      const result = await auctionsService.delete("auction_123");

      expect(result.message).toBe("Deleted");
      expect(mockApiService.delete).toHaveBeenCalledWith(
        expect.stringContaining("auction_123")
      );
    });

    it("should handle deletion of active auction with bids", async () => {
      const error = new Error("Cannot delete auction with bids");
      mockApiService.delete.mockRejectedValue(error);

      await expect(auctionsService.delete("auction_123")).rejects.toThrow();
    });
  });

  // ============================================================================
  // VALIDATION
  // ============================================================================

  describe("validateSlug", () => {
    it("should validate available slug", async () => {
      mockApiService.get.mockResolvedValue({
        available: true,
      });

      const result = await auctionsService.validateSlug("unique-slug");

      expect(result.available).toBe(true);
    });

    it("should validate unavailable slug", async () => {
      mockApiService.get.mockResolvedValue({
        available: false,
        message: "Slug already exists",
      });

      const result = await auctionsService.validateSlug("existing-slug");

      expect(result.available).toBe(false);
      expect(result.message).toBeDefined();
    });

    it("should validate slug with shop context", async () => {
      mockApiService.get.mockResolvedValue({ available: true });

      await auctionsService.validateSlug("slug", "shop_123");

      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shop_id=shop_123")
      );
    });
  });

  // ============================================================================
  // BIDDING OPERATIONS
  // ============================================================================

  describe("getBids", () => {
    it("should get auction bids", async () => {
      const mockResponse = {
        data: [mockBidBE],
        count: 1,
        pagination: { nextCursor: null, hasMore: false },
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await auctionsService.getBids("auction_123");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].amount).toBe(1500);
    });

    it("should support pagination for bids", async () => {
      const mockResponse = {
        data: [mockBidBE],
        count: 1,
        pagination: { nextCursor: "cursor_123", hasMore: true },
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await auctionsService.getBids(
        "auction_123",
        10,
        "cursor_123"
      );

      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startAfter=cursor_123")
      );
    });

    it("should support sort order for bids", async () => {
      const mockResponse = {
        data: [mockBidBE],
        count: 1,
        pagination: { nextCursor: null, hasMore: false },
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      await auctionsService.getBids("auction_123", undefined, undefined, "asc");

      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("sortOrder=asc")
      );
    });

    it("should handle auction with no bids", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { nextCursor: null, hasMore: false },
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await auctionsService.getBids("auction_123");

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("placeBid", () => {
    it("should place a bid successfully", async () => {
      mockApiService.post.mockResolvedValue(mockBidBE);

      const result = await auctionsService.placeBid(
        "auction_123",
        mockPlaceBidForm
      );

      expect(result.amount).toBe(1500);
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.stringContaining("bid"),
        expect.objectContaining({
          amount: mockPlaceBidForm.amount,
        })
      );
    });

    it("should place auto bid", async () => {
      const autoBidForm: PlaceBidFormFE = {
        amount: 1600,
        isAutoBid: true,
        maxAutoBidAmount: 2500,
      };
      mockApiService.post.mockResolvedValue({
        ...mockBidBE,
        isAutoBid: true,
        maxAutoBidAmount: 2500,
      });

      const result = await auctionsService.placeBid("auction_123", autoBidForm);

      expect(result.isAutoBid).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          isAutoBid: true,
          maxAutoBidAmount: 2500,
        })
      );
    });

    it("should handle bid below minimum", async () => {
      const error = new Error("Bid too low");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        auctionsService.placeBid("auction_123", {
          amount: 100,
          isAutoBid: false,
        })
      ).rejects.toThrow();
    });

    it("should handle bidding on ended auction", async () => {
      const error = new Error("Auction has ended");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        auctionsService.placeBid("auction_123", mockPlaceBidForm)
      ).rejects.toThrow();
    });

    it("should handle self-bidding", async () => {
      const error = new Error("Cannot bid on your own auction");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        auctionsService.placeBid("auction_123", mockPlaceBidForm)
      ).rejects.toThrow();
    });
  });

  // ============================================================================
  // FEATURE OPERATIONS
  // ============================================================================

  describe("setFeatured", () => {
    it("should feature an auction", async () => {
      mockApiService.patch.mockResolvedValue({
        ...mockAuctionBE,
        featured: true,
        featuredPriority: 1,
      });

      const result = await auctionsService.setFeatured("auction_123", true, 1);

      expect(result).toBeDefined();
      expect(result.id).toBe("auction_123");
      expect(mockApiService.patch).toHaveBeenCalledWith(
        expect.stringContaining("feature"),
        expect.objectContaining({
          featured: true,
          featuredPriority: 1,
        })
      );
    });

    it("should unfeature an auction", async () => {
      mockApiService.patch.mockResolvedValue({
        ...mockAuctionBE,
        featured: false,
      });

      const result = await auctionsService.setFeatured("auction_123", false);

      expect(result.featured).toBe(false);
    });
  });

  describe("getFeatured", () => {
    it("should get featured auctions", async () => {
      mockApiService.get.mockResolvedValue([mockAuctionBE]);

      const result = await auctionsService.getFeatured();

      expect(result).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("featured")
      );
    });

    it("should handle no featured auctions", async () => {
      mockApiService.get.mockResolvedValue([]);

      const result = await auctionsService.getFeatured();

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // LIVE & HOMEPAGE AUCTIONS
  // ============================================================================

  describe("getLive", () => {
    it("should get live auctions", async () => {
      mockApiService.get.mockResolvedValue([mockAuctionBE]);

      const result = await auctionsService.getLive();

      expect(result).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("live")
      );
    });

    it("should handle no live auctions", async () => {
      mockApiService.get.mockResolvedValue([]);

      const result = await auctionsService.getLive();

      expect(result).toEqual([]);
    });
  });

  describe("getHomepage", () => {
    it("should get homepage auctions", async () => {
      const mockResponse = {
        data: [mockAuctionBE],
        count: 1,
        pagination: { nextCursor: null, hasMore: false },
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await auctionsService.getHomepage();

      expect(result).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining(`status=${AUCTION_STATUS.ACTIVE}`)
      );
    });
  });

  // ============================================================================
  // RELATED AUCTIONS
  // ============================================================================

  describe("getSimilar", () => {
    it("should get similar auctions", async () => {
      mockApiService.get.mockResolvedValue([mockAuctionBE]);

      const result = await auctionsService.getSimilar("auction_123");

      expect(result).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("similar")
      );
    });

    it("should respect limit parameter", async () => {
      mockApiService.get.mockResolvedValue([mockAuctionBE]);

      await auctionsService.getSimilar("auction_123", 5);

      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=5")
      );
    });
  });

  describe("getSellerAuctions", () => {
    it("should get seller's other auctions", async () => {
      mockApiService.get.mockResolvedValue([mockAuctionBE]);

      const result = await auctionsService.getSellerAuctions("auction_123");

      expect(result).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("seller-items")
      );
    });

    it("should respect limit parameter", async () => {
      mockApiService.get.mockResolvedValue([mockAuctionBE]);

      await auctionsService.getSellerAuctions("auction_123", 10);

      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=10")
      );
    });
  });

  // ============================================================================
  // WATCHLIST OPERATIONS
  // ============================================================================

  describe("toggleWatch", () => {
    it("should watch an auction", async () => {
      mockApiService.post.mockResolvedValue({ watching: true });

      const result = await auctionsService.toggleWatch("auction_123");

      expect(result.watching).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.stringContaining("watch"),
        {}
      );
    });

    it("should unwatch an auction", async () => {
      mockApiService.post.mockResolvedValue({ watching: false });

      const result = await auctionsService.toggleWatch("auction_123");

      expect(result.watching).toBe(false);
    });
  });

  describe("getWatchlist", () => {
    it("should get user's watchlist", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [mockAuctionBE],
      });

      const result = await auctionsService.getWatchlist();

      expect(result).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining("watchlist")
      );
    });

    it("should handle empty watchlist", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await auctionsService.getWatchlist();

      expect(result).toEqual([]);
    });

    it("should handle API errors", async () => {
      const error = new Error("Network error");
      mockApiService.get.mockRejectedValue(error);

      await expect(auctionsService.getWatchlist()).rejects.toThrow();
      expect(mockLogServiceError).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // USER AUCTIONS
  // ============================================================================

  describe("getMyBids", () => {
    it("should get user's active bids", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [mockBidBE],
      });

      const result = await auctionsService.getMyBids();

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(1500);
    });

    it("should handle no active bids", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await auctionsService.getMyBids();

      expect(result).toEqual([]);
    });
  });

  describe("getWonAuctions", () => {
    it("should get user's won auctions", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [mockAuctionBE],
      });

      const result = await auctionsService.getWonAuctions();

      expect(result).toHaveLength(1);
    });

    it("should handle no won auctions", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await auctionsService.getWonAuctions();

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  describe("Bulk Operations", () => {
    const auctionIds = ["auction_1", "auction_2", "auction_3"];

    describe("bulkAction", () => {
      it("should perform generic bulk action", async () => {
        const mockResponse = {
          success: true,
          results: {
            successfulIds: auctionIds,
            failedIds: [],
            errors: [],
          },
        };
        mockApiService.post.mockResolvedValue(mockResponse);

        const result = await auctionsService.bulkAction("start", auctionIds);

        expect(result.success).toBe(true);
        expect(result.results.successfulIds).toEqual(auctionIds);
      });

      it("should handle partial failures", async () => {
        const mockResponse = {
          success: false,
          results: {
            successfulIds: ["auction_1"],
            failedIds: ["auction_2", "auction_3"],
            errors: ["Error 1", "Error 2"],
          },
        };
        mockApiService.post.mockResolvedValue(mockResponse);

        const result = await auctionsService.bulkAction("start", auctionIds);

        expect(result.results.failedIds).toHaveLength(2);
      });
    });

    describe("bulkStart", () => {
      it("should start multiple auctions", async () => {
        mockApiService.post.mockResolvedValue({
          success: true,
          results: { successfulIds: auctionIds, failedIds: [], errors: [] },
        });

        const result = await auctionsService.bulkStart(auctionIds);

        expect(result.success).toBe(true);
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            action: "start",
            ids: auctionIds,
          })
        );
      });
    });

    describe("bulkEnd", () => {
      it("should end multiple auctions", async () => {
        mockApiService.post.mockResolvedValue({
          success: true,
          results: { successfulIds: auctionIds, failedIds: [], errors: [] },
        });

        const result = await auctionsService.bulkEnd(auctionIds);

        expect(result.success).toBe(true);
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ action: "end" })
        );
      });
    });

    describe("bulkCancel", () => {
      it("should cancel multiple auctions", async () => {
        mockApiService.post.mockResolvedValue({
          success: true,
          results: { successfulIds: auctionIds, failedIds: [], errors: [] },
        });

        const result = await auctionsService.bulkCancel(auctionIds);

        expect(result.success).toBe(true);
      });
    });

    describe("bulkFeature", () => {
      it("should feature multiple auctions", async () => {
        mockApiService.post.mockResolvedValue({
          success: true,
          results: { successfulIds: auctionIds, failedIds: [], errors: [] },
        });

        const result = await auctionsService.bulkFeature(auctionIds);

        expect(result.success).toBe(true);
      });
    });

    describe("bulkUnfeature", () => {
      it("should unfeature multiple auctions", async () => {
        mockApiService.post.mockResolvedValue({
          success: true,
          results: { successfulIds: auctionIds, failedIds: [], errors: [] },
        });

        const result = await auctionsService.bulkUnfeature(auctionIds);

        expect(result.success).toBe(true);
      });
    });

    describe("bulkDelete", () => {
      it("should delete multiple auctions", async () => {
        mockApiService.post.mockResolvedValue({
          success: true,
          results: { successfulIds: auctionIds, failedIds: [], errors: [] },
        });

        const result = await auctionsService.bulkDelete(auctionIds);

        expect(result.success).toBe(true);
      });
    });

    describe("bulkUpdate", () => {
      it("should update multiple auctions", async () => {
        const updates = { status: "paused" };
        mockApiService.post.mockResolvedValue({
          success: true,
          results: { successfulIds: auctionIds, failedIds: [], errors: [] },
        });

        const result = await auctionsService.bulkUpdate(auctionIds, updates);

        expect(result.success).toBe(true);
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            action: "update",
            updates,
          })
        );
      });
    });
  });

  // ============================================================================
  // QUICK OPERATIONS
  // ============================================================================

  describe("Quick Operations", () => {
    describe("quickCreate", () => {
      it("should quick create auction with minimal fields", async () => {
        const quickData = {
          name: "Quick Auction",
          startingBid: 500,
          startTime: new Date("2024-01-01"),
          endTime: new Date("2024-01-31"),
        };
        mockApiService.post.mockResolvedValue(mockAuctionBE);

        const result = await auctionsService.quickCreate(quickData);

        expect(result.name).toBe("Vintage Watch");
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            name: quickData.name,
          })
        );
      });

      it("should auto-generate slug from name", async () => {
        const quickData = {
          name: "My Special Auction",
          startingBid: 1000,
          startTime: new Date("2024-01-01"),
          endTime: new Date("2024-01-31"),
        };
        mockApiService.post.mockResolvedValue(mockAuctionBE);

        await auctionsService.quickCreate(quickData);

        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            slug: "my-special-auction",
          })
        );
      });
    });

    describe("quickUpdate", () => {
      it("should quick update auction", async () => {
        const updates = { name: "Updated Name" };
        mockApiService.patch.mockResolvedValue({
          ...mockAuctionBE,
          productName: "Updated Name",
        });

        const result = await auctionsService.quickUpdate(
          "auction_123",
          updates
        );

        expect(result.name).toBe("Updated Name");
      });
    });
  });

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  describe("getByIds", () => {
    it("should fetch auctions by IDs", async () => {
      const ids = ["auction_1", "auction_2"];
      mockApiService.post.mockResolvedValue({ data: [mockAuctionBE] });

      const result = await auctionsService.getByIds(ids);

      expect(result).toHaveLength(1);
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.stringContaining("batch"),
        { ids }
      );
    });

    it("should handle empty ID array", async () => {
      const result = await auctionsService.getByIds([]);

      expect(result).toEqual([]);
      expect(mockApiService.post).not.toHaveBeenCalled();
    });

    it("should handle null or undefined IDs", async () => {
      const result = await auctionsService.getByIds(null as any);

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle auction with missing optional fields", async () => {
      const sparseAuction = {
        ...mockAuctionBE,
        reservePrice: undefined,
        shopId: undefined,
      };
      mockApiService.get.mockResolvedValue(sparseAuction);

      const result = await auctionsService.getById("auction_123");

      expect(result).toBeDefined();
      expect(result.id).toBe("auction_123");
    });

    it("should handle very large bid amount", async () => {
      const largeBidForm: PlaceBidFormFE = {
        amount: 999999999,
        isAutoBid: false,
      };
      mockApiService.post.mockResolvedValue({
        ...mockBidBE,
        amount: 999999999,
      });

      const result = await auctionsService.placeBid(
        "auction_123",
        largeBidForm
      );

      expect(result.amount).toBe(999999999);
    });

    it("should handle auction with many images", async () => {
      const images = Array.from({ length: 50 }, (_, i) => `image${i}.jpg`);
      const auctionWithManyImages = {
        ...mockAuctionBE,
        images,
      };
      mockApiService.get.mockResolvedValue(auctionWithManyImages);

      const result = await auctionsService.getById("auction_123");

      expect(result.images).toHaveLength(50);
    });

    it("should handle concurrent bid placements", async () => {
      mockApiService.post.mockResolvedValue(mockBidBE);

      const promises = [
        auctionsService.placeBid("auction_123", {
          amount: 1600,
          isAutoBid: false,
        }),
        auctionsService.placeBid("auction_123", {
          amount: 1700,
          isAutoBid: false,
        }),
        auctionsService.placeBid("auction_123", {
          amount: 1800,
          isAutoBid: false,
        }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
    });
  });
});
