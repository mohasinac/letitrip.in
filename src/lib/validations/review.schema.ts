/**
 * @fileoverview TypeScript Module
 * @module src/lib/validations/review.schema
 * @description This file contains functionality related to review.schema
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Review validation schema
export const reviewSchema = z.object({
  /** Product Id */
  productId: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Product ID")),
  /** Rating */
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
  /** Title */
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
  /** Comment */
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
  /** Pros */
  pros: z.array(z.string()).max(5, "Maximum 5 pros allowed").optional(),
  /** Cons */
  cons: z.array(z.string()).max(5, "Maximum 5 cons allowed").optional(),
});

// Reply to review validation
export const reviewReplySchema = z.object({
  /** Comment */
  comment: z
    .string()
    .min(10, "Reply must be at least 10 characters")
    .max(500, "Reply must be less than 500 characters"),
});

// Helpful vote validation
export const reviewHelpfulSchema = z.object({
  /** Review Id */
  reviewId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Review ID")),
  /** Is Helpful */
  isHelpful: z.boolean(),
});

/**
 * ReviewFormData type
 * 
 * @typedef {Object} ReviewFormData
 * @description Type definition for ReviewFormData
 */
/**
 * ReviewFormData type definition
 *
 * @typedef {z.infer<typeof reviewSchema>} ReviewFormData
 * @description Type definition for ReviewFormData
 */
export type ReviewFormData = z.infer<typeof reviewSchema>;
/**
 * ReviewReplyFormData type
 * 
 * @typedef {Object} ReviewReplyFormData
 * @description Type definition for ReviewReplyFormData
 */
/**
 * ReviewReplyFormData type definition
 *
 * @typedef {z.infer<typeof reviewReplySchema>} ReviewReplyFormData
 * @description Type definition for ReviewReplyFormData
 */
export type ReviewReplyFormData = z.infer<typeof reviewReplySchema>;
/**
 * ReviewHelpfulFormData type
 * 
 * @typedef {Object} ReviewHelpfulFormData
 * @description Type definition for ReviewHelpfulFormData
 */
/**
 * ReviewHelpfulFormData type definition
 *
 * @typedef {z.infer<typeof reviewHelpfulSchema>} ReviewHelpfulFormData
 * @description Type definition for ReviewHelpfulFormData
 */
export type ReviewHelpfulFormData = z.infer<typeof reviewHelpfulSchema>;
