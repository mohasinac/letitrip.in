"use client";

import {
  FavoriteButton,
  CategoryCard as LibraryCategoryCard,
  CategoryCardProps as LibraryCategoryCardProps,
} from "@letitrip/react-library";
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Re-export props for Next.js usage
export type CategoryCardProps = Omit<
  LibraryCategoryCardProps,
  "LinkComponent" | "ImageComponent" | "FavoriteButtonComponent" | "PackageIcon"
>;

export const CategoryCard: React.FC<CategoryCardProps> = (props) => {
  return (
    <LibraryCategoryCard
      {...props}
      LinkComponent={Link as any}
      ImageComponent={Image}
      FavoriteButtonComponent={FavoriteButton}
      PackageIcon={Package}
    />
  );
};
