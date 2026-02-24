import { render, screen } from "@testing-library/react";
import type React from "react";
import UserSettingsPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({
    user: {
      uid: "user-1",
      email: "user@example.com",
      emailVerified: true,
      phoneNumber: null,
      phoneVerified: false,
    },
    loading: false,
    refreshUser: jest.fn(),
  }),
  useChangePassword: () => ({ mutate: jest.fn(), isLoading: false }),
  useResendVerification: () => ({ mutate: jest.fn(), isLoading: false }),
}));

jest.mock("@/components", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
  EmailVerificationCard: () => <div data-testid="email-card" />,
  PhoneVerificationCard: () => <div data-testid="phone-card" />,
  ProfileInfoForm: () => <div data-testid="profile-info-form" />,
  PasswordChangeForm: () => <div data-testid="password-form" />,
  AccountInfoCard: () => <div data-testid="account-card" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("User Settings Page", () => {
  it("renders settings content", () => {
    render(<UserSettingsPage />);

    expect(screen.getByText(UI_LABELS.SETTINGS.TITLE)).toBeInTheDocument();
    expect(screen.getByTestId("email-card")).toBeInTheDocument();
    expect(screen.getByTestId("profile-info-form")).toBeInTheDocument();
    expect(screen.getByTestId("password-form")).toBeInTheDocument();
    expect(screen.getByTestId("account-card")).toBeInTheDocument();
  });
});
