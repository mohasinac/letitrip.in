import { apiService } from "../api.service";
import { reviewsService } from "../reviews.service";

jest.mock("../api.service");

describe("ReviewsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("lists reviews with filters", async () => {
      const mockResponse = {
        data: [
          {
            id: "review1",
            rating: 5,
            comment: "Great product!",
            productId: "prod1",
            images: [],
            createdAt: new Date().toISOString(),
            helpful: 0,
            notHelpful: 0,
          },
        ],
        count: 1,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.list({ productId: "prod1" });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/reviews")
      );
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("handles response with reviews property", async () => {
      const mockResponse = {
        reviews: [
          {
            id: "review1",
            rating: 4,
            images: [],
            createdAt: new Date().toISOString(),
            helpful: 0,
            notHelpful: 0,
          },
        ],
        count: 1,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.list();

      expect(result.data).toHaveLength(1);
    });

    it("handles empty review list", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: [],
        count: 0,
      });

      const result = await reviewsService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getById", () => {
    it("gets review by ID", async () => {
      const mockReview = {
        data: {
          id: "review1",
          rating: 5,
          comment: "Excellent!",
          productId: "prod1",
          images: [],
          createdAt: new Date().toISOString(),
          helpful: 0,
          notHelpful: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewsService.getById("review1");

      expect(apiService.get).toHaveBeenCalledWith("/reviews/review1");
      expect(result).toBeDefined();
    });
  });

  describe("create", () => {
    it("creates a new review", async () => {
      const mockFormData = {
        productId: "prod1",
        orderId: "order1",
        rating: 5,
        comment: "Great product!",
        images: ["img1.jpg"],
      };

      const mockReview = {
        data: {
          id: "review1",
          ...mockFormData,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewsService.create(mockFormData as any);

      expect(apiService.post).toHaveBeenCalledWith(
        "/reviews",
        expect.any(Object)
      );
      expect(result).toBeDefined();
    });
  });

  describe("update", () => {
    it("updates an existing review", async () => {
      const mockFormData = {
        rating: 4,
        comment: "Updated comment",
        images: [],
      };

      const mockReview = {
        data: {
          id: "review1",
          ...mockFormData,
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewsService.update(
        "review1",
        mockFormData as any
      );

      expect(apiService.patch).toHaveBeenCalledWith(
        "/reviews/review1",
        expect.any(Object)
      );
      expect(result).toBeDefined();
    });
  });

  describe("delete", () => {
    it("deletes a review", async () => {
      const mockResponse = { message: "Review deleted successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.delete("review1");

      expect(apiService.delete).toHaveBeenCalledWith("/reviews/review1");
      expect(result.message).toBe("Review deleted successfully");
    });
  });

  describe("moderate", () => {
    it("moderates a review - approve", async () => {
      const mockReview = {
        data: {
          id: "review1",
          isApproved: true,
          moderationNotes: "Looks good",
          images: [],
          createdAt: new Date().toISOString(),
          helpful: 0,
          notHelpful: 0,
          rating: 5,
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewsService.moderate("review1", {
        isApproved: true,
        moderationNotes: "Looks good",
      });

      expect(apiService.patch).toHaveBeenCalledWith(
        "/reviews/review1/moderate",
        expect.objectContaining({
          isApproved: true,
          moderationNotes: "Looks good",
        })
      );
      expect(result).toBeDefined();
    });

    it("moderates a review - reject", async () => {
      const mockReview = {
        data: {
          id: "review1",
          isApproved: false,
          images: [],
          createdAt: new Date().toISOString(),
          helpful: 0,
          notHelpful: 0,
          rating: 3,
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewsService.moderate("review1", {
        isApproved: false,
      });

      expect(apiService.patch).toHaveBeenCalledWith(
        "/reviews/review1/moderate",
        expect.objectContaining({
          isApproved: false,
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe("markHelpful", () => {
    it("marks review as helpful", async () => {
      const mockResponse = { helpfulCount: 5 };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.markHelpful("review1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/reviews/review1/helpful",
        {}
      );
      expect(result.helpfulCount).toBe(5);
    });
  });

  describe("uploadMedia", () => {
    it("uploads media files using apiService.postFormData", async () => {
      const mockFiles = [
        new File(["image1"], "image1.jpg", { type: "image/jpeg" }),
        new File(["image2"], "image2.jpg", { type: "image/jpeg" }),
      ];

      const mockResponse = {
        urls: [
          "https://example.com/reviews/image1.jpg",
          "https://example.com/reviews/image2.jpg",
        ],
      };

      (apiService.postFormData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.uploadMedia(mockFiles);

      expect(apiService.postFormData).toHaveBeenCalledWith(
        "/reviews/media",
        expect.any(FormData)
      );
      expect(result.urls).toHaveLength(2);
    });

    it("handles upload errors", async () => {
      const mockFiles = [
        new File(["image"], "image.jpg", { type: "image/jpeg" }),
      ];

      (apiService.postFormData as jest.Mock).mockRejectedValue(
        new Error("Upload failed")
      );

      await expect(reviewsService.uploadMedia(mockFiles)).rejects.toThrow(
        "Upload failed"
      );
    });
  });

  describe("getSummary", () => {
    it("gets review summary for product", async () => {
      const mockSummary = {
        averageRating: 4.5,
        totalReviews: 100,
        ratingDistribution: [
          { rating: 5, count: 60 },
          { rating: 4, count: 20 },
          { rating: 3, count: 10 },
          { rating: 2, count: 5 },
          { rating: 1, count: 5 },
        ],
        verifiedPurchasePercentage: 80,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockSummary);

      const result = await reviewsService.getSummary({ productId: "prod1" });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/reviews/summary")
      );
      expect(result.averageRating).toBe(4.5);
      expect(result.totalReviews).toBe(100);
    });

    it("gets review summary for shop", async () => {
      const mockSummary = {
        averageRating: 4.2,
        totalReviews: 50,
        ratingDistribution: [],
        verifiedPurchasePercentage: 75,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockSummary);

      await reviewsService.getSummary({ shopId: "shop1" });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shopId=shop1")
      );
    });

    it("gets review summary for auction", async () => {
      const mockSummary = {
        averageRating: 4.8,
        totalReviews: 25,
        ratingDistribution: [],
        verifiedPurchasePercentage: 90,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockSummary);

      await reviewsService.getSummary({ auctionId: "auction1" });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("auctionId=auction1")
      );
    });
  });

  describe("canReview", () => {
    it("checks if user can review product", async () => {
      const mockResponse = { canReview: true };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.canReview("prod1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("productId=prod1")
      );
      expect(result.canReview).toBe(true);
    });

    it("checks if user can review auction", async () => {
      const mockResponse = {
        canReview: false,
        reason: "You haven't purchased from this auction",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.canReview(undefined, "auction1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("auctionId=auction1")
      );
      expect(result.canReview).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe("getFeatured", () => {
    it("gets featured reviews", async () => {
      const mockResponse = {
        data: [
          {
            id: "rev1",
            rating: 5,
            comment: "Featured review",
            featured: true,
            isApproved: true,
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.getFeatured();

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("featured=true")
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("getHomepage", () => {
    it("gets homepage reviews", async () => {
      const mockResponse = {
        data: [
          {
            id: "rev1",
            rating: 5,
            verifiedPurchase: true,
            featured: true,
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.getHomepage();

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("verifiedPurchase=true")
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("bulk operations", () => {
    it("bulk approves reviews", async () => {
      const mockResponse = {
        success: true,
        results: {
          success: ["rev1", "rev2"],
          failed: [],
        },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await reviewsService.bulkApprove(["rev1", "rev2"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/reviews/bulk",
        expect.objectContaining({ action: "approve" })
      );
    });

    it("bulk rejects reviews", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["rev1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await reviewsService.bulkReject(["rev1"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/reviews/bulk",
        expect.objectContaining({ action: "reject" })
      );
    });

    it("bulk flags reviews", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["rev1", "rev2"], failed: [] },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await reviewsService.bulkFlag(["rev1", "rev2"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/reviews/bulk",
        expect.objectContaining({ action: "flag" })
      );
    });

    it("bulk unflags reviews", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["rev1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await reviewsService.bulkUnflag(["rev1"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/reviews/bulk",
        expect.objectContaining({ action: "unflag" })
      );
    });

    it("bulk deletes reviews", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["rev1", "rev2"], failed: [] },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await reviewsService.bulkDelete(["rev1", "rev2"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/reviews/bulk",
        expect.objectContaining({ action: "delete" })
      );
    });

    it("bulk updates reviews with custom data", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["rev1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await reviewsService.bulkUpdate(["rev1"], {
        featured: true,
        moderationNotes: "High quality review",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/reviews/bulk",
        expect.objectContaining({
          action: "update",
          data: expect.objectContaining({ featured: true }),
        })
      );
    });

    it("handles partial failures in bulk operations", async () => {
      const mockResponse = {
        success: false,
        results: {
          success: ["rev1"],
          failed: [{ id: "rev2", error: "Review already deleted" }],
        },
        summary: { total: 2, succeeded: 1, failed: 1 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.bulkApprove(["rev1", "rev2"]);

      expect(result.summary.succeeded).toBe(1);
      expect(result.summary.failed).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("handles reviews with special characters", async () => {
      const mockFormData = {
        productId: "prod1",
        rating: 5,
        comment: "Special chars: @#$%^&*() and unicode: 😊 नमस्ते",
        images: [],
      };

      const mockReview = {
        data: {
          id: "rev1",
          comment: mockFormData.comment,
          rating: 5,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockReview);

      const result = await reviewsService.create(mockFormData as any);

      expect(result).toBeDefined();
    });

    it("handles multiple media uploads", async () => {
      const mockFiles = Array.from(
        { length: 5 },
        (_, i) =>
          new File([`image${i}`], `image${i}.jpg`, { type: "image/jpeg" })
      );

      const mockResponse = {
        urls: mockFiles.map((_, i) => `https://example.com/image${i}.jpg`),
      };

      (apiService.postFormData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reviewsService.uploadMedia(mockFiles);

      expect(result.urls).toHaveLength(5);
    });

    it("handles concurrent bulk operations", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["rev1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        reviewsService.bulkApprove(["rev1"]),
        reviewsService.bulkFlag(["rev2"]),
        reviewsService.bulkDelete(["rev3"]),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.post).toHaveBeenCalledTimes(3);
    });

    it("handles review summary with no ratings", async () => {
      const mockSummary = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [],
        verifiedPurchasePercentage: 0,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockSummary);

      const result = await reviewsService.getSummary({ productId: "new-prod" });

      expect(result.totalReviews).toBe(0);
      expect(result.averageRating).toBe(0);
    });
  });

  describe("error handling", () => {
    it("handles API errors in list", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(reviewsService.list()).rejects.toThrow("Network error");
    });

    it("handles API errors in create", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Validation failed")
      );

      await expect(
        reviewsService.create({ images: [] } as any)
      ).rejects.toThrow("Validation failed");
    });
  });
});
