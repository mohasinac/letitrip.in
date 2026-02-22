import { render, screen } from "@testing-library/react";
import type React from "react";
import "@testing-library/jest-dom";

// Mock @/constants to avoid ESM sieve chain
jest.mock("@/constants", () => {
  const ui = require("../../../constants/ui");
  return {
    UI_LABELS: ui.UI_LABELS,
    THEME_CONSTANTS: {
      themed: {
        border: "border-gray-200",
        borderColor: "border-gray-200",
        textPrimary: "text-gray-900",
        textSecondary: "text-gray-600",
        bgPrimary: "bg-white",
        bgSecondary: "bg-gray-50",
        bgTertiary: "bg-gray-100",
        hover: "hover:bg-gray-50",
        hoverCard: "hover:bg-gray-50",
        divider: "divide-gray-200",
      },
      borderRadius: { lg: "rounded-lg" },
      spacing: { stack: "space-y-4", gap: { md: "gap-4" } },
    },
  };
});

jest.mock("@/components", () => ({
  Spinner: ({ label }: { label: string }) => <div role="status">{label}</div>,
  Pagination: () => <nav aria-label="Pagination" />,
}));

// Import directly from file to avoid barrel ESM issues
import { DataTable } from "../DataTable";
import { UI_LABELS } from "@/constants";

interface TestItem {
  id: string;
  name: string;
}

describe("DataTable", () => {
  const columns = [
    {
      key: "name" as const,
      header: UI_LABELS.PROFILE.DISPLAY_NAME,
    },
  ];

  it("renders loading state", () => {
    render(
      <DataTable<TestItem>
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={true}
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <DataTable<TestItem>
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
      />,
    );

    expect(screen.getByText(UI_LABELS.TABLE.NO_DATA_TITLE)).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.TABLE.NO_DATA_DESCRIPTION),
    ).toBeInTheDocument();
  });

  it("renders table rows", () => {
    const data = [{ id: "1", name: UI_LABELS.ACTIONS.VIEW }];

    render(
      <DataTable<TestItem>
        data={data}
        columns={columns}
        keyExtractor={(item) => item.id}
        showPagination={false}
      />,
    );

    expect(
      screen.getByText(UI_LABELS.PROFILE.DISPLAY_NAME),
    ).toBeInTheDocument();
    expect(screen.getByText(UI_LABELS.ACTIONS.VIEW)).toBeInTheDocument();
  });

  it("externalPagination=true renders all rows without internal slicing", () => {
    const data = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
    }));

    render(
      <DataTable<TestItem>
        data={data}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={10}
        externalPagination
      />,
    );

    // All 25 rows should be rendered (no internal slicing to pageSize=10)
    expect(screen.getAllByRole("row").length).toBeGreaterThanOrEqual(25);
    // No internal pagination footer
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("externalPagination=false (default) slices rows to pageSize", () => {
    const data = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      name: `Row ${i}`,
    }));

    render(
      <DataTable<TestItem>
        data={data}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={2}
        showPagination={true}
      />,
    );

    // Only 2 data rows visible (pageSize=2), plus 1 header row → 3 total rows
    const rows = screen.getAllByRole("row");
    // header + 2 data = 3
    expect(rows).toHaveLength(3);
    // Pagination nav rendered since totalPages=3>1
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
