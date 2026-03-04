import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ListingLayout } from "../ListingLayout";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "activeCount" && params) return `Filters (${params.count})`;
    if (key === "selectedCount" && params) return `${params.count} selected`;
    if (key === "title") return "Filters";
    if (key === "showFilters") return "Show filters";
    if (key === "hideFilters") return "Hide filters";
    if (key === "clearAll") return "Clear all";
    if (key === "applyFilters") return "Apply filters";
    if (key === "close") return "Close";
    if (key === "bulkActionsRegion") return "Bulk actions";
    if (key === "clearSelection") return "Clear selection";
    return key;
  },
}));

// Shallow mocks — only stub what's used
jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    "aria-label": ariaLabel,
    "aria-expanded": ariaExpanded,
    className,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    "aria-label"?: string;
    "aria-expanded"?: boolean;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      className={className}
    >
      {children}
    </button>
  ),
  BulkActionBar: ({
    children,
    selectedCount,
    onClearSelection,
  }: {
    children?: React.ReactNode;
    selectedCount: number;
    onClearSelection?: () => void;
  }) =>
    selectedCount > 0 ? (
      <div data-testid="bulk-action-bar">
        <button onClick={onClearSelection}>Clear</button>
        {children}
      </div>
    ) : null,
  Span: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  DrawerFormFooter: () => <div />,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      border: "border-gray-200",
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
    },
    badge: { active: "bg-indigo-100 text-indigo-700" },
    borderRadius: { xl: "rounded-xl", lg: "rounded-lg" },
    flex: { between: "flex justify-between", rowCenter: "flex items-center" },
    spacing: { padding: { xs: "p-2", md: "p-4" } },
  },
}));

describe("ListingLayout", () => {
  it("renders children", () => {
    render(
      <ListingLayout>
        <div data-testid="content">Content</div>
      </ListingLayout>,
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("shows search slot", () => {
    render(
      <ListingLayout searchSlot={<input placeholder="Search..." />}>
        <div>Content</div>
      </ListingLayout>,
    );
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("shows sort and actions slots", () => {
    render(
      <ListingLayout
        sortSlot={<select data-testid="sort" />}
        actionsSlot={<button>Create</button>}
      >
        <div>Content</div>
      </ListingLayout>,
    );
    expect(screen.getByTestId("sort")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("renders filter toggle buttons when filterContent is provided", () => {
    render(
      <ListingLayout filterContent={<div>Filter options</div>}>
        <div>Content</div>
      </ListingLayout>,
    );
    // Desktop sidebar toggle should be present (hidden md:flex)
    const toggleBtns = screen.getAllByText("Filters");
    // Both mobile (md:hidden) and desktop (hidden md:flex) buttons
    expect(toggleBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("shows filter active count badge when filterActiveCount > 0", () => {
    render(
      <ListingLayout
        filterContent={<div>Options</div>}
        filterActiveCount={3}
      >
        <div>Content</div>
      </ListingLayout>,
    );
    // Badge with count 3 appears
    const badges = screen.getAllByText("3");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("does NOT render filter toggle when no filterContent", () => {
    render(
      <ListingLayout>
        <div>Content</div>
      </ListingLayout>,
    );
    expect(screen.queryByText("Filters")).not.toBeInTheDocument();
  });

  it("shows BulkActionBar when selectedCount > 0", () => {
    render(
      <ListingLayout selectedCount={5} onClearSelection={jest.fn()}>
        <div>Content</div>
      </ListingLayout>,
    );
    expect(screen.getByTestId("bulk-action-bar")).toBeInTheDocument();
  });

  it("hides BulkActionBar when selectedCount is 0", () => {
    render(
      <ListingLayout selectedCount={0}>
        <div>Content</div>
      </ListingLayout>,
    );
    expect(screen.queryByTestId("bulk-action-bar")).not.toBeInTheDocument();
  });

  it("toggles desktop sidebar on desktop toggle click", () => {
    render(
      <ListingLayout filterContent={<div>Facets</div>} defaultSidebarOpen>
        <div>Content</div>
      </ListingLayout>,
    );
    // The desktop toggle button has aria-expanded=true initially
    const desktopBtn = screen.getByLabelText("Hide filters");
    expect(desktopBtn).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(desktopBtn);
    expect(screen.getByLabelText("Show filters")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens mobile filter overlay on mobile button click", () => {
    render(
      <ListingLayout filterContent={<div data-testid="facets">Facets</div>}>
        <div>Content</div>
      </ListingLayout>,
    );
    // The mobile filter button (aria-label="Filters")
    const mobileBtns = screen.getAllByLabelText("Filters");
    expect(mobileBtns.length).toBeGreaterThanOrEqual(1);
    // Click the first (mobile) Filters button
    fireEvent.click(mobileBtns[0]);
    // The mobile overlay dialog should appear
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes mobile filter overlay on close button", () => {
    render(
      <ListingLayout filterContent={<div>Facets</div>}>
        <div>Content</div>
      </ListingLayout>,
    );
    const mobileBtns = screen.getAllByLabelText("Filters");
    fireEvent.click(mobileBtns[0]);
    // Dialog is open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Click close
    const closeBtn = screen.getByLabelText("Close");
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onFilterApply and closes overlay when Apply is clicked", () => {
    const onApply = jest.fn();
    render(
      <ListingLayout filterContent={<div>Facets</div>} onFilterApply={onApply}>
        <div>Content</div>
      </ListingLayout>,
    );
    const mobileBtns = screen.getAllByLabelText("Filters");
    fireEvent.click(mobileBtns[0]);
    const applyBtn = screen.getByText("Apply filters");
    fireEvent.click(applyBtn);
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onFilterClear when Clear all is clicked in mobile overlay", () => {
    const onClear = jest.fn();
    render(
      <ListingLayout
        filterContent={<div>Facets</div>}
        onFilterClear={onClear}
      >
        <div>Content</div>
      </ListingLayout>,
    );
    const mobileBtns = screen.getAllByLabelText("Filters");
    fireEvent.click(mobileBtns[0]);
    const clearBtns = screen.getAllByText("Clear all");
    fireEvent.click(clearBtns[0]);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
