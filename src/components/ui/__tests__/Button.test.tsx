import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "../Button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders with default props", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it("renders with custom text", () => {
      render(<Button>Custom Text</Button>);
      expect(screen.getByText("Custom Text")).toBeInTheDocument();
    });

    it("renders as disabled", () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("renders in loading state", () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toBeDisabled();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders primary variant", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-blue-600");
    });

    it("renders secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gray-200");
    });

    it("renders danger variant", () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-red-600");
    });

    it("renders ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent");
    });

    it("renders outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border-2");
    });
  });

  describe("sizes", () => {
    it("renders small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-3", "py-1.5", "text-sm");
    });

    it("renders medium size (default)", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-4", "py-2", "text-base");
    });

    it("renders large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-6", "py-3", "text-lg");
    });
  });

  describe("icons", () => {
    it("renders with left icon", () => {
      render(
        <Button leftIcon={<Home data-testid="left-icon" />}>With Icon</Button>
      );
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    it("renders with right icon", () => {
      render(
        <Button rightIcon={<ChevronRight data-testid="right-icon" />}>
          Next
        </Button>
      );
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("renders with both left and right icons", () => {
      render(
        <Button
          leftIcon={<Home data-testid="left-icon" />}
          rightIcon={<ChevronRight data-testid="right-icon" />}
        >
          Both Icons
        </Button>
      );
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("hides icons when loading", () => {
      render(
        <Button
          isLoading
          leftIcon={<Home data-testid="left-icon" />}
          rightIcon={<ChevronRight data-testid="right-icon" />}
        >
          Loading
        </Button>
      );
      expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
      expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("renders full width when specified", () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full");
    });

    it("renders inline by default", () => {
      render(<Button>Inline</Button>);
      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("w-full");
    });
  });

  describe("interactions", () => {
    it("calls onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when loading", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick} isLoading>
          Loading
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("has correct role", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("supports aria-label", () => {
      render(<Button aria-label="Custom label">Icon Only</Button>);
      expect(screen.getByLabelText("Custom label")).toBeInTheDocument();
    });

    it("has aria-busy when loading", () => {
      render(<Button isLoading>Loading</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });

    it("has screen reader text when loading", () => {
      render(<Button isLoading>Loading</Button>);
      expect(screen.getByText("Loading...")).toHaveClass("sr-only");
    });

    it("icons are hidden from screen readers", () => {
      render(
        <Button leftIcon={<Home />} rightIcon={<ChevronRight />}>
          With Icons
        </Button>
      );
      const spans = screen.getAllByRole("button")[0].querySelectorAll("span");
      spans.forEach((span) => {
        if (span.querySelector("svg")) {
          expect(span).toHaveAttribute("aria-hidden", "true");
        }
      });
    });
  });

  describe("custom className", () => {
    it("applies custom className", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("merges custom className with default classes", () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("bg-blue-600"); // default primary variant
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to button element", () => {
      const ref = jest.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("native button props", () => {
    it("supports type attribute", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("supports form attribute", () => {
      render(<Button form="my-form">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("form", "my-form");
    });

    it("supports name attribute", () => {
      render(<Button name="action">Action</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("name", "action");
    });

    it("supports value attribute", () => {
      render(<Button value="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("value", "submit");
    });
  });
});
