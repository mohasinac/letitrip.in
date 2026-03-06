import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { BlogFilters, BLOG_SORT_OPTIONS } from "../BlogFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("BlogFilters", () => {
  it("renders status, category, isFeatured sections", () => {
    const table = makeTable();
    render(<BlogFilters table={table} />);
    expect(screen.getByTestId("facet-status")).toBeInTheDocument();
    expect(screen.getByTestId("facet-category")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isFeatured")).toBeInTheDocument();
  });

  it("exports BLOG_SORT_OPTIONS with views sort", () => {
    const values = BLOG_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-views");
  });
});
