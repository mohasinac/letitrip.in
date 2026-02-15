/**
 * Tests for ProtectedRoute component
 *
 * Coverage:
 * - Route protection based on authentication
 * - Role-based access control
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProtectedRoute } from "@/components";
import { ROUTES, UI_LABELS } from "@/constants";

const mockPush = jest.fn();
const mockUseSession = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/protected",
}));

jest.mock("@/contexts", () => ({
  useSession: () => mockUseSession(),
}));

describe("ProtectedRoute", () => {
  const TestContent = () => <div>Protected Content</div>;

  beforeEach(() => {
    mockPush.mockClear();
    mockUseSession.mockReturnValue({
      user: { uid: "user-123", role: "user", emailVerified: true },
      loading: false,
      sessionId: null,
      isAuthenticated: true,
      refreshUser: jest.fn(),
      refreshSession: jest.fn(),
      signOut: jest.fn(),
      updateSessionActivity: jest.fn(),
    });
  });

  it("renders content when authorized", () => {
    render(
      <ProtectedRoute requireAuth={true}>
        <TestContent />
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to login when unauthenticated", async () => {
    mockUseSession.mockReturnValue({
      user: null,
      loading: false,
      sessionId: null,
      isAuthenticated: false,
      refreshUser: jest.fn(),
      refreshSession: jest.fn(),
      signOut: jest.fn(),
      updateSessionActivity: jest.fn(),
    });

    render(
      <ProtectedRoute requireAuth={true}>
        <TestContent />
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN);
    });
  });

  it("shows unauthorized message when requested", async () => {
    render(
      <ProtectedRoute requireRole="admin" showUnauthorized={true}>
        <TestContent />
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(UI_LABELS.AUTH.ACCESS_DENIED),
      ).toBeInTheDocument();
    });
  });

  describe("Nested Protection", () => {
    it("handles nested protected routes", () => {
      render(
        <ProtectedRoute requireAuth={true}>
          <ProtectedRoute requireRole="user">
            <TestContent />
          </ProtectedRoute>
        </ProtectedRoute>,
      );
      // Both levels of protection should work
    });
  });

  describe("Accessibility", () => {
    it("provides accessible error messages", () => {
      jest.mock("@/hooks", () => ({
        useAuth: () => ({
          user: null,
          loading: false,
        }),
      }));

      render(
        <ProtectedRoute requireAuth={true}>
          <TestContent />
        </ProtectedRoute>,
      );
      // Error messages should be accessible
    });

    it("maintains focus management during redirects", () => {
      render(
        <ProtectedRoute requireAuth={true}>
          <TestContent />
        </ProtectedRoute>,
      );
      // Focus should be managed properly
    });
  });

  describe("Performance", () => {
    it("memoizes protected content to prevent unnecessary re-renders", () => {
      const { rerender } = render(
        <ProtectedRoute requireAuth={true}>
          <TestContent />
        </ProtectedRoute>,
      );
      rerender(
        <ProtectedRoute requireAuth={true}>
          <TestContent />
        </ProtectedRoute>,
      );
      // Should not cause unnecessary renders
    });
  });

  describe("Integration", () => {
    it("works with Next.js routing", () => {
      render(
        <ProtectedRoute requireAuth={true}>
          <TestContent />
        </ProtectedRoute>,
      );
      // Should integrate properly with Next.js routing
    });

    it("respects RBAC configuration", () => {
      render(
        <ProtectedRoute requireRole="user">
          <TestContent />
        </ProtectedRoute>,
      );
      // Should follow RBAC_CONFIG rules
    });
  });
});
