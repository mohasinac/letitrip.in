import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkActionBar } from "../BulkActionBar";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "selectedCount" && params) return `${params.count} selected`;
    if (key === "bulkActionsRegion") return "Bulk actions";
    if (key === "clearSelection") return "Clear selection";
    return key;
  },
}));

// Mock @/components to avoid full component tree
jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    "aria-label": ariaLabel,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    "aria-label"?: string;
  }) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  ),
  Text: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
}));

describe("BulkActionBar", () => {
  it("renders null when selectedCount is 0", () => {
    const { container } = render(
      <BulkActionBar selectedCount={0}>
        <button>Delete</button>
      </BulkActionBar>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders selected count when items are selected", () => {
    render(
      <BulkActionBar selectedCount={3}>
        <button>Delete</button>
      </BulkActionBar>,
    );
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("renders singular count correctly", () => {
    render(
      <BulkActionBar selectedCount={1}>
        <button>Delete</button>
      </BulkActionBar>,
    );
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("calls onClearSelection when clear button is clicked", () => {
    const onClear = jest.fn();
    render(
      <BulkActionBar selectedCount={2} onClearSelection={onClear}>
        <button>Delete</button>
      </BulkActionBar>,
    );
    const clearBtn = screen.getByLabelText("Clear selection");
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renders children (action buttons)", () => {
    render(
      <BulkActionBar selectedCount={2}>
        <button>Delete</button>
        <button>Export</button>
      </BulkActionBar>,
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("renders without children gracefully", () => {
    render(<BulkActionBar selectedCount={1} />);
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("has correct ARIA region label", () => {
    render(
      <BulkActionBar selectedCount={1}>
        <button>Action</button>
      </BulkActionBar>,
    );
    expect(screen.getByRole("region", { name: "Bulk actions" })).toBeInTheDocument();
  });
});
