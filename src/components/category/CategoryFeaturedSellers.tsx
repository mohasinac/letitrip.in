"use client";

import Link from "next/link";
import {
  CategoryFeaturedSellers as LibCategoryFeaturedSellers,
  type CategoryFeaturedSellersProps as LibCategoryFeaturedSellersProps,
} from "@letitrip/react-library";

export type CategoryFeaturedSellersProps = Omit<
  LibCategoryFeaturedSellersProps,
  "LinkComponent"
>;

export function CategoryFeaturedSellers(props: CategoryFeaturedSellersProps) {
  return (
    <LibCategoryFeaturedSellers
      {...props}
      LinkComponent={Link}
    />
  );
}

export default CategoryFeaturedSellers;
