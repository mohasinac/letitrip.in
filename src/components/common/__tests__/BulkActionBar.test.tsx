/**
 * Comprehensive tests for BulkActionBar component
 * Tests: Bulk actions UI, desktop/mobile views, confirmation dialogs, variants
 * Focus: Selection display, action execution, loading states, dark mode, responsive
 */

import { BulkAction } from "@/types/inline-edit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Archive, Download, Trash2 } from "lucide-react";
import { BulkActionBar } from "../BulkActionBar";

// Mock dependencies
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("@/lib/error-logger", () => ({
  logError: jest.fn(),
}));

const mockActions: BulkAction[] = [
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "danger",
    confirm: true,
    confirmTitle: "Delete Items",
    confirmMessage: "Are you sure?",
  },
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
    variant: "warning",
  },
  {
    id: "download",
    label: "Download",
    icon: Download,
    variant: "default",
  },
];

describe("BulkActionBar", () => {
  const defaultProps = {
    selectedCount: 5,
    actions: mockActions,
    onAction: jest.fn(),
    onClearSelection: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("returns null when selectedCount is 0", () => {
      const { container } = render(
        <BulkActionBar {...defaultProps} selectedCount={0} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders desktop view with hidden class", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const desktop = container.querySelector(".hidden.md\\:flex");
      expect(desktop).toBeInTheDocument();
    });

    it("renders mobile view with md:hidden class", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const mobile = container.querySelector(".md\\:hidden.fixed");
      expect(mobile).toBeInTheDocument();
    });

    it("displays selected count", () => {
      render(<BulkActionBar {...defaultProps} selectedCount={5} />);
      expect(screen.getAllByText(/5/)).toHaveLength(2); // Desktop and mobile
    });

    it("uses singular resource name when count is 1", () => {
      render(
        <BulkActionBar
          {...defaultProps}
          selectedCount={1}
          resourceName="product"
        />
      );
      expect(screen.getByText(/1 product selected/i)).toBeInTheDocument();
    });

    it("uses plural resource name when count > 1", () => {
      render(
        <BulkActionBar
          {...defaultProps}
          selectedCount={5}
          resourceName="product"
        />
      );
      expect(screen.getByText(/5 products selected/i)).toBeInTheDocument();
    });

    it("displays total count when provided", () => {
      render(<BulkActionBar {...defaultProps} totalCount={100} />);
      expect(screen.getByText(/of 100/i)).toBeInTheDocument();
    });
  });

  describe("Desktop View", () => {
    it("renders desktop bar with correct styling", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const desktop = container.querySelector(".hidden.md\\:flex");
      expect(desktop).toHaveClass("bg-blue-50", "dark:bg-blue-900/30");
    });

    it("renders clear selection button", () => {
      render(<BulkActionBar {...defaultProps} />);
      const clearButtons = screen.getAllByText("Clear selection");
      expect(clearButtons.length).toBeGreaterThan(0);
    });

    it("calls onClearSelection when clear button clicked", () => {
      const onClearSelection = jest.fn();
      render(
        <BulkActionBar {...defaultProps} onClearSelection={onClearSelection} />
      );

      const clearButtons = screen.getAllByText("Clear selection");
      fireEvent.click(clearButtons[0]);

      expect(onClearSelection).toHaveBeenCalledTimes(1);
    });

    it("renders all action buttons", () => {
      render(<BulkActionBar {...defaultProps} />);
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Archive").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Download").length).toBeGreaterThan(0);
    });
  });

  describe("Mobile View", () => {
    it("renders mobile bar with fixed positioning", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const mobile = container.querySelector(".md\\:hidden.fixed");
      expect(mobile).toHaveClass("bottom-0", "left-0", "right-0");
    });

    it("renders close icon button with aria-label", () => {
      render(<BulkActionBar {...defaultProps} />);
      const closeButton = screen.getByLabelText("Clear selection");
      expect(closeButton).toBeInTheDocument();
    });

    it("uses grid layout for actions on mobile", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const grid = container.querySelector(".grid.grid-cols-2");
      expect(grid).toBeInTheDocument();
    });

    it("truncates long action labels on mobile", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const mobile = container.querySelector(".md\\:hidden");
      const truncate = mobile?.querySelector(".truncate");
      expect(truncate).toBeInTheDocument();
    });
  });

  describe("Action Variants", () => {
    it("applies danger variant styling", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const deleteButtons = screen.getAllByText("Delete");
      const button = deleteButtons[0].closest("button");
      expect(button).toHaveClass("bg-red-600", "hover:bg-red-700");
    });

    it("applies warning variant styling", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const archiveButtons = screen.getAllByText("Archive");
      const button = archiveButtons[0].closest("button");
      expect(button).toHaveClass("bg-yellow-600", "hover:bg-yellow-700");
    });

    it("applies default variant styling", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const downloadButtons = screen.getAllByText("Download");
      const button = downloadButtons[0].closest("button");
      expect(button).toHaveClass("bg-blue-600", "hover:bg-blue-700");
    });

    it("applies success variant when specified", () => {
      const successAction: BulkAction = {
        id: "approve",
        label: "Approve",
        variant: "success",
      };
      const { container } = render(
        <BulkActionBar {...defaultProps} actions={[successAction]} />
      );
      const button = screen.getAllByText("Approve")[0].closest("button");
      expect(button).toHaveClass("bg-green-600", "hover:bg-green-700");
    });
  });

  describe("Action Execution", () => {
    it("calls onAction immediately for actions without confirm", async () => {
      const onAction = jest.fn().mockResolvedValue(undefined);
      render(<BulkActionBar {...defaultProps} onAction={onAction} />);

      const downloadButtons = screen.getAllByText("Download");
      fireEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(onAction).toHaveBeenCalledWith("download", undefined);
      });
    });

    it("shows confirmation dialog for actions with confirm", () => {
      render(<BulkActionBar {...defaultProps} />);

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText("Delete Items")).toBeInTheDocument();
    });

    it("uses default confirm title when not specified", () => {
      const actionWithoutTitle: BulkAction = {
        id: "test",
        label: "Test Action",
        confirm: true,
      };
      render(
        <BulkActionBar {...defaultProps} actions={[actionWithoutTitle]} />
      );

      const testButtons = screen.getAllByText("Test Action");
      fireEvent.click(testButtons[0]);

      expect(screen.getByText("Confirm Test Action")).toBeInTheDocument();
    });

    it("uses default confirm message when not specified", () => {
      const actionWithoutMessage: BulkAction = {
        id: "test",
        label: "Test",
        confirm: true,
      };
      render(
        <BulkActionBar
          {...defaultProps}
          actions={[actionWithoutMessage]}
          selectedCount={3}
          resourceName="item"
        />
      );

      const testButtons = screen.getAllByText("Test");
      fireEvent.click(testButtons[0]);

      expect(
        screen.getByText(/are you sure you want to test 3 items/i)
      ).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("disables clear button when loading", () => {
      render(<BulkActionBar {...defaultProps} loading={true} />);
      const clearButtons = screen.getAllByText("Clear selection");
      clearButtons.forEach((button) => {
        expect(button.closest("button")).toBeDisabled();
      });
    });

    it("disables action buttons when loading", () => {
      render(<BulkActionBar {...defaultProps} loading={true} />);
      const deleteButtons = screen.getAllByText("Delete");
      deleteButtons.forEach((button) => {
        expect(button.closest("button")).toBeDisabled();
      });
    });

    it("shows loading spinner on mobile during action", async () => {
      const onAction = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<BulkActionBar {...defaultProps} onAction={onAction} />);

      const downloadButtons = screen.getAllByText("Download");
      fireEvent.click(downloadButtons[1]); // Mobile button

      await waitFor(
        () => {
          const spinners = document.querySelectorAll(".animate-spin");
          expect(spinners.length).toBeGreaterThan(0);
        },
        { timeout: 50 }
      );
    });

    it("applies disabled opacity when disabled", () => {
      render(<BulkActionBar {...defaultProps} loading={true} />);
      const buttons = screen.getAllByText("Delete");
      buttons.forEach((button) => {
        expect(button.closest("button")).toHaveClass("disabled:opacity-50");
      });
    });
  });

  describe("Disabled Actions", () => {
    it("disables action when action.disabled is true", () => {
      const disabledAction: BulkAction = {
        id: "disabled",
        label: "Disabled Action",
        disabled: true,
      };
      render(<BulkActionBar {...defaultProps} actions={[disabledAction]} />);

      const buttons = screen.getAllByText("Disabled Action");
      buttons.forEach((button) => {
        expect(button.closest("button")).toBeDisabled();
      });
    });

    it("does not call onAction for disabled actions", () => {
      const onAction = jest.fn();
      const disabledAction: BulkAction = {
        id: "disabled",
        label: "Disabled",
        disabled: true,
      };
      render(
        <BulkActionBar
          {...defaultProps}
          actions={[disabledAction]}
          onAction={onAction}
        />
      );

      const buttons = screen.getAllByText("Disabled");
      fireEvent.click(buttons[0]);

      expect(onAction).not.toHaveBeenCalled();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to desktop bar", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const desktop = container.querySelector(".hidden.md\\:flex");
      expect(desktop).toHaveClass(
        "dark:bg-blue-900/30",
        "dark:border-blue-800"
      );
    });

    it("applies dark mode classes to mobile bar", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const mobile = container.querySelector(".md\\:hidden.fixed");
      expect(mobile).toHaveClass("dark:bg-gray-800", "dark:border-blue-800");
    });

    it("applies dark mode text colors", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const text = container.querySelector(".dark\\:text-white");
      expect(text).toBeInTheDocument();
    });

    it("applies dark mode hover states", () => {
      render(<BulkActionBar {...defaultProps} />);
      const clearButtons = screen.getAllByText("Clear selection");
      expect(clearButtons[0]).toHaveClass(
        "dark:text-blue-400",
        "dark:hover:text-blue-300"
      );
    });
  });

  describe("Responsive Design", () => {
    it("hides desktop view on mobile", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const desktop = container.querySelector(".hidden.md\\:flex");
      expect(desktop).toHaveClass("hidden");
    });

    it("shows desktop view on md+ screens", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const desktop = container.querySelector(".hidden.md\\:flex");
      expect(desktop).toHaveClass("md:flex");
    });

    it("hides mobile view on md+ screens", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const mobile = container.querySelector(".md\\:hidden");
      expect(mobile).toHaveClass("md:hidden");
    });

    it("uses safe-bottom class for mobile notch support", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const mobile = container.querySelector(".safe-bottom");
      expect(mobile).toBeInTheDocument();
    });
  });

  describe("Resource Name Pluralization", () => {
    it("adds 's' for simple pluralization", () => {
      render(
        <BulkActionBar
          {...defaultProps}
          selectedCount={2}
          resourceName="item"
        />
      );
      expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();
    });

    it("handles custom resource names", () => {
      render(
        <BulkActionBar
          {...defaultProps}
          selectedCount={3}
          resourceName="product"
        />
      );
      expect(screen.getByText(/3 products selected/i)).toBeInTheDocument();
    });

    it("uses default 'item' when not specified", () => {
      render(<BulkActionBar {...defaultProps} selectedCount={2} />);
      expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("renders action icons when provided", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      // Icons are rendered as SVG elements
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("renders action without icon gracefully", () => {
      const actionWithoutIcon: BulkAction = {
        id: "no-icon",
        label: "No Icon",
      };
      render(<BulkActionBar {...defaultProps} actions={[actionWithoutIcon]} />);
      expect(screen.getAllByText("No Icon").length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty actions array", () => {
      const { container } = render(
        <BulkActionBar {...defaultProps} actions={[]} />
      );
      expect(container.firstChild).toBeInTheDocument(); // Still renders bar
    });

    it("handles very long action labels", () => {
      const longAction: BulkAction = {
        id: "long",
        label: "Very Long Action Label That Should Be Truncated",
      };
      render(<BulkActionBar {...defaultProps} actions={[longAction]} />);
      expect(screen.getAllByText(/Very Long Action/i).length).toBeGreaterThan(
        0
      );
    });

    it("handles special characters in resource name", () => {
      render(
        <BulkActionBar
          {...defaultProps}
          selectedCount={2}
          resourceName="item-type"
        />
      );
      expect(screen.getByText(/item-types/i)).toBeInTheDocument();
    });

    it("handles very large selection counts", () => {
      render(<BulkActionBar {...defaultProps} selectedCount={9999} />);
      const elements = screen.getAllByText(/9999/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("uses button type='button' for all actions", () => {
      const { container } = render(<BulkActionBar {...defaultProps} />);
      const buttons = container.querySelectorAll("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("has aria-label for mobile close button", () => {
      render(<BulkActionBar {...defaultProps} />);
      const closeButton = screen.getByLabelText("Clear selection");
      expect(closeButton).toBeInTheDocument();
    });

    it("applies cursor-not-allowed when disabled", () => {
      render(<BulkActionBar {...defaultProps} loading={true} />);
      const buttons = screen.getAllByText("Delete");
      buttons.forEach((button) => {
        expect(button.closest("button")).toHaveClass(
          "disabled:cursor-not-allowed"
        );
      });
    });
  });

  describe("Integration with ConfirmDialog", () => {
    it("passes correct variant to ConfirmDialog", () => {
      render(<BulkActionBar {...defaultProps} />);

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      // Dialog should be visible
      expect(screen.getByText("Delete Items")).toBeInTheDocument();
    });

    it("closes dialog and clears state after action", async () => {
      const onAction = jest.fn().mockResolvedValue(undefined);
      const { container } = render(
        <BulkActionBar {...defaultProps} onAction={onAction} />
      );

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      // Confirm in dialog - get button that's inside the dialog
      const dialog = container.querySelector(".fixed.inset-0.z-50");
      const confirmButton = dialog?.querySelector("button.bg-red-600");
      if (confirmButton) {
        fireEvent.click(confirmButton);
      }

      await waitFor(() => {
        expect(screen.queryByText("Delete Items")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("handles action errors gracefully", async () => {
      const { toast } = require("sonner");
      const onAction = jest.fn().mockRejectedValue(new Error("Action failed"));

      render(<BulkActionBar {...defaultProps} onAction={onAction} />);

      const downloadButtons = screen.getAllByText("Download");
      fireEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to execute action");
      });
    });

    it("logs errors when action fails", async () => {
      const { logError } = require("@/lib/error-logger");
      const error = new Error("Test error");
      const onAction = jest.fn().mockRejectedValue(error);

      render(<BulkActionBar {...defaultProps} onAction={onAction} />);

      const downloadButtons = screen.getAllByText("Download");
      fireEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(error, expect.any(Object));
      });
    });
  });
});
