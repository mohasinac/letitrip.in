"use client";

import {
  CategoryFeaturedSellers as LibCategoryFeaturedSellers,
  type CategoryFeaturedSellersProps as LibCategoryFeaturedSellersProps,
} from "@letitrip/react-library";
import Link from "next/link";

export type CategoryFeaturedSellersProps = Omit<
  LibCategoryFeaturedSellersProps,
  "LinkComponent"
>;

export function CategoryFeaturedSellers(props: CategoryFeaturedSellersProps) {
  return <LibCategoryFeaturedSellers {...props} LinkComponent={Link} />;
}

export default CategoryFeaturedSellers;
