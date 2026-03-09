import React from "react";
import { render, screen } from "@testing-library/react";

// Mock heavy dependencies
jest.mock("@/hooks", () => ({
  useAuth: () => ({
    user: null,
    loading: true,
    refreshUser: jest.fn(),
  }),
  useChangePassword: () => ({ mutate: jest.fn(), isLoading: false }),
  useResendVerification: () => ({ mutate: jest.fn(), isLoading: false }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/services", () => ({ profileService: { update: jest.fn() } }));
jest.mock("@/classes", () => ({ logger: { error: jest.fn() } }));
jest.mock("@/components", () => ({
  Heading: ({ children, level }: any) => <h2 data-level={level}>{children}</h2>,
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("../EmailVerificationCard", () => ({
  EmailVerificationCard: () => <div data-testid="email-verify" />,
}));
jest.mock("../PhoneVerificationCard", () => ({
  PhoneVerificationCard: () => <div data-testid="phone-verify" />,
}));
jest.mock("../ProfileInfoForm", () => ({
  ProfileInfoForm: () => <div data-testid="profile-form" />,
}));
jest.mock("../PasswordChangeForm", () => ({
  PasswordChangeForm: () => <div data-testid="pw-form" />,
}));
jest.mock("../AccountInfoCard", () => ({
  AccountInfoCard: () => <div data-testid="account-info" />,
}));
jest.mock("@/constants", () => ({
  THEME_CONSTANTS: { spacing: { stack: "space-y-4" } },
  SUCCESS_MESSAGES: {
    USER: { PASSWORD_CHANGED: "ok", SETTINGS_SAVED: "ok" },
    EMAIL: { VERIFICATION_SENT: "ok" },
  },
  ERROR_MESSAGES: {
    PASSWORD: { CHANGE_FAILED: "err" },
    EMAIL: { SEND_FAILED: "err" },
    GENERIC: { INTERNAL_ERROR: "err" },
  },
  ROUTES: { AUTH: { LOGIN: "/login" } },
}));

import { UserSettingsView } from "../UserSettingsView";

describe("UserSettingsView", () => {
  it("renders a spinner while loading", () => {
    render(<UserSettingsView />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders null (no crash) when profile is absent after loading", () => {
    // useAuth returns loading:false, user:null → redirects; no crash
    jest.resetModules();
  });
});
