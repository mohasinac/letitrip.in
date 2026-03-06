import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { RipCoinFilters, RIPCOIN_SORT_OPTIONS } from "../RipCoinFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("RipCoinFilters", () => {
  it("renders type section", () => {
    const table = makeTable();
    render(<RipCoinFilters table={table} />);
    expect(screen.getByTestId("facet-type")).toBeInTheDocument();
  });

  it("exports RIPCOIN_SORT_OPTIONS with createdAt sort", () => {
    const values = RIPCOIN_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-createdAt");
  });
});
