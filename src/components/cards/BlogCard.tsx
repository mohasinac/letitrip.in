"use client";

import { formatDate } from "@/lib/formatters";
import {
  BlogCard as LibraryBlogCard,
  BlogCardProps as LibraryBlogCardProps,
} from "@letitrip/react-library";
import { Calendar, Clock, Eye, Heart, Tag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Re-export props for Next.js usage
export type BlogCardProps = Omit<
  LibraryBlogCardProps,
  | "LinkComponent"
  | "ImageComponent"
  | "CalendarIcon"
  | "UserIcon"
  | "ClockIcon"
  | "EyeIcon"
  | "HeartIcon"
  | "TagIcon"
  | "formatDate"
>;

export const BlogCard: React.FC<BlogCardProps> = (props) => {
  return (
    <LibraryBlogCard
      {...props}
      LinkComponent={Link as any}
      ImageComponent={Image}
      CalendarIcon={Calendar}
      UserIcon={User}
      ClockIcon={Clock}
      EyeIcon={Eye}
      HeartIcon={Heart}
      TagIcon={Tag}
      formatDate={formatDate}
    />
  );
};
