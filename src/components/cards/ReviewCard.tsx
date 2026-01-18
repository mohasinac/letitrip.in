"use client";

import { formatDate } from "@letitrip/react-library";
import {
  ReviewCard as LibraryReviewCard,
  ReviewCardProps as LibraryReviewCardProps,
} from "@letitrip/react-library";
import { Calendar, Package, ShieldCheck, Star, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Re-export props for Next.js usage
export type ReviewCardProps = Omit<
  LibraryReviewCardProps,
  | "LinkComponent"
  | "ImageComponent"
  | "StarIcon"
  | "ThumbsUpIcon"
  | "ShieldCheckIcon"
  | "CalendarIcon"
  | "PackageIcon"
  | "formatDate"
>;

export const ReviewCard: React.FC<ReviewCardProps> = (props) => {
  return (
    <LibraryReviewCard
      {...props}
      LinkComponent={Link as any}
      ImageComponent={Image}
      StarIcon={Star}
      ThumbsUpIcon={ThumbsUp}
      ShieldCheckIcon={ShieldCheck}
      CalendarIcon={Calendar}
      PackageIcon={Package}
      formatDate={formatDate}
    />
  );
};
