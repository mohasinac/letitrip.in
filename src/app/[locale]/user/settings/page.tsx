"use client";
import { useState } from "react";
import Link from "next/link";
import { UserSettingsView, useAuth, ROUTES, useChangePassword, useToast } from "@mohasinac/appkit/client";
import { FontToggleClient } from "@/components/user/FontToggleClient";

export default function Page() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useChangePassword({
    onSuccess: () => {
      showToast("Password changed successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      showToast(msg, "error");
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };

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
      renderPasswordForm={() => (
        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Change Password
          </p>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ background: "var(--appkit-color-primary)" }}
          >
            {changePassword.isPending ? "Updating…" : "Update Password"}
          </button>
        </form>
      )}
    />
  );
}
