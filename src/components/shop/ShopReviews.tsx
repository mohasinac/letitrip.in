"use client";
import {
  EmptyState,
  ShopReviews as ShopReviewsBase,
  type ShopReviewsProps,
} from "@letitrip/react-library";
import React from "react";
import toast from "react-hot-toast";

interface NextShopReviewsProps
  extends Omit<
    ShopReviewsProps,
    | "onSubmitReview"
    | "onMarkHelpful"
    | "onSubmitSuccess"
    | "onSubmitError"
    | "onMarkHelpfulError"
    | "EmptyStateComponent"
  > {
  shopId?: string;
}

const ShopReviews: React.FC<NextShopReviewsProps> = ({
  shopId: passedShopId,
  shop,
  ...props
}) => {
  const shopId = passedShopId || shop?.id || "";
  const handleSubmitReview = async (rating: number, comment: string) => {
    try {
      // TODO: Implement review submission API call
      console.log("Submitting review:", { shopId, rating, comment });
      // await submitShopReview(shopId, { rating, comment });
    } catch (error) {
      console.error("Failed to submit shop review:", { shopId, error });
      throw error;
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      // TODO: Implement mark helpful API call
      console.log("Marking review helpful:", { reviewId, shopId });
      // await markReviewHelpful(reviewId);
      return true;
    } catch (error) {
      console.error("Failed to mark review helpful:", {
        reviewId,
        shopId,
        error,
      });
      throw error;
    }
  };

  const handleSubmitSuccess = () => {
    toast.success("Review submitted successfully!");
  };

  const handleSubmitError = (error: any) => {
    const message =
      error?.response?.data?.message ||
      "Failed to submit review. Please try again.";
    toast.error(message);
  };

  const handleMarkHelpfulError = (error: any) => {
    const message =
      error?.response?.data?.message ||
      "Failed to mark review helpful. Please try again.";
    toast.error(message);
  };

  return (
    <ShopReviewsBase
      {...props}
      shop={shop}
      onSubmitReview={handleSubmitReview}
      onMarkHelpful={handleMarkHelpful}
      onSubmitSuccess={handleSubmitSuccess}
      onSubmitError={handleSubmitError}
      onMarkHelpfulError={handleMarkHelpfulError}
      EmptyStateComponent={EmptyState}
    />
  );
};

export default ShopReviews;
