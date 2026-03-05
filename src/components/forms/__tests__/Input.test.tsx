import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

describe("Input Component", () => {
  it("renders input field", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows required indicator when required", () => {
    render(<Input label="Email" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("displays helper text", () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("applies error styling when error is present", () => {
    render(<Input error="Error" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass(...THEME_CONSTANTS.input.error.split(" "));
  });

  it("handles user input", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole("textbox");

    await user.type(input, "test@example.com");
    expect(input).toHaveValue("test@example.com");
  });

  it("can be disabled", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("supports different input types", () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
  });

  it("renders with icon", () => {
    const icon = <span data-testid="icon">@</span>;
    render(<Input icon={icon} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies padding when icon is present", () => {
    const icon = <span>@</span>;
    render(<Input icon={icon} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass(THEME_CONSTANTS.input.withIcon);
  });

  it("accepts custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("supports placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });
  it('renders rightIcon', () => {
    const rightIcon = <span data-testid="right-icon">x</span>;
    render(<Input rightIcon={rightIcon} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('shows success indicator when success prop is true', () => {
    const { container } = render(<Input success />);
    const successSvg = container.querySelector('.text-emerald-500');
    expect(successSvg).toBeInTheDocument();
  });

  it('does not show success indicator when error is also set', () => {
    const { container } = render(<Input success error="Error" />);
    const successSvg = container.querySelector('.text-emerald-500');
    expect(successSvg).not.toBeInTheDocument();
  });});
