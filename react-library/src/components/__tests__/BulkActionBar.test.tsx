import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  BulkActionBar,
  type BulkAction,
} from "../../components/tables/BulkActionBar";

const mockActions: BulkAction[] = [
  { id: "delete", label: "Delete", variant: "danger" },
  { id: "publish", label: "Publish", variant: "success" },
  { id: "archive", label: "Archive", variant: "default" },
];

describe("BulkActionBar", () => {
  it("renders nothing when selectedCount is 0", () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={0}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders desktop bar when items are selected", () => {
    render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    expect(screen.getByText("3 items selected")).toBeInTheDocument();
  });

  it("displays custom resource name", () => {
    render(
      <BulkActionBar
        selectedCount={2}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
        resourceName="product"
      />
    );

    expect(screen.getByText("2 products selected")).toBeInTheDocument();
  });

  it("uses singular form for 1 item", () => {
    render(
      <BulkActionBar
        selectedCount={1}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
        resourceName="product"
      />
    );

    expect(screen.getByText("1 product selected")).toBeInTheDocument();
  });

  it("displays total count when provided", () => {
    render(
      <BulkActionBar
        selectedCount={5}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
        totalCount={100}
      />
    );

    expect(screen.getByText("5 items selected (of 100)")).toBeInTheDocument();
  });

  it("calls onClearSelection when clear button is clicked", () => {
    const onClearSelection = vi.fn();
    render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={onClearSelection}
      />
    );

    const clearButton = screen.getByText("Clear selection");
    fireEvent.click(clearButton);

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("renders all action buttons", () => {
    render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    expect(screen.getAllByText("Delete")).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText("Publish")).toHaveLength(2);
    expect(screen.getAllByText("Archive")).toHaveLength(2);
  });

  it("calls onAction when action button is clicked", async () => {
    const onAction = vi.fn().mockResolvedValue(undefined);
    render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={onAction}
        onClearSelection={vi.fn()}
      />
    );

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(onAction).toHaveBeenCalledWith("delete", undefined);
    });
  });

  it("disables buttons when loading", () => {
    render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
        loading={true}
      />
    );

    const clearButton = screen.getByText("Clear selection");
    expect(clearButton).toBeDisabled();
  });

  it("disables specific action when action.disabled is true", () => {
    const actionsWithDisabled: BulkAction[] = [
      { id: "delete", label: "Delete", variant: "danger", disabled: true },
      { id: "publish", label: "Publish", variant: "success" },
    ];

    render(
      <BulkActionBar
        selectedCount={3}
        actions={actionsWithDisabled}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    deleteButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    const publishButtons = screen.getAllByRole("button", { name: /publish/i });
    publishButtons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it("applies correct variant classes", () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons[0]).toHaveClass("bg-red-600");

    const publishButtons = screen.getAllByText("Publish");
    expect(publishButtons[0]).toHaveClass("bg-green-600");

    const archiveButtons = screen.getAllByText("Archive");
    expect(archiveButtons[0]).toHaveClass("bg-blue-600");
  });

  it("shows confirmation dialog when action.confirm is true and ConfirmDialog is provided", () => {
    const MockConfirmDialog = vi.fn(() => <div>Confirm Dialog</div>);
    const actionsWithConfirm: BulkAction[] = [
      {
        id: "delete",
        label: "Delete",
        variant: "danger",
        confirm: true,
        confirmTitle: "Confirm Delete",
        confirmMessage: "Are you sure?",
      },
    ];

    render(
      <BulkActionBar
        selectedCount={3}
        actions={actionsWithConfirm}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
        ConfirmDialog={MockConfirmDialog}
      />
    );

    const deleteButton = screen.getAllByText("Delete")[0];
    fireEvent.click(deleteButton);

    expect(MockConfirmDialog).toHaveBeenCalled();
  });

  it("handles action errors with onError callback", async () => {
    const onError = vi.fn();
    const onAction = vi.fn().mockRejectedValue(new Error("Action failed"));

    render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={onAction}
        onClearSelection={vi.fn()}
        onError={onError}
      />
    );

    const deleteButton = screen.getAllByText("Delete")[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error), "delete");
    });
  });

  it("renders with custom icons", () => {
    const MockXIcon = () => <span data-testid="custom-x">X</span>;
    const MockLoaderIcon = () => (
      <span data-testid="custom-loader">Loading</span>
    );

    render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
        XIcon={MockXIcon}
        LoaderIcon={MockLoaderIcon}
      />
    );

    expect(screen.getByTestId("custom-x")).toBeInTheDocument();
  });

  it("shows mobile bar", () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    const mobileBar = container.querySelector(".md\\:hidden");
    expect(mobileBar).toBeInTheDocument();
  });

  it("shows desktop bar", () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    const desktopBar = container.querySelector(".hidden.md\\:flex");
    expect(desktopBar).toBeInTheDocument();
  });

  it("handles action with custom icon", () => {
    const MockIcon = () => <span data-testid="custom-action-icon">Icon</span>;
    const actionsWithIcon: BulkAction[] = [
      { id: "delete", label: "Delete", variant: "danger", icon: MockIcon },
    ];

    render(
      <BulkActionBar
        selectedCount={3}
        actions={actionsWithIcon}
        onAction={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    expect(screen.getAllByTestId("custom-action-icon")).toHaveLength(2); // Desktop + Mobile
  });

  it("disables buttons during action execution", async () => {
    const onAction = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <BulkActionBar
        selectedCount={3}
        actions={mockActions}
        onAction={onAction}
        onClearSelection={vi.fn()}
      />
    );

    const deleteButton = screen.getAllByText("Delete")[0];
    fireEvent.click(deleteButton);

    // Buttons should be disabled during execution
    await waitFor(() => {
      const clearButton = screen.getByText("Clear selection");
      expect(clearButton).toBeDisabled();
    });
  });
});
