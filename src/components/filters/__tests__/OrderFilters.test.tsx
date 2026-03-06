import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({
    title,
    onChange,
  }: {
    title: string;
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (vals: string[]) => void;
  }) => (
    <div data-testid={`facet-${title}`}>
      <button onClick={() => onChange(["shipped"])}>select-option</button>
    </div>
  ),
}));
jest.mock("../RangeFilter", () => ({
  RangeFilter: ({ title }: { title: string }) => (
    <div data-testid={`range-${title}`} />
  ),
}));

import {
  OrderFilters,
  ORDER_ADMIN_SORT_OPTIONS,
  ORDER_SELLER_SORT_OPTIONS,
} from "../OrderFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("OrderFilters", () => {
  it("renders status, paymentStatus, amountRange, dateRange for seller variant", () => {
    const table = makeTable();
    render(<OrderFilters table={table} variant="seller" />);
    expect(screen.getByTestId("facet-status")).toBeInTheDocument();
    expect(screen.getByTestId("facet-paymentStatus")).toBeInTheDocument();
    expect(screen.queryByTestId("facet-orderPayoutStatus")).toBeNull();
    expect(screen.getByTestId("range-amountRange")).toBeInTheDocument();
  });

  it("renders payoutStatus section for admin variant", () => {
    const table = makeTable();
    render(<OrderFilters table={table} variant="admin" />);
    expect(screen.getByTestId("facet-orderPayoutStatus")).toBeInTheDocument();
  });

  it("calls table.set on status change", async () => {
    const table = makeTable();
    render(<OrderFilters table={table} variant="admin" />);
    await userEvent.click(screen.getAllByText("select-option")[0]);
    expect(table.set).toHaveBeenCalledWith("status", "shipped");
  });

  it("exports both sort option arrays", () => {
    expect(ORDER_ADMIN_SORT_OPTIONS.length).toBeGreaterThan(0);
    expect(ORDER_SELLER_SORT_OPTIONS.length).toBeGreaterThan(0);
  });
});
