import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Review validation schema
export const reviewSchema = z.object({
  productId: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Product ID")),
  rating: z
    .number()
    .int(VALIDATION_MESSAGES.NUMBER.NOT_INTEGER)
    .min(
      VALIDATION_RULES.REVIEW.RATING.MIN,
      VALIDATION_MESSAGES.REVIEW.RATING_INVALID,
    )
    .max(
      VALIDATION_RULES.REVIEW.RATING.MAX,
      VALIDATION_MESSAGES.REVIEW.RATING_INVALID,
    ),
  title: z
    .string()
    .min(
      VALIDATION_RULES.REVIEW.TITLE.MIN_LENGTH,
      VALIDATION_MESSAGES.REVIEW.TITLE_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.REVIEW.TITLE.MAX_LENGTH,
      VALIDATION_MESSAGES.REVIEW.TITLE_TOO_LONG,
    ),
  comment: z
    .string()
    .min(
      VALIDATION_RULES.REVIEW.CONTENT.MIN_LENGTH,
      VALIDATION_MESSAGES.REVIEW.CONTENT_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.REVIEW.CONTENT.MAX_LENGTH,
      VALIDATION_MESSAGES.REVIEW.CONTENT_TOO_LONG,
    ),
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
  reviewId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Review ID")),
  isHelpful: z.boolean(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ReviewReplyFormData = z.infer<typeof reviewReplySchema>;
export type ReviewHelpfulFormData = z.infer<typeof reviewHelpfulSchema>;
