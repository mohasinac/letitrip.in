import { Suspense, type ReactNode } from "react";
import { RoleGuard } from "@mohasinac/appkit/client";
import { UserLayoutClient } from "./UserLayoutClient";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard>
      <UserLayoutClient>
        <Suspense>{children}</Suspense>
      </UserLayoutClient>
    </RoleGuard>
  );
}
