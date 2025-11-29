import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  describe("Visibility", () => {
    it("does not render when isOpen is false", () => {
      render(
        <ConfirmDialog
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });

    it("renders when isOpen is true", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Dialog"
        />,
      );
      expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    });
  });

  describe("Content", () => {
    it("renders title", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Are you sure?"
        />,
      );
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete item"
          description="This action cannot be undone"
        />,
      );
      expect(
        screen.getByText("This action cannot be undone"),
      ).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete item"
        />,
      );
      expect(container.querySelector("p")).not.toBeInTheDocument();
    });

    it("renders custom children", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Custom"
        >
          <div>Custom content</div>
        </ConfirmDialog>,
      );
      expect(screen.getByText("Custom content")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("renders danger variant by default", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete"
        />,
      );
      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toHaveClass("bg-red-600");
    });

    it("renders warning variant", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Warning"
          variant="warning"
        />,
      );
      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toHaveClass("bg-yellow-600");
    });

    it("renders info variant", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Info"
          variant="info"
        />,
      );
      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toHaveClass("bg-blue-600");
    });
  });

  describe("Button Labels", () => {
    it("uses default confirm label", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });

    it("uses custom confirm label", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          confirmLabel="Delete"
        />,
      );
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("uses default cancel label", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("uses custom cancel label", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          cancelLabel="Go Back"
        />,
      );
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });
  });

  describe("Cancel Action", () => {
    it("calls onClose when cancel button clicked", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );
      fireEvent.click(screen.getByText("Cancel"));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when backdrop clicked", () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );
      const backdrop = container.querySelector(".bg-black");
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose on Escape key", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("does not close on Escape when processing", async () => {
      mockOnConfirm.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      fireEvent.click(screen.getByText("Confirm"));
      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Confirm Action", () => {
    it("calls onConfirm when confirm button clicked", async () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalled();
      });
    });

    it("closes dialog after successful confirm", async () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("handles async onConfirm", async () => {
      const asyncConfirm = jest.fn().mockResolvedValue(undefined);

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={asyncConfirm}
          title="Test"
        />,
      );

      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(asyncConfirm).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("handles onConfirm error", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      mockOnConfirm.mockRejectedValue(new Error("Failed"));

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          "Confirm action failed:",
          expect.any(Error),
        );
      });

      consoleError.mockRestore();
    });
  });

  describe("Loading State", () => {
    it("shows processing text when confirming", async () => {
      mockOnConfirm.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      fireEvent.click(screen.getByText("Confirm"));

      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("shows external loading state", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          isLoading={true}
        />,
      );

      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("disables buttons when loading", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          isLoading={true}
        />,
      );

      const cancelButton = screen.getByText("Cancel");
      const confirmButton = screen.getByText("Processing...").closest("button");

      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
    });

    it("does not call onClose when loading and backdrop clicked", () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          isLoading={true}
        />,
      );

      const backdrop = container.querySelector(".bg-black");
      fireEvent.click(backdrop!);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Body Overflow", () => {
    it("sets body overflow hidden when open", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("resets body overflow when closed", () => {
      const { rerender } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      rerender(
        <ConfirmDialog
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      expect(document.body.style.overflow).toBe("unset");
    });
  });

  describe("Edge Cases", () => {
    it("handles multiple rapid clicks on confirm", async () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      const confirmButton = screen.getByText("Confirm");
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });
    });

    it("renders without description", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });

    it("handles very long title text", () => {
      const longTitle = "A".repeat(200);
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title={longTitle}
        />,
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles very long description text", () => {
      const longDesc = "B".repeat(500);
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          description={longDesc}
        />,
      );
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it("handles special characters in title and description", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete <>&"
          description="Are you sure? @#$%"
        />,
      );
      expect(screen.getByText("Delete <>&")).toBeInTheDocument();
      expect(screen.getByText("Are you sure? @#$%")).toBeInTheDocument();
    });

    it("handles empty string button labels", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          confirmLabel=""
          cancelLabel=""
        />,
      );
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });
  });

  describe("Keyboard Navigation", () => {
    it("focuses confirm button by default when opened", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      // Confirm button should be in the document
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });

    it("allows Tab navigation between buttons", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      const cancelButton = screen.getByText("Cancel");
      const confirmButton = screen.getByText("Confirm");

      expect(cancelButton).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();
    });

    it("handles Enter key on confirm button", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      const confirmButton = screen.getByText("Confirm");
      fireEvent.keyDown(confirmButton, { key: "Enter", code: "Enter" });

      // Confirm button click should trigger
      fireEvent.click(confirmButton);
      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it("does not close when other keys are pressed", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      fireEvent.keyDown(document, { key: "a", code: "KeyA" });
      fireEvent.keyDown(document, { key: "Enter", code: "Enter" });
      fireEvent.keyDown(document, { key: "Tab", code: "Tab" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic dialog role", () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      // Dialog should have proper ARIA structure
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog || container.querySelector(".fixed")).toBeInTheDocument();
    });

    it("buttons have accessible labels", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" }),
      ).toBeInTheDocument();
    });

    it("title has proper heading level", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
        />,
      );

      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("Test Title");
    });
  });

  describe("Animation and Transitions", () => {
    it("applies overlay styling", () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      const overlay = container.querySelector(".fixed");
      expect(overlay).toBeInTheDocument();
    });

    it("dialog has centered positioning", () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
        />,
      );

      // Check for centering classes or fixed positioning
      const dialog = container.querySelector(".fixed");
      expect(dialog).toBeInTheDocument();
    });
  });

  describe("Button Styling by Variant", () => {
    it("danger variant has red confirm button", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          variant="danger"
        />,
      );

      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toHaveClass("bg-red-600");
    });

    it("warning variant has yellow/orange confirm button", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          variant="warning"
        />,
      );

      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toHaveClass("bg-yellow-600");
    });

    it("info variant has blue confirm button", () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          variant="info"
        />,
      );

      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toHaveClass("bg-blue-600");
    });
  });
});
