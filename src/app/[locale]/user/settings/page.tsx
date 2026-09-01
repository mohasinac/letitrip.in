"use client";
import {useState, Suspense } from "react";
import { Link } from "@/i18n/navigation";
import {
  useAuth,
  ROUTES,
  ACTIONS,
  useForgotPassword,
  useLinkGoogleAccount,
  useProfile,
  useToast,
  Div,
  DynamicBgDiv,
  Row,
  Stack,
  Text,
  Button,
  NotificationPreferencesPanel,
  LinkedAccountsSection,
} from "@mohasinac/appkit/client";
import { Tabs, TabsList, TabsTrigger, Accordion, PaginatedSelect } from "@mohasinac/appkit/ui";
import type { AsyncPage, PaginatedSelectOption } from "@mohasinac/appkit/ui";
import { SUPPORTED_LANGUAGES, LANGUAGES_PAGE_SIZE } from "@/constants";
import { FontToggleClient, HandModeToggleClient } from "@/components";
import { API_ROUTES } from "@/constants";
import { ChangeEmailForm } from "@/components/user/ChangeEmailForm";



type Tab = "account" | "privacy" | "appearance" | "notifications";

const TAB_LABELS: Record<Tab, string> = {
  account: "Account",
  notifications: "Notifications",
  privacy: "Privacy",
  appearance: "Appearance",
};

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Stack padding="5" 
      gap="md"
      className="relative border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] overflow-hidden" rounded="xl" shadow="sm"
    >
      <DynamicBgDiv
        background="linear-gradient(to right,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)"
        className="absolute top-0 left-0 right-0 h-[3px]"
        aria-hidden="true"
      />
      {children}
    </Stack>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="tracking-widest text-[var(--appkit-color-text-muted)]" size="xs" weight="semibold" transform="uppercase">
      {children}
    </Text>
  );
}

// ─── Tab renderers ────────────────────────────────────────────────────────────

function renderAccountTab({
  user,
  handleSendPasswordReset,
  isSendingPasswordReset,
  passwordResetSent,
  googleLinked,
  googleLinkedEmail,
  onLinkGoogle,
  isLinkingGoogle,
}: {
  user: ReturnType<typeof useAuth>["user"];
  handleSendPasswordReset: () => void;
  isSendingPasswordReset: boolean;
  passwordResetSent: boolean;
  googleLinked?: boolean;
  googleLinkedEmail?: string | null;
  onLinkGoogle: () => void;
  isLinkingGoogle: boolean;
}) {
  return (
    <Stack gap="lg">
      <SectionCard>
        <SectionTitle>Account Info</SectionTitle>
        <Row justify="between" align="center" gap="md">
          <Div className="min-w-0">
            <Text className="text-[var(--appkit-color-text)] truncate" size="sm" weight="medium">
              {user?.displayName || user?.email?.split("@")[0] || "My Account"}
            </Text>
            {user?.email && (
              <Text variant="secondary" className="truncate" size="xs">{user.email}</Text>
            )}
          </Div>
          <Link
            href={String(ROUTES.USER.PROFILE)}
            className="shrink-0 text-[length:var(--appkit-text-xs)] font-medium text-[var(--appkit-color-primary)] hover:underline"
          >
            Edit profile →
          </Link>
        </Row>
      </SectionCard>

      <SectionCard>
        <Accordion title="Change Email">
          <ChangeEmailForm />
        </Accordion>
      </SectionCard>

      <SectionCard>
        <LinkedAccountsSection
          googleLinked={googleLinked}
          googleLinkedEmail={googleLinkedEmail}
          onLinkGoogle={onLinkGoogle}
          isLinking={isLinkingGoogle}
        />
      </SectionCard>

      <SectionCard>
        <Accordion title="Change Password">
          <Stack gap="md" padding="t-sm">
            <Div className="grid gap-[1rem] md:grid-cols-[1fr_240px]" align="start">
              <Stack gap="sm">
                <Text size="sm">
                  {passwordResetSent
                    ? `We sent a password reset link to ${user?.email || "your email"}. Click it to choose a new password.`
                    : `We'll email a secure reset link to ${user?.email || "your account email"}.`}
                </Text>
                <Div>
                  <Button
                    type="button"
                    onClick={handleSendPasswordReset}
                    isLoading={isSendingPasswordReset}
                    size="sm"
                  >
                    {passwordResetSent ? "Resend reset link" : ACTIONS.USER["update-password"].label}
                  </Button>
                </Div>
              </Stack>
              <Text variant="secondary" className="md:mt-1" size="xs">
                Changing your password requires access to your email inbox — that's what proves it's really you, so nobody with only a stolen browser session can lock you out of your account. The link expires in 1 hour.
              </Text>
            </Div>
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
        <Text variant="secondary" size="xs">
          Download a copy of your account data including your profile, addresses, and order history.
        </Text>
        <Div>
          <Button variant="outline" size="sm" onClick={() => window.open(API_ROUTES.USER.EXPORT, "_blank")}>
            Download My Data
          </Button>
        </Div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Delete Account</SectionTitle>
        <Text variant="secondary" size="xs">
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
        <SectionTitle>Layout</SectionTitle>
        <HandModeToggleClient />
      </SectionCard>

      <SectionCard>
        <SectionTitle>Language</SectionTitle>
        <Stack gap="xs">
          <Text variant="secondary" size="xs">Choose your display language. More are on the way.</Text>
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

function PageInner() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const { data: profile, refetch: refetchProfile } = useProfile({ enabled: !!user });
  const linkGoogle = useLinkGoogleAccount({
    onSuccess: () => {
      showToast("Google account connected.", "success");
      void refetchProfile();
    },
    onError: (err) => {
      showToast("Failed to connect Google account.", "error");
    },
  });

  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Password change is Firebase-only: it sends the same native reset-link
  // email as "Forgot Password", to the signed-in user's own address.
  // Completing it requires access to that inbox, which a stolen session
  // cookie alone can't provide — the identity proof the older custom
  // OTP-code flow existed for, achieved via inbox possession instead.
  const sendPasswordReset = useForgotPassword({
    onSuccess: () => {
      setPasswordResetSent(true);
      showToast("Password reset link sent — check your inbox.", "success");
    },
    onError: (err) => {
      showToast("Failed to send reset link.", "error");
    },
  });

  const handleSendPasswordReset = () => {
    if (!user?.email) {
      showToast("Your account has no email address on file.", "error");
      return;
    }
    sendPasswordReset.mutate({ email: user.email });
  };

  const [language, setLanguage] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("display-language") ?? "en";
  });

  const handleLanguageChange = (next: string) => {
    setLanguage(next);
    if (typeof window !== "undefined") localStorage.setItem("display-language", next);
    showToast("Language preference saved.", "success");
  };

  return (
    <Div className="w-full max-w-5xl">
      <Text className="text-[var(--appkit-color-text)] mb-6" size="xl" weight="bold">Settings</Text>

      <Div className="mb-6">
        <Tabs value={activeTab} onChange={(key) => setActiveTab(key as Tab)}>
          <TabsList>
            {(Object.keys(TAB_LABELS) as Tab[]).map((key) => (
              <TabsTrigger key={key} value={key}>{TAB_LABELS[key]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Div>

      {activeTab === "account" && renderAccountTab({
        user,
        handleSendPasswordReset,
        isSendingPasswordReset: sendPasswordReset.isPending,
        passwordResetSent,
        googleLinked: profile?.googleLinked, googleLinkedEmail: profile?.googleLinkedEmail,
        onLinkGoogle: () => linkGoogle.mutate(), isLinkingGoogle: linkGoogle.isLoading,
      })}
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

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
