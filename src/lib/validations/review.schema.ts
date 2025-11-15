import { z } from "zod";

// Review validation schema
export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  title: z
    .string()
    .min(5, "Review title must be at least 5 characters")
    .max(100, "Review title must be less than 100 characters"),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be less than 1000 characters"),
  pros: z.array(z.string()).max(5, "Maximum 5 pros allowed").optional(),
  cons: z.array(z.string()).max(5, "Maximum 5 cons allowed").optional(),
});

// Reply to review validation
export const reviewReplySchema = z.object({
  comment: z
    .string()
    .min(10, "Reply must be at least 10 characters")
    .max(500, "Reply must be less than 500 characters"),
});

// Helpful vote validation
export const reviewHelpfulSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  isHelpful: z.boolean(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ReviewReplyFormData = z.infer<typeof reviewReplySchema>;
export type ReviewHelpfulFormData = z.infer<typeof reviewHelpfulSchema>;
