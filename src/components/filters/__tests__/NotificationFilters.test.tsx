import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/components", () => ({
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title}`} />
  ),
}));

import {
  NotificationFilters,
  NOTIFICATION_SORT_OPTIONS,
} from "../NotificationFilters";

const makeTable = () => ({
  get: jest.fn(() => ""),
  set: jest.fn(),
  setMany: jest.fn(),
});

describe("NotificationFilters", () => {
  it("renders type, priority, isRead, and relatedType sections", () => {
    const table = makeTable();
    render(<NotificationFilters table={table} />);
    expect(screen.getByTestId("facet-type")).toBeInTheDocument();
    expect(screen.getByTestId("facet-priority")).toBeInTheDocument();
    expect(screen.getByTestId("facet-isRead")).toBeInTheDocument();
    expect(screen.getByTestId("facet-relatedType")).toBeInTheDocument();
  });

  it("exports NOTIFICATION_SORT_OPTIONS with priority sort", () => {
    const values = NOTIFICATION_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("priority");
  });
});
