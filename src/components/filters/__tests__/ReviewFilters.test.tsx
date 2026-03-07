import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { ReviewFilters, REVIEW_SORT_OPTIONS } from "../ReviewFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("ReviewFilters", () => {
  it("renders status, rating, verified, featured sections", () => {
    const table = makeTable();
    render(<ReviewFilters table={table} />);
    expect(screen.getByTestId("facet-status")).toBeInTheDocument();
    expect(screen.getByTestId("facet-rating")).toBeInTheDocument();
    expect(screen.getByTestId("facet-verified")).toBeInTheDocument();
    expect(screen.getByTestId("facet-featured")).toBeInTheDocument();
  });

  it("exports REVIEW_SORT_OPTIONS with rating sort values and i18n keys", () => {
    const values = REVIEW_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-rating");
    expect(values).toContain("rating");
    const keys = REVIEW_SORT_OPTIONS.map((o) => o.key);
    expect(keys).toContain("sortHighestRated");
    expect(keys).toContain("sortLowestRated");
  });
});
