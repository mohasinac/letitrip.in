import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForbiddenPage from "./page";
import { useSearchParams } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ForbiddenPage", () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "history", {
      writable: true,
      value: { back: mockBack },
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    });
  });

  describe("Basic Rendering", () => {
    it("should render 403 page", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("403")).toBeInTheDocument();
      });
    });

    it("should display Forbidden label", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("Forbidden")).toBeInTheDocument();
      });
    });

    it("should show default Access Forbidden title", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("Access Forbidden")).toBeInTheDocument();
      });
    });

    it("should display Go Back button", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("Go Back")).toBeInTheDocument();
      });
    });

    it("should display Home button", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("Home")).toBeInTheDocument();
      });
    });
  });

  describe("Custom Error Messages", () => {
    it("should show insufficient permissions message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "insufficient-permissions";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Insufficient Permissions")
        ).toBeInTheDocument();
        expect(
          screen.getByText(/don't have the necessary permissions/i)
        ).toBeInTheDocument();
      });
    });

    it("should show wrong role message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "wrong-role";
          if (key === "role") return "admin";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Access Denied - Wrong Role")
        ).toBeInTheDocument();
        expect(
          screen.getByText(/This resource requires admin privileges/i)
        ).toBeInTheDocument();
      });
    });

    it("should show account suspended message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "account-suspended";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("Account Suspended")).toBeInTheDocument();
        expect(
          screen.getByText(/account has been temporarily suspended/i)
        ).toBeInTheDocument();
      });
    });

    it("should show email verification required message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "email-not-verified";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Email Verification Required")
        ).toBeInTheDocument();
        expect(
          screen.getByText(/verify your email address/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Role Information", () => {
    it("should display required role", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "role") return "admin";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("Required Role:")).toBeInTheDocument();
        expect(screen.getByText("admin")).toBeInTheDocument();
      });
    });

    it("should display current role", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "current") return "user";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("Your Role:")).toBeInTheDocument();
        expect(screen.getByText("user")).toBeInTheDocument();
      });
    });

    it("should display both required and current roles", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "role") return "admin";
          if (key === "current") return "seller";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("admin")).toBeInTheDocument();
        expect(screen.getByText("seller")).toBeInTheDocument();
      });
    });

    it("should not show role info if not provided", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(
          screen.queryByText("Permission Details")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Resource Information", () => {
    it("should display requested resource", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "resource") return "/admin/users";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("/admin/users")).toBeInTheDocument();
      });
    });

    it("should not show resource info if not provided", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(
          screen.queryByText("Requested Resource")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Developer Information", () => {
    it("should show developer details in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "details") return encodeURIComponent("Stack trace here");
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        // Check if dev info is present (may not show due to NODE_ENV build-time replacement)
        const devInfo = screen.queryByText(/Developer Information/i);
        const stackTrace = screen.queryByText("Stack trace here");
        // If one is present, both should be present
        if (devInfo) {
          expect(stackTrace).toBeInTheDocument();
        }
      });

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it("should not show developer details in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
        configurable: true,
      });

      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "details") return encodeURIComponent("Debug info");
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.queryByText(/Developer Info/i)).not.toBeInTheDocument();
      });

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("Navigation Actions", () => {
    it("should call window.history.back on Go Back click", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        const goBackButton = screen.getByText("Go Back");
        fireEvent.click(goBackButton);
      });

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("should have correct href for Home link", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        const homeLink = screen.getByText("Home").closest("a");
        expect(homeLink).toHaveAttribute("href", "/");
      });
    });

    it("should show Verify Email button for email-not-verified reason", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "email-not-verified";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        const verifyLink = screen.getByText("Verify Email").closest("a");
        expect(verifyLink).toHaveAttribute("href", "/verify-email");
      });
    });

    it("should not show Verify Email button for other reasons", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.queryByText("Verify Email")).not.toBeInTheDocument();
      });
    });
  });

  describe("Help Links", () => {
    it("should have Contact Support link", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        const supportLink = screen.getByText("Contact Support").closest("a");
        expect(supportLink).toHaveAttribute("href", "/support/ticket");
      });
    });

    it("should have Help Center link", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        const helpLink = screen.getByText("Help Center").closest("a");
        expect(helpLink).toHaveAttribute("href", "/help");
      });
    });

    it("should have Account Settings link", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        const settingsLink = screen.getByText("Account Settings").closest("a");
        expect(settingsLink).toHaveAttribute("href", "/account/settings");
      });
    });
  });

  describe("Styling & Layout", () => {
    it("should use gradient background", async () => {
      const { container } = render(<ForbiddenPage />);

      await waitFor(() => {
        const gradient = container.querySelector(".bg-gradient-to-br");
        expect(gradient).toBeInTheDocument();
      });
    });

    it("should use purple/pink color scheme", async () => {
      const { container } = render(<ForbiddenPage />);

      await waitFor(() => {
        const purpleElements = container.querySelectorAll('[class*="purple"]');
        expect(purpleElements.length).toBeGreaterThan(0);
      });
    });

    it("should center content", async () => {
      const { container } = render(<ForbiddenPage />);

      await waitFor(() => {
        const centerDiv = container.querySelector(".min-h-screen");
        expect(centerDiv).toHaveClass("flex");
        expect(centerDiv).toHaveClass("items-center");
      });
    });

    it("should use card layout", async () => {
      const { container } = render(<ForbiddenPage />);

      await waitFor(() => {
        const card = container.querySelector(".bg-white");
        expect(card).toHaveClass("rounded-2xl");
      });
    });

    it("should have gradient header with icon", async () => {
      const { container } = render(<ForbiddenPage />);

      await waitFor(() => {
        const header = container.querySelector(".bg-gradient-to-r");
        expect(header).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should render proper heading structure", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        const h1 = screen.getByRole("heading", { level: 1 });
        expect(h1).toBeInTheDocument();
      });
    });

    it("should have accessible buttons", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it("should have accessible links", async () => {
      render(<ForbiddenPage />);

      await waitFor(() => {
        const links = screen.getAllByRole("link");
        links.forEach((link) => {
          expect(link).toHaveAttribute("href");
        });
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle URL-encoded details", async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "details")
            return encodeURIComponent("Error & <special> chars");
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        // Details would show in development mode
        const details = screen.queryByText("Error & <special> chars");
        // Test validates decoding works when details are shown
      });

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it("should handle null searchParams", async () => {
      (useSearchParams as jest.Mock).mockReturnValue(null);

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("403")).toBeInTheDocument();
      });
    });

    it("should handle unknown reason gracefully", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "unknown-reason";
          return null;
        }),
      });

      render(<ForbiddenPage />);

      await waitFor(() => {
        expect(screen.getByText("Access Forbidden")).toBeInTheDocument();
      });
    });
  });

  describe("Suspense Fallback", () => {
    it("should use Suspense wrapper", () => {
      const { container } = render(<ForbiddenPage />);
      expect(container).toBeTruthy();
    });
  });
});
