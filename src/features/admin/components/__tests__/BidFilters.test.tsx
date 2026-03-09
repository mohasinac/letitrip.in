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
  SwitchFilter: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { BidFilters, BID_SORT_OPTIONS } from "../BidFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("BidFilters", () => {
  it("renders status, isWinning, amountRange sections", () => {
    const table = makeTable();
    render(<BidFilters table={table} />);
    expect(screen.getByTestId("facet-status")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isWinning")).toBeInTheDocument();
    expect(screen.getByTestId("range-amountRange")).toBeInTheDocument();
  });

  it("exports BID_SORT_OPTIONS with bidAmount sort values", () => {
    const values = BID_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-bidAmount");
    expect(values).toContain("bidAmount");
  });
});
