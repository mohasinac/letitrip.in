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

import { EventFilters, EVENT_SORT_OPTIONS } from "../EventFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("EventFilters", () => {
  it("renders type, status, and dateRange sections", () => {
    const table = makeTable();
    render(<EventFilters table={table} />);
    expect(screen.getByTestId("facet-type")).toBeInTheDocument();
    expect(screen.getByTestId("facet-status")).toBeInTheDocument();
    expect(screen.getByTestId("range-dateRange")).toBeInTheDocument();
  });

  it("exports EVENT_SORT_OPTIONS with startsAt sort", () => {
    const values = EVENT_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-startsAt");
  });
});
