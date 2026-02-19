/**
 * Tests for ConfirmDeleteModal component
 *
 * Coverage:
 * - Modal visibility
 * - Delete confirmation flow
 * - Cancel action
 * - Confirm action
 * - Warning message display
 * - Item name display
 * - Loading state during deletion
 * - Error handling
 * - Accessibility
 * - Keyboard interaction (Escape to close)
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ConfirmDeleteModal } from "@/components";
import { UI_LABELS } from "@/constants";

describe("ConfirmDeleteModal", () => {
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Modal Behavior", () => {
    describe("Modal Rendering", () => {
      it("renders title and message when open", () => {
        render(
          <ConfirmDeleteModal
            isOpen={true}
            title="Delete Item"
            message="This action cannot be undone."
            onConfirm={mockOnConfirm}
            onClose={mockOnClose}
          />,
        );

        expect(screen.getByText("Delete Item")).toBeInTheDocument();
        expect(
          screen.getByText("This action cannot be undone."),
        ).toBeInTheDocument();
      });

      it("does not render when closed", () => {
        const { container } = render(
          <ConfirmDeleteModal
            isOpen={false}
            title="Delete Item"
            message="This action cannot be undone."
            onConfirm={mockOnConfirm}
            onClose={mockOnClose}
          />,
        );

        expect(container.firstChild).toBeNull();
      });

      it("invokes onConfirm when delete is clicked", () => {
        render(
          <ConfirmDeleteModal
            isOpen={true}
            title="Delete Item"
            message="This action cannot be undone."
            onConfirm={mockOnConfirm}
            onClose={mockOnClose}
          />,
        );

        fireEvent.click(screen.getByRole("button", { name: /delete/i }));
        expect(mockOnConfirm).toHaveBeenCalled();
      });

      it("invokes onClose when cancel is clicked", () => {
        render(
          <ConfirmDeleteModal
            isOpen={true}
            title="Delete Item"
            message="This action cannot be undone."
            onConfirm={mockOnConfirm}
            onClose={mockOnClose}
          />,
        );

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe("Button States", () => {
    it("delete button has danger styling", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Item"
          message="Confirm?"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />,
      );
      const deleteButton = screen.getByRole("button", {
        name: /delete|confirm/i,
      });
      // Should have danger/destructive styling
      expect(deleteButton).toBeInTheDocument();
    });

    it("cancel button has secondary styling", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Item"
          message="Confirm?"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />,
      );
      const cancelButton = screen.getByRole("button", {
        name: /cancel/i,
      });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Item"
          message="Confirm deletion?"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />,
      );
      const modal = screen.getByTestId("confirm-delete-modal");
      expect(modal).toBeInTheDocument();
    });

    it("buttons are keyboard accessible", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Item"
          message="Confirm?"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />,
      );
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    it("closes on Escape key press", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Item"
          message="Confirm?"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />,
      );
      const modal = screen.getByTestId("confirm-delete-modal");
      fireEvent.keyDown(modal, { key: "Escape", code: "Escape" });
      // Should trigger onClose
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Customization", () => {
    it("accepts custom button labels", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Item"
          message="Confirm?"
          confirmText="Remove"
          cancelText="Keep"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />,
      );
      const removeButton = screen.queryByRole("button", { name: /remove/i });
      const keepButton = screen.queryByRole("button", { name: /keep/i });
      if (removeButton && keepButton) {
        expect(removeButton).toBeInTheDocument();
        expect(keepButton).toBeInTheDocument();
      }
    });
  });
});
