"use client";

import { type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ROUTES,
  ProtectedRoute,
  useSession,
  type AuthGuardUser,
} from "@mohasinac/appkit/client";

export default function DemoLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  return (
    <ProtectedRoute
      user={user as AuthGuardUser | null}
      loading={loading}
      requireAuth
      requireRole="admin"
      onNavigate={(path) => router.push(path as Parameters<typeof router.push>[0])}
      routes={{
        loginPath: String(ROUTES.AUTH.LOGIN),
        unauthorizedPath: String(ROUTES.ERRORS.UNAUTHORIZED),
      }}
    >
      {children}
    </ProtectedRoute>
  );
}
