"use client";

import {
  TabNav as LibraryTabNav,
  type TabNavProps as LibraryTabNavProps,
} from "@letitrip/react-library";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Re-export Tab type from library
export type { Tab } from "@letitrip/react-library";

// Next.js specific props (remove injected props)
interface TabNavProps
  extends Omit<LibraryTabNavProps, "LinkComponent" | "currentPath"> {}

export function TabNav(props: TabNavProps) {
  const pathname = usePathname();

  return (
    <LibraryTabNav
      {...props}
      LinkComponent={Link as any}
      currentPath={pathname}
    />
  );
}
