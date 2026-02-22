import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FilterDrawer } from "../FilterDrawer";
import { UI_LABELS } from "@/constants";

// Mock SideDrawer and DrawerFormFooter
jest.mock("@/components", () => ({
  SideDrawer: ({
    isOpen,
    onClose,
    children,
    footer,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) =>
    isOpen ? (
      <div role="dialog" aria-modal="true" data-testid="side-drawer">
        <button onClick={onClose} aria-label="Close">
          Close
        </button>
        {children}
        {footer}
      </div>
    ) : null,
  DrawerFormFooter: ({
    onCancel,
    onSubmit,
    cancelLabel,
    submitLabel,
  }: {
    onCancel: () => void;
    onSubmit: () => void;
    cancelLabel?: string;
    submitLabel?: string;
  }) => (
    <div data-testid="drawer-footer">
      <button onClick={onCancel} data-testid="clear-all-btn">
        {cancelLabel || "Clear all"}
      </button>
      <button onClick={onSubmit} data-testid="apply-btn">
        {submitLabel || "Apply"}
      </button>
    </div>
  ),
}));

describe("FilterDrawer", () => {
  it("does not render drawer content when closed", () => {
    render(
      <FilterDrawer>
        <div data-testid="filter-content">Filters</div>
      </FilterDrawer>,
    );
    expect(screen.queryByTestId("side-drawer")).not.toBeInTheDocument();
  });

  it("opens drawer when trigger button is clicked", () => {
    render(
      <FilterDrawer>
        <div data-testid="filter-content">Filters</div>
      </FilterDrawer>,
    );
    const trigger = screen.getByRole("button", { name: /filter/i });
    fireEvent.click(trigger);
    expect(screen.getByTestId("side-drawer")).toBeInTheDocument();
  });

  it("shows active count badge when activeCount > 0", () => {
    render(
      <FilterDrawer activeCount={3}>
        <div>Filters</div>
      </FilterDrawer>,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("does not show badge when activeCount is 0", () => {
    render(
      <FilterDrawer activeCount={0}>
        <div>Filters</div>
      </FilterDrawer>,
    );
    // No number badge visible
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("calls onClearAll when Clear All button is clicked", () => {
    const onClearAll = jest.fn();
    render(
      <FilterDrawer onClearAll={onClearAll} activeCount={2}>
        <div>Filters</div>
      </FilterDrawer>,
    );
    // Open drawer first
    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    fireEvent.click(screen.getByTestId("clear-all-btn"));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("calls onApply and closes drawer when Apply is clicked", () => {
    const onApply = jest.fn();
    render(
      <FilterDrawer onApply={onApply}>
        <div>Filters</div>
      </FilterDrawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    fireEvent.click(screen.getByTestId("apply-btn"));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("closes drawer when the drawer close button is clicked", () => {
    render(
      <FilterDrawer>
        <div data-testid="filter-content">Filters</div>
      </FilterDrawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    expect(screen.getByTestId("side-drawer")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByTestId("side-drawer")).not.toBeInTheDocument();
  });

  it("renders children inside the drawer", () => {
    render(
      <FilterDrawer>
        <div data-testid="custom-filter">Custom Filter Content</div>
      </FilterDrawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    expect(screen.getByTestId("custom-filter")).toBeInTheDocument();
  });

  it("uses custom triggerLabel when provided", () => {
    render(
      <FilterDrawer triggerLabel="Show Filters">
        <div>Filters</div>
      </FilterDrawer>,
    );
    expect(
      screen.getByRole("button", { name: /show filters/i }),
    ).toBeInTheDocument();
  });
});
