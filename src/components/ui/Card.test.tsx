import React from "react";
import { render, screen } from "@testing-library/react";
import { Card, CardSection, CardProps, CardSectionProps } from "./Card";

describe("Card", () => {
  describe("Basic Rendering", () => {
    it("renders children content", () => {
      render(<Card>Card content</Card>);

      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies base styles", () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(
        "bg-white",
        "rounded-lg",
        "border",
        "border-gray-200",
      );
    });

    it("applies padding to content by default", () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      const content = card.firstChild as HTMLElement;
      expect(content).toHaveClass("p-6");
    });
  });

  describe("Title", () => {
    it("renders title when provided", () => {
      render(<Card title="Card Title">Content</Card>);

      expect(screen.getByText("Card Title")).toBeInTheDocument();
    });

    it("does not render header when no title, description, or action", () => {
      const { container } = render(<Card>Content</Card>);

      const header = container.querySelector(".border-b");
      expect(header).not.toBeInTheDocument();
    });

    it("renders title with correct styling", () => {
      render(<Card title="Title">Content</Card>);

      const title = screen.getByText("Title");
      expect(title.tagName).toBe("H2");
      expect(title).toHaveClass("text-lg", "font-semibold", "text-gray-900");
    });
  });

  describe("Description", () => {
    it("renders description when provided", () => {
      render(<Card description="Card description">Content</Card>);

      expect(screen.getByText("Card description")).toBeInTheDocument();
    });

    it("renders description with correct styling", () => {
      render(<Card description="Description text">Content</Card>);

      const description = screen.getByText("Description text");
      expect(description.tagName).toBe("P");
      expect(description).toHaveClass("mt-1", "text-sm", "text-gray-500");
    });

    it("renders both title and description", () => {
      render(
        <Card title="Title" description="Description">
          Content
        </Card>,
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("renders description without title", () => {
      render(<Card description="Only description">Content</Card>);

      expect(screen.getByText("Only description")).toBeInTheDocument();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });

  describe("Header Action", () => {
    it("renders header action when provided", () => {
      render(
        <Card headerAction={<button>Action Button</button>}>Content</Card>,
      );

      expect(screen.getByText("Action Button")).toBeInTheDocument();
    });

    it("renders header action with title", () => {
      render(
        <Card title="Title" headerAction={<button>Action</button>}>
          Content
        </Card>,
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    it("renders complex header action", () => {
      render(
        <Card
          headerAction={
            <div data-testid="complex-action">
              <button>Edit</button>
              <button>Delete</button>
            </div>
          }
        >
          Content
        </Card>,
      );

      expect(screen.getByTestId("complex-action")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("Header Layout", () => {
    it("renders header with border when content present", () => {
      const { container } = render(<Card title="Title">Content</Card>);

      const header = container.querySelector(".px-6.py-4.border-b");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("border-gray-200");
    });

    it("header uses flex layout", () => {
      const { container } = render(<Card title="Title">Content</Card>);

      const headerContent = container.querySelector(
        ".flex.items-start.justify-between",
      );
      expect(headerContent).toBeInTheDocument();
    });

    it("header action has left margin", () => {
      const { container } = render(
        <Card title="Title" headerAction={<button>Action</button>}>
          Content
        </Card>,
      );

      const actionWrapper = screen.getByText("Action").parentElement;
      expect(actionWrapper).toHaveClass("ml-4");
    });
  });

  describe("No Padding Option", () => {
    it("removes padding when noPadding is true", () => {
      const { container } = render(<Card noPadding>Content</Card>);

      const card = container.firstChild as HTMLElement;
      const content = card.firstChild as HTMLElement;
      expect(content).not.toHaveClass("p-6");
      expect(content?.className).toBe("");
    });

    it("keeps padding by default", () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      const content = card.firstChild as HTMLElement;
      expect(content).toHaveClass("p-6");
    });

    it("noPadding does not affect header padding", () => {
      const { container } = render(
        <Card title="Title" noPadding>
          Content
        </Card>,
      );

      const header = container.querySelector(".px-6.py-4");
      expect(header).toBeInTheDocument();
    });
  });

  describe("Custom ClassName", () => {
    it("applies custom className", () => {
      const { container } = render(
        <Card className="custom-card-class">Content</Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-card-class");
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-white", "rounded-lg", "custom-class");
    });
  });

  describe("Complex Content", () => {
    it("renders multiple children", () => {
      render(
        <Card>
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <button>Action</button>
        </Card>,
      );

      expect(screen.getByText("First paragraph")).toBeInTheDocument();
      expect(screen.getByText("Second paragraph")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    it("renders nested components", () => {
      render(
        <Card title="Parent Card">
          <div data-testid="nested-content">
            <span>Nested span</span>
          </div>
        </Card>,
      );

      expect(screen.getByTestId("nested-content")).toBeInTheDocument();
      expect(screen.getByText("Nested span")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty children", () => {
      const { container } = render(<Card>{null}</Card>);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles empty strings in title and description", () => {
      render(
        <Card title="" description="">
          Content
        </Card>,
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("handles very long title", () => {
      const longTitle = "A".repeat(200);
      render(<Card title={longTitle}>Content</Card>);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles special characters in title", () => {
      render(<Card title="Title with & special <chars>">Content</Card>);

      expect(
        screen.getByText("Title with & special <chars>"),
      ).toBeInTheDocument();
    });
  });
});

describe("CardSection", () => {
  describe("Basic Rendering", () => {
    it("renders children content", () => {
      render(<CardSection>Section content</CardSection>);

      expect(screen.getByText("Section content")).toBeInTheDocument();
    });

    it("renders without title or description", () => {
      render(<CardSection>Just content</CardSection>);

      expect(screen.getByText("Just content")).toBeInTheDocument();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });

  describe("Title", () => {
    it("renders title when provided", () => {
      render(<CardSection title="Section Title">Content</CardSection>);

      expect(screen.getByText("Section Title")).toBeInTheDocument();
    });

    it("renders title with correct styling", () => {
      render(<CardSection title="Title">Content</CardSection>);

      const title = screen.getByText("Title");
      expect(title.tagName).toBe("H3");
      expect(title).toHaveClass("text-base", "font-medium", "text-gray-900");
    });
  });

  describe("Description", () => {
    it("renders description when provided", () => {
      render(
        <CardSection description="Section description">Content</CardSection>,
      );

      expect(screen.getByText("Section description")).toBeInTheDocument();
    });

    it("renders description with correct styling", () => {
      render(<CardSection description="Description">Content</CardSection>);

      const description = screen.getByText("Description");
      expect(description.tagName).toBe("P");
      expect(description).toHaveClass("mt-1", "text-sm", "text-gray-500");
    });

    it("renders both title and description", () => {
      render(
        <CardSection title="Title" description="Description">
          Content
        </CardSection>,
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });

  describe("Header Spacing", () => {
    it("applies margin bottom when header present", () => {
      const { container } = render(
        <CardSection title="Title">Content</CardSection>,
      );

      const header = screen.getByText("Title").parentElement;
      expect(header).toHaveClass("mb-4");
    });

    it("does not render header container when no title or description", () => {
      const { container } = render(<CardSection>Content</CardSection>);

      const mbElements = container.querySelectorAll(".mb-4");
      expect(mbElements.length).toBe(0);
    });
  });

  describe("Custom ClassName", () => {
    it("applies custom className to root", () => {
      const { container } = render(
        <CardSection className="custom-section-class">Content</CardSection>,
      );

      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass("custom-section-class");
    });

    it("preserves custom className with other elements", () => {
      const { container } = render(
        <CardSection className="custom-class" title="Title">
          Content
        </CardSection>,
      );

      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass("custom-class");
    });
  });

  describe("Nested Usage", () => {
    it("can be used inside Card", () => {
      render(
        <Card title="Card Title">
          <CardSection title="Section 1">Section 1 content</CardSection>
          <CardSection title="Section 2">Section 2 content</CardSection>
        </Card>,
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Section 1")).toBeInTheDocument();
      expect(screen.getByText("Section 2")).toBeInTheDocument();
    });

    it("renders multiple sections correctly", () => {
      render(
        <Card>
          <CardSection title="First">First content</CardSection>
          <CardSection title="Second">Second content</CardSection>
          <CardSection title="Third">Third content</CardSection>
        </Card>,
      );

      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty children", () => {
      const { container } = render(<CardSection>{null}</CardSection>);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles empty strings", () => {
      render(
        <CardSection title="" description="">
          Content
        </CardSection>,
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("handles very long descriptions", () => {
      const longDesc = "A".repeat(300);
      render(<CardSection description={longDesc}>Content</CardSection>);

      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });
  });
});
