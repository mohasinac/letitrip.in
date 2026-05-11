"use client";
import { useState } from "react";
import Link from "next/link";
import {
  useAuth,
  ROUTES,
  useChangePassword,
  useChangeEmail,
  useToast,
  Div,
  Row,
  Stack,
  Text,
} from "@mohasinac/appkit/client";
import { FontToggleClient } from "@/components/user/FontToggleClient";

type Tab = "account" | "privacy" | "appearance";

const TAB_LABELS: Record<Tab, string> = {
  account: "Account",
  privacy: "Privacy",
  appearance: "Appearance",
};

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
      {children}
    </Div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      {children}
    </Text>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
    >
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 " +
        "px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 " +
        "focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)] " +
        (props.className ?? "")
      }
    />
  );
}

function SubmitButton({
  isPending,
  label,
  pendingLabel,
}: {
  isPending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-colors"
      style={{ background: "var(--appkit-color-primary)" }}
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}

export default function Page() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("account");

  // --- password change ---
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
      showToast(err instanceof Error ? err.message : "Failed to change password.", "error");
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

  // --- email change ---
  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const changeEmail = useChangeEmail({
    onSuccess: () => {
      showToast(
        `Verification email sent to ${newEmail}. Please click the link in the email to confirm your new address.`,
        "success",
      );
      setEmailPassword("");
      setNewEmail("");
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Failed to update email.", "error");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !emailPassword) return;
    changeEmail.mutate({ currentPassword: emailPassword, newEmail });
  };

  // --- data export ---
  const handleExport = () => {
    window.open("/api/user/export", "_blank");
  };

  return (
    <Div className="max-w-2xl mx-auto px-4 py-8">
      <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Settings</Text>

      {/* tab bar */}
      <Row gap="xs" className="mb-6 border-b border-zinc-200 dark:border-slate-700">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-[var(--appkit-color-primary)] text-[var(--appkit-color-primary)]"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
            ].join(" ")}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </Row>

      {/* Account tab */}
      {activeTab === "account" && (
        <Stack gap="lg">
          {/* account info */}
          <SectionCard>
            <SectionTitle>Account Info</SectionTitle>
            <Row justify="between" align="center" gap="md">
              <Div className="min-w-0">
                <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.displayName || user?.email?.split("@")[0] || "My Account"}
                </Text>
                {user?.email && (
                  <Text variant="secondary" className="text-xs truncate">{user.email}</Text>
                )}
              </Div>
              <Link
                href={String(ROUTES.USER.PROFILE)}
                className="shrink-0 text-xs font-medium text-[var(--appkit-color-primary)] hover:underline"
              >
                Edit profile →
              </Link>
            </Row>
          </SectionCard>

          {/* email change */}
          <SectionCard>
            <SectionTitle>Change Email</SectionTitle>
            <Text variant="secondary" className="text-xs">
              A verification link will be sent to your new address. Your email will update after you click the link.
            </Text>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <Div className="space-y-1">
                <FieldLabel htmlFor="new-email">New Email Address</FieldLabel>
                <TextInput
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="new@example.com"
                />
              </Div>
              <Div className="space-y-1">
                <FieldLabel htmlFor="email-password">Current Password</FieldLabel>
                <TextInput
                  id="email-password"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Div>
              <SubmitButton
                isPending={changeEmail.isPending}
                label="Send Verification Email"
                pendingLabel="Sending…"
              />
            </form>
          </SectionCard>

          {/* password change */}
          <SectionCard>
            <SectionTitle>Change Password</SectionTitle>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <Div className="space-y-1">
                <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
                <TextInput
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Div>
              <Div className="space-y-1">
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <TextInput
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </Div>
              <Div className="space-y-1">
                <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
                <TextInput
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Div>
              <SubmitButton
                isPending={changePassword.isPending}
                label="Update Password"
                pendingLabel="Updating…"
              />
            </form>
          </SectionCard>
        </Stack>
      )}

      {/* Privacy tab */}
      {activeTab === "privacy" && (
        <Stack gap="lg">
          <SectionCard>
            <SectionTitle>Your Data</SectionTitle>
            <Text variant="secondary" className="text-xs">
              Download a copy of your account data including your profile, addresses, and order history.
            </Text>
            <button
              onClick={handleExport}
              className="rounded-xl border border-zinc-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
            >
              Download My Data
            </button>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Delete Account</SectionTitle>
            <Text variant="secondary" className="text-xs">
              To permanently delete your account and all associated data, please contact our support team.
              Account deletion is irreversible.
            </Text>
            <Link
              href={String(ROUTES.PUBLIC.SUPPORT)}
              className="inline-block rounded-xl border border-red-200 dark:border-red-900 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Contact Support →
            </Link>
          </SectionCard>
        </Stack>
      )}

      {/* Appearance tab */}
      {activeTab === "appearance" && (
        <Stack gap="lg">
          <SectionCard>
            <SectionTitle>Theme & Font</SectionTitle>
            <FontToggleClient />
          </SectionCard>

          <SectionCard>
            <SectionTitle>Language</SectionTitle>
            <Div className="space-y-1">
              <FieldLabel htmlFor="language">Display Language</FieldLabel>
              <select
                id="language"
                defaultValue="en"
                disabled
                className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none opacity-60 cursor-not-allowed"
              >
                <option value="en">English</option>
              </select>
              <Text variant="secondary" className="text-xs">
                Additional languages coming soon.
              </Text>
            </Div>
          </SectionCard>
        </Stack>
      )}
    </Div>
  );
}
