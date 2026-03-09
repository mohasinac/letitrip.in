import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import {
  NewsletterFilters,
  NEWSLETTER_SORT_OPTIONS,
} from "../NewsletterFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("NewsletterFilters", () => {
  it("renders status and source sections", () => {
    const table = makeTable();
    render(<NewsletterFilters table={table} />);
    expect(screen.getByTestId("facet-status")).toBeInTheDocument();
    expect(screen.getByTestId("facet-source")).toBeInTheDocument();
  });

  it("exports NEWSLETTER_SORT_OPTIONS with subscribedAt sort", () => {
    const values = NEWSLETTER_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-subscribedAt");
  });
});
