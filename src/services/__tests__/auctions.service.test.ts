import type { AuctionBE, BidBE } from "@/types/backend/auction.types";
import type {
  AuctionFormFE,
  PlaceBidFormFE,
} from "@/types/frontend/auction.types";
import type {
  BulkActionResponse,
  PaginatedResponseBE,
} from "@/types/shared/common.types";
import { apiService } from "../api.service";
import { auctionsService } from "../auctions.service";

// Mock dependencies
jest.mock("../api.service");
jest.mock("@/lib/error-logger");
jest.mock("@/components/common/ErrorMessage");
jest.mock("@/types/transforms/auction.transforms", () => ({
  toFEAuction: (auction: any) => ({ ...auction, _transformed: true }),
  toFEAuctions: (auctions: any[]) =>
    auctions.map((a) => ({ ...a, _transformed: true })),
  toFEAuctionCard: (auction: any) => ({ ...auction, _card: true }),
  toFEBid: (bid: any) => ({ ...bid, _bidTransformed: true }),
  toBECreateAuctionRequest: (data: any) => ({ ...data, _createRequest: true }),
}));

describe("AuctionsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list auctions with filters", async () => {
      const mockResponse: PaginatedResponseBE<any> = {
        data: [
          { id: "auc1", name: "Auction 1" },
          { id: "auc2", name: "Auction 2" },
        ],
        count: 2,
        pagination: { page: 1, limit: 10, total: 2, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.list({ status: "active" });

      expect(apiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.data[0]._card).toBe(true);
      expect(result.count).toBe(2);
    });

    it("should handle empty response", async () => {
      const mockResponse: PaginatedResponseBE<any> = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10, total: 0, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.list();

      expect(result.data).toEqual([]);
    });

    it("should handle API errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      await expect(auctionsService.list()).rejects.toThrow("API Error");
    });
  });

  describe("getById", () => {
    it("should fetch auction by ID", async () => {
      const mockAuction: AuctionBE = {
        id: "auc1",
        name: "Test Auction",
      } as AuctionBE;

      (apiService.get as jest.Mock).mockResolvedValue(mockAuction);

      const result = await auctionsService.getById("auc1");

      expect(apiService.get).toHaveBeenCalledWith("/auctions/auc1");
      expect(result._transformed).toBe(true);
    });

    it("should handle not found error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Auction not found")
      );

      await expect(auctionsService.getById("invalid")).rejects.toThrow(
        "Auction not found"
      );
    });
  });

  describe("getBySlug", () => {
    it("should fetch auction by slug", async () => {
      const mockAuction: AuctionBE = {
        id: "auc1",
        slug: "test-auction",
      } as AuctionBE;

      (apiService.get as jest.Mock).mockResolvedValue(mockAuction);

      const result = await auctionsService.getBySlug("test-auction");

      expect(apiService.get).toHaveBeenCalledWith("/auctions/test-auction");
      expect(result._transformed).toBe(true);
    });
  });

  describe("create", () => {
    it("should create auction successfully", async () => {
      const mockFormData: AuctionFormFE = {
        name: "New Auction",
        startingBid: 1000,
        startTime: new Date(),
        endTime: new Date(),
      } as AuctionFormFE;

      const mockCreated: AuctionBE = {
        id: "auc1",
        name: "New Auction",
      } as AuctionBE;

      (apiService.post as jest.Mock).mockResolvedValue(mockCreated);

      const result = await auctionsService.create(mockFormData);

      expect(apiService.post).toHaveBeenCalledWith("/auctions", {
        ...mockFormData,
        _createRequest: true,
      });
      expect(result._transformed).toBe(true);
    });

    it("should handle creation errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Creation failed")
      );

      await expect(auctionsService.create({} as AuctionFormFE)).rejects.toThrow(
        "Creation failed"
      );
    });
  });

  describe("update", () => {
    it("should update auction successfully", async () => {
      const mockUpdateData: Partial<AuctionFormFE> = {
        name: "Updated Auction",
      };

      const mockUpdated: AuctionBE = {
        id: "auc1",
        name: "Updated Auction",
      } as AuctionBE;

      (apiService.patch as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await auctionsService.update("auc1", mockUpdateData);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/auctions/auc1",
        mockUpdateData
      );
      expect(result._transformed).toBe(true);
    });
  });

  describe("delete", () => {
    it("should delete auction successfully", async () => {
      const mockResponse = { message: "Auction deleted" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.delete("auc1");

      expect(apiService.delete).toHaveBeenCalledWith("/auctions/auc1");
      expect(result.message).toBe("Auction deleted");
    });
  });

  describe("validateSlug", () => {
    it("should check slug availability", async () => {
      const mockResponse = {
        available: true,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.validateSlug("new-auction");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("validate-slug")
      );
      expect(result.available).toBe(true);
    });

    it("should check slug with shop ID", async () => {
      const mockResponse = {
        available: false,
        message: "Slug already in use",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.validateSlug(
        "existing-auction",
        "shop1"
      );

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shop_id=shop1")
      );
      expect(result.available).toBe(false);
    });
  });

  describe("getBids", () => {
    it("should fetch bids for auction", async () => {
      const mockResponse: PaginatedResponseBE<BidBE> = {
        data: [
          { id: "bid1", amount: 1500 } as BidBE,
          { id: "bid2", amount: 1600 } as BidBE,
        ],
        count: 2,
        pagination: { page: 1, limit: 10, total: 2, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.getBids("auc1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/auctions/auc1/bid")
      );
      expect(result.data).toHaveLength(2);
      expect(result.data[0]._bidTransformed).toBe(true);
    });

    it("should fetch bids with pagination", async () => {
      const mockResponse: PaginatedResponseBE<BidBE> = {
        data: [{ id: "bid1", amount: 1500 } as BidBE],
        count: 1,
        pagination: { page: 1, limit: 5, total: 1, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.getBids("auc1", 5, "cursor1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=5")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startAfter=cursor1")
      );
    });

    it("should fetch bids with ascending order", async () => {
      const mockResponse: PaginatedResponseBE<BidBE> = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10, total: 0, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await auctionsService.getBids("auc1", undefined, null, "asc");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("sortOrder=asc")
      );
    });
  });

  describe("placeBid", () => {
    it("should place bid successfully", async () => {
      const mockBidData: PlaceBidFormFE = {
        amount: 1500,
        isAutoBid: false,
      };

      const mockBid: BidBE = {
        id: "bid1",
        amount: 1500,
      } as BidBE;

      (apiService.post as jest.Mock).mockResolvedValue(mockBid);

      const result = await auctionsService.placeBid("auc1", mockBidData);

      expect(apiService.post).toHaveBeenCalledWith("/auctions/auc1/bid", {
        amount: 1500,
        isAutoBid: false,
        maxAutoBidAmount: undefined,
      });
      expect(result._bidTransformed).toBe(true);
    });

    it("should place auto bid with max amount", async () => {
      const mockBidData: PlaceBidFormFE = {
        amount: 1500,
        isAutoBid: true,
        maxAutoBidAmount: 3000,
      };

      const mockBid: BidBE = {
        id: "bid1",
        amount: 1500,
      } as BidBE;

      (apiService.post as jest.Mock).mockResolvedValue(mockBid);

      await auctionsService.placeBid("auc1", mockBidData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions/auc1/bid",
        expect.objectContaining({
          maxAutoBidAmount: 3000,
        })
      );
    });
  });

  describe("setFeatured", () => {
    it("should set auction as featured", async () => {
      const mockAuction: AuctionBE = {
        id: "auc1",
        featured: true,
      } as AuctionBE;

      (apiService.patch as jest.Mock).mockResolvedValue(mockAuction);

      const result = await auctionsService.setFeatured("auc1", true, 1);

      expect(apiService.patch).toHaveBeenCalledWith("/auctions/auc1/feature", {
        featured: true,
        featuredPriority: 1,
      });
      expect(result._transformed).toBe(true);
    });

    it("should unfeature auction", async () => {
      const mockAuction: AuctionBE = {
        id: "auc1",
        featured: false,
      } as AuctionBE;

      (apiService.patch as jest.Mock).mockResolvedValue(mockAuction);

      await auctionsService.setFeatured("auc1", false);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/auctions/auc1/feature",
        expect.objectContaining({
          featured: false,
        })
      );
    });
  });

  describe("getLive", () => {
    it("should fetch live auctions", async () => {
      const mockAuctions: AuctionBE[] = [
        { id: "auc1", status: "active" } as AuctionBE,
        { id: "auc2", status: "active" } as AuctionBE,
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAuctions);

      const result = await auctionsService.getLive();

      expect(apiService.get).toHaveBeenCalledWith("/auctions/live");
      expect(result).toHaveLength(2);
      expect(result[0]._transformed).toBe(true);
    });

    it("should return empty array when no live auctions", async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await auctionsService.getLive();

      expect(result).toEqual([]);
    });
  });

  describe("getFeatured", () => {
    it("should fetch featured auctions", async () => {
      const mockAuctions: AuctionBE[] = [
        { id: "auc1", featured: true } as AuctionBE,
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAuctions);

      const result = await auctionsService.getFeatured();

      expect(apiService.get).toHaveBeenCalledWith("/auctions/featured");
      expect(result).toHaveLength(1);
    });
  });

  describe("getHomepage", () => {
    it("should fetch homepage auctions", async () => {
      const mockResponse: PaginatedResponseBE<any> = {
        data: [{ id: "auc1" }],
        count: 1,
        pagination: { page: 1, limit: 10, total: 1, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.getHomepage();

      expect(result).toHaveLength(1);
      expect(result[0]._card).toBe(true);
    });
  });

  describe("getSimilar", () => {
    it("should fetch similar auctions", async () => {
      const mockAuctions: AuctionBE[] = [
        { id: "auc2", name: "Similar" } as AuctionBE,
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAuctions);

      const result = await auctionsService.getSimilar("auc1");

      expect(apiService.get).toHaveBeenCalledWith("/auctions/auc1/similar");
      expect(result).toHaveLength(1);
    });

    it("should fetch similar auctions with limit", async () => {
      const mockAuctions: AuctionBE[] = [
        { id: "auc2", name: "Similar" } as AuctionBE,
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAuctions);

      await auctionsService.getSimilar("auc1", 5);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=5")
      );
    });
  });

  describe("getSellerAuctions", () => {
    it("should fetch seller's other auctions", async () => {
      const mockAuctions: AuctionBE[] = [
        { id: "auc2", sellerId: "seller1" } as AuctionBE,
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAuctions);

      const result = await auctionsService.getSellerAuctions("auc1");

      expect(apiService.get).toHaveBeenCalledWith(
        "/auctions/auc1/seller-items"
      );
      expect(result).toHaveLength(1);
    });

    it("should fetch seller auctions with limit", async () => {
      const mockAuctions: AuctionBE[] = [];

      (apiService.get as jest.Mock).mockResolvedValue(mockAuctions);

      await auctionsService.getSellerAuctions("auc1", 10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=10")
      );
    });
  });

  describe("toggleWatch", () => {
    it("should watch auction", async () => {
      const mockResponse = { watching: true };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.toggleWatch("auc1");

      expect(apiService.post).toHaveBeenCalledWith("/auctions/auc1/watch", {});
      expect(result.watching).toBe(true);
    });

    it("should unwatch auction", async () => {
      const mockResponse = { watching: false };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.toggleWatch("auc1");

      expect(result.watching).toBe(false);
    });
  });

  describe("getWatchlist", () => {
    it("should fetch user's watchlist", async () => {
      const mockResponse = {
        success: true,
        data: [{ id: "auc1" } as AuctionBE, { id: "auc2" } as AuctionBE],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.getWatchlist();

      expect(apiService.get).toHaveBeenCalledWith("/auctions/watchlist");
      expect(result).toHaveLength(2);
    });

    it("should handle empty watchlist", async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.getWatchlist();

      expect(result).toEqual([]);
    });
  });

  describe("getMyBids", () => {
    it("should fetch user's active bids", async () => {
      const mockResponse = {
        success: true,
        data: [{ id: "bid1" } as BidBE, { id: "bid2" } as BidBE],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.getMyBids();

      expect(apiService.get).toHaveBeenCalledWith("/auctions/my-bids");
      expect(result).toHaveLength(2);
      expect(result[0]._bidTransformed).toBe(true);
    });
  });

  describe("getWonAuctions", () => {
    it("should fetch user's won auctions", async () => {
      const mockResponse = {
        success: true,
        data: [{ id: "auc1" } as AuctionBE],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.getWonAuctions();

      expect(apiService.get).toHaveBeenCalledWith("/auctions/won");
      expect(result).toHaveLength(1);
    });
  });

  describe("bulkAction", () => {
    it("should perform bulk action", async () => {
      const mockResponse: BulkActionResponse = {
        success: true,
        message: "Completed",
        successCount: 2,
        failureCount: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.bulkAction("start", [
        "auc1",
        "auc2",
      ]);

      expect(apiService.post).toHaveBeenCalledWith("/auctions/bulk", {
        action: "start",
        ids: ["auc1", "auc2"],
        updates: undefined,
      });
      expect(result.successCount).toBe(2);
    });
  });

  describe("bulk operations", () => {
    beforeEach(() => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        successCount: 1,
        failureCount: 0,
        errors: [],
      } as BulkActionResponse);
    });

    it("should bulk start auctions", async () => {
      await auctionsService.bulkStart(["auc1"]);
      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions/bulk",
        expect.objectContaining({ action: "start" })
      );
    });

    it("should bulk end auctions", async () => {
      await auctionsService.bulkEnd(["auc1"]);
      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions/bulk",
        expect.objectContaining({ action: "end" })
      );
    });

    it("should bulk cancel auctions", async () => {
      await auctionsService.bulkCancel(["auc1"]);
      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions/bulk",
        expect.objectContaining({ action: "cancel" })
      );
    });

    it("should bulk feature auctions", async () => {
      await auctionsService.bulkFeature(["auc1"]);
      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions/bulk",
        expect.objectContaining({ action: "feature" })
      );
    });

    it("should bulk unfeature auctions", async () => {
      await auctionsService.bulkUnfeature(["auc1"]);
      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions/bulk",
        expect.objectContaining({ action: "unfeature" })
      );
    });

    it("should bulk delete auctions", async () => {
      await auctionsService.bulkDelete(["auc1"]);
      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions/bulk",
        expect.objectContaining({ action: "delete" })
      );
    });

    it("should bulk update auctions", async () => {
      const updates: Partial<AuctionFormFE> = { name: "Updated" };
      await auctionsService.bulkUpdate(["auc1"], updates);
      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions/bulk",
        expect.objectContaining({
          action: "update",
          updates,
        })
      );
    });
  });

  describe("quickCreate", () => {
    it("should quick create auction", async () => {
      const mockAuction: AuctionBE = {
        id: "auc1",
        name: "Quick Auction",
      } as AuctionBE;

      (apiService.post as jest.Mock).mockResolvedValue(mockAuction);

      const result = await auctionsService.quickCreate({
        name: "Quick Auction",
        startingBid: 1000,
        startTime: new Date(),
        endTime: new Date(),
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/auctions",
        expect.objectContaining({
          name: "Quick Auction",
          slug: "quick-auction",
          description: "",
        })
      );
      expect(result._transformed).toBe(true);
    });
  });

  describe("quickUpdate", () => {
    it("should quick update auction", async () => {
      const mockAuction: AuctionBE = {
        id: "auc1",
        name: "Updated",
      } as AuctionBE;

      (apiService.patch as jest.Mock).mockResolvedValue(mockAuction);

      const result = await auctionsService.quickUpdate("auc1", {
        name: "Updated",
      });

      expect(apiService.patch).toHaveBeenCalledWith("/auctions/auc1", {
        name: "Updated",
      });
      expect(result._transformed).toBe(true);
    });
  });

  describe("getByIds", () => {
    it("should fetch auctions by IDs", async () => {
      const mockResponse = {
        data: [{ id: "auc1" }, { id: "auc2" }],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auctionsService.getByIds(["auc1", "auc2"]);

      expect(apiService.post).toHaveBeenCalledWith("/auctions/batch", {
        ids: ["auc1", "auc2"],
      });
      expect(result).toHaveLength(2);
      expect(result[0]._card).toBe(true);
    });

    it("should return empty array for empty IDs", async () => {
      const result = await auctionsService.getByIds([]);
      expect(result).toEqual([]);
      expect(apiService.post).not.toHaveBeenCalled();
    });

    it("should handle null IDs", async () => {
      const result = await auctionsService.getByIds(null as any);
      expect(result).toEqual([]);
    });
  });
});
