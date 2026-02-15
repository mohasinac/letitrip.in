import { render, screen } from "@testing-library/react";
import type React from "react";
import { AdminSessionsManager } from "@/components";

jest.mock("@/hooks", () => ({
  useAdminSessions: () => ({
    data: {
      stats: {
        totalActive: 1,
        uniqueUsers: 1,
        recentActivity: 1,
        totalExpired: 0,
      },
      sessions: [
        {
          id: "session-1",
          userId: "user-1",
          user: {
            displayName: "User",
            email: "user@example.com",
            role: "admin",
          },
          deviceInfo: {
            browser: "Browser",
            os: "OS",
            device: "Device",
            ip: "127.0.0.1",
          },
          location: { city: "City", country: "Country" },
          lastActivity: new Date().toISOString(),
          isActive: true,
          expiresAt: new Date(Date.now() + 1000).toISOString(),
        },
      ],
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useRevokeSession: () => ({ mutate: jest.fn(), isLoading: false }),
  useRevokeUserSessions: () => ({ mutate: jest.fn(), isLoading: false }),
}));

jest.mock("@/utils", () => ({
  formatRelativeTime: () => "0",
  formatDate: () => "0",
}));

jest.mock("@/components/feedback/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("AdminSessionsManager", () => {
  it("renders session rows", () => {
    render(<AdminSessionsManager />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });
});
