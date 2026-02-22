import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockUseAuth = jest.fn();
const mockUseApiQuery = jest.fn();
const mockUseApiMutation = jest
  .fn()
  .mockReturnValue({ mutate: jest.fn(), isLoading: false });
const mockUseMessage = jest
  .fn()
  .mockReturnValue({ showSuccess: jest.fn(), showError: jest.fn() });
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/seller/payouts",
}));

jest.mock("@/hooks", () => ({
  useAuth: () => mockUseAuth(),
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
  useApiMutation: (...args: any[]) => mockUseApiMutation(...args),
  useMessage: () => mockUseMessage(),
}));

jest.mock("@/components", () => ({
  SellerPayoutStats: ({
    summary,
    isLoading,
  }: {
    summary: any;
    isLoading: boolean;
  }) => (
    <div data-testid="payout-stats">
      {isLoading
        ? "Loading..."
        : summary
          ? `Available: ${summary.availableBalance}`
          : "No stats"}
    </div>
  ),
  SellerPayoutRequestForm: ({
    summary,
    onSubmit,
  }: {
    summary: any;
    onSubmit: (p: any) => void;
  }) => (
    <div data-testid="payout-request-form">
      <button onClick={() => onSubmit({ amount: summary?.availableBalance })}>
        Request Payout
      </button>
    </div>
  ),
  SellerPayoutHistoryTable: ({
    payouts,
    isLoading,
  }: {
    payouts: any[];
    isLoading: boolean;
  }) => (
    <div data-testid="payout-history-table">
      {isLoading ? "Loading history..." : `${payouts.length} payouts`}
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    LOADING: { DEFAULT: "Loading..." },
    SELLER_PAYOUTS: {
      PAGE_TITLE: "Payouts",
      PAGE_SUBTITLE: "Manage your earnings",
      STATUS_PENDING: "Payout requested",
      NO_EARNINGS: "No earnings to pay out",
    },
  },
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    SELLER: { DASHBOARD: "/seller" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: { stack: "space-y-4", padding: { lg: "p-6" } },
    typography: { h2: "text-3xl font-bold" },
  },
  API_ENDPOINTS: {
    SELLER: { PAYOUTS: "/api/seller/payouts" },
  },
}));

import SellerPayoutsPage from "../page";

describe("SellerPayoutsPage", () => {
  const mockSeller = {
    uid: "seller-1",
    email: "seller@example.com",
    role: "seller",
  };
  const mockSummary = {
    availableBalance: 5000,
    pendingBalance: 1500,
    totalPaidOut: 20000,
    minimumPayout: 1000,
  };
  const mockPayouts = [
    {
      id: "pay-1",
      amount: 5000,
      status: "paid",
      requestedAt: "2026-01-01",
      paidAt: "2026-01-05",
    },
    {
      id: "pay-2",
      amount: 3000,
      status: "pending",
      requestedAt: "2026-02-01",
      paidAt: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    render(<SellerPayoutsPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders payout stats component", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: { data: { summary: mockSummary, payouts: mockPayouts } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<SellerPayoutsPage />);
    expect(screen.getByTestId("payout-stats")).toBeInTheDocument();
  });

  it("renders payout request form when summary is available", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: { data: { summary: mockSummary, payouts: mockPayouts } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<SellerPayoutsPage />);
    expect(screen.getByTestId("payout-request-form")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /request payout/i }),
    ).toBeInTheDocument();
  });

  it("renders payout history table", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: { data: { summary: mockSummary, payouts: mockPayouts } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<SellerPayoutsPage />);
    expect(screen.getByTestId("payout-history-table")).toBeInTheDocument();
    expect(screen.getByText("2 payouts")).toBeInTheDocument();
  });
});
