/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { PAYOUT_TABLE_COLUMNS } from "../PayoutTableColumns";
import type { PayoutRecord } from "../PayoutTableColumns";

const mockPayout: PayoutRecord = {
  id: "payout-001",
  amount: 950,
  grossAmount: 1000,
  platformFee: 50,
  status: "completed",
  paymentMethod: "bank_transfer",
  requestedAt: "2026-03-01T10:00:00Z",
  processedAt: "2026-03-02T12:00:00Z",
  orderIds: ["order-001"],
};

jest.mock("@/components", () => ({
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Caption: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/utils", () => ({
  formatCurrency: (n: number) => `₹${n}`,
  formatDate: () => "Mar 1, 2026",
  formatDateTime: () => "Mar 2, 2026, 12:00 PM",
}));

describe("PAYOUT_TABLE_COLUMNS", () => {
  it("has the expected number of columns", () => {
    expect(PAYOUT_TABLE_COLUMNS).toHaveLength(7);
  });

  it("column keys are correct", () => {
    const keys = PAYOUT_TABLE_COLUMNS.map((c) => c.key);
    expect(keys).toEqual([
      "grossAmount",
      "platformFee",
      "amount",
      "paymentMethod",
      "status",
      "requestedAt",
      "processedAt",
    ]);
  });

  it("amount column renders formatted currency", () => {
    const col = PAYOUT_TABLE_COLUMNS.find((c) => c.key === "amount")!;
    const { getByText } = render(<>{col.render!(mockPayout)}</>);
    expect(getByText("₹950")).toBeTruthy();
  });

  it("status column renders badge with label", () => {
    const col = PAYOUT_TABLE_COLUMNS.find((c) => c.key === "status")!;
    const { getByText } = render(<>{col.render!(mockPayout)}</>);
    expect(getByText("Completed")).toBeTruthy();
  });

  it("processedAt column renders date when provided", () => {
    const col = PAYOUT_TABLE_COLUMNS.find((c) => c.key === "processedAt")!;
    const { getByText } = render(<>{col.render!(mockPayout)}</>);
    expect(getByText("Mar 2, 2026, 12:00 PM")).toBeTruthy();
  });

  it("processedAt column renders dash when absent", () => {
    const col = PAYOUT_TABLE_COLUMNS.find((c) => c.key === "processedAt")!;
    const { getByText } = render(
      <>{col.render!({ ...mockPayout, processedAt: undefined })}</>,
    );
    expect(getByText("—")).toBeTruthy();
  });
});
