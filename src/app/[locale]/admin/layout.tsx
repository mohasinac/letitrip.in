"use client";

import { ReactNode, useState } from "react";
import { ProtectedRoute, Main } from "@/components";
import { AdminSidebar, AdminTopBar } from "@/features/admin";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute requireAuth requireRole="admin">
      <div className="flex h-screen overflow-hidden bg-slate-950">
        <AdminSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopBar onMenuOpen={() => setMobileOpen(true)} />
          <Main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/30">
            {children}
          </Main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
