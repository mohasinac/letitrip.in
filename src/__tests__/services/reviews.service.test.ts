/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/services/api.service";
import { reviewsService } from "@/services/reviews.service";

// Mock dependencies
jest.mock("@/services/api.service");

describe("ReviewsService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  const mockReviewBE = {
    id: "review123",
    productId: "product123",
    userId: "user123",
    userName: "Test User",
    userAvatar: "https://example.com/avatar.jpg",
    rating: 5,
    title: "Great Product!",
    comment: "This product exceeded my expectations.",
    media: ["https://example.com/photo1.jpg"],
    isApproved: true,
    isFlagged: false,
    isFeatured: false,
    verifiedPurchase: true,
    helpfulCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list reviews with filters", async () => {
      const mockResponse = {
        data: [mockReviewBE],
        reviews: [mockReviewBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await reviewsService.list({
        productId: "product123",
        rating: 5,
        page: 1,
      });

      expect(mockApiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("should list reviews without filters", async () => {
      const mockResponse = {
        data: [mockReviewBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await reviewsService.list();

      expect(result.data).toHaveLength(1);
    });

    it("should handle empty review list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await reviewsService.list();

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getById", () => {
    it("should get review by ID", async () => {
      mockApiService.get.mockResolvedValue({ data: mockReviewBE });

      const result = await reviewsService.getById("review123");

      expect(mockApiService.get).toHaveBeenCalledWith("/reviews/review123");
      expect(result.id).toBe("review123");
    });

    it("should throw error if review not found", async () => {
      const error = new Error("Review not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(reviewsService.getById("invalid")).rejects.toThrow(
        "Review not found"
      );
    });
  });

  describe("create", () => {
    it("should create review successfully", async () => {
      const formData = {
        productId: "product123",
        rating: 5,
        title: "Great Product!",
        comment: "This product exceeded my expectations.",
        media: ["https://example.com/photo1.jpg"],
      };

      mockApiService.post.mockResolvedValue({ data: mockReviewBE });

      const result = await reviewsService.create(formData as any);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/reviews",
        expect.any(Object)
      );
      expect(result.id).toBe("review123");
    });

    it("should throw error if validation fails", async () => {
      const error = new Error("Rating is required");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        reviewsService.create({ productId: "product123" } as any)
      ).rejects.toThrow("Rating is required");
    });

    it("should throw error if user not purchased", async () => {
      const error = new Error("Purchase required to review");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        reviewsService.create({
          productId: "product123",
          rating: 5,
          comment: "Test",
        } as any)
      ).rejects.toThrow("Purchase required to review");
    });
  });

  describe("update", () => {
    it("should update review successfully", async () => {
      const updates = {
        rating: 4,
        title: "Updated Title",
        comment: "Updated comment",
      };

      mockApiService.patch.mockResolvedValue({
        data: { ...mockReviewBE, ...updates },
      });

      const result = await reviewsService.update("review123", updates as any);

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/reviews/review123",
        expect.any(Object)
      );
      expect(result.id).toBe("review123");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.patch.mockRejectedValue(error);

      await expect(
        reviewsService.update("review123", { rating: 4 } as any)
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("delete", () => {
    it("should delete review successfully", async () => {
      mockApiService.delete.mockResolvedValue({
        message: "Review deleted successfully",
      });

      const result = await reviewsService.delete("review123");

      expect(mockApiService.delete).toHaveBeenCalledWith("/reviews/review123");
      expect(result.message).toBe("Review deleted successfully");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.delete.mockRejectedValue(error);

      await expect(reviewsService.delete("review123")).rejects.toThrow(
        "Not authorized"
      );
    });
  });

  describe("moderate", () => {
    it("should approve review", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockReviewBE, isApproved: true },
      });

      const result = await reviewsService.moderate("review123", {
        isApproved: true,
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/reviews/review123/moderate",
        expect.objectContaining({ isApproved: true })
      );
      expect(result.id).toBe("review123");
    });

    it("should reject review with notes", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockReviewBE, isApproved: false },
      });

      const result = await reviewsService.moderate("review123", {
        isApproved: false,
        moderationNotes: "Inappropriate content",
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/reviews/review123/moderate",
        expect.objectContaining({
          isApproved: false,
          moderationNotes: "Inappropriate content",
        })
      );
      expect(result.id).toBe("review123");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.patch.mockRejectedValue(error);

      await expect(
        reviewsService.moderate("review123", { isApproved: true })
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("markHelpful", () => {
    it("should mark review as helpful", async () => {
      mockApiService.post.mockResolvedValue({ helpfulCount: 11 });

      const result = await reviewsService.markHelpful("review123");

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/reviews/review123/helpful",
        {}
      );
      expect(result.helpfulCount).toBe(11);
    });

    it("should throw error if not authenticated", async () => {
      const error = new Error("Authentication required");
      mockApiService.post.mockRejectedValue(error);

      await expect(reviewsService.markHelpful("review123")).rejects.toThrow(
        "Authentication required"
      );
    });
  });

  describe("uploadMedia", () => {
    it("should upload review media successfully", async () => {
      const mockFiles = [
        new File(["photo1"], "photo1.jpg", { type: "image/jpeg" }),
        new File(["photo2"], "photo2.jpg", { type: "image/jpeg" }),
      ];

      mockApiService.postFormData.mockResolvedValue({
        urls: [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.jpg",
        ],
      });

      const result = await reviewsService.uploadMedia(mockFiles);

      expect(mockApiService.postFormData).toHaveBeenCalledWith(
        "/reviews/media",
        expect.any(FormData)
      );
      expect(result.urls).toHaveLength(2);
    });

    it("should throw error on invalid file type", async () => {
      const error = new Error("Invalid file type");
      mockApiService.postFormData.mockRejectedValue(error);

      const mockFiles = [new File(["doc"], "doc.txt", { type: "text/plain" })];

      await expect(reviewsService.uploadMedia(mockFiles)).rejects.toThrow(
        "Invalid file type"
      );
    });
  });

  describe("getSummary", () => {
    it("should get review summary for product", async () => {
      const mockSummary = {
        averageRating: 4.5,
        totalReviews: 100,
        ratingDistribution: [
          { rating: 5, count: 60 },
          { rating: 4, count: 25 },
          { rating: 3, count: 10 },
          { rating: 2, count: 3 },
          { rating: 1, count: 2 },
        ],
        verifiedPurchasePercentage: 85,
      };

      mockApiService.get.mockResolvedValue(mockSummary);

      const result = await reviewsService.getSummary({
        productId: "product123",
      });

      expect(mockApiService.get).toHaveBeenCalled();
      expect(result.averageRating).toBe(4.5);
      expect(result.totalReviews).toBe(100);
      expect(result.ratingDistribution).toHaveLength(5);
    });

    it("should get review summary for shop", async () => {
      const mockSummary = {
        averageRating: 4.8,
        totalReviews: 250,
        ratingDistribution: [{ rating: 5, count: 200 }],
        verifiedPurchasePercentage: 90,
      };

      mockApiService.get.mockResolvedValue(mockSummary);

      const result = await reviewsService.getSummary({ shopId: "shop123" });

      expect(result.averageRating).toBe(4.8);
      expect(result.totalReviews).toBe(250);
    });

    it("should get review summary for auction", async () => {
      const mockSummary = {
        averageRating: 4.2,
        totalReviews: 15,
        ratingDistribution: [],
        verifiedPurchasePercentage: 100,
      };

      mockApiService.get.mockResolvedValue(mockSummary);

      const result = await reviewsService.getSummary({
        auctionId: "auction123",
      });

      expect(result.averageRating).toBe(4.2);
    });

    it("should handle empty summary", async () => {
      const mockSummary = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [],
        verifiedPurchasePercentage: 0,
      };

      mockApiService.get.mockResolvedValue(mockSummary);

      const result = await reviewsService.getSummary({
        productId: "product123",
      });

      expect(result.totalReviews).toBe(0);
    });
  });

  describe("canReview", () => {
    it("should check if user can review product", async () => {
      mockApiService.get.mockResolvedValue({
        canReview: true,
      });

      const result = await reviewsService.canReview("product123");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/reviews/can-review?productId=product123"
      );
      expect(result.canReview).toBe(true);
    });

    it("should check if user can review auction", async () => {
      mockApiService.get.mockResolvedValue({
        canReview: true,
      });

      const result = await reviewsService.canReview(undefined, "auction123");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/reviews/can-review?auctionId=auction123"
      );
      expect(result.canReview).toBe(true);
    });

    it("should return false with reason if cannot review", async () => {
      mockApiService.get.mockResolvedValue({
        canReview: false,
        reason: "Already reviewed this product",
      });

      const result = await reviewsService.canReview("product123");

      expect(result.canReview).toBe(false);
      expect(result.reason).toBe("Already reviewed this product");
    });

    it("should return false if not purchased", async () => {
      mockApiService.get.mockResolvedValue({
        canReview: false,
        reason: "Purchase required",
      });

      const result = await reviewsService.canReview("product123");

      expect(result.canReview).toBe(false);
      expect(result.reason).toBe("Purchase required");
    });
  });

  describe("getFeatured", () => {
    it("should get featured reviews", async () => {
      mockApiService.get.mockResolvedValue({
        data: [mockReviewBE, { ...mockReviewBE, id: "review456" }],
      });

      const result = await reviewsService.getFeatured();

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/reviews?featured=true&isApproved=true&limit=100"
      );
      expect(result).toHaveLength(2);
    });

    it("should handle empty featured reviews", async () => {
      mockApiService.get.mockResolvedValue({ data: [] });

      const result = await reviewsService.getFeatured();

      expect(result).toHaveLength(0);
    });
  });

  describe("getHomepage", () => {
    it("should get homepage reviews", async () => {
      mockApiService.get.mockResolvedValue({
        data: [mockReviewBE],
      });

      const result = await reviewsService.getHomepage();

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/reviews?featured=true&isApproved=true&verifiedPurchase=true&limit=20"
      );
      expect(result).toHaveLength(1);
    });

    it("should handle empty homepage reviews", async () => {
      mockApiService.get.mockResolvedValue({ data: [] });

      const result = await reviewsService.getHomepage();

      expect(result).toHaveLength(0);
    });
  });

  describe("bulkApprove", () => {
    it("should bulk approve reviews", async () => {
      const mockResponse = {
        success: true,
        results: {
          success: ["review1", "review2"],
          failed: [],
        },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await reviewsService.bulkApprove(["review1", "review2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/reviews/bulk", {
        action: "approve",
        ids: ["review1", "review2"],
      });
      expect(result.summary.succeeded).toBe(2);
    });

    it("should handle partial approval failure", async () => {
      const mockResponse = {
        success: false,
        results: {
          success: ["review1"],
          failed: [{ id: "review2", error: "Not found" }],
        },
        summary: { total: 2, succeeded: 1, failed: 1 },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await reviewsService.bulkApprove(["review1", "review2"]);

      expect(result.summary.failed).toBe(1);
    });
  });

  describe("bulkReject", () => {
    it("should bulk reject reviews", async () => {
      const mockResponse = {
        success: true,
        results: {
          success: ["review1", "review2"],
          failed: [],
        },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await reviewsService.bulkReject(["review1", "review2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/reviews/bulk", {
        action: "reject",
        ids: ["review1", "review2"],
      });
      expect(result.summary.succeeded).toBe(2);
    });
  });

  describe("bulkFlag", () => {
    it("should bulk flag reviews", async () => {
      const mockResponse = {
        success: true,
        results: {
          success: ["review1"],
          failed: [],
        },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await reviewsService.bulkFlag(["review1"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/reviews/bulk", {
        action: "flag",
        ids: ["review1"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkUnflag", () => {
    it("should bulk unflag reviews", async () => {
      const mockResponse = {
        success: true,
        results: {
          success: ["review1"],
          failed: [],
        },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await reviewsService.bulkUnflag(["review1"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/reviews/bulk", {
        action: "unflag",
        ids: ["review1"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkDelete", () => {
    it("should bulk delete reviews", async () => {
      const mockResponse = {
        success: true,
        results: {
          success: ["review1", "review2", "review3"],
          failed: [],
        },
        summary: { total: 3, succeeded: 3, failed: 0 },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await reviewsService.bulkDelete([
        "review1",
        "review2",
        "review3",
      ]);

      expect(mockApiService.post).toHaveBeenCalledWith("/reviews/bulk", {
        action: "delete",
        ids: ["review1", "review2", "review3"],
      });
      expect(result.summary.succeeded).toBe(3);
    });
  });

  describe("bulkUpdate", () => {
    it("should bulk update reviews", async () => {
      const updates = { isFeatured: true };
      const mockResponse = {
        success: true,
        results: {
          success: ["review1", "review2"],
          failed: [],
        },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await reviewsService.bulkUpdate(
        ["review1", "review2"],
        updates
      );

      expect(mockApiService.post).toHaveBeenCalledWith("/reviews/bulk", {
        action: "update",
        ids: ["review1", "review2"],
        data: updates,
      });
      expect(result.summary.succeeded).toBe(2);
    });
  });
});
