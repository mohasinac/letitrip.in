/**
 * Tests for ForgotPasswordView component
 *
 * Coverage:
 * - Form rendering
 * - Email input and submit
 * - Loading state
 * - Error handling
 * - Success state (check email screen)
 * - Navigation back to login
 * - Send another email reset
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockPush = jest.fn();

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("@/hooks", () => ({
  useForgotPassword: jest.fn(),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick, disabled, type, variant }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  FormField: ({ label, name, value, onChange, disabled }: any) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  ),
  Heading: ({ children }: any) => <h2>{children}</h2>,
  Text: ({ children, className }: any) => (
    <p className={className}>{children}</p>
  ),
}));

jest.mock("@/constants", () => ({
  ROUTES: { AUTH: { LOGIN: "/auth/login" } },
  THEME_CONSTANTS: { spacing: { stack: "space-y-4", stackSmall: "space-y-2" } },
}));

import { ForgotPasswordView } from "../ForgotPasswordView";
import * as hooks from "@/hooks";

describe("ForgotPasswordView", () => {
  const mockMutate = jest.fn();
  const mockUseForgotPassword = hooks.useForgotPassword as jest.MockedFunction<
    typeof hooks.useForgotPassword
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseForgotPassword.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    } as any);
  });

  describe("Form rendering", () => {
    it("renders the email form by default", () => {
      render(<ForgotPasswordView />);
      expect(screen.getByText("forgotPassword.pageTitle")).toBeInTheDocument();
      expect(screen.getByText("forgotPassword.subtitle")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "forgotPassword.sendResetEmail" }),
      ).toBeInTheDocument();
    });

    it("renders email input field", () => {
      render(<ForgotPasswordView />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders link back to login", () => {
      render(<ForgotPasswordView />);
      const link = screen.getByRole("link", {
        name: "forgotPassword.signInLink",
      });
      expect(link).toHaveAttribute("href", "/auth/login");
    });
  });

  describe("Email input", () => {
    it("updates email state on input change", () => {
      render(<ForgotPasswordView />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "user@example.com" } });
      expect(input).toHaveValue("user@example.com");
    });

    it("submit button is disabled when email is empty", () => {
      render(<ForgotPasswordView />);
      const btn = screen.getByRole("button", {
        name: "forgotPassword.sendResetEmail",
      });
      expect(btn).toBeDisabled();
    });

    it("submit button is enabled when email is entered", () => {
      render(<ForgotPasswordView />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "user@example.com" },
      });
      expect(
        screen.getByRole("button", { name: "forgotPassword.sendResetEmail" }),
      ).not.toBeDisabled();
    });
  });

  describe("Loading state", () => {
    it("shows sending text when isLoading is true", () => {
      mockUseForgotPassword.mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
      } as any);
      render(<ForgotPasswordView />);
      expect(screen.getByText("forgotPassword.sending")).toBeInTheDocument();
    });

    it("disables submit button when loading", () => {
      mockUseForgotPassword.mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
      } as any);
      render(<ForgotPasswordView />);
      expect(
        screen.getByRole("button", { name: "forgotPassword.sending" }),
      ).toBeDisabled();
    });

    it("disables form field when loading", () => {
      mockUseForgotPassword.mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
      } as any);
      render(<ForgotPasswordView />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("Form submission", () => {
    it("calls forgotPassword mutate with trimmed email on submit", async () => {
      render(<ForgotPasswordView />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "  user@example.com  " },
      });
      fireEvent.submit(
        screen
          .getByRole("button", { name: "forgotPassword.sendResetEmail" })
          .closest("form")!,
      );
      await waitFor(() =>
        expect(mockMutate).toHaveBeenCalledWith({ email: "user@example.com" }),
      );
    });
  });

  describe("Error handling", () => {
    it("displays error alert when onError is triggered", async () => {
      mockUseForgotPassword.mockImplementation(({ onError }: any) => {
        return {
          mutate: () => onError({ message: "Email not found" }),
          isLoading: false,
        };
      });
      render(<ForgotPasswordView />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "bad@email.com" },
      });
      fireEvent.submit(
        screen
          .getByRole("button", { name: "forgotPassword.sendResetEmail" })
          .closest("form")!,
      );
      await waitFor(() => {
        expect(screen.getByTestId("alert")).toHaveAttribute(
          "data-variant",
          "error",
        );
        expect(screen.getByTestId("alert")).toHaveTextContent(
          "Email not found",
        );
      });
    });

    it("uses fallback message when error has no message", async () => {
      mockUseForgotPassword.mockImplementation(({ onError }: any) => ({
        mutate: () => onError({}),
        isLoading: false,
      }));
      render(<ForgotPasswordView />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "test@email.com" },
      });
      fireEvent.submit(
        screen
          .getByRole("button", { name: "forgotPassword.sendResetEmail" })
          .closest("form")!,
      );
      await waitFor(() =>
        expect(screen.getByTestId("alert")).toHaveTextContent(
          "forgotPassword.failedSendEmail",
        ),
      );
    });
  });

  describe("Success state", () => {
    it("shows success screen after onSuccess callback fires", async () => {
      mockUseForgotPassword.mockImplementation(({ onSuccess }: any) => ({
        mutate: () => onSuccess(),
        isLoading: false,
      }));
      render(<ForgotPasswordView />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "user@example.com" },
      });
      fireEvent.submit(
        screen
          .getByRole("button", { name: "forgotPassword.sendResetEmail" })
          .closest("form")!,
      );
      await waitFor(() => {
        expect(
          screen.getByText("forgotPassword.checkEmail"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("forgotPassword.linkExpires"),
        ).toBeInTheDocument();
      });
    });

    it("navigates to login when Return to Login is clicked on success screen", async () => {
      mockUseForgotPassword.mockImplementation(({ onSuccess }: any) => ({
        mutate: () => onSuccess(),
        isLoading: false,
      }));
      render(<ForgotPasswordView />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "user@example.com" },
      });
      fireEvent.submit(
        screen
          .getByRole("button", { name: "forgotPassword.sendResetEmail" })
          .closest("form")!,
      );
      await waitFor(() => screen.getByText("forgotPassword.returnToLogin"));
      fireEvent.click(screen.getByText("forgotPassword.returnToLogin"));
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });

    it("resets to form when Send Another Email is clicked", async () => {
      mockUseForgotPassword.mockImplementation(({ onSuccess }: any) => ({
        mutate: () => onSuccess(),
        isLoading: false,
      }));
      render(<ForgotPasswordView />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "user@example.com" },
      });
      fireEvent.submit(
        screen
          .getByRole("button", { name: "forgotPassword.sendResetEmail" })
          .closest("form")!,
      );
      await waitFor(() => screen.getByText("forgotPassword.sendAnotherEmail"));
      fireEvent.click(screen.getByText("forgotPassword.sendAnotherEmail"));
      expect(screen.getByText("forgotPassword.pageTitle")).toBeInTheDocument();
      expect(
        screen.queryByText("forgotPassword.checkEmail"),
      ).not.toBeInTheDocument();
    });
  });
});
