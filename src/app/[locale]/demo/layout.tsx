"use client";

import { type ReactNode } from "react";
import { RoleGuard } from "@mohasinac/appkit/client";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="admin">{children}</RoleGuard>;
}
