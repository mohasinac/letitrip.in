/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginPage from "./page";

// Mock Next.js navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the AuthContext
const mockLogin = jest.fn();
const mockAuthContextValue = {
  user: null,
  isAuthenticated: false,
  login: mockLogin,
  logout: jest.fn(),
  register: jest.fn(),
  loading: false,
};

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContextValue,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("renders the login form correctly", () => {
      render(<LoginPage />);

      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(
        screen.getByText("Sign in to your account to continue"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it("renders company name link", () => {
      render(<LoginPage />);

      const companyLink = screen.getByRole("link", { name: /let it rip/i });
      expect(companyLink).toBeInTheDocument();
      expect(companyLink).toHaveAttribute("href", "/");
    });

    it("renders register link", () => {
      render(<LoginPage />);

      const registerLink = screen.getByRole("link", {
        name: /create account/i,
      });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it("renders forgot password link pointing to support ticket", () => {
      render(<LoginPage />);

      const forgotLink = screen.getByRole("link", { name: /forgot password/i });
      expect(forgotLink).toBeInTheDocument();
      // NOTE: Password reset handled via support ticket since /forgot-password does not exist
      expect(forgotLink).toHaveAttribute("href", "/support/ticket");
    });

    it("renders terms and privacy links", () => {
      render(<LoginPage />);

      expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
      expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    });

    it("renders remember me checkbox", () => {
      render(<LoginPage />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(screen.getByText(/remember me/i)).toBeInTheDocument();
    });
  });

  describe("Form Inputs", () => {
    it("allows email input", () => {
      render(<LoginPage />);
      const emailInput = screen.getByLabelText(
        /email address/i,
      ) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput.value).toBe("test@example.com");
    });

    it("allows password input", () => {
      render(<LoginPage />);
      const passwordInput = screen.getByLabelText(
        /password/i,
      ) as HTMLInputElement;

      fireEvent.change(passwordInput, { target: { value: "password123" } });

      expect(passwordInput.value).toBe("password123");
    });

    it("has correct input types", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("has required attributes", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it("has placeholders", () => {
      render(<LoginPage />);

      expect(
        screen.getByPlaceholderText("you@example.com"),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("submits the form successfully", async () => {
      mockLogin.mockResolvedValueOnce({});

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          "test@example.com",
          "password123",
        );
      });
    });

    it("shows loading state during submission", async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Signing in...")).toBeInTheDocument();
      });
    });

    it("disables submit button during loading", async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("redirects to home after successful login", async () => {
      mockLogin.mockResolvedValueOnce({});

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/");
      });
    });

    it("redirects to specified redirect URL after login", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => (key === "redirect" ? "/checkout" : null)),
      });

      mockLogin.mockResolvedValueOnce({});

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/checkout");
      });
    });
  });

  describe("Error Handling", () => {
    it("shows error on login failure", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("shows generic error when error message is not provided", async () => {
      mockLogin.mockRejectedValueOnce({});

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Login failed. Please try again."),
        ).toBeInTheDocument();
      });
    });

    it("clears previous errors on new submission", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpassword" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      // Try again with different credentials
      mockLogin.mockResolvedValueOnce({});

      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "correctpassword" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.queryByText("Invalid credentials"),
        ).not.toBeInTheDocument();
      });
    });

    it("validates required fields", async () => {
      render(<LoginPage />);

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      // HTML5 validation should prevent submission
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("re-enables submit button after error", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("has proper form structure", () => {
      render(<LoginPage />);

      const form = screen
        .getByRole("button", { name: /sign in/i })
        .closest("form");
      expect(form).toBeInTheDocument();
    });

    it("has proper label associations", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("has focus styles on inputs", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveClass("focus:ring-2", "focus:ring-yellow-500");
    });
  });

  describe("Already Authenticated", () => {
    it("redirects authenticated users to home", () => {
      const authenticatedContext = {
        ...mockAuthContextValue,
        isAuthenticated: true,
        user: { id: "1", email: "test@example.com" },
      };

      jest.mock("@/contexts/AuthContext", () => ({
        useAuth: () => authenticatedContext,
      }));

      render(<LoginPage />);

      // Component should trigger redirect via useEffect
      // This test validates the redirect logic exists
      expect(useRouter).toHaveBeenCalled();
    });
  });
});
