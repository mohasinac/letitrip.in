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
  Form,
  NotificationPreferencesPanel,
} from "@mohasinac/appkit/client";
import { TabStrip, Accordion, PaginatedSelect } from "@mohasinac/appkit/ui";
import type { AsyncPage, PaginatedSelectOption } from "@mohasinac/appkit/ui";
import { SUPPORTED_LANGUAGES, LANGUAGES_PAGE_SIZE } from "@/constants";
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
        // audit-inline-style-ok: runtime theme gradient
        style={{ background: "linear-gradient(to right,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)" }} // eslint-disable-line lir/no-inline-static-style
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
        <Accordion title="Change Email">
          <Stack gap="md" className="pt-3">
            <Text variant="secondary" className="text-xs">
              A verification link will be sent to your new address. Your email updates after you click the link.
            </Text>
            <Form onSubmit={handleEmailSubmit} className="grid gap-4 md:grid-cols-[1fr_240px] md:items-start">
              <Stack gap="sm">
                <Input id="new-email" type="email" label="New Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required autoComplete="email" placeholder="new@example.com" />
                <Input id="email-password" type="password" label="Current Password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required autoComplete="current-password" />
                <Div>
                  <Button type="submit" isLoading={changeEmail.isPending} size="sm">{ACTIONS.USER["send-verification-email"].label}</Button>
                </Div>
              </Stack>
              <Text variant="secondary" className="text-xs md:mt-1">
                We will email a confirmation link to your new address. Until you click it, your sign-in email stays the same. The link expires after 24 hours.
              </Text>
            </Form>
          </Stack>
        </Accordion>
      </SectionCard>

      <SectionCard>
        <Accordion title="Change Password">
          <Stack gap="md" className="pt-3">
            <Form onSubmit={handlePasswordSubmit} className="grid gap-4 md:grid-cols-[1fr_240px] md:items-start">
              <Stack gap="sm">
                <Input id="current-password" type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
                <Input id="new-password" type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                <Input id="confirm-password" type="password" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                <Div>
                  <Button type="submit" isLoading={changePassword.isPending} size="sm">{ACTIONS.USER["update-password"].label}</Button>
                </Div>
              </Stack>
              <Text variant="secondary" className="text-xs md:mt-1">
                Pick at least 8 characters. We recommend a mix of upper-case, numbers, and a symbol. After changing, you stay signed in on this device; other sessions are not signed out.
              </Text>
            </Form>
          </Stack>
        </Accordion>
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

function renderAppearanceTab({
  language,
  setLanguage,
}: {
  language: string;
  setLanguage: (v: string) => void;
}) {
  const loadLanguages = async (
    query: string,
    page: number,
  ): Promise<AsyncPage<PaginatedSelectOption<string>>> => {
    const filtered = SUPPORTED_LANGUAGES.filter((l) =>
      l.label.toLowerCase().includes(query.toLowerCase()),
    );
    const start = (page - 1) * LANGUAGES_PAGE_SIZE;
    const slice = filtered.slice(start, start + LANGUAGES_PAGE_SIZE);
    return {
      items: slice.map((l) => ({
        value: l.code,
        label: l.available ? l.label : `${l.label} — coming soon`,
        meta: { available: l.available },
      })),
      hasMore: start + LANGUAGES_PAGE_SIZE < filtered.length,
      nextPage: page + 1,
    };
  };

  return (
    <Stack gap="lg">
      <SectionCard>
        <SectionTitle>Theme & Font</SectionTitle>
        <FontToggleClient />
      </SectionCard>

      <SectionCard>
        <SectionTitle>Language</SectionTitle>
        <Stack gap="xs">
          <Text variant="secondary" className="text-xs">Choose your display language. More are on the way.</Text>
          <PaginatedSelect<string>
            value={language}
            onChange={(v, opt) => {
              if (!v || !opt) return;
              const meta = opt.meta as { available?: boolean } | undefined;
              if (meta?.available === false) return;
              setLanguage(v);
            }}
            loadOptions={loadLanguages}
            placeholder="Select language"
            searchPlaceholder="Search languages…"
            ariaLabel="Display language"
          />
        </Stack>
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
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("display-language") ?? "en";
  });

  const handleLanguageChange = (next: string) => {
    setLanguage(next);
    if (typeof window !== "undefined") localStorage.setItem("display-language", next);
    showToast("Language preference saved.", "success");
  };

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
    <Div className="w-full max-w-5xl">
      <Text className="text-xl font-bold text-[var(--appkit-color-text)] mb-6">Settings</Text>

      <Div className="mb-6">
        <TabStrip
          tabs={(Object.keys(TAB_LABELS) as Tab[]).map((key) => ({ key, label: TAB_LABELS[key] }))}
          activeKey={activeTab}
          onChange={(key: string) => setActiveTab(key as Tab)}
        />
      </Div>

      {activeTab === "account" && renderAccountTab({ user, newEmail, setNewEmail, emailPassword, setEmailPassword, handleEmailSubmit, changeEmail, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, handlePasswordSubmit, changePassword })}
      {activeTab === "notifications" && (
        <NotificationPreferencesPanel
          fetchUrl={API_ROUTES.USER.NOTIFICATION_PREFERENCES}
          saveUrl={API_ROUTES.USER.NOTIFICATION_PREFERENCES}
        />
      )}
      {activeTab === "privacy" && renderPrivacyTab()}
      {activeTab === "appearance" && renderAppearanceTab({ language, setLanguage: handleLanguageChange })}
    </Div>
  );
}
