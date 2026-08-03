import type { ReactNode } from "react";
import { RoleGuard } from "@mohasinac/appkit/client";
import { getFlag } from "@/lib/features";
import { UserLayoutClient } from "./UserLayoutClient";

export default function UserLayout({ children }: { children: ReactNode }) {
  const eventsOn = getFlag("EVENTS");
  const auctionsOn = getFlag("AUCTIONS");
  return (
    <RoleGuard>
      <UserLayoutClient flags={{ eventsOn, auctionsOn }}>{children}</UserLayoutClient>
    </RoleGuard>
  );
}
