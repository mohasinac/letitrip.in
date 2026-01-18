"use client";

import type { CategoryHeaderProps as LibraryCategoryHeaderProps } from "@letitrip/react-library";
import {
  CategoryHeader as LibraryCategoryHeader,
  OptimizedImage,
} from "@letitrip/react-library";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";

export interface CategoryHeaderProps
  extends Omit<
    LibraryCategoryHeaderProps,
    "LinkComponent" | "ImageComponent" | "icons"
  > {}

/**
 * CategoryHeader Component (Next.js Wrapper)
 *
 * Integrates library CategoryHeader with Next.js Link and OptimizedImage.
 */
export function CategoryHeader(props: CategoryHeaderProps) {
  return (
    <LibraryCategoryHeader
      {...props}
      LinkComponent={Link as any}
      ImageComponent={OptimizedImage as any}
      icons={{
        chevronRight: <ChevronRight className="w-4 h-4" />,
        package: <Package className="w-4 h-4" />,
      }}
    />
  );
}

export default CategoryHeader;
