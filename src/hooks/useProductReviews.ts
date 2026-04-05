"use client";

import { useMutation } from "@tanstack/react-query";
import { createReviewAction } from "@/actions";

export { useProductReviews } from "@mohasinac/feat-reviews";

interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export function useCreateReview(
  onSuccess?: () => void,
  onError?: (err: { status?: number; message?: string }) => void,
) {
  return useMutation<unknown, Error, CreateReviewInput>({
    mutationFn: (data) =>
      createReviewAction({ ...data, images: data.images ?? [] }),
    onSuccess,
    onError,
  });
}
