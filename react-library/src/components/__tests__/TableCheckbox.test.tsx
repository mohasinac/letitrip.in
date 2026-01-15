import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TableCheckbox } from "../../components/tables/TableCheckbox";

describe("TableCheckbox", () => {
  it("renders unchecked checkbox", () => {
    render(<TableCheckbox checked={false} onChange={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("renders checked checkbox", () => {
    render(<TableCheckbox checked={true} onChange={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onChange when clicked", () => {
    const onChange = vi.fn();
    render(<TableCheckbox checked={false} onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when unchecking", () => {
    const onChange = vi.fn();
    render(<TableCheckbox checked={true} onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(
      <TableCheckbox checked={false} onChange={onChange} disabled={true} />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders with disabled state", () => {
    render(
      <TableCheckbox checked={false} onChange={() => {}} disabled={true} />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("sets indeterminate state", () => {
    render(
      <TableCheckbox checked={false} onChange={() => {}} indeterminate={true} />
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it("updates indeterminate state when prop changes", () => {
    const { rerender } = render(
      <TableCheckbox
        checked={false}
        onChange={() => {}}
        indeterminate={false}
      />
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(false);

    rerender(
      <TableCheckbox checked={false} onChange={() => {}} indeterminate={true} />
    );
    expect(checkbox.indeterminate).toBe(true);
  });

  it("applies default aria-label for unchecked state", () => {
    render(<TableCheckbox checked={false} onChange={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "Select");
  });

  it("applies default aria-label for checked state", () => {
    render(<TableCheckbox checked={true} onChange={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "Deselect");
  });

  it("applies default aria-label for indeterminate state", () => {
    render(
      <TableCheckbox checked={false} onChange={() => {}} indeterminate={true} />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "Select all");
  });

  it("uses custom label when provided", () => {
    render(
      <TableCheckbox checked={false} onChange={() => {}} label="Custom label" />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "Custom label");
  });

  it("custom label overrides default aria-label", () => {
    render(
      <TableCheckbox
        checked={true}
        onChange={() => {}}
        indeterminate={true}
        label="My custom label"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "My custom label");
  });

  it("renders with touch-friendly minimum size", () => {
    const { container } = render(
      <TableCheckbox checked={false} onChange={() => {}} />
    );

    const label = container.querySelector("label");
    expect(label).toHaveClass("min-w-[44px]");
    expect(label).toHaveClass("min-h-[44px]");
  });

  it("applies correct styling classes", () => {
    const { container } = render(
      <TableCheckbox checked={false} onChange={() => {}} />
    );

    const label = container.querySelector("label");
    expect(label).toHaveClass("flex");
    expect(label).toHaveClass("items-center");
    expect(label).toHaveClass("cursor-pointer");
    expect(label).toHaveClass("justify-center");
  });

  it("checkbox has correct styling", () => {
    render(<TableCheckbox checked={false} onChange={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("w-4");
    expect(checkbox).toHaveClass("h-4");
    expect(checkbox).toHaveClass("rounded");
  });

  it("handles rapid clicks correctly", () => {
    const onChange = vi.fn();
    render(<TableCheckbox checked={false} onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("maintains checked state through indeterminate changes", () => {
    const { rerender } = render(
      <TableCheckbox checked={true} onChange={() => {}} indeterminate={false} />
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    rerender(
      <TableCheckbox checked={true} onChange={() => {}} indeterminate={true} />
    );
    expect(checkbox.checked).toBe(true);
    expect(checkbox.indeterminate).toBe(true);
  });

  it("can be checked while disabled", () => {
    render(
      <TableCheckbox checked={true} onChange={() => {}} disabled={true} />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
  });

  it("prevents onChange when disabled and clicked", () => {
    const onChange = vi.fn();
    render(
      <TableCheckbox checked={false} onChange={onChange} disabled={true} />
    );

    const checkbox = screen.getByRole("checkbox");

    // Try to click
    fireEvent.click(checkbox);

    // onChange should not be called
    expect(onChange).not.toHaveBeenCalled();
  });
});
