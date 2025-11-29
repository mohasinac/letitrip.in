# Reviews Resource - Test Cases

## Unit Tests

### Review Operations

```typescript
describe("Review Service", () => {
  describe("getProductReviews", () => {
    it("should return reviews for product", async () => {
      const reviews = await reviewsService.getProductReviews("prod_001");
      expect(reviews.data).toBeInstanceOf(Array);
      expect(reviews.meta.total).toBeGreaterThan(0);
    });

    it("should include user info", async () => {
      const reviews = await reviewsService.getProductReviews("prod_001");
      reviews.data.forEach((review) => {
        expect(review.user).toHaveProperty("name");
      });
    });

    it("should filter by rating", async () => {
      const reviews = await reviewsService.getProductReviews("prod_001", {
        rating: 5,
      });
      reviews.data.forEach((review) => {
        expect(review.rating).toBe(5);
      });
    });

    it("should sort by date", async () => {
      const reviews = await reviewsService.getProductReviews("prod_001", {
        sortBy: "date",
        sortOrder: "desc",
      });
      for (let i = 1; i < reviews.data.length; i++) {
        expect(
          new Date(reviews.data[i - 1].createdAt).getTime(),
        ).toBeGreaterThanOrEqual(new Date(reviews.data[i].createdAt).getTime());
      }
    });

    it("should sort by helpful votes", async () => {
      const reviews = await reviewsService.getProductReviews("prod_001", {
        sortBy: "helpful",
      });
      for (let i = 1; i < reviews.data.length; i++) {
        expect(reviews.data[i - 1].helpfulCount).toBeGreaterThanOrEqual(
          reviews.data[i].helpfulCount,
        );
      }
    });
  });

  describe("create", () => {
    it("should create review for purchased product", async () => {
      const review = await reviewsService.create({
        productId: "prod_001",
        orderId: "order_001",
        rating: 5,
        title: "Great product!",
        comment: "Really happy with this purchase.",
        images: [],
      });
      expect(review.id).toBeDefined();
      expect(review.status).toBe("pending");
    });

    it("should fail if product not purchased", async () => {
      await expect(
        reviewsService.create({
          productId: "prod_not_purchased",
          rating: 5,
        }),
      ).rejects.toThrow("You can only review purchased products");
    });

    it("should fail for duplicate review", async () => {
      await expect(
        reviewsService.create({
          productId: "prod_already_reviewed",
          rating: 4,
        }),
      ).rejects.toThrow("You have already reviewed this product");
    });

    it("should validate rating range", async () => {
      await expect(
        reviewsService.create({ productId: "prod_001", rating: 6 }),
      ).rejects.toThrow("Rating must be between 1 and 5");
    });

    it("should support image uploads", async () => {
      const review = await reviewsService.create({
        productId: "prod_001",
        rating: 5,
        images: ["https://img1.jpg", "https://img2.jpg"],
      });
      expect(review.images).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("should update own review", async () => {
      const updated = await reviewsService.update("review_001", {
        rating: 4,
        comment: "Updated comment",
      });
      expect(updated.rating).toBe(4);
    });

    it("should fail for other user's review", async () => {
      await expect(
        reviewsService.update("other_review", { rating: 1 }),
      ).rejects.toThrow("Forbidden");
    });
  });

  describe("delete", () => {
    it("should delete own review", async () => {
      const result = await reviewsService.delete("review_001");
      expect(result.success).toBe(true);
    });
  });
});
```

### Helpful Votes

```typescript
describe("Review Helpful Votes", () => {
  describe("markHelpful", () => {
    it("should mark review as helpful", async () => {
      const result = await reviewsService.markHelpful("review_001");
      expect(result.helpfulCount).toBeGreaterThan(0);
    });

    it("should not allow duplicate votes", async () => {
      await reviewsService.markHelpful("review_001");
      await expect(reviewsService.markHelpful("review_001")).rejects.toThrow(
        "Already marked as helpful",
      );
    });

    it("should not allow voting on own review", async () => {
      await expect(reviewsService.markHelpful("own_review")).rejects.toThrow(
        "Cannot vote on own review",
      );
    });
  });

  describe("unmarkHelpful", () => {
    it("should remove helpful vote", async () => {
      await reviewsService.markHelpful("review_002");
      const result = await reviewsService.unmarkHelpful("review_002");
      expect(result.success).toBe(true);
    });
  });
});
```

### Seller Response

```typescript
describe("Seller Review Response", () => {
  let sellerToken: string;

  beforeAll(async () => {
    sellerToken = await getTestSellerToken();
  });

  describe("respond", () => {
    it("should add seller response", async () => {
      const result = await reviewsService.respond("review_001", {
        response: "Thank you for your feedback!",
      });
      expect(result.sellerResponse).toBe("Thank you for your feedback!");
    });

    it("should fail for review not on seller's product", async () => {
      await expect(
        reviewsService.respond("other_shop_review", { response: "..." }),
      ).rejects.toThrow("Forbidden");
    });

    it("should update existing response", async () => {
      await reviewsService.respond("review_001", { response: "First" });
      const updated = await reviewsService.respond("review_001", {
        response: "Updated",
      });
      expect(updated.sellerResponse).toBe("Updated");
    });
  });
});
```

### Review Moderation

```typescript
describe("Review Moderation (Admin)", () => {
  describe("approve", () => {
    it("should approve pending review", async () => {
      const result = await reviewsService.approve("review_pending");
      expect(result.status).toBe("approved");
    });

    it("should make review visible", async () => {
      await reviewsService.approve("review_pending");
      const reviews = await reviewsService.getProductReviews("prod_001");
      expect(reviews.data.find((r) => r.id === "review_pending")).toBeDefined();
    });
  });

  describe("reject", () => {
    it("should reject review with reason", async () => {
      const result = await reviewsService.reject("review_inappropriate", {
        reason: "Inappropriate content",
      });
      expect(result.status).toBe("rejected");
    });
  });

  describe("flag", () => {
    it("should flag review for moderation", async () => {
      const result = await reviewsService.flag("review_001", {
        reason: "spam",
      });
      expect(result.isFlagged).toBe(true);
    });
  });
});
```

---

## Integration Tests

### Review API

```typescript
describe("Review API Integration", () => {
  let userToken: string;

  beforeAll(async () => {
    userToken = await getTestUserToken();
  });

  describe("GET /api/products/:id/reviews", () => {
    it("should return product reviews", async () => {
      const response = await fetch("/api/products/prod_001/reviews");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });

    it("should include rating summary", async () => {
      const response = await fetch("/api/products/prod_001/reviews");
      const data = await response.json();
      expect(data.meta).toHaveProperty("averageRating");
      expect(data.meta).toHaveProperty("ratingDistribution");
    });
  });

  describe("POST /api/reviews", () => {
    it("should require authentication", async () => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod_001", rating: 5 }),
      });
      expect(response.status).toBe(401);
    });

    it("should create review", async () => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: "prod_purchased",
          orderId: "order_001",
          rating: 5,
          title: "Great!",
          comment: "Love it",
        }),
      });
      expect(response.status).toBe(201);
    });
  });

  describe("POST /api/reviews/:id/helpful", () => {
    it("should mark as helpful", async () => {
      const response = await fetch("/api/reviews/review_001/helpful", {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Seller Review API

```typescript
describe("Seller Review API Integration", () => {
  let sellerToken: string;

  beforeAll(async () => {
    sellerToken = await getTestSellerToken();
  });

  describe("GET /api/seller/reviews", () => {
    it("should return reviews for seller products", async () => {
      const response = await fetch("/api/seller/reviews", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/seller/reviews/:id/respond", () => {
    it("should add seller response", async () => {
      const response = await fetch("/api/seller/reviews/review_001/respond", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: "Thank you!" }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Admin Review API

```typescript
describe("Admin Review API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("GET /api/admin/reviews/pending", () => {
    it("should return pending reviews", async () => {
      const response = await fetch("/api/admin/reviews/pending", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/admin/reviews/:id/approve", () => {
    it("should approve review", async () => {
      const response = await fetch(
        "/api/admin/reviews/review_pending/approve",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/admin/reviews/:id/reject", () => {
    it("should reject review", async () => {
      const response = await fetch(
        "/api/admin/reviews/review_inappropriate/reject",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Inappropriate content" }),
        },
      );
      expect(response.status).toBe(200);
    });
  });
});
```
