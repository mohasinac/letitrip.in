"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ThumbsUp, ShieldCheck, Calendar, Package } from "lucide-react";
import { ReviewCard as LibraryReviewCard, ReviewCardProps as LibraryReviewCardProps } from "@letitrip/react-library";
import { formatDate } from "@/lib/formatters";

// Re-export props for Next.js usage
export type ReviewCardProps = Omit<LibraryReviewCardProps, 
  'LinkComponent' | 'ImageComponent' | 'StarIcon' | 'ThumbsUpIcon' | 
  'ShieldCheckIcon' | 'CalendarIcon' | 'PackageIcon' | 'formatDate'
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
