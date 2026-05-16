"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  useAuth,
  ROUTES,
  ACTIONS,
  useChangePassword,
  useChangeEmail,
  useToast,
  Div,
  Row,
  Stack,
  Text,
  Input,
  Button,
  NotificationPreferencesPanel,
} from "@mohasinac/appkit/client";
import { FontToggleClient } from "@/components";
import { API_ROUTES } from "@/constants";

type Tab = "account" | "privacy" | "appearance" | "notifications";

const TAB_LABELS: Record<Tab, string> = {
  account: "Account",
  notifications: "Notifications",
  privacy: "Privacy",
  appearance: "Appearance",
};

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      gap="md"
      className="relative rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] overflow-hidden p-5 shadow-sm"
    >
      <Div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(to right,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)" }}
        aria-hidden="true"
      />
      {children}
    </Stack>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-widest text-[var(--appkit-color-text-muted)]">
      {children}
    </Text>
  );
}

// ─── Tab renderers ────────────────────────────────────────────────────────────

function renderAccountTab({
  user,
  newEmail,
  setNewEmail,
  emailPassword,
  setEmailPassword,
  handleEmailSubmit,
  changeEmail,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handlePasswordSubmit,
  changePassword,
}: {
  user: ReturnType<typeof useAuth>["user"];
  newEmail: string;
  setNewEmail: (v: string) => void;
  emailPassword: string;
  setEmailPassword: (v: string) => void;
  handleEmailSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  changeEmail: ReturnType<typeof useChangeEmail>;
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  handlePasswordSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  changePassword: ReturnType<typeof useChangePassword>;
}) {
  return (
    <Stack gap="lg">
      <SectionCard>
        <SectionTitle>Account Info</SectionTitle>
        <Row justify="between" align="center" gap="md">
          <Div className="min-w-0">
            <Text className="text-sm font-medium text-[var(--appkit-color-text)] truncate">
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

      <SectionCard>
        <SectionTitle>Change Email</SectionTitle>
        <Text variant="secondary" className="text-xs">
          A verification link will be sent to your new address. Your email updates after you click the link.
        </Text>
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <Input id="new-email" type="email" label="New Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required autoComplete="email" placeholder="new@example.com" />
          <Input id="email-password" type="password" label="Current Password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required autoComplete="current-password" />
          <Button type="submit" isLoading={changeEmail.isPending} size="sm">{ACTIONS.USER["send-verification-email"].label}</Button>
        </form>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Change Password</SectionTitle>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <Input id="current-password" type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
          <Input id="new-password" type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          <Input id="confirm-password" type="password" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          <Button type="submit" isLoading={changePassword.isPending} size="sm">{ACTIONS.USER["update-password"].label}</Button>
        </form>
      </SectionCard>
    </Stack>
  );
}

function renderPrivacyTab() {
  return (
    <Stack gap="lg">
      <SectionCard>
        <SectionTitle>Your Data</SectionTitle>
        <Text variant="secondary" className="text-xs">
          Download a copy of your account data including your profile, addresses, and order history.
        </Text>
        <Div>
          <Button variant="outline" size="sm" onClick={() => window.open("/api/user/export", "_blank")}>
            Download My Data
          </Button>
        </Div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Delete Account</SectionTitle>
        <Text variant="secondary" className="text-xs">
          To permanently delete your account and all associated data, please contact our support team.
          Account deletion is irreversible.
        </Text>
        <Div>
          <Button variant="danger" size="sm" asChild>
            <Link href={String(ROUTES.PUBLIC.SUPPORT)}>Contact Support →</Link>
          </Button>
        </Div>
      </SectionCard>
    </Stack>
  );
}

function renderAppearanceTab() {
  return (
    <Stack gap="lg">
      <SectionCard>
        <SectionTitle>Theme & Font</SectionTitle>
        <FontToggleClient />
      </SectionCard>

      <SectionCard>
        <SectionTitle>Language</SectionTitle>
        <Input id="language" label="Display Language" disabled defaultValue="English" helperText="Additional languages coming soon." />
      </SectionCard>
    </Stack>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Page() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("account");

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

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast("New passwords do not match.", "error"); return; }
    if (newPassword.length < 8) { showToast("Password must be at least 8 characters.", "error"); return; }
    changePassword.mutate({ currentPassword, newPassword });
  };

  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const changeEmail = useChangeEmail({
    onSuccess: () => {
      showToast(`Verification email sent to ${newEmail}. Click the link in the email to confirm your new address.`, "success");
      setEmailPassword("");
      setNewEmail("");
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Failed to update email.", "error");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmail || !emailPassword) return;
    changeEmail.mutate({ currentPassword: emailPassword, newEmail });
  };

  return (
    <Div className="w-full max-w-3xl">
      <Text className="text-xl font-bold text-[var(--appkit-color-text)] mb-6">Settings</Text>

      <Row gap="xs" className="mb-6 border-b border-[var(--appkit-color-border)]">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-[var(--appkit-color-cobalt)] text-[var(--appkit-color-cobalt)]"
                : "border-transparent text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]",
            ].join(" ")}
          >
            {TAB_LABELS[tab]}
          </Button>
        ))}
      </Row>

      {activeTab === "account" && renderAccountTab({ user, newEmail, setNewEmail, emailPassword, setEmailPassword, handleEmailSubmit, changeEmail, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, handlePasswordSubmit, changePassword })}
      {activeTab === "notifications" && (
        <NotificationPreferencesPanel
          fetchUrl={API_ROUTES.USER.NOTIFICATION_PREFERENCES}
          saveUrl={API_ROUTES.USER.NOTIFICATION_PREFERENCES}
        />
      )}
      {activeTab === "privacy" && renderPrivacyTab()}
      {activeTab === "appearance" && renderAppearanceTab()}
    </Div>
  );
}
