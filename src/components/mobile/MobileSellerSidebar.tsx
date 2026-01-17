"use client";

import {
  MobileSellerSidebar as LibraryMobileSellerSidebar,
  type MobileSellerSidebarProps as LibraryMobileSellerSidebarProps,
  defaultSellerNavigation,
} from "@letitrip/react-library";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Re-export types
export type { SellerNavItem } from "@letitrip/react-library";
export { defaultSellerNavigation };

interface MobileSellerSidebarProps
  extends Omit<
    LibraryMobileSellerSidebarProps,
    "LinkComponent" | "currentPath"
  > {}

export function MobileSellerSidebar(props: MobileSellerSidebarProps) {
  const pathname = usePathname();

  return (
    <LibraryMobileSellerSidebar
      {...props}
      currentPath={pathname}
      LinkComponent={Link as any}
    />
  );
}
