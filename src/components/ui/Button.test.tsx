import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";
import { Loader2 } from "lucide-react";

jest.mock("lucide-react", () => ({
  Loader2: ({ className }: any) => (
    <div data-testid="loader-icon" className={className} />
  ),
}));

describe("Button", () => {
  describe("Basic Rendering", () => {
    it("renders button with text", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("renders as button element", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Click me</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("Variants", () => {
    it("applies primary variant styles by default", () => {
      render(<Button>Primary</Button>);
      const button = screen.getByText("Primary");
      expect(button).toHaveClass("bg-blue-600");
    });

    it("applies secondary variant styles", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByText("Secondary");
      expect(button).toHaveClass("bg-gray-200");
    });

    it("applies danger variant styles", () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByText("Danger");
      expect(button).toHaveClass("bg-red-600");
    });

    it("applies ghost variant styles", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByText("Ghost");
      expect(button).toHaveClass("bg-transparent");
    });

    it("applies outline variant styles", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByText("Outline");
      expect(button).toHaveClass("border-2");
    });
  });

  describe("Sizes", () => {
    it("applies medium size by default", () => {
      render(<Button>Medium</Button>);
      const button = screen.getByText("Medium");
      expect(button).toHaveClass("px-4", "py-2");
    });

    it("applies small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByText("Small");
      expect(button).toHaveClass("px-3", "py-1.5");
    });

    it("applies large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByText("Large");
      expect(button).toHaveClass("px-6", "py-3");
    });
  });

  describe("Loading State", () => {
    it("shows loader when isLoading is true", () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("hides content when loading", () => {
      render(
        <Button isLoading leftIcon={<div data-testid="left" />}>
          Submit
        </Button>
      );
      expect(screen.queryByTestId("left")).not.toBeInTheDocument();
    });

    it("disables button when loading", () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("sets aria-busy when loading", () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });

    it("shows loading screen reader text", () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByText("Loading...")).toHaveClass("sr-only");
    });
  });

  describe("Icons", () => {
    it("renders left icon", () => {
      render(<Button leftIcon={<div data-testid="left-icon" />}>Click</Button>);
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    it("renders right icon", () => {
      render(
        <Button rightIcon={<div data-testid="right-icon" />}>Click</Button>
      );
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("renders both icons", () => {
      render(
        <Button
          leftIcon={<div data-testid="left-icon" />}
          rightIcon={<div data-testid="right-icon" />}
        >
          Click
        </Button>
      );
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("hides icons when loading", () => {
      render(
        <Button
          isLoading
          leftIcon={<div data-testid="left-icon" />}
          rightIcon={<div data-testid="right-icon" />}
        >
          Click
        </Button>
      );
      expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
      expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
    });

    it("sets aria-hidden on icons", () => {
      render(<Button leftIcon={<div>Icon</div>}>Click</Button>);
      const iconContainer = screen.getByText("Icon").parentElement;
      expect(iconContainer).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Full Width", () => {
    it("applies full width class when fullWidth is true", () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByText("Full Width")).toHaveClass("w-full");
    });

    it("does not apply full width by default", () => {
      render(<Button>Normal</Button>);
      expect(screen.getByText("Normal")).not.toHaveClass("w-full");
    });
  });

  describe("Disabled State", () => {
    it("disables button when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("applies disabled cursor style", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toHaveClass(
        "disabled:cursor-not-allowed"
      );
    });

    it("does not call onClick when disabled", () => {
      const onClick = jest.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("Click Handler", () => {
    it("calls onClick when clicked", () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click me</Button>);
      fireEvent.click(screen.getByText("Click me"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when loading", () => {
      const onClick = jest.fn();
      render(
        <Button isLoading onClick={onClick}>
          Click me
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("Custom Props", () => {
    it("applies custom className", () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByText("Custom")).toHaveClass("custom-class");
    });

    it("passes through HTML button attributes", () => {
      render(
        <Button type="submit" name="submit-btn">
          Submit
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("name", "submit-btn");
    });

    it("handles aria attributes", () => {
      render(<Button aria-label="Custom label">Click</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Custom label"
      );
    });
  });

  describe("Edge Cases", () => {
    it("renders with empty children", () => {
      render(<Button></Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders with multiple children", () => {
      render(
        <Button>
          <span>Part 1</span>
          <span>Part 2</span>
        </Button>
      );
      expect(screen.getByText("Part 1")).toBeInTheDocument();
      expect(screen.getByText("Part 2")).toBeInTheDocument();
    });

    it("combines loading and disabled states", () => {
      render(
        <Button isLoading disabled>
          Both
        </Button>
      );
      expect(screen.getByRole("button")).toBeDisabled();
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });
  });
});
