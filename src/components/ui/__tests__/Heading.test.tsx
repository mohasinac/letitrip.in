import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Heading } from "../Heading";

describe("Heading - Consistent Heading Component", () => {
  describe("Basic Rendering", () => {
    it("should render heading with children", () => {
      render(<Heading>Test Heading</Heading>);
      expect(screen.getByText("Test Heading")).toBeInTheDocument();
    });

    it("should default to h2 tag", () => {
      render(<Heading>Default Heading</Heading>);
      const heading = screen.getByText("Default Heading");
      expect(heading.tagName).toBe("H2");
    });

    it("should default to level 2 styles", () => {
      render(<Heading>Default Heading</Heading>);
      const heading = screen.getByText("Default Heading");
      expect(heading).toHaveClass("text-2xl", "md:text-3xl", "font-bold");
    });

    it("should have dark mode text color", () => {
      render(<Heading>Dark Mode Heading</Heading>);
      const heading = screen.getByText("Dark Mode Heading");
      expect(heading).toHaveClass("text-gray-900", "dark:text-white");
    });
  });

  describe("Heading Levels", () => {
    it("should render h1 with level 1", () => {
      render(<Heading level={1}>Level 1</Heading>);
      const heading = screen.getByText("Level 1");
      expect(heading.tagName).toBe("H1");
    });

    it("should have level 1 size classes", () => {
      render(<Heading level={1}>Level 1</Heading>);
      const heading = screen.getByText("Level 1");
      expect(heading).toHaveClass("text-3xl", "md:text-4xl", "font-bold");
    });

    it("should render h2 with level 2", () => {
      render(<Heading level={2}>Level 2</Heading>);
      const heading = screen.getByText("Level 2");
      expect(heading.tagName).toBe("H2");
    });

    it("should have level 2 size classes", () => {
      render(<Heading level={2}>Level 2</Heading>);
      const heading = screen.getByText("Level 2");
      expect(heading).toHaveClass("text-2xl", "md:text-3xl", "font-bold");
    });

    it("should render h3 with level 3", () => {
      render(<Heading level={3}>Level 3</Heading>);
      const heading = screen.getByText("Level 3");
      expect(heading.tagName).toBe("H3");
    });

    it("should have level 3 size classes", () => {
      render(<Heading level={3}>Level 3</Heading>);
      const heading = screen.getByText("Level 3");
      expect(heading).toHaveClass("text-xl", "md:text-2xl", "font-semibold");
    });

    it("should render h4 with level 4", () => {
      render(<Heading level={4}>Level 4</Heading>);
      const heading = screen.getByText("Level 4");
      expect(heading.tagName).toBe("H4");
    });

    it("should have level 4 size classes", () => {
      render(<Heading level={4}>Level 4</Heading>);
      const heading = screen.getByText("Level 4");
      expect(heading).toHaveClass("text-lg", "md:text-xl", "font-semibold");
    });

    it("should render h5 with level 5", () => {
      render(<Heading level={5}>Level 5</Heading>);
      const heading = screen.getByText("Level 5");
      expect(heading.tagName).toBe("H5");
    });

    it("should have level 5 size classes", () => {
      render(<Heading level={5}>Level 5</Heading>);
      const heading = screen.getByText("Level 5");
      expect(heading).toHaveClass("text-base", "md:text-lg", "font-medium");
    });

    it("should render h6 with level 6", () => {
      render(<Heading level={6}>Level 6</Heading>);
      const heading = screen.getByText("Level 6");
      expect(heading.tagName).toBe("H6");
    });

    it("should have level 6 size classes", () => {
      render(<Heading level={6}>Level 6</Heading>);
      const heading = screen.getByText("Level 6");
      expect(heading).toHaveClass("text-sm", "md:text-base", "font-medium");
    });
  });

  describe("Tag Override with 'as' Prop", () => {
    it("should render as p tag when as='p'", () => {
      render(
        <Heading level={3} as="p">
          Paragraph Heading
        </Heading>
      );
      const heading = screen.getByText("Paragraph Heading");
      expect(heading.tagName).toBe("P");
    });

    it("should keep level 3 styling when rendered as p", () => {
      render(
        <Heading level={3} as="p">
          Paragraph Heading
        </Heading>
      );
      const heading = screen.getByText("Paragraph Heading");
      expect(heading).toHaveClass("text-xl", "md:text-2xl", "font-semibold");
    });

    it("should render as span tag when as='span'", () => {
      render(
        <Heading level={2} as="span">
          Span Heading
        </Heading>
      );
      const heading = screen.getByText("Span Heading");
      expect(heading.tagName).toBe("SPAN");
    });

    it("should render as div tag when as='div'", () => {
      render(
        <Heading level={1} as="div">
          Div Heading
        </Heading>
      );
      const heading = screen.getByText("Div Heading");
      expect(heading.tagName).toBe("DIV");
    });

    it("should override semantic tag but keep visual level", () => {
      // Visually h1, semantically h2
      render(
        <Heading level={1} as="h2">
          Override Heading
        </Heading>
      );
      const heading = screen.getByText("Override Heading");
      expect(heading.tagName).toBe("H2");
      expect(heading).toHaveClass("text-3xl", "md:text-4xl", "font-bold");
    });
  });

  describe("Custom Styling", () => {
    it("should accept custom className", () => {
      render(<Heading className="custom-heading">Styled Heading</Heading>);
      const heading = screen.getByText("Styled Heading");
      expect(heading).toHaveClass("custom-heading");
    });

    it("should merge custom className with base classes", () => {
      render(<Heading className="text-center mb-4">Styled Heading</Heading>);
      const heading = screen.getByText("Styled Heading");
      expect(heading).toHaveClass(
        "text-center",
        "mb-4",
        "text-2xl",
        "font-bold"
      );
    });

    it("should accept custom id", () => {
      render(<Heading id="main-heading">ID Heading</Heading>);
      const heading = screen.getByText("ID Heading");
      expect(heading).toHaveAttribute("id", "main-heading");
    });

    it("should accept data attributes", () => {
      render(<Heading data-testid="custom-heading">Data Heading</Heading>);
      const heading = screen.getByTestId("custom-heading");
      expect(heading).toBeInTheDocument();
    });
  });

  describe("Children Rendering", () => {
    it("should render text children", () => {
      render(<Heading>Simple Text</Heading>);
      expect(screen.getByText("Simple Text")).toBeInTheDocument();
    });

    it("should render complex children", () => {
      render(
        <Heading>
          Complex <strong>Heading</strong> with <em>formatting</em>
        </Heading>
      );
      expect(screen.getByText(/Complex/)).toBeInTheDocument();
      expect(screen.getByText("Heading")).toBeInTheDocument();
      expect(screen.getByText("formatting")).toBeInTheDocument();
    });

    it("should render nested components", () => {
      render(
        <Heading>
          <span>Nested</span> <span>Components</span>
        </Heading>
      );
      expect(screen.getByText("Nested")).toBeInTheDocument();
      expect(screen.getByText("Components")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      render(
        <Heading>
          <svg data-testid="icon" />
          Heading with Icon
        </Heading>
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("Heading with Icon")).toBeInTheDocument();
    });
  });

  describe("Responsive Styles", () => {
    it("should have responsive text size for level 1", () => {
      render(<Heading level={1}>Responsive</Heading>);
      const heading = screen.getByText("Responsive");
      const classes = heading.className;
      expect(classes).toContain("text-3xl");
      expect(classes).toContain("md:text-4xl");
    });

    it("should have responsive text size for level 2", () => {
      render(<Heading level={2}>Responsive</Heading>);
      const heading = screen.getByText("Responsive");
      const classes = heading.className;
      expect(classes).toContain("text-2xl");
      expect(classes).toContain("md:text-3xl");
    });

    it("should have responsive text size for level 3", () => {
      render(<Heading level={3}>Responsive</Heading>);
      const heading = screen.getByText("Responsive");
      const classes = heading.className;
      expect(classes).toContain("text-xl");
      expect(classes).toContain("md:text-2xl");
    });

    it("should have responsive text size for level 4", () => {
      render(<Heading level={4}>Responsive</Heading>);
      const heading = screen.getByText("Responsive");
      const classes = heading.className;
      expect(classes).toContain("text-lg");
      expect(classes).toContain("md:text-xl");
    });

    it("should have responsive text size for level 5", () => {
      render(<Heading level={5}>Responsive</Heading>);
      const heading = screen.getByText("Responsive");
      const classes = heading.className;
      expect(classes).toContain("text-base");
      expect(classes).toContain("md:text-lg");
    });

    it("should have responsive text size for level 6", () => {
      render(<Heading level={6}>Responsive</Heading>);
      const heading = screen.getByText("Responsive");
      const classes = heading.className;
      expect(classes).toContain("text-sm");
      expect(classes).toContain("md:text-base");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark:text-white on all levels", () => {
      const levels: Array<1 | 2 | 3 | 4 | 5 | 6> = [1, 2, 3, 4, 5, 6];
      levels.forEach((level) => {
        const { unmount } = render(
          <Heading level={level}>Level {level}</Heading>
        );
        const heading = screen.getByText(`Level ${level}`);
        expect(heading).toHaveClass("dark:text-white");
        unmount();
      });
    });

    it("should have text-gray-900 for light mode", () => {
      render(<Heading>Light Mode</Heading>);
      const heading = screen.getByText("Light Mode");
      expect(heading).toHaveClass("text-gray-900");
    });
  });

  describe("Font Weights", () => {
    it("should have font-bold for level 1", () => {
      render(<Heading level={1}>Bold Heading</Heading>);
      expect(screen.getByText("Bold Heading")).toHaveClass("font-bold");
    });

    it("should have font-bold for level 2", () => {
      render(<Heading level={2}>Bold Heading</Heading>);
      expect(screen.getByText("Bold Heading")).toHaveClass("font-bold");
    });

    it("should have font-semibold for level 3", () => {
      render(<Heading level={3}>Semibold Heading</Heading>);
      expect(screen.getByText("Semibold Heading")).toHaveClass("font-semibold");
    });

    it("should have font-semibold for level 4", () => {
      render(<Heading level={4}>Semibold Heading</Heading>);
      expect(screen.getByText("Semibold Heading")).toHaveClass("font-semibold");
    });

    it("should have font-medium for level 5", () => {
      render(<Heading level={5}>Medium Heading</Heading>);
      expect(screen.getByText("Medium Heading")).toHaveClass("font-medium");
    });

    it("should have font-medium for level 6", () => {
      render(<Heading level={6}>Medium Heading</Heading>);
      expect(screen.getByText("Medium Heading")).toHaveClass("font-medium");
    });
  });

  describe("HTML Attributes", () => {
    it("should accept onClick handler", () => {
      const handleClick = jest.fn();
      render(<Heading onClick={handleClick}>Clickable</Heading>);
      const heading = screen.getByText("Clickable");
      heading.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should accept aria-label", () => {
      render(<Heading aria-label="Main heading">Content</Heading>);
      const heading = screen.getByLabelText("Main heading");
      expect(heading).toBeInTheDocument();
    });

    it("should accept role attribute", () => {
      render(<Heading role="banner">Banner</Heading>);
      const heading = screen.getByRole("banner");
      expect(heading).toBeInTheDocument();
    });

    it("should accept style prop", () => {
      render(<Heading style={{ marginTop: "20px" }}>Styled</Heading>);
      const heading = screen.getByText("Styled");
      expect(heading).toHaveStyle({ marginTop: "20px" });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string children", () => {
      render(<Heading>{""}</Heading>);
      const heading = document.querySelector("h2");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe("");
    });

    it("should handle very long text", () => {
      const longText = "A".repeat(500);
      render(<Heading>{longText}</Heading>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("should handle special characters", () => {
      const specialText = "Special © ™ ® & < > \" '";
      render(<Heading>{specialText}</Heading>);
      expect(screen.getByText(/Special/)).toBeInTheDocument();
    });

    it("should handle numbers as children", () => {
      render(<Heading>{12345}</Heading>);
      expect(screen.getByText("12345")).toBeInTheDocument();
    });

    it("should render with multiple className props via cn()", () => {
      render(
        <Heading className="text-center uppercase tracking-wide">
          Styled
        </Heading>
      );
      const heading = screen.getByText("Styled");
      expect(heading).toHaveClass("text-center", "uppercase", "tracking-wide");
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic hierarchy", () => {
      const { container } = render(
        <>
          <Heading level={1}>Main Title</Heading>
          <Heading level={2}>Section Title</Heading>
          <Heading level={3}>Subsection</Heading>
        </>
      );
      expect(container.querySelector("h1")).toHaveTextContent("Main Title");
      expect(container.querySelector("h2")).toHaveTextContent("Section Title");
      expect(container.querySelector("h3")).toHaveTextContent("Subsection");
    });

    it("should allow visual override while maintaining semantics", () => {
      // Visually h3, semantically h2 for SEO
      render(
        <Heading level={3} as="h2">
          Visual vs Semantic
        </Heading>
      );
      const heading = screen.getByText("Visual vs Semantic");
      expect(heading.tagName).toBe("H2");
      expect(heading).toHaveClass("text-xl", "md:text-2xl");
    });
  });

  describe("Performance", () => {
    it("should render without crashing with minimal props", () => {
      expect(() => {
        render(<Heading>Minimal</Heading>);
      }).not.toThrow();
    });

    it("should render without crashing with all props", () => {
      expect(() => {
        render(
          <Heading
            level={3}
            as="h2"
            className="custom"
            id="test"
            onClick={jest.fn()}
            aria-label="test"
          >
            Complete
          </Heading>
        );
      }).not.toThrow();
    });

    it("should render multiple headings efficiently", () => {
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <Heading key={i} level={((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6}>
              Heading {i}
            </Heading>
          ))}
        </>
      );
      expect(screen.getByText("Heading 0")).toBeInTheDocument();
      expect(screen.getByText("Heading 19")).toBeInTheDocument();
    });
  });
});
