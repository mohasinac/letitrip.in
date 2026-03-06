import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { FaqFilters, FAQ_SORT_OPTIONS } from "../FaqFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("FaqFilters", () => {
  it("renders category and isActive sections", () => {
    const table = makeTable();
    render(<FaqFilters table={table} />);
    expect(screen.getByTestId("facet-category")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isActive")).toBeInTheDocument();
  });

  it("exports FAQ_SORT_OPTIONS", () => {
    expect(FAQ_SORT_OPTIONS.length).toBeGreaterThan(0);
  });
});
