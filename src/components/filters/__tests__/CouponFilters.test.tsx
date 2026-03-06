import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));
jest.mock("../RangeFilter", () => ({
  RangeFilter: ({ title }: { title: string }) => (
    <div data-testid={`range-${title}`} />
  ),
}));

import { CouponFilters, COUPON_SORT_OPTIONS } from "../CouponFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("CouponFilters", () => {
  it("renders type, isActive, and dateRange sections", () => {
    const table = makeTable();
    render(<CouponFilters table={table} />);
    expect(screen.getByTestId("facet-type")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isActive")).toBeInTheDocument();
    expect(screen.getByTestId("range-dateRange")).toBeInTheDocument();
  });

  it("exports COUPON_SORT_OPTIONS", () => {
    const values = COUPON_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("code");
  });
});
