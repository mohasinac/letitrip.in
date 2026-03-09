import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({
    title,
    onChange,
  }: {
    title: string;
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (vals: string[]) => void;
    searchable?: boolean;
    defaultCollapsed?: boolean;
    selectionMode?: string;
  }) => (
    <div data-testid={`facet-${title}`}>
      <button onClick={() => onChange(["seller"])}>select-option</button>
    </div>
  ),
  RangeFilter: ({ title }: { title: string }) => (
    <div data-testid={`range-${title}`} />
  ),
  SwitchFilter: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import { UserFilters, USER_SORT_OPTIONS } from "../UserFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("UserFilters", () => {
  it("renders role, emailVerified, accountStatus, storeStatus, and dateRange sections", () => {
    const table = makeTable();
    render(<UserFilters table={table} />);
    expect(screen.getByTestId("facet-role")).toBeInTheDocument();
    expect(screen.getByTestId("facet-emailVerified")).toBeInTheDocument();
    expect(screen.getByTestId("facet-accountStatus")).toBeInTheDocument();
    expect(screen.getByTestId("facet-storeStatus")).toBeInTheDocument();
    expect(screen.getByTestId("range-dateRange")).toBeInTheDocument();
  });

  it("calls table.set when a role option is selected", async () => {
    const table = makeTable();
    render(<UserFilters table={table} />);
    await userEvent.click(screen.getAllByText("select-option")[0]);
    expect(table.set).toHaveBeenCalledWith("role", "seller");
  });

  it("exports USER_SORT_OPTIONS with createdAt and displayName sort values", () => {
    const values = USER_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("-createdAt");
    expect(values).toContain("displayName");
  });
});
