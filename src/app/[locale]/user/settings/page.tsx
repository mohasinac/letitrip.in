"use client";
import Link from "next/link";
import { UserSettingsView, useAuth, ROUTES } from "@mohasinac/appkit/client";
import { FontToggleClient } from "@/components/user/FontToggleClient";

export default function Page() {
  const { user } = useAuth();

  return (
    <UserSettingsView
      labels={{ title: "Settings" }}
      renderAccountInfo={() => (
        <div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Account
          </p>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {user?.displayName || user?.email?.split("@")[0] || "My Account"}
              </p>
              {user?.email && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
              )}
            </div>
            <Link
              href={String(ROUTES.USER.PROFILE)}
              className="shrink-0 text-xs font-medium text-primary dark:text-primary-400 hover:underline"
            >
              Edit profile →
            </Link>
          </div>
        </div>
      )}
      renderAppearance={() => (
        <div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Appearance
          </p>
          <FontToggleClient />
        </div>
      )}
    />
  );
}
