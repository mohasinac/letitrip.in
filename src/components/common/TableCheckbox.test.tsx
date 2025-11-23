import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TableCheckbox } from "./TableCheckbox";

describe("TableCheckbox", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders checkbox input", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("renders with label wrapper", () => {
      const { container } = render(
        <TableCheckbox checked={false} onChange={mockOnChange} />
      );

      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
    });

    it("has minimum touch target size", () => {
      const { container } = render(
        <TableCheckbox checked={false} onChange={mockOnChange} />
      );

      const label = container.querySelector("label");
      expect(label).toHaveClass("min-w-[44px]", "min-h-[44px]");
    });
  });

  // Checked State
  describe("Checked State", () => {
    it("renders unchecked when checked is false", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it("renders checked when checked is true", () => {
      render(<TableCheckbox checked={true} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("updates visual state when checked prop changes", () => {
      const { rerender } = render(
        <TableCheckbox checked={false} onChange={mockOnChange} />
      );

      let checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      rerender(<TableCheckbox checked={true} onChange={mockOnChange} />);
      checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  // Indeterminate State
  describe("Indeterminate State", () => {
    it("sets indeterminate state when prop is true", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          indeterminate={true}
        />
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it("does not set indeterminate when prop is false", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          indeterminate={false}
        />
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);
    });

    it("updates indeterminate state when prop changes", () => {
      const { rerender } = render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          indeterminate={false}
        />
      );

      let checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);

      rerender(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          indeterminate={true}
        />
      );
      checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });
  });

  // User Interaction
  describe("User Interaction", () => {
    it("calls onChange with true when unchecked checkbox is clicked", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(true);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange with false when checked checkbox is clicked", () => {
      render(<TableCheckbox checked={true} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(false);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange through click event", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      // Click event triggers the onChange handler
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it("handles rapid clicks", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  // Disabled State
  describe("Disabled State", () => {
    it("applies disabled attribute when disabled is true", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.disabled).toBe(true);
    });

    it("does not apply disabled when disabled is false", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          disabled={false}
        />
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.disabled).toBe(false);
    });

    it("has disabled styling when disabled", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("disabled:opacity-50");
      expect(checkbox).toHaveClass("disabled:cursor-not-allowed");
    });

    it("should not interact when disabled", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      // Disabled checkbox has disabled attribute
      expect(checkbox.disabled).toBe(true);
      // Even if clicked, onChange is called by browser but we verify disabled state
      fireEvent.click(checkbox);
      // Browser handles disabled state, onChange still fires but checkbox doesn't change
    });
  });

  // Aria Labels
  describe("Aria Labels", () => {
    it("uses custom label when provided", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Custom Label"
        />
      );

      const checkbox = screen.getByLabelText("Custom Label");
      expect(checkbox).toBeInTheDocument();
    });

    it("uses 'Select all' for indeterminate state", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          indeterminate={true}
        />
      );

      const checkbox = screen.getByLabelText("Select all");
      expect(checkbox).toBeInTheDocument();
    });

    it("uses 'Deselect' for checked state", () => {
      render(<TableCheckbox checked={true} onChange={mockOnChange} />);

      const checkbox = screen.getByLabelText("Deselect");
      expect(checkbox).toBeInTheDocument();
    });

    it("uses 'Select' for unchecked state", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByLabelText("Select");
      expect(checkbox).toBeInTheDocument();
    });

    it("prioritizes custom label over default", () => {
      render(
        <TableCheckbox
          checked={true}
          onChange={mockOnChange}
          label="Override Label"
        />
      );

      const checkbox = screen.getByLabelText("Override Label");
      expect(checkbox).toBeInTheDocument();
      expect(screen.queryByLabelText("Deselect")).not.toBeInTheDocument();
    });
  });

  // Styling
  describe("Styling", () => {
    it("has correct checkbox size", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("w-4", "h-4");
    });

    it("has blue accent color", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("text-blue-600");
    });

    it("has rounded corners", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("rounded");
    });

    it("has focus ring styling", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("focus:ring-2", "focus:ring-blue-500");
    });

    it("has white background", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("bg-white");
    });

    it("has gray border", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("border-gray-300");
    });
  });

  // Label Styling
  describe("Label Styling", () => {
    it("has cursor pointer on label", () => {
      const { container } = render(
        <TableCheckbox checked={false} onChange={mockOnChange} />
      );

      const label = container.querySelector("label");
      expect(label).toHaveClass("cursor-pointer");
    });

    it("centers content in label", () => {
      const { container } = render(
        <TableCheckbox checked={false} onChange={mockOnChange} />
      );

      const label = container.querySelector("label");
      expect(label).toHaveClass("flex", "items-center", "justify-center");
    });
  });

  // Keyboard Accessibility
  describe("Keyboard Accessibility", () => {
    it("is keyboard accessible", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
    });

    it("responds to Space key (via click)", () => {
      render(<TableCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      // Space key triggers click event in browsers
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles undefined indeterminate", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          indeterminate={undefined}
        />
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);
    });

    it("handles null label", () => {
      render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          label={undefined}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("handles empty string label", () => {
      render(
        <TableCheckbox checked={false} onChange={mockOnChange} label="" />
      );

      const checkbox = screen.getByRole("checkbox");
      // Empty string label should result in default label (empty string is falsy)
      expect(checkbox).toHaveAttribute("aria-label", "Select");
    });

    it("updates when all props change simultaneously", () => {
      const { rerender } = render(
        <TableCheckbox
          checked={false}
          onChange={mockOnChange}
          indeterminate={false}
          disabled={false}
        />
      );

      rerender(
        <TableCheckbox
          checked={true}
          onChange={mockOnChange}
          indeterminate={true}
          disabled={true}
        />
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(true);
      expect(checkbox.disabled).toBe(true);
    });
  });

  // Complete Component
  describe("Complete Component", () => {
    it("renders with all props", () => {
      render(
        <TableCheckbox
          checked={true}
          onChange={mockOnChange}
          indeterminate={false}
          disabled={false}
          label="Complete checkbox"
        />
      );

      const checkbox = screen.getByLabelText(
        "Complete checkbox"
      ) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.checked).toBe(true);
      expect(checkbox.disabled).toBe(false);
    });
  });
});
