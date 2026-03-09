import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { CategoryFilters, CATEGORY_SORT_OPTIONS } from "../CategoryFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("CategoryFilters", () => {
  it("renders tier, isActive, isFeatured, isSearchable, isLeaf sections", () => {
    const table = makeTable();
    render(<CategoryFilters table={table} />);
    expect(screen.getByTestId("facet-tier")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isActive")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isFeatured")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isSearchable")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isLeaf")).toBeInTheDocument();
  });

  it("exports CATEGORY_SORT_OPTIONS", () => {
    expect(CATEGORY_SORT_OPTIONS.length).toBeGreaterThan(0);
    const values = CATEGORY_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("name");
  });
});
