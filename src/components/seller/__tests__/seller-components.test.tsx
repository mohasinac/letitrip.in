import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SellerAnalyticsStats } from "../SellerAnalyticsStats";
import { SellerPayoutStats } from "../SellerPayoutStats";
import { SellerPayoutHistoryTable } from "../SellerPayoutHistoryTable";
import { SellerPayoutRequestForm } from "../SellerPayoutRequestForm";
import { SellerTopProducts } from "../SellerTopProducts";

// SellerRevenueChart uses recharts — mock it to avoid canvas errors
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}));

// SellerRevenueChart uses useTheme — mock ThemeContext
jest.mock("@/contexts", () => ({
  useTheme: () => ({ theme: "light", setTheme: jest.fn() }),
}));
import { SellerRevenueChart } from "../SellerRevenueChart";

// ── Shared fixtures ─────────────────────────────────────────────────────────

const analyticsSummary = {
  totalOrders: 42,
  totalRevenue: 100000,
  totalProducts: 10,
  publishedProducts: 7,
};

const payoutSummary = {
  availableEarnings: 5000,
  totalPaidOut: 20000,
  pendingAmount: 1000,
  platformFeeRate: 0.05,
  platformFee: 263,
  grossEarnings: 5263,
  hasPendingPayout: false,
  eligibleOrderCount: 3,
};

const payoutRecord = {
  id: "payout-1",
  amount: 5000,
  grossAmount: 5263,
  platformFee: 263,
  status: "completed" as const,
  paymentMethod: "bank_transfer" as const,
  requestedAt: "2025-01-01T00:00:00Z",
  processedAt: "2025-01-03T00:00:00Z",
  orderIds: ["order-1"],
};

// ── SellerAnalyticsStats ─────────────────────────────────────────────────────

describe("SellerAnalyticsStats", () => {
  it("renders all four stat cards", () => {
    render(<SellerAnalyticsStats summary={analyticsSummary} />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Products Listed")).toBeInTheDocument();
    expect(screen.getByText("Published Products")).toBeInTheDocument();
  });

  it("displays numeric values from the summary", () => {
    render(<SellerAnalyticsStats summary={analyticsSummary} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});

// ── SellerPayoutStats ────────────────────────────────────────────────────────

describe("SellerPayoutStats", () => {
  it("renders payout stat labels", () => {
    render(<SellerPayoutStats summary={payoutSummary} isLoading={false} />);
    expect(screen.getByText("Available Earnings")).toBeInTheDocument();
    expect(screen.getByText("Total Paid Out")).toBeInTheDocument();
    expect(screen.getByText("Pending Payout")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<SellerPayoutStats summary={undefined} isLoading={true} />);
    expect(screen.getByText("Loading payouts...")).toBeInTheDocument();
  });
});

// ── SellerRevenueChart ───────────────────────────────────────────────────────

describe("SellerRevenueChart", () => {
  const chartData = [
    { month: "Jan", revenue: 1000, orders: 5 },
    { month: "Feb", revenue: 2000, orders: 10 },
  ];

  it("renders chart title", () => {
    render(<SellerRevenueChart data={chartData} />);
    expect(screen.getByText("Revenue Last 6 Months")).toBeInTheDocument();
  });

  it("renders no data message when data is empty", () => {
    render(<SellerRevenueChart data={[]} />);
    expect(screen.getByText("No sales data yet")).toBeInTheDocument();
  });

  it("renders the chart container when data provided", () => {
    render(<SellerRevenueChart data={chartData} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});

// ── SellerTopProducts ────────────────────────────────────────────────────────

describe("SellerTopProducts", () => {
  const products = [
    {
      productId: "p1",
      title: "Product A",
      orders: 15,
      revenue: 3000,
      mainImage: "",
    },
    {
      productId: "p2",
      title: "Product B",
      orders: 10,
      revenue: 2000,
      mainImage: "",
    },
  ];

  it("renders top products title", () => {
    render(<SellerTopProducts products={products} />);
    expect(screen.getByText("Top Products by Revenue")).toBeInTheDocument();
  });

  it("renders product names", () => {
    render(<SellerTopProducts products={products} />);
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
  });

  it("shows empty state when no products", () => {
    render(<SellerTopProducts products={[]} />);
    expect(screen.getByText("No sales data yet")).toBeInTheDocument();
  });
});

// ── SellerPayoutHistoryTable ─────────────────────────────────────────────────

describe("SellerPayoutHistoryTable", () => {
  it("renders history section title", () => {
    render(
      <SellerPayoutHistoryTable payouts={[payoutRecord]} isLoading={false} />,
    );
    expect(screen.getByText("Payout History")).toBeInTheDocument();
  });

  it("renders payout status", () => {
    render(
      <SellerPayoutHistoryTable payouts={[payoutRecord]} isLoading={false} />,
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("shows empty state when no payouts", () => {
    render(<SellerPayoutHistoryTable payouts={[]} isLoading={false} />);
    expect(screen.getByText("No payouts yet")).toBeInTheDocument();
  });

  it("renders loading state without showing empty state", () => {
    render(<SellerPayoutHistoryTable payouts={[]} isLoading={true} />);
    expect(screen.queryByText("No payouts yet")).not.toBeInTheDocument();
  });
});

// ── SellerPayoutRequestForm ──────────────────────────────────────────────────

describe("SellerPayoutRequestForm", () => {
  const noop = jest.fn();

  it("renders request payout heading when earnings available", () => {
    render(
      <SellerPayoutRequestForm
        summary={payoutSummary}
        submitting={false}
        onSubmit={noop}
      />,
    );
    // heading text for request payout
    expect(screen.getAllByText("Request Payout").length).toBeGreaterThan(0);
  });

  it("shows already-pending message when hasPendingPayout is true", () => {
    render(
      <SellerPayoutRequestForm
        summary={{ ...payoutSummary, hasPendingPayout: true }}
        submitting={false}
        onSubmit={noop}
      />,
    );
    expect(
      screen.getByText("You have a pending payout request"),
    ).toBeInTheDocument();
  });

  it("shows no-earnings message when availableEarnings is 0", () => {
    render(
      <SellerPayoutRequestForm
        summary={{ ...payoutSummary, availableEarnings: 0 }}
        submitting={false}
        onSubmit={noop}
      />,
    );
    expect(
      screen.getByText("No available earnings to withdraw"),
    ).toBeInTheDocument();
  });
});
