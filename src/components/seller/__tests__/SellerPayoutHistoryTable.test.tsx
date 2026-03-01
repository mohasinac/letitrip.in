/**
 * Tests for SellerPayoutHistoryTable component
 *
 * Coverage:
 * - Renders section heading via Heading primitive
 * - Shows loading text while data loads
 * - Shows empty-state card when no payouts
 * - Delegates to DataTable when payouts are present
 */

import { render, screen } from "@testing-library/react";
import {
  SellerPayoutHistoryTable,
  type PayoutRecord,
} from "../SellerPayoutHistoryTable";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
  Heading: ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => <h2 data-testid={`heading-${level}`}>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="text">{children}</p>
  ),
  DataTable: ({ data }: { data: PayoutRecord[] }) => (
    <div data-testid="data-table" data-count={data.length} />
  ),
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
  formatDate: () => "01 Jan 2025",
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: { bgSecondary: "", textSecondary: "", border: "" },
    spacing: { padding: { lg: "p-6" } },
  },
}));

const payout: PayoutRecord = {
  id: "payout-001",
  amount: 900,
  grossAmount: 1000,
  platformFee: 100,
  status: "completed",
  paymentMethod: "bank_transfer",
  requestedAt: "2025-01-01T00:00:00Z",
  orderIds: [],
};

describe("SellerPayoutHistoryTable", () => {
  it("renders the section heading", () => {
    render(<SellerPayoutHistoryTable payouts={[payout]} isLoading={false} />);
    expect(screen.getByTestId("heading-2")).toHaveTextContent("historyTitle");
  });

  it("shows loading text while isLoading=true", () => {
    render(<SellerPayoutHistoryTable payouts={[]} isLoading={true} />);
    expect(screen.getByTestId("text")).toHaveTextContent("loading");
  });

  it("shows empty-state card when no payouts and not loading", () => {
    render(<SellerPayoutHistoryTable payouts={[]} isLoading={false} />);
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders DataTable when payouts are present", () => {
    render(<SellerPayoutHistoryTable payouts={[payout]} isLoading={false} />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toHaveAttribute("data-count", "1");
  });
});
