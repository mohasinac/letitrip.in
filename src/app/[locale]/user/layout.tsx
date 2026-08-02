import type { ReactNode } from "react";
import { RoleGuard } from "@mohasinac/appkit/client";
import { getFlag } from "@/lib/features";
import { UserLayoutClient } from "./UserLayoutClient";

export default function UserLayout({ children }: { children: ReactNode }) {
  const auctionsOn = getFlag("AUCTIONS");
  return (
    <RoleGuard>
      <UserLayoutClient flags={{ auctionsOn }}>{children}</UserLayoutClient>
    </RoleGuard>
  );
}
