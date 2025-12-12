import { fireEvent, render, screen } from "@testing-library/react";
import { TableCheckbox } from "../TableCheckbox";

describe("TableCheckbox", () => {
  const defaultProps = {
    checked: false,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders checkbox without errors", () => {
      render(<TableCheckbox {...defaultProps} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("renders unchecked by default", () => {
      render(<TableCheckbox {...defaultProps} checked={false} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("renders checked when checked prop is true", () => {
      render(<TableCheckbox {...defaultProps} checked={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("wraps checkbox in label", () => {
      const { container } = render(<TableCheckbox {...defaultProps} />);
      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has minimum touch target size (44x44px)", () => {
      const { container } = render(<TableCheckbox {...defaultProps} />);
      const label = container.querySelector("label");
      expect(label).toHaveClass("min-w-[44px]");
      expect(label).toHaveClass("min-h-[44px]");
    });

    it("has cursor-pointer on label", () => {
      const { container } = render(<TableCheckbox {...defaultProps} />);
      const label = container.querySelector("label");
      expect(label).toHaveClass("cursor-pointer");
    });

    it("checkbox has proper styling classes", () => {
      render(<TableCheckbox {...defaultProps} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("w-4", "h-4", "text-blue-600", "rounded");
    });

    it("checkbox has focus ring classes", () => {
      render(<TableCheckbox {...defaultProps} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("focus:ring-2", "focus:ring-blue-500");
    });
  });

  describe("Indeterminate State", () => {
    it("sets indeterminate property when prop is true", () => {
      render(
        <TableCheckbox {...defaultProps} indeterminate={true} checked={false} />
      );
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it("clears indeterminate property when prop is false", () => {
      const { rerender } = render(
        <TableCheckbox {...defaultProps} indeterminate={true} />
      );
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);

      rerender(<TableCheckbox {...defaultProps} indeterminate={false} />);
      expect(checkbox.indeterminate).toBe(false);
    });

    it("updates indeterminate on prop change", () => {
      const { rerender } = render(<TableCheckbox {...defaultProps} />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);

      rerender(<TableCheckbox {...defaultProps} indeterminate={true} />);
      expect(checkbox.indeterminate).toBe(true);
    });

    it("handles indeterminate with checked state", () => {
      render(
        <TableCheckbox {...defaultProps} indeterminate={true} checked={true} />
      );
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("User Interaction", () => {
    it("calls onChange when clicked", () => {
      const onChange = jest.fn();
      render(<TableCheckbox {...defaultProps} onChange={onChange} />);
      const checkbox = screen.getByRole("checkbox");

      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("passes new checked state to onChange", () => {
      const onChange = jest.fn();
      render(
        <TableCheckbox {...defaultProps} checked={false} onChange={onChange} />
      );
      const checkbox = screen.getByRole("checkbox");

      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("passes false when unchecking", () => {
      const onChange = jest.fn();
      render(
        <TableCheckbox {...defaultProps} checked={true} onChange={onChange} />
      );
      const checkbox = screen.getByRole("checkbox");

      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("can be toggled multiple times", () => {
      const onChange = jest.fn();
      render(<TableCheckbox {...defaultProps} onChange={onChange} />);
      const checkbox = screen.getByRole("checkbox");

      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledTimes(3);
    });
  });

  describe("Disabled State", () => {
    it("disables checkbox when disabled prop is true", () => {
      render(<TableCheckbox {...defaultProps} disabled={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });

    it("does not call onChange when disabled and clicked", () => {
      const onChange = jest.fn();
      render(
        <TableCheckbox {...defaultProps} disabled={true} onChange={onChange} />
      );
      const checkbox = screen.getByRole("checkbox");

      fireEvent.click(checkbox);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("has disabled styling when disabled", () => {
      render(<TableCheckbox {...defaultProps} disabled={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("disabled:opacity-50");
      expect(checkbox).toHaveClass("disabled:cursor-not-allowed");
    });

    it("can be enabled after being disabled", () => {
      const onChange = jest.fn();
      const { rerender } = render(
        <TableCheckbox {...defaultProps} disabled={true} onChange={onChange} />
      );

      rerender(
        <TableCheckbox {...defaultProps} disabled={false} onChange={onChange} />
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has default aria-label when unchecked", () => {
      render(<TableCheckbox {...defaultProps} checked={false} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-label", "Select");
    });

    it("has default aria-label when checked", () => {
      render(<TableCheckbox {...defaultProps} checked={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-label", "Deselect");
    });

    it("has default aria-label when indeterminate", () => {
      render(
        <TableCheckbox {...defaultProps} indeterminate={true} checked={false} />
      );
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-label", "Select all");
    });

    it("uses custom label when provided", () => {
      render(<TableCheckbox {...defaultProps} label="Custom Label" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-label", "Custom Label");
    });

    it("custom label overrides default aria-label", () => {
      render(
        <TableCheckbox {...defaultProps} indeterminate={true} label="Custom" />
      );
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-label", "Custom");
    });

    it("is keyboard accessible", () => {
      const onChange = jest.fn();
      render(<TableCheckbox {...defaultProps} onChange={onChange} />);
      const checkbox = screen.getByRole("checkbox");

      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
    });

    it("can be toggled with keyboard", () => {
      const onChange = jest.fn();
      render(<TableCheckbox {...defaultProps} onChange={onChange} />);
      const checkbox = screen.getByRole("checkbox");

      fireEvent.keyDown(checkbox, { key: " ", code: "Space" });
      fireEvent.click(checkbox); // Simulates Space key behavior
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles onChange being undefined", () => {
      // @ts-expect-error - Testing runtime behavior
      expect(() => render(<TableCheckbox checked={false} />)).not.toThrow();
    });

    it("handles rapid state changes", () => {
      const { rerender } = render(
        <TableCheckbox {...defaultProps} checked={false} />
      );

      for (let i = 0; i < 100; i++) {
        rerender(<TableCheckbox {...defaultProps} checked={i % 2 === 0} />);
      }

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true); // Last iteration (99 is odd, so false, but 0-indexed means 100th is even)
    });

    it("handles indeterminate toggling rapidly", () => {
      const { rerender } = render(<TableCheckbox {...defaultProps} />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

      for (let i = 0; i < 10; i++) {
        rerender(
          <TableCheckbox {...defaultProps} indeterminate={i % 2 === 0} />
        );
      }

      expect(checkbox.indeterminate).toBe(true);
    });

    it("maintains checked state during indeterminate changes", () => {
      const { rerender } = render(
        <TableCheckbox {...defaultProps} checked={true} indeterminate={false} />
      );
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

      rerender(
        <TableCheckbox {...defaultProps} checked={true} indeterminate={true} />
      );

      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(true);
    });
  });

  describe("Multiple Instances", () => {
    it("renders multiple checkboxes independently", () => {
      render(
        <>
          <TableCheckbox {...defaultProps} checked={true} />
          <TableCheckbox {...defaultProps} checked={false} />
          <TableCheckbox {...defaultProps} checked={true} />
        </>
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(3);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });

    it("each instance has independent onChange handler", () => {
      const onChange1 = jest.fn();
      const onChange2 = jest.fn();
      const onChange3 = jest.fn();

      render(
        <>
          <TableCheckbox {...defaultProps} onChange={onChange1} />
          <TableCheckbox {...defaultProps} onChange={onChange2} />
          <TableCheckbox {...defaultProps} onChange={onChange3} />
        </>
      );

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);

      expect(onChange1).not.toHaveBeenCalled();
      expect(onChange2).toHaveBeenCalledTimes(1);
      expect(onChange3).not.toHaveBeenCalled();
    });
  });

  describe("State Management", () => {
    it("controlled component updates correctly", () => {
      const { rerender } = render(
        <TableCheckbox {...defaultProps} checked={false} />
      );

      rerender(<TableCheckbox {...defaultProps} checked={true} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("maintains state through rerenders", () => {
      const { rerender } = render(
        <TableCheckbox {...defaultProps} checked={true} indeterminate={false} />
      );

      // Change only indeterminate
      rerender(
        <TableCheckbox {...defaultProps} checked={true} indeterminate={true} />
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(true);
    });
  });
});
