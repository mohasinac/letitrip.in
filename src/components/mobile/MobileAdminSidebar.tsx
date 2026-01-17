"use client";

import {
  MobileAdminSidebar as LibraryMobileAdminSidebar,
  type MobileAdminSidebarProps as LibraryMobileAdminSidebarProps,
  defaultAdminNavigation,
} from "@letitrip/react-library";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Re-export types
export type { NavItem } from "@letitrip/react-library";
export { defaultAdminNavigation };

interface MobileAdminSidebarProps
  extends Omit<
    LibraryMobileAdminSidebarProps,
    "LinkComponent" | "currentPath"
  > {}

export function MobileAdminSidebar(props: MobileAdminSidebarProps) {
  const pathname = usePathname();

  return (
    <LibraryMobileAdminSidebar
      {...props}
      currentPath={pathname}
      LinkComponent={Link as any}
    />
  );
}
