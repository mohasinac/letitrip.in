import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import {
  EventEntryFilters,
  EVENT_ENTRY_SORT_OPTIONS,
} from "../EventEntryFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("EventEntryFilters", () => {
  it("renders entryReviewStatus section", () => {
    const table = makeTable();
    render(<EventEntryFilters table={table} />);
    expect(screen.getByTestId("facet-entryReviewStatus")).toBeInTheDocument();
  });

  it("exports EVENT_ENTRY_SORT_OPTIONS with points sort", () => {
    const values = EVENT_ENTRY_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-points");
  });
});
