"use client";

import { Button } from "@mohasinac/appkit/ui";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { AvatarDisplay, NotificationBell, AutoBreadcrumbs } from "@/components";
import { useAuth } from "@/hooks";
import { RoleBadge } from "@/components";

interface AdminTopBarProps {
  onMenuOpen: () => void;
  onDesktopToggle: () => void;
  desktopSidebarOpen: boolean;
}

/**
 * AdminTopBar
 *
 * Sticky top bar for the admin portal.
 * Left: hamburger (mobile) + sidebar toggle (desktop) + AutoBreadcrumbs.
 * Right: NotificationBell + AvatarDisplay + role badge.
 */
export function AdminTopBar({
  onMenuOpen,
  onDesktopToggle,
  desktopSidebarOpen,
}: AdminTopBarProps) {
  const { user } = useAuth();
  const t = useTranslations("nav");

  return (
    <header className="h-14 flex-shrink-0 flex items-center px-4 md:px-6 justify-between border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      {/* Left: hamburger + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile: open drawer */}
        <Button
          variant="ghost"
          onClick={onMenuOpen}
          className={`md:hidden ${THEME_CONSTANTS.flex.center} w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors`}
          aria-label={t("mobileNav")}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* Desktop: collapse/expand sidebar */}
        <Button
          variant="ghost"
          onClick={onDesktopToggle}
          className={`hidden md:flex ${THEME_CONSTANTS.flex.center} w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors`}
          aria-label={
            desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
          }
        >
          {desktopSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
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
