import { Suspense, type ReactNode } from "react";
import { RoleGuard } from "@mohasinac/appkit/client";
import { getFlag } from "@/lib/features";
import { UserLayoutClient } from "./UserLayoutClient";

/*
 * Every route under this layout is auth-gated and reads the session, so none
 * can be meaningfully prerendered — and a route-segment config on a LAYOUT
 * governs the whole subtree.
 *
 * This is the fix for Root Cause #17 at the right level. `export const
 * dynamic` has NO effect in a "use client" file, which is what most dashboard
 * pages are, so it cannot be set on them; and a page-level <Suspense> around
 * the client tree does NOT satisfy Next 16 static export either — verified,
 * admin/moderation still failed with the boundary in place. The layout is the
 * one place that both applies and works.
 */
export const dynamic = "force-dynamic";


export default function UserLayout({ children }: { children: ReactNode }) {
  const eventsOn = getFlag("EVENTS");
  const auctionsOn = getFlag("AUCTIONS");
  const chatOn = getFlag("CHAT");
  return (
    <RoleGuard>
      <UserLayoutClient flags={{ eventsOn, auctionsOn, chatOn }}>
        <Suspense>{children}</Suspense>
      </UserLayoutClient>
    </RoleGuard>
  );
}
