"use client";

import { usePathname } from "next/navigation";

export function useIsAdminRoute(): boolean {
  const pathname = usePathname() || "";
  return pathname.startsWith("/admin");
}
