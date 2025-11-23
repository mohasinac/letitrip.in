import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BulkActionBar } from "./BulkActionBar";
import { BulkAction } from "@/types/inline-edit";
import "@testing-library/jest-dom";

// Mock ConfirmDialog
jest.mock("./ConfirmDialog", () => ({
  ConfirmDialog: ({ isOpen, title, description, onConfirm, onClose }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onConfirm} data-testid="confirm-btn">
          Confirm
        </button>
        <button onClick={onClose} data-testid="cancel-btn">
          Cancel
        </button>
      </div>
    ) : null,
}));

// Mock icons
jest.mock("lucide-react", () => ({
  X: ({ className }: any) => <span className={className}>X</span>,
  Loader2: ({ className }: any) => <span className={className}>Loader</span>,
  Trash2: ({ className }: any) => <span className={className}>Trash</span>,
  CheckCircle: ({ className }: any) => <span className={className}>Check</span>,
}));

describe("BulkActionBar", () => {
  const mockOnAction = jest.fn();
  const mockOnClearSelection = jest.fn();

  const defaultActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Items",
      confirmMessage: "Are you sure?",
    },
    {
      id: "publish",
      label: "Publish",
      variant: "success",
      confirm: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("should not render when selectedCount is 0", () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={0}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("should render desktop view when selectedCount > 0", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      expect(screen.getByText("3 items selected")).toBeInTheDocument();
    });

    it("should render mobile view when selectedCount > 0", () => {
      render(
        <BulkActionBar
          selectedCount={5}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      expect(screen.getByText("5 selected")).toBeInTheDocument();
    });

    it("should render all action buttons", () => {
      render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      expect(screen.getAllByText("Delete")).toHaveLength(2); // Desktop + Mobile
      expect(screen.getAllByText("Publish")).toHaveLength(2);
    });
  });

  // Selected Count Display
  describe("Selected Count Display", () => {
    it("should display singular resource name when selectedCount is 1", () => {
      render(
        <BulkActionBar
          selectedCount={1}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
          resourceName="product"
        />
      );
      expect(screen.getByText("1 product selected")).toBeInTheDocument();
    });

    it("should display plural resource name when selectedCount > 1", () => {
      render(
        <BulkActionBar
          selectedCount={5}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
          resourceName="product"
        />
      );
      expect(screen.getByText("5 products selected")).toBeInTheDocument();
    });

    it("should display total count when provided", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
          totalCount={100}
        />
      );
      expect(screen.getByText("3 items selected (of 100)")).toBeInTheDocument();
    });

    it("should default to 'item' resource name", () => {
      render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      expect(screen.getByText("2 items selected")).toBeInTheDocument();
    });
  });

  // Clear Selection
  describe("Clear Selection", () => {
    it("should call onClearSelection when clear button clicked (desktop)", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const clearButtons = screen.getAllByText("Clear selection");
      fireEvent.click(clearButtons[0]);
      expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });

    it("should call onClearSelection when X button clicked (mobile)", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const xButtons = screen.getAllByLabelText("Clear selection");
      fireEvent.click(xButtons[0]);
      expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });

    it("should not call onClearSelection when disabled", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
          loading={true}
        />
      );
      const clearButtons = screen.getAllByText("Clear selection");
      fireEvent.click(clearButtons[0]);
      expect(mockOnClearSelection).not.toHaveBeenCalled();
    });
  });

  // Action Execution (without confirmation)
  describe("Action Execution (without confirmation)", () => {
    it("should execute action immediately when confirm is false", async () => {
      render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const publishButtons = screen.getAllByText("Publish");
      fireEvent.click(publishButtons[0]);
      await waitFor(() => {
        expect(mockOnAction).toHaveBeenCalledWith("publish", undefined);
      });
    });

    it("should not show confirm dialog for non-confirming actions", () => {
      render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const publishButtons = screen.getAllByText("Publish");
      fireEvent.click(publishButtons[0]);
      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    });
  });

  // Action Confirmation
  describe("Action Confirmation", () => {
    it("should show confirm dialog when action requires confirmation", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    });

    it("should display custom confirm title and message", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText("Delete Items")).toBeInTheDocument();
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("should execute action when confirmed", async () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);
      const confirmBtn = screen.getByTestId("confirm-btn");
      fireEvent.click(confirmBtn);
      await waitFor(() => {
        expect(mockOnAction).toHaveBeenCalledWith("delete", undefined);
      });
    });

    it("should close dialog when cancelled", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);
      const cancelBtn = screen.getByTestId("cancel-btn");
      fireEvent.click(cancelBtn);
      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    });

    it("should not execute action when cancelled", () => {
      render(
        <BulkActionBar
          selectedCount={3}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);
      const cancelBtn = screen.getByTestId("cancel-btn");
      fireEvent.click(cancelBtn);
      expect(mockOnAction).not.toHaveBeenCalled();
    });

    it("should generate default confirm title when not provided", () => {
      const actionsWithoutTitle: BulkAction[] = [
        {
          id: "archive",
          label: "Archive",
          variant: "default",
          confirm: true,
        },
      ];
      render(
        <BulkActionBar
          selectedCount={2}
          actions={actionsWithoutTitle}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const archiveButtons = screen.getAllByText("Archive");
      fireEvent.click(archiveButtons[0]);
      expect(screen.getByText("Confirm Archive")).toBeInTheDocument();
    });

    it("should generate default confirm message when not provided", () => {
      const actionsWithoutMessage: BulkAction[] = [
        {
          id: "archive",
          label: "Archive",
          variant: "default",
          confirm: true,
        },
      ];
      render(
        <BulkActionBar
          selectedCount={2}
          actions={actionsWithoutMessage}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
          resourceName="product"
        />
      );
      const archiveButtons = screen.getAllByText("Archive");
      fireEvent.click(archiveButtons[0]);
      expect(
        screen.getByText("Are you sure you want to archive 2 products?")
      ).toBeInTheDocument();
    });
  });

  // Button Variants
  describe("Button Variants", () => {
    it("should apply danger variant classes", () => {
      render(
        <BulkActionBar
          selectedCount={1}
          actions={[
            {
              id: "delete",
              label: "Delete",
              variant: "danger",
              confirm: false,
            },
          ]}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const button = screen.getAllByText("Delete")[0];
      expect(button).toHaveClass("bg-red-600");
    });

    it("should apply success variant classes", () => {
      render(
        <BulkActionBar
          selectedCount={1}
          actions={[
            {
              id: "approve",
              label: "Approve",
              variant: "success",
              confirm: false,
            },
          ]}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const button = screen.getAllByText("Approve")[0];
      expect(button).toHaveClass("bg-green-600");
    });

    it("should apply warning variant classes", () => {
      render(
        <BulkActionBar
          selectedCount={1}
          actions={[
            { id: "warn", label: "Warn", variant: "warning", confirm: false },
          ]}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const button = screen.getAllByText("Warn")[0];
      expect(button).toHaveClass("bg-yellow-600");
    });

    it("should apply default variant classes", () => {
      render(
        <BulkActionBar
          selectedCount={1}
          actions={[
            {
              id: "draft",
              label: "Draft",
              variant: "default",
              confirm: false,
            },
          ]}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const button = screen.getAllByText("Draft")[0];
      expect(button).toHaveClass("bg-blue-600");
    });
  });

  // Disabled State
  describe("Disabled State", () => {
    it("should disable all buttons when loading prop is true", () => {
      render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
          loading={true}
        />
      );
      const allButtons = screen.getAllByRole("button");
      allButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    it("should disable specific action button when action.disabled is true", () => {
      const actionsWithDisabled: BulkAction[] = [
        {
          id: "publish",
          label: "Publish",
          variant: "success",
          confirm: false,
          disabled: true,
        },
      ];
      render(
        <BulkActionBar
          selectedCount={2}
          actions={actionsWithDisabled}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const publishButtons = screen.getAllByText("Publish");
      publishButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    it("should not execute action when button is disabled", () => {
      const actionsWithDisabled: BulkAction[] = [
        {
          id: "publish",
          label: "Publish",
          variant: "success",
          confirm: false,
          disabled: true,
        },
      ];
      render(
        <BulkActionBar
          selectedCount={2}
          actions={actionsWithDisabled}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const publishButtons = screen.getAllByText("Publish");
      fireEvent.click(publishButtons[0]);
      expect(mockOnAction).not.toHaveBeenCalled();
    });
  });

  // Icons
  describe("Icons", () => {
    it("should render action icons when provided", () => {
      const Trash2 = () => <span>TrashIcon</span>;
      const actionsWithIcons: BulkAction[] = [
        {
          id: "delete",
          label: "Delete",
          variant: "danger",
          confirm: false,
          icon: Trash2,
        },
      ];
      render(
        <BulkActionBar
          selectedCount={2}
          actions={actionsWithIcons}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      expect(screen.getAllByText("TrashIcon")).toHaveLength(2); // Desktop + Mobile
    });

    it("should not render icon when not provided", () => {
      const actionsWithoutIcons: BulkAction[] = [
        {
          id: "publish",
          label: "Publish",
          variant: "success",
          confirm: false,
        },
      ];
      render(
        <BulkActionBar
          selectedCount={2}
          actions={actionsWithoutIcons}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      // Should only show text
      expect(screen.getAllByText("Publish")).toHaveLength(2);
    });
  });

  // Loading State
  describe("Loading State", () => {
    it("should show loader in mobile view when action is loading", async () => {
      let resolveAction: any;
      mockOnAction.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveAction = resolve;
          })
      );
      render(
        <BulkActionBar
          selectedCount={2}
          actions={[
            {
              id: "publish",
              label: "Publish",
              variant: "success",
              confirm: false,
            },
          ]}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const publishButtons = screen.getAllByText("Publish");
      fireEvent.click(publishButtons[1]); // Mobile button
      // Loader should appear in mobile view
      await waitFor(() => {
        expect(screen.getByText("Loader")).toBeInTheDocument();
      });
      // Resolve the action to cleanup
      if (resolveAction) resolveAction();
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("should handle empty actions array", () => {
      render(
        <BulkActionBar
          selectedCount={2}
          actions={[]}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      expect(screen.getByText("2 items selected")).toBeInTheDocument();
    });

    it("should handle very long action labels", () => {
      const actionsWithLongLabels: BulkAction[] = [
        {
          id: "action",
          label: "This is a very long action label that should be handled",
          variant: "default",
          confirm: false,
        },
      ];
      render(
        <BulkActionBar
          selectedCount={2}
          actions={actionsWithLongLabels}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      expect(
        screen.getAllByText(
          "This is a very long action label that should be handled"
        )[0]
      ).toBeInTheDocument();
    });

    it("should handle special characters in resource name", () => {
      render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
          resourceName="user's item"
        />
      );
      expect(screen.getByText("2 user's items selected")).toBeInTheDocument();
    });

    it("should handle action execution errors gracefully", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockOnAction.mockRejectedValue(new Error("Action failed"));
      render(
        <BulkActionBar
          selectedCount={2}
          actions={[
            {
              id: "publish",
              label: "Publish",
              variant: "success",
              confirm: false,
            },
          ]}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const publishButtons = screen.getAllByText("Publish");
      fireEvent.click(publishButtons[0]);
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          "Failed to execute bulk action:",
          expect.any(Error)
        );
      });
      consoleError.mockRestore();
    });

    it("should handle multiple rapid clicks", async () => {
      render(
        <BulkActionBar
          selectedCount={2}
          actions={[
            {
              id: "publish",
              label: "Publish",
              variant: "success",
              confirm: false,
            },
          ]}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const publishButtons = screen.getAllByText("Publish");
      fireEvent.click(publishButtons[0]);
      fireEvent.click(publishButtons[0]);
      fireEvent.click(publishButtons[0]);
      await waitFor(() => {
        // All three clicks are registered
        expect(mockOnAction).toHaveBeenCalled();
      });
    });
  });

  // Responsive Layout
  describe("Responsive Layout", () => {
    it("should render desktop view with hidden class on mobile screens", () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const desktopView = container.querySelector(".hidden.md\\:flex");
      expect(desktopView).toBeInTheDocument();
    });

    it("should render mobile view with fixed bottom positioning", () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const mobileView = container.querySelector(".md\\:hidden.fixed.bottom-0");
      expect(mobileView).toBeInTheDocument();
    });

    it("should render mobile view with grid layout for actions", () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={2}
          actions={defaultActions}
          onAction={mockOnAction}
          onClearSelection={mockOnClearSelection}
        />
      );
      const gridContainer = container.querySelector(".grid.grid-cols-2");
      expect(gridContainer).toBeInTheDocument();
    });
  });
});
