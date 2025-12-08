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

  // Note: reply method doesn't exist in reviews.service - skipping test

  // Note: getStats method doesn't exist in reviews.service - skipping test

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
