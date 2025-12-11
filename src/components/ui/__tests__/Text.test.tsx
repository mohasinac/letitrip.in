import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Text } from "../Text";

describe("Text - Consistent Text Component", () => {
  describe("Basic Rendering", () => {
    it("should render text with children", () => {
      render(<Text>Test Text</Text>);
      expect(screen.getByText("Test Text")).toBeInTheDocument();
    });

    it("should default to p tag", () => {
      render(<Text>Default Text</Text>);
      const text = screen.getByText("Default Text");
      expect(text.tagName).toBe("P");
    });

    it("should default to base size", () => {
      render(<Text>Default Text</Text>);
      const text = screen.getByText("Default Text");
      expect(text).toHaveClass("text-base");
    });

    it("should default to default color", () => {
      render(<Text>Default Text</Text>);
      const text = screen.getByText("Default Text");
      expect(text).toHaveClass("text-gray-700", "dark:text-gray-300");
    });

    it("should default to normal weight", () => {
      render(<Text>Default Text</Text>);
      const text = screen.getByText("Default Text");
      expect(text).toHaveClass("font-normal");
    });

    it("should not truncate by default", () => {
      render(<Text>Not Truncated</Text>);
      const text = screen.getByText("Not Truncated");
      expect(text).not.toHaveClass("truncate");
    });
  });

  describe("Size Variants", () => {
    it("should render xs size", () => {
      render(<Text size="xs">Extra Small</Text>);
      expect(screen.getByText("Extra Small")).toHaveClass("text-xs");
    });

    it("should render sm size", () => {
      render(<Text size="sm">Small</Text>);
      expect(screen.getByText("Small")).toHaveClass("text-sm");
    });

    it("should render base size", () => {
      render(<Text size="base">Base</Text>);
      expect(screen.getByText("Base")).toHaveClass("text-base");
    });

    it("should render lg size", () => {
      render(<Text size="lg">Large</Text>);
      expect(screen.getByText("Large")).toHaveClass("text-lg");
    });

    it("should render xl size", () => {
      render(<Text size="xl">Extra Large</Text>);
      expect(screen.getByText("Extra Large")).toHaveClass("text-xl");
    });
  });

  describe("Color Variants", () => {
    it("should render default color", () => {
      render(<Text color="default">Default Color</Text>);
      const text = screen.getByText("Default Color");
      expect(text).toHaveClass("text-gray-700", "dark:text-gray-300");
    });

    it("should render muted color", () => {
      render(<Text color="muted">Muted Color</Text>);
      const text = screen.getByText("Muted Color");
      expect(text).toHaveClass("text-gray-500", "dark:text-gray-400");
    });

    it("should render error color", () => {
      render(<Text color="error">Error Color</Text>);
      const text = screen.getByText("Error Color");
      expect(text).toHaveClass("text-red-600", "dark:text-red-400");
    });

    it("should render success color", () => {
      render(<Text color="success">Success Color</Text>);
      const text = screen.getByText("Success Color");
      expect(text).toHaveClass("text-green-600", "dark:text-green-400");
    });

    it("should render warning color", () => {
      render(<Text color="warning">Warning Color</Text>);
      const text = screen.getByText("Warning Color");
      expect(text).toHaveClass("text-yellow-600", "dark:text-yellow-400");
    });

    it("should render info color", () => {
      render(<Text color="info">Info Color</Text>);
      const text = screen.getByText("Info Color");
      expect(text).toHaveClass("text-blue-600", "dark:text-blue-400");
    });
  });

  describe("Weight Variants", () => {
    it("should render normal weight", () => {
      render(<Text weight="normal">Normal Weight</Text>);
      expect(screen.getByText("Normal Weight")).toHaveClass("font-normal");
    });

    it("should render medium weight", () => {
      render(<Text weight="medium">Medium Weight</Text>);
      expect(screen.getByText("Medium Weight")).toHaveClass("font-medium");
    });

    it("should render semibold weight", () => {
      render(<Text weight="semibold">Semibold Weight</Text>);
      expect(screen.getByText("Semibold Weight")).toHaveClass("font-semibold");
    });

    it("should render bold weight", () => {
      render(<Text weight="bold">Bold Weight</Text>);
      expect(screen.getByText("Bold Weight")).toHaveClass("font-bold");
    });
  });

  describe("Tag Override with 'as' Prop", () => {
    it("should render as p tag by default", () => {
      render(<Text>Paragraph</Text>);
      expect(screen.getByText("Paragraph").tagName).toBe("P");
    });

    it("should render as span tag", () => {
      render(<Text as="span">Span Text</Text>);
      expect(screen.getByText("Span Text").tagName).toBe("SPAN");
    });

    it("should render as div tag", () => {
      render(<Text as="div">Div Text</Text>);
      expect(screen.getByText("Div Text").tagName).toBe("DIV");
    });

    it("should keep styling when rendered as different tag", () => {
      render(
        <Text as="span" size="lg" color="success">
          Styled Span
        </Text>
      );
      const text = screen.getByText("Styled Span");
      expect(text.tagName).toBe("SPAN");
      expect(text).toHaveClass("text-lg", "text-green-600");
    });
  });

  describe("Truncate Prop", () => {
    it("should not truncate by default", () => {
      render(<Text>Not Truncated</Text>);
      expect(screen.getByText("Not Truncated")).not.toHaveClass("truncate");
    });

    it("should truncate when truncate is true", () => {
      render(<Text truncate>Truncated Text</Text>);
      expect(screen.getByText("Truncated Text")).toHaveClass("truncate");
    });

    it("should truncate long text", () => {
      const longText = "A".repeat(200);
      render(<Text truncate>{longText}</Text>);
      expect(screen.getByText(longText)).toHaveClass("truncate");
    });
  });

  describe("Custom Styling", () => {
    it("should accept custom className", () => {
      render(<Text className="custom-text">Styled</Text>);
      expect(screen.getByText("Styled")).toHaveClass("custom-text");
    });

    it("should merge custom className with base classes", () => {
      render(<Text className="text-center underline">Styled</Text>);
      const text = screen.getByText("Styled");
      expect(text).toHaveClass(
        "text-center",
        "underline",
        "text-base",
        "font-normal"
      );
    });

    it("should accept custom id", () => {
      render(<Text id="custom-text">ID Text</Text>);
      expect(screen.getByText("ID Text")).toHaveAttribute("id", "custom-text");
    });
  });

  describe("Children Rendering", () => {
    it("should render text children", () => {
      render(<Text>Simple Text</Text>);
      expect(screen.getByText("Simple Text")).toBeInTheDocument();
    });

    it("should render complex children", () => {
      render(
        <Text>
          Complex <strong>text</strong> with <em>formatting</em>
        </Text>
      );
      expect(screen.getByText(/Complex/)).toBeInTheDocument();
      expect(screen.getByText("text")).toBeInTheDocument();
      expect(screen.getByText("formatting")).toBeInTheDocument();
    });

    it("should render nested components", () => {
      render(
        <Text>
          <span>Nested</span> <span>Components</span>
        </Text>
      );
      expect(screen.getByText("Nested")).toBeInTheDocument();
      expect(screen.getByText("Components")).toBeInTheDocument();
    });

    it("should render numbers", () => {
      render(<Text>{12345}</Text>);
      expect(screen.getByText("12345")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      render(
        <Text>
          <svg data-testid="icon" />
          Text with Icon
        </Text>
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("Text with Icon")).toBeInTheDocument();
    });
  });

  describe("Combined Props", () => {
    it("should combine size and color", () => {
      render(
        <Text size="sm" color="muted">
          Small Muted
        </Text>
      );
      const text = screen.getByText("Small Muted");
      expect(text).toHaveClass(
        "text-sm",
        "text-gray-500",
        "dark:text-gray-400"
      );
    });

    it("should combine size, color, and weight", () => {
      render(
        <Text size="lg" color="error" weight="bold">
          Large Bold Error
        </Text>
      );
      const text = screen.getByText("Large Bold Error");
      expect(text).toHaveClass(
        "text-lg",
        "text-red-600",
        "dark:text-red-400",
        "font-bold"
      );
    });

    it("should combine all text props", () => {
      render(
        <Text size="xl" color="success" weight="semibold" truncate>
          All Props
        </Text>
      );
      const text = screen.getByText("All Props");
      expect(text).toHaveClass(
        "text-xl",
        "text-green-600",
        "dark:text-green-400",
        "font-semibold",
        "truncate"
      );
    });

    it("should combine all props with custom className", () => {
      render(
        <Text
          size="sm"
          color="warning"
          weight="medium"
          truncate
          className="uppercase"
        >
          Complete
        </Text>
      );
      const text = screen.getByText("Complete");
      expect(text).toHaveClass(
        "text-sm",
        "text-yellow-600",
        "font-medium",
        "truncate",
        "uppercase"
      );
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode for default color", () => {
      render(<Text color="default">Default</Text>);
      const text = screen.getByText("Default");
      expect(text).toHaveClass("dark:text-gray-300");
    });

    it("should have dark mode for muted color", () => {
      render(<Text color="muted">Muted</Text>);
      const text = screen.getByText("Muted");
      expect(text).toHaveClass("dark:text-gray-400");
    });

    it("should have dark mode for error color", () => {
      render(<Text color="error">Error</Text>);
      const text = screen.getByText("Error");
      expect(text).toHaveClass("dark:text-red-400");
    });

    it("should have dark mode for success color", () => {
      render(<Text color="success">Success</Text>);
      const text = screen.getByText("Success");
      expect(text).toHaveClass("dark:text-green-400");
    });

    it("should have dark mode for warning color", () => {
      render(<Text color="warning">Warning</Text>);
      const text = screen.getByText("Warning");
      expect(text).toHaveClass("dark:text-yellow-400");
    });

    it("should have dark mode for info color", () => {
      render(<Text color="info">Info</Text>);
      const text = screen.getByText("Info");
      expect(text).toHaveClass("dark:text-blue-400");
    });
  });

  describe("Use Cases", () => {
    it("should render helper text", () => {
      render(
        <Text size="sm" color="muted">
          This is a helper text
        </Text>
      );
      expect(screen.getByText("This is a helper text")).toHaveClass(
        "text-sm",
        "text-gray-500"
      );
    });

    it("should render error message", () => {
      render(<Text color="error">This field is required</Text>);
      expect(screen.getByText("This field is required")).toHaveClass(
        "text-red-600"
      );
    });

    it("should render success message", () => {
      render(<Text color="success">Saved successfully!</Text>);
      expect(screen.getByText("Saved successfully!")).toHaveClass(
        "text-green-600"
      );
    });

    it("should render inline text as span", () => {
      render(
        <p>
          This is <Text as="span">inline text</Text> in a paragraph
        </p>
      );
      const span = screen.getByText("inline text");
      expect(span.tagName).toBe("SPAN");
    });

    it("should render badge-like text", () => {
      render(
        <Text as="span" size="xs" weight="bold" className="uppercase">
          New
        </Text>
      );
      const badge = screen.getByText("New");
      expect(badge).toHaveClass("text-xs", "font-bold", "uppercase");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string children", () => {
      render(<Text>{""}</Text>);
      const text = document.querySelector("p");
      expect(text).toBeInTheDocument();
      expect(text?.textContent).toBe("");
    });

    it("should handle very long text", () => {
      const longText = "A".repeat(1000);
      render(<Text>{longText}</Text>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("should handle special characters", () => {
      const specialText = "Special © ™ ® & < > \" '";
      render(<Text>{specialText}</Text>);
      expect(screen.getByText(/Special/)).toBeInTheDocument();
    });

    it("should handle zero as children", () => {
      render(<Text>{0}</Text>);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle boolean children (renders nothing)", () => {
      const { container } = render(<Text>{true as any}</Text>);
      const text = container.querySelector("p");
      expect(text?.textContent).toBe("");
    });

    it("should render with whitespace", () => {
      render(<Text> Whitespace </Text>);
      expect(screen.getByText(/Whitespace/)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic p tag by default", () => {
      render(<Text>Paragraph</Text>);
      expect(screen.getByText("Paragraph").tagName).toBe("P");
    });

    it("should allow span for inline text", () => {
      render(<Text as="span">Inline</Text>);
      expect(screen.getByText("Inline").tagName).toBe("SPAN");
    });

    it("should accept id for linking", () => {
      render(<Text id="description">Description</Text>);
      expect(screen.getByText("Description")).toHaveAttribute(
        "id",
        "description"
      );
    });

    it("should use semantic colors for messages", () => {
      render(<Text color="error">Error message</Text>);
      const text = screen.getByText("Error message");
      expect(text).toHaveClass("text-red-600");
    });
  });

  describe("Performance", () => {
    it("should render without crashing with minimal props", () => {
      expect(() => {
        render(<Text>Minimal</Text>);
      }).not.toThrow();
    });

    it("should render without crashing with all props", () => {
      expect(() => {
        render(
          <Text
            size="lg"
            color="info"
            weight="bold"
            as="div"
            truncate
            className="custom"
            id="test"
          >
            Complete
          </Text>
        );
      }).not.toThrow();
    });

    it("should render multiple text elements efficiently", () => {
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Text key={i} size={["xs", "sm", "base", "lg", "xl"][i % 5] as any}>
              Text {i}
            </Text>
          ))}
        </>
      );
      expect(screen.getByText("Text 0")).toBeInTheDocument();
      expect(screen.getByText("Text 49")).toBeInTheDocument();
    });
  });

  describe("Type Safety", () => {
    it("should accept valid size values", () => {
      const sizes: Array<"xs" | "sm" | "base" | "lg" | "xl"> = [
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
      ];
      sizes.forEach((size, i) => {
        const { unmount } = render(<Text size={size}>Size {i}</Text>);
        expect(screen.getByText(`Size ${i}`)).toBeInTheDocument();
        unmount();
      });
    });

    it("should accept valid color values", () => {
      const colors: Array<
        "default" | "muted" | "error" | "success" | "warning" | "info"
      > = ["default", "muted", "error", "success", "warning", "info"];
      colors.forEach((color, i) => {
        const { unmount } = render(<Text color={color}>Color {i}</Text>);
        expect(screen.getByText(`Color ${i}`)).toBeInTheDocument();
        unmount();
      });
    });

    it("should accept valid weight values", () => {
      const weights: Array<"normal" | "medium" | "semibold" | "bold"> = [
        "normal",
        "medium",
        "semibold",
        "bold",
      ];
      weights.forEach((weight, i) => {
        const { unmount } = render(<Text weight={weight}>Weight {i}</Text>);
        expect(screen.getByText(`Weight ${i}`)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
