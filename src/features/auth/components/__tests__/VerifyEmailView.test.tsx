/**
 * Tests for VerifyEmailView component
 *
 * Coverage:
 * - Loading/verifying state (token present)
 * - Success state
 * - Error state (bad token)
 * - No-token error state
 * - Navigation (go to profile, go to home)
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

jest.mock("@/hooks", () => ({
  useVerifyEmail: jest.fn(),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  Spinner: ({ size, variant: v }: any) => (
    <div data-testid="spinner" data-size={size} data-variant={v} />
  ),
  Heading: ({ children }: any) => <h2>{children}</h2>,
  Text: ({ children, className }: any) => (
    <p className={className}>{children}</p>
  ),
}));

jest.mock("@/constants", () => ({
  ROUTES: { USER: { PROFILE: "/user/profile" }, HOME: "/" },
  THEME_CONSTANTS: { spacing: { stackSmall: "space-y-2" } },
}));

// VerifyEmailView renders Suspense + VerifyEmailContent.
// useSearchParams requires Suspense in Next.js — we mock it so it resolves immediately.
jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    Suspense: ({ children }: any) => <>{children}</>,
  };
});

import { VerifyEmailView } from "../VerifyEmailView";
import * as hooks from "@/hooks";

describe("VerifyEmailView", () => {
  const mockMutate = jest.fn();
  const mockUseVerifyEmail = hooks.useVerifyEmail as jest.MockedFunction<
    typeof hooks.useVerifyEmail
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParamsGet.mockReturnValue("valid-token-123");
    mockUseVerifyEmail.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    } as any);
  });

  describe("Loading state", () => {
    it("shows verifying title when isLoading is true", () => {
      mockUseVerifyEmail.mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
      } as any);
      render(<VerifyEmailView />);
      expect(
        screen.getByText("verifyEmail.verifyingTitle"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("verifyEmail.verifyingMessage"),
      ).toBeInTheDocument();
    });
  });

  describe("Token handling", () => {
    it("calls verifyEmail with the token on mount", () => {
      mockSearchParamsGet.mockReturnValue("abc123");
      render(<VerifyEmailView />);
      expect(mockMutate).toHaveBeenCalledWith({ token: "abc123" });
    });

    it("sets no-token error when token is absent", () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockUseVerifyEmail.mockImplementation(({ onError }: any) => {
        // no-op: error is set via useEffect when token is null, not via onError
        return { mutate: mockMutate, isLoading: false };
      });
      render(<VerifyEmailView />);
      // error state renders: verifyEmail.failed heading
      expect(screen.getByText("verifyEmail.failed")).toBeInTheDocument();
      expect(screen.getByTestId("alert")).toHaveTextContent(
        "verifyEmail.noToken",
      );
    });
  });

  describe("Success state", () => {
    it("shows success heading after onSuccess fires", async () => {
      mockUseVerifyEmail.mockImplementation(({ onSuccess }: any) => {
        // trigger onSuccess immediately
        setTimeout(() => onSuccess(), 0);
        return { mutate: mockMutate, isLoading: false };
      });
      render(<VerifyEmailView />);
      await waitFor(() =>
        expect(screen.getByText("verifyEmail.success")).toBeInTheDocument(),
      );
      expect(
        screen.getByText("verifyEmail.successMessage"),
      ).toBeInTheDocument();
    });

    it("navigates to profile when Go to Profile is clicked on success", async () => {
      mockUseVerifyEmail.mockImplementation(({ onSuccess }: any) => {
        setTimeout(() => onSuccess(), 0);
        return { mutate: mockMutate, isLoading: false };
      });
      render(<VerifyEmailView />);
      await waitFor(() => screen.getByText("verifyEmail.goToProfile"));
      fireEvent.click(screen.getByText("verifyEmail.goToProfile"));
      expect(mockPush).toHaveBeenCalledWith("/user/profile");
    });
  });

  describe("Error state", () => {
    it("shows error heading and alert when onError fires", async () => {
      mockUseVerifyEmail.mockImplementation(({ onError }: any) => {
        setTimeout(() => onError({ message: "Token expired" }), 0);
        return { mutate: mockMutate, isLoading: false };
      });
      render(<VerifyEmailView />);
      await waitFor(() =>
        expect(screen.getByText("verifyEmail.failed")).toBeInTheDocument(),
      );
      expect(screen.getByTestId("alert")).toHaveTextContent("Token expired");
    });

    it("navigates to home when Go to Home is clicked on error", async () => {
      mockUseVerifyEmail.mockImplementation(({ onError }: any) => {
        setTimeout(() => onError({ message: "Invalid" }), 0);
        return { mutate: mockMutate, isLoading: false };
      });
      render(<VerifyEmailView />);
      await waitFor(() => screen.getByText("verifyEmail.goToHome"));
      fireEvent.click(screen.getByText("verifyEmail.goToHome"));
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("navigates to profile from error state via Go to Profile button", async () => {
      mockUseVerifyEmail.mockImplementation(({ onError }: any) => {
        setTimeout(() => onError({ message: "Bad token" }), 0);
        return { mutate: mockMutate, isLoading: false };
      });
      render(<VerifyEmailView />);
      await waitFor(() => screen.getByText("verifyEmail.goToProfile"));
      const profileBtns = screen.getAllByText("verifyEmail.goToProfile");
      fireEvent.click(profileBtns[0]);
      expect(mockPush).toHaveBeenCalledWith("/user/profile");
    });
  });
});
