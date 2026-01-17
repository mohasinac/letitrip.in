"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Clock, Eye, Heart, Tag } from "lucide-react";
import { BlogCard as LibraryBlogCard, BlogCardProps as LibraryBlogCardProps } from "@letitrip/react-library";
import { formatDate } from "@/lib/formatters";

// Re-export props for Next.js usage
export type BlogCardProps = Omit<LibraryBlogCardProps, 
  'LinkComponent' | 'ImageComponent' | 'CalendarIcon' | 'UserIcon' | 
  'ClockIcon' | 'EyeIcon' | 'HeartIcon' | 'TagIcon' | 'formatDate'
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
