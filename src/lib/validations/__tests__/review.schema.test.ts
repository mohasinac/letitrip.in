import {
  reviewHelpfulSchema,
  reviewReplySchema,
  reviewSchema,
} from "../review.schema";

describe("Review Validation Schemas", () => {
  describe("Review Schema", () => {
    const validReviewData = {
      productId: "prod_123",
      rating: 4,
      title: "Great product!",
      comment:
        "This is a detailed review of the product with sufficient length to meet minimum requirements.",
    };

    describe("Full review validation", () => {
      it("should accept valid review data", () => {
        const result = reviewSchema.safeParse(validReviewData);
        expect(result.success).toBe(true);
      });

      it("should require all mandatory fields", () => {
        const result = reviewSchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it("should accept review with optional pros and cons", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          pros: ["Good quality", "Fast shipping", "Great price"],
          cons: ["Minor packaging issue"],
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Product ID validation", () => {
      it("should require product ID", () => {
        const { productId, ...data } = validReviewData;
        const result = reviewSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject empty product ID", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          productId: "",
        });
        expect(result.success).toBe(false);
      });

      it("should accept valid product IDs", () => {
        const result = reviewSchema.safeParse(validReviewData);
        expect(result.success).toBe(true);
      });
    });

    describe("Rating validation", () => {
      it("should require rating", () => {
        const { rating, ...data } = validReviewData;
        const result = reviewSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid ratings 1-5", () => {
        const validRatings = [1, 2, 3, 4, 5];

        validRatings.forEach((rating) => {
          const result = reviewSchema.safeParse({
            ...validReviewData,
            rating,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject rating below minimum", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          rating: 0,
        });
        expect(result.success).toBe(false);
      });

      it("should reject rating above maximum", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          rating: 6,
        });
        expect(result.success).toBe(false);
      });

      it("should reject decimal ratings", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          rating: 3.5,
        });
        expect(result.success).toBe(false);
      });

      it("should reject negative ratings", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          rating: -1,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Title validation", () => {
      it("should require title", () => {
        const { title, ...data } = validReviewData;
        const result = reviewSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid titles", () => {
        const validTitles = [
          "Great!",
          "Excellent product",
          "Amazing quality and fast delivery",
        ];

        validTitles.forEach((title) => {
          const result = reviewSchema.safeParse({
            ...validReviewData,
            title,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject too short titles", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          title: "Good",
        });
        expect(result.success).toBe(false);
      });

      it("should reject too long titles", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          title: "A".repeat(101),
        });
        expect(result.success).toBe(false);
      });

      it("should accept minimum length title", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          title: "Great",
        });
        expect(result.success).toBe(true);
      });

      it("should accept maximum length title", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          title: "A".repeat(100),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Comment validation", () => {
      it("should require comment", () => {
        const { comment, ...data } = validReviewData;
        const result = reviewSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid comments", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          comment:
            "This is a detailed review with proper length and information.",
        });
        expect(result.success).toBe(true);
      });

      it("should reject too short comments", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          comment: "Too short",
        });
        expect(result.success).toBe(false);
      });

      it("should reject too long comments", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          comment: "A".repeat(2001),
        });
        expect(result.success).toBe(false);
      });

      it("should accept minimum length comment", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          comment: "A".repeat(20),
        });
        expect(result.success).toBe(true);
      });

      it("should accept maximum length comment", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          comment: "A".repeat(2000),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Pros validation", () => {
      it("should handle optional pros", () => {
        const result = reviewSchema.safeParse(validReviewData);
        expect(result.success).toBe(true);
      });

      it("should accept valid pros array", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          pros: ["Good quality", "Fast delivery", "Great price"],
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty pros array", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          pros: [],
        });
        expect(result.success).toBe(true);
      });

      it("should accept maximum 5 pros", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          pros: ["Pro 1", "Pro 2", "Pro 3", "Pro 4", "Pro 5"],
        });
        expect(result.success).toBe(true);
      });

      it("should reject more than 5 pros", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          pros: ["Pro 1", "Pro 2", "Pro 3", "Pro 4", "Pro 5", "Pro 6"],
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Cons validation", () => {
      it("should handle optional cons", () => {
        const result = reviewSchema.safeParse(validReviewData);
        expect(result.success).toBe(true);
      });

      it("should accept valid cons array", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          cons: ["Minor issue", "Could be better"],
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty cons array", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          cons: [],
        });
        expect(result.success).toBe(true);
      });

      it("should accept maximum 5 cons", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          cons: ["Con 1", "Con 2", "Con 3", "Con 4", "Con 5"],
        });
        expect(result.success).toBe(true);
      });

      it("should reject more than 5 cons", () => {
        const result = reviewSchema.safeParse({
          ...validReviewData,
          cons: ["Con 1", "Con 2", "Con 3", "Con 4", "Con 5", "Con 6"],
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Review Reply Schema", () => {
    const validReplyData = {
      comment: "Thank you for your feedback!",
    };

    describe("Reply validation", () => {
      it("should accept valid reply", () => {
        const result = reviewReplySchema.safeParse(validReplyData);
        expect(result.success).toBe(true);
      });

      it("should require comment", () => {
        const result = reviewReplySchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it("should reject too short comments", () => {
        const result = reviewReplySchema.safeParse({
          comment: "Thanks",
        });
        expect(result.success).toBe(false);
      });

      it("should reject too long comments", () => {
        const result = reviewReplySchema.safeParse({
          comment: "A".repeat(501),
        });
        expect(result.success).toBe(false);
      });

      it("should accept minimum length comment", () => {
        const result = reviewReplySchema.safeParse({
          comment: "A".repeat(10),
        });
        expect(result.success).toBe(true);
      });

      it("should accept maximum length comment", () => {
        const result = reviewReplySchema.safeParse({
          comment: "A".repeat(500),
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Review Helpful Schema", () => {
    const validHelpfulData = {
      reviewId: "review_123",
      isHelpful: true,
    };

    describe("Helpful vote validation", () => {
      it("should accept valid helpful vote", () => {
        const result = reviewHelpfulSchema.safeParse(validHelpfulData);
        expect(result.success).toBe(true);
      });

      it("should require review ID", () => {
        const { reviewId, ...data } = validHelpfulData;
        const result = reviewHelpfulSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should require isHelpful", () => {
        const { isHelpful, ...data } = validHelpfulData;
        const result = reviewHelpfulSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject empty review ID", () => {
        const result = reviewHelpfulSchema.safeParse({
          ...validHelpfulData,
          reviewId: "",
        });
        expect(result.success).toBe(false);
      });

      it("should accept true for isHelpful", () => {
        const result = reviewHelpfulSchema.safeParse({
          ...validHelpfulData,
          isHelpful: true,
        });
        expect(result.success).toBe(true);
      });

      it("should accept false for isHelpful", () => {
        const result = reviewHelpfulSchema.safeParse({
          ...validHelpfulData,
          isHelpful: false,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle Unicode in review content", () => {
      const result = reviewSchema.safeParse({
        productId: "prod_123",
        rating: 5,
        title: "बहुत अच्छा उत्पाद",
        comment:
          "यह उत्पाद वास्तव में अद्भुत है। मैं इसे सभी को सुझाता हूं। Great quality!",
      });
      expect(result.success).toBe(true);
    });

    it("should handle special characters in title", () => {
      const result = reviewSchema.safeParse({
        productId: "prod_123",
        rating: 4,
        title: "Great! Works 100%!",
        comment: "This product exceeded my expectations in every way possible.",
      });
      expect(result.success).toBe(true);
    });

    it("should handle emojis in comment", () => {
      const result = reviewSchema.safeParse({
        productId: "prod_123",
        rating: 5,
        title: "Amazing product",
        comment:
          "Love this product! 😍 Highly recommend 👍 Five stars ⭐⭐⭐⭐⭐",
      });
      expect(result.success).toBe(true);
    });
  });
});
