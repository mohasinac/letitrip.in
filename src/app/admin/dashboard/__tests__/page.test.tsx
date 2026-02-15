import { render, screen } from "@testing-library/react";
import type React from "react";
import AdminDashboardPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({
    user: { uid: "admin-1", role: "admin" },
    loading: false,
  }),
  useAdminStats: () => ({
    stats: { users: 0, orders: 0, revenue: 0 },
    isLoading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Spinner: () => <div data-testid="spinner" />,
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AdminStatsCards: () => <div data-testid="stats-cards" />,
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

jest.mock("@/components/admin/dashboard", () => ({
  QuickActionsGrid: () => <div data-testid="quick-actions" />,
  RecentActivityCard: () => <div data-testid="recent-activity" />,
}));

describe("Admin Dashboard Page", () => {
  it("renders dashboard content", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByText(UI_LABELS.ADMIN.DASHBOARD.TITLE),
    ).toBeInTheDocument();
    expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
  });
});
