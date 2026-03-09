import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import {
  HomepageSectionFilters,
  HOMEPAGE_SECTION_SORT_OPTIONS,
} from "../HomepageSectionFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("HomepageSectionFilters", () => {
  it("renders type and enabled sections", () => {
    const table = makeTable();
    render(<HomepageSectionFilters table={table} />);
    expect(screen.getByTestId("facet-type")).toBeInTheDocument();
    expect(screen.getByTestId("facet-enabled")).toBeInTheDocument();
  });

  it("exports HOMEPAGE_SECTION_SORT_OPTIONS with order sort", () => {
    const values = HOMEPAGE_SECTION_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("order");
  });
});
