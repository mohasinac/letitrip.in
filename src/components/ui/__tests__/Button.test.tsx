import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

describe("Button Component", () => {
  it("renders button with children", () => {
    render(<Button>Click Me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      ...THEME_CONSTANTS.colors.button.primary.split(" "),
    );
  });

  it("applies outline variant when specified", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      ...THEME_CONSTANTS.colors.button.outline.split(" "),
    );
  });

  it("applies different sizes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-2.5", "py-1.5");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-3", "py-2");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-4", "py-2.5");
  });

  it("meets WCAG 2.5.5 touch target: min-h-[36px] on sm, min-h-[44px] on md and lg", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("min-h-[36px]");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button")).toHaveClass("min-h-[44px]");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("min-h-[44px]");
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click Me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("accepts custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  describe("isLoading", () => {
    it("disables the button when isLoading=true", () => {
      render(<Button isLoading>Saving</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("sets aria-busy when isLoading=true", () => {
      render(<Button isLoading>Saving</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });

    it("renders a spinner SVG when isLoading=true", () => {
      render(<Button isLoading>Saving</Button>);
      // Loader2 renders an SVG with animate-spin
      expect(
        screen.getByRole("button").querySelector("svg"),
      ).toBeInTheDocument();
    });

    it("still shows children text when isLoading=true", () => {
      render(<Button isLoading>Saving</Button>);
      expect(screen.getByText("Saving")).toBeInTheDocument();
    });

    it("does not disable when isLoading=false", () => {
      render(<Button isLoading={false}>Save</Button>);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });
});
