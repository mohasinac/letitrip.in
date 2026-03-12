"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { AvatarDisplay, Button, NotificationBell } from "@/components";
import AutoBreadcrumbs from "@/components/layout/AutoBreadcrumbs";
import { useAuth } from "@/hooks";
import { RoleBadge } from "@/components";

interface AdminTopBarProps {
  onMenuOpen: () => void;
}

/**
 * AdminTopBar
 *
 * Sticky top bar for the admin portal.
 * Left: hamburger (mobile) + AutoBreadcrumbs.
 * Right: NotificationBell + AvatarDisplay + role badge.
 */
export function AdminTopBar({ onMenuOpen }: AdminTopBarProps) {
  const { user } = useAuth();
  const t = useTranslations("nav");

  return (
    <header className="h-14 flex-shrink-0 flex items-center px-4 md:px-6 justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      {/* Left: hamburger + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuOpen}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label={t("mobileNav")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <AutoBreadcrumbs />
        </div>
      </div>

      {/* Right: notification + avatar + role */}
      {user && (
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <NotificationBell />
          <AvatarDisplay
            cropData={
              user.photoURL
                ? { url: user.photoURL, position: { x: 50, y: 50 }, zoom: 1 }
                : null
            }
            displayName={user.displayName ?? user.email ?? ""}
            email={user.email ?? ""}
            size="sm"
          />
          <RoleBadge role={user.role} />
        </div>
      )}
    </header>
  );
}
