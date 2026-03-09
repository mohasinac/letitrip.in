import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { CarouselFilters, CAROUSEL_SORT_OPTIONS } from "../CarouselFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("CarouselFilters", () => {
  it("renders isActive (active) section", () => {
    const table = makeTable();
    render(<CarouselFilters table={table} />);
    expect(screen.getByTestId("facet-isActive")).toBeInTheDocument();
  });

  it("exports CAROUSEL_SORT_OPTIONS with order sort", () => {
    const values = CAROUSEL_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("order");
  });
});
