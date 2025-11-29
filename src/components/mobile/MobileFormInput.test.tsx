import { render, screen, fireEvent } from "@testing-library/react";
import { MobileFormInput } from "./MobileFormInput";

describe("MobileFormInput", () => {
  it("renders with label", () => {
    render(<MobileFormInput label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows required indicator when required", () => {
    render(<MobileFormInput label="Email" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    render(<MobileFormInput label="Email" error="Invalid email format" />);
    expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows helper text when provided", () => {
    render(
      <MobileFormInput label="Email" helperText="Enter your work email" />,
    );
    expect(screen.getByText("Enter your work email")).toBeInTheDocument();
  });

  it("prioritizes error over helper text", () => {
    render(
      <MobileFormInput
        label="Email"
        error="Invalid"
        helperText="Enter your email"
      />,
    );
    expect(screen.getByText("Invalid")).toBeInTheDocument();
    expect(screen.queryByText("Enter your email")).not.toBeInTheDocument();
  });

  it("renders left icon when provided", () => {
    render(
      <MobileFormInput
        label="Search"
        leftIcon={<span data-testid="left-icon">🔍</span>}
      />,
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("renders right icon when provided", () => {
    render(
      <MobileFormInput
        label="Password"
        rightIcon={<span data-testid="right-icon">👁</span>}
      />,
    );
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("applies disabled styles when disabled", () => {
    render(<MobileFormInput label="Email" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("textbox")).toHaveClass("bg-gray-100");
  });

  it("has correct inputMode for email type", () => {
    render(<MobileFormInput label="Email" type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("inputMode", "email");
  });

  it("has correct inputMode for tel type", () => {
    render(<MobileFormInput label="Phone" type="tel" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("inputMode", "tel");
  });

  it("has correct inputMode for number type", () => {
    render(<MobileFormInput label="Age" type="number" />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute(
      "inputMode",
      "numeric",
    );
  });

  it("sets aria-invalid when error is present", () => {
    render(<MobileFormInput label="Email" error="Invalid" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("has minimum height of 48px for touch target", () => {
    render(<MobileFormInput label="Email" />);
    expect(screen.getByRole("textbox")).toHaveClass("min-h-[48px]");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<MobileFormInput label="Email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("handles onChange correctly", () => {
    const handleChange = jest.fn();
    render(<MobileFormInput label="Email" onChange={handleChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test@example.com" },
    });
    expect(handleChange).toHaveBeenCalled();
  });
});
