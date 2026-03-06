import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { SessionFilters, SESSION_SORT_OPTIONS } from "../SessionFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("SessionFilters", () => {
  it("renders isActive section", () => {
    const table = makeTable();
    render(<SessionFilters table={table} />);
    expect(screen.getByTestId("facet-isActive")).toBeInTheDocument();
  });

  it("exports SESSION_SORT_OPTIONS with lastActivity sort", () => {
    const values = SESSION_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-lastActivity");
  });
});
