import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FormInput } from "../FormInput";

describe("FormInput", () => {
  it("should render with label", () => {
    render(<FormInput id="test" label="Test Label" />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should display error message", () => {
    render(<FormInput id="test" label="Test" error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should display helper text", () => {
    render(<FormInput id="test" label="Test" helperText="Helper text" />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<FormInput id="test" label="Test" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should handle user input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<FormInput id="test" label="Test" onChange={onChange} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "Hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("should display character count when maxLength is provided", () => {
    render(<FormInput id="test" label="Test" maxLength={100} value="Hello" />);
    expect(screen.getByText(/5.*100/)).toBeInTheDocument();
  });

  it("should render with different sizes", () => {
    const { rerender } = render(<FormInput id="test" label="Test" size="sm" />);
    expect(screen.getByRole("textbox")).toHaveClass("text-sm");

    rerender(<FormInput id="test" label="Test" size="lg" />);
    expect(screen.getByRole("textbox")).toHaveClass("text-lg");
  });

  it("should apply error styling", () => {
    render(<FormInput id="test" label="Test" error="Error" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-error");
  });
});
