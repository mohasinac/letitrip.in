"use client";

import { useMutation } from "@tanstack/react-query";
import { createReviewAction } from "@/actions";

interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  videoUrl?: string;
}

export function useCreateReview(
  onSuccess?: () => void,
  onError?: (err: { status?: number; message?: string }) => void,
) {
  return useMutation<unknown, Error, CreateReviewInput>({
    mutationFn: (data) => {
      if ((data.images?.length ?? 0) > 5) {
        return Promise.reject(new Error("Reviews support at most 5 images."));
      }
      return createReviewAction({
        ...data,
        images: data.images ?? [],
        videoUrl: data.videoUrl,
      });
    },
    onSuccess,
    onError,
  });
}

