import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Card, CardSection } from "../Card";

describe("Card - Simple Card Wrapper", () => {
  describe("Basic Rendering", () => {
    it("should render card with children", () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should have bg-white by default", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass("bg-white");
    });

    it("should have border border-gray-200", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass("border", "border-gray-200");
    });

    it("should have rounded-lg", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass("rounded-lg");
    });

    it("should have p-6 on content wrapper by default", () => {
      const { container } = render(<Card>Content</Card>);
      const contentWrapper = container.querySelector(".p-6");
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe("Title and Description", () => {
    it("should render title when provided", () => {
      render(<Card title="Test Title">Content</Card>);
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render description when provided", () => {
      render(<Card description="Test description">Content</Card>);
      expect(screen.getByText("Test description")).toBeInTheDocument();
    });

    it("should render both title and description", () => {
      render(
        <Card title="Title" description="Description">
          Content
        </Card>
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should have text-lg font-semibold on title", () => {
      render(<Card title="Title">Content</Card>);
      const title = screen.getByText("Title");
      expect(title).toHaveClass("text-lg", "font-semibold", "text-gray-900");
    });

    it("should have text-sm text-gray-500 on description", () => {
      render(<Card description="Description">Content</Card>);
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("text-sm", "text-gray-500");
    });

    it("should have mt-1 on description when title exists", () => {
      render(
        <Card title="Title" description="Description">
          Content
        </Card>
      );
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("mt-1");
    });

    it("should not render header when no title and description", () => {
      const { container } = render(<Card>Content</Card>);
      const header = container.querySelector(".border-b");
      expect(header).not.toBeInTheDocument();
    });
  });

  describe("Header Action", () => {
    it("should render headerAction when provided", () => {
      render(
        <Card title="Title" headerAction={<button>Action</button>}>
          Content
        </Card>
      );
      expect(
        screen.getByRole("button", { name: "Action" })
      ).toBeInTheDocument();
    });

    it("should position headerAction on the right", () => {
      const { container } = render(
        <Card title="Title" headerAction={<button>Action</button>}>
          Content
        </Card>
      );
      const header = container.querySelector(".flex.justify-between");
      expect(header).toBeInTheDocument();
    });

    it("should render headerAction without title", () => {
      render(<Card headerAction={<button>Action</button>}>Content</Card>);
      expect(
        screen.getByRole("button", { name: "Action" })
      ).toBeInTheDocument();
    });

    it("should have px-6 py-4 on header with title", () => {
      const { container } = render(
        <Card title="Title" headerAction={<button>Action</button>}>
          Content
        </Card>
      );
      const header = container.querySelector(".px-6.py-4");
      expect(header).toBeInTheDocument();
    });

    it("should have border-b on header", () => {
      const { container } = render(
        <Card title="Title" headerAction={<button>Action</button>}>
          Content
        </Card>
      );
      const header = container.querySelector(".border-b");
      expect(header).toBeInTheDocument();
    });

    it("should have ml-4 on headerAction wrapper", () => {
      const { container } = render(
        <Card title="Title" headerAction={<button>Action</button>}>
          Content
        </Card>
      );
      const actionWrapper = container.querySelector(".ml-4");
      expect(actionWrapper).toBeInTheDocument();
    });
  });

  describe("noPadding Mode", () => {
    it("should remove padding when noPadding is true", () => {
      const { container } = render(<Card noPadding>Content</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass("p-6");
    });

    it("should still have padding on header with noPadding", () => {
      const { container } = render(
        <Card title="Title" noPadding>
          Content
        </Card>
      );
      const header = container.querySelector(".px-6");
      expect(header).toBeInTheDocument();
    });

    it("should render children directly without padding wrapper", () => {
      render(
        <Card noPadding>
          <div data-testid="custom-content">Custom</div>
        </Card>
      );
      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      );
      const card = container.firstChild;
      expect(card).toHaveClass("custom-class");
    });

    it("should merge custom className with base classes", () => {
      const { container } = render(<Card className="my-custom">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass("my-custom", "bg-white", "rounded-lg");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark:bg-gray-800", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass("dark:bg-gray-800");
    });

    it("should have dark:border-gray-700", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass("dark:border-gray-700");
    });

    it("should have dark:text-white on title", () => {
      render(<Card title="Title">Content</Card>);
      const title = screen.getByText("Title");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should have dark:text-gray-400 on description", () => {
      render(<Card description="Description">Content</Card>);
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("dark:text-gray-400");
    });

    it("should have dark:border-gray-700 on header border", () => {
      const { container } = render(<Card title="Title">Content</Card>);
      const header = container.querySelector(".border-b");
      expect(header).toHaveClass("dark:border-gray-700");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = render(<Card />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle complex children", () => {
      render(
        <Card>
          <div>
            <h1>Heading</h1>
            <p>Paragraph</p>
            <button>Button</button>
          </div>
        </Card>
      );
      expect(screen.getByText("Heading")).toBeInTheDocument();
      expect(screen.getByText("Paragraph")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should handle long title", () => {
      const longTitle =
        "This is a very long title that might wrap to multiple lines";
      render(<Card title={longTitle}>Content</Card>);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle long description", () => {
      const longDesc =
        "This is a very long description that provides detailed information about the card content and might span multiple lines depending on the container width";
      render(<Card description={longDesc}>Content</Card>);
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it("should handle headerAction with multiple elements", () => {
      render(
        <Card
          title="Title"
          headerAction={
            <>
              <button>Edit</button>
              <button>Delete</button>
            </>
          }
        >
          Content
        </Card>
      );
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" })
      ).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render without crashing with all props", () => {
      expect(() => {
        render(
          <Card
            title="Title"
            description="Description"
            headerAction={<button>Action</button>}
            noPadding={false}
            className="custom-class"
          >
            <p>Content</p>
          </Card>
        );
      }).not.toThrow();
    });

    it("should handle multiple cards", () => {
      render(
        <div>
          <Card title="Card 1">Content 1</Card>
          <Card title="Card 2">Content 2</Card>
          <Card title="Card 3">Content 3</Card>
        </div>
      );
      expect(screen.getByText("Card 1")).toBeInTheDocument();
      expect(screen.getByText("Card 2")).toBeInTheDocument();
      expect(screen.getByText("Card 3")).toBeInTheDocument();
    });
  });
});

describe("CardSection - Internal Card Section", () => {
  describe("Basic Rendering", () => {
    it("should render CardSection with children", () => {
      render(
        <CardSection>
          <p>Section content</p>
        </CardSection>
      );
      expect(screen.getByText("Section content")).toBeInTheDocument();
    });

    it("should be a simple div wrapper", () => {
      const { container } = render(<CardSection>Content</CardSection>);
      const section = container.firstChild;
      expect(section).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Title and Description", () => {
    it("should render section title", () => {
      render(<CardSection title="Section Title">Content</CardSection>);
      expect(screen.getByText("Section Title")).toBeInTheDocument();
    });

    it("should render section description", () => {
      render(
        <CardSection description="Section description">Content</CardSection>
      );
      expect(screen.getByText("Section description")).toBeInTheDocument();
    });

    it("should render both title and description", () => {
      render(
        <CardSection title="Title" description="Description">
          Content
        </CardSection>
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should have text-base font-medium on section title", () => {
      render(<CardSection title="Title">Content</CardSection>);
      const title = screen.getByText("Title");
      expect(title).toHaveClass("text-base", "font-medium", "text-gray-900");
    });

    it("should have text-sm text-gray-500 on section description", () => {
      render(<CardSection description="Description">Content</CardSection>);
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("text-sm", "text-gray-500");
    });

    it("should have mb-4 on header wrapper when title or description exists", () => {
      const { container } = render(
        <CardSection title="Title">
          <div data-testid="content">Content</div>
        </CardSection>
      );
      const header = container.querySelector(".mb-4");
      expect(header).toBeInTheDocument();
    });

    it("should not have header when no title and description", () => {
      const { container } = render(<CardSection>Content</CardSection>);
      const header = container.querySelector(".mb-4");
      expect(header).not.toBeInTheDocument();
    });

    it("should have mt-1 on description", () => {
      render(
        <CardSection title="Title" description="Description">
          Content
        </CardSection>
      );
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("mt-1");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark:text-white on title", () => {
      render(<CardSection title="Title">Content</CardSection>);
      const title = screen.getByText("Title");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should have dark:text-gray-400 on description", () => {
      render(<CardSection description="Description">Content</CardSection>);
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <CardSection className="custom-section">Content</CardSection>
      );
      const section = container.firstChild;
      expect(section).toHaveClass("custom-section");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = render(<CardSection />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle complex children", () => {
      render(
        <CardSection title="Section">
          <div>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </CardSection>
      );
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  describe("Usage with Card", () => {
    it("should render CardSection inside Card", () => {
      render(
        <Card title="Main Title">
          <CardSection title="Section 1">Section 1 content</CardSection>
          <CardSection title="Section 2">Section 2 content</CardSection>
        </Card>
      );
      expect(screen.getByText("Main Title")).toBeInTheDocument();
      expect(screen.getByText("Section 1")).toBeInTheDocument();
      expect(screen.getByText("Section 2")).toBeInTheDocument();
    });

    it("should work with noPadding Card", () => {
      render(
        <Card noPadding>
          <CardSection title="Section">Content</CardSection>
        </Card>
      );
      expect(screen.getByText("Section")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render without crashing with all props", () => {
      expect(() => {
        render(
          <CardSection
            title="Title"
            description="Description"
            className="custom"
          >
            <p>Content</p>
          </CardSection>
        );
      }).not.toThrow();
    });
  });
});
