import type { ReactNode } from "react";
import { requireFeatureFlag } from "@/lib/features";

export default function Layout({ children }: { children: ReactNode }) {
  requireFeatureFlag("COUPONS");
  return <>{children}</>;
}
