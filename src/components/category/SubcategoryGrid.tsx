"use client";

import type { SubcategoryGridProps as LibrarySubcategoryGridProps } from "@letitrip/react-library";
import {
  SubcategoryGrid as LibrarySubcategoryGrid,
  OptimizedImage,
} from "@letitrip/react-library";
import { ChevronLeft, ChevronRight, Package, Search } from "lucide-react";
import Link from "next/link";

export type { Subcategory } from "@letitrip/react-library";

export interface SubcategoryGridProps
  extends Omit<
    LibrarySubcategoryGridProps,
    "LinkComponent" | "ImageComponent" | "icons"
  > {}

/**
 * SubcategoryGrid Component (Next.js Wrapper)
 *
 * Integrates library SubcategoryGrid with Next.js Link and OptimizedImage.
 */
export function SubcategoryGrid(props: SubcategoryGridProps) {
  return (
    <LibrarySubcategoryGrid
      {...props}
      LinkComponent={Link as any}
      ImageComponent={OptimizedImage as any}
      icons={{
        search: <Search className="w-4 h-4" />,
        chevronLeft: <ChevronLeft className="w-5 h-5" />,
        chevronRight: <ChevronRight className="w-5 h-5" />,
        package: <Package className="w-3 h-3" />,
      }}
    />
  );
}

export default SubcategoryGrid;
