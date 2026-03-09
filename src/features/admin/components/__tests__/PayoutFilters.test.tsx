import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
  RangeFilter: ({ title }: { title: string }) => (
    <div data-testid={`range-${title}`} />
  ),
}));

import { PayoutFilters, PAYOUT_SORT_OPTIONS } from "../PayoutFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("PayoutFilters", () => {
  it("renders status, payoutPaymentMethod, and amountRange sections", () => {
    const table = makeTable();
    render(<PayoutFilters table={table} />);
    expect(screen.getByTestId("facet-status")).toBeInTheDocument();
    expect(screen.getByTestId("facet-payoutPaymentMethod")).toBeInTheDocument();
    expect(screen.getByTestId("range-amountRange")).toBeInTheDocument();
  });

  it("exports PAYOUT_SORT_OPTIONS with amount sort", () => {
    const values = PAYOUT_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-amount");
    expect(values).toContain("amount");
  });
});
