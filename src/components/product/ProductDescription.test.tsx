import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductDescription } from "./ProductDescription";

describe("ProductDescription", () => {
  const mockDescription =
    "<p>This is a great product with amazing features.</p>";
  const mockSpecifications = {
    Brand: "Test Brand",
    Color: "Blue",
    Material: "Cotton",
    Weight: "500g",
  };
  const mockShipping = "<p>Custom shipping information</p>";

  const defaultProps = {
    description: mockDescription,
  };

  describe("Tabs Rendering", () => {
    it("renders description tab by default", () => {
      render(<ProductDescription {...defaultProps} />);

      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("renders specifications tab when specifications provided", () => {
      render(
        <ProductDescription
          {...defaultProps}
          specifications={mockSpecifications}
        />,
      );

      expect(screen.getByText("Specifications")).toBeInTheDocument();
    });

    it("hides specifications tab when no specifications", () => {
      render(<ProductDescription {...defaultProps} />);

      expect(screen.queryByText("Specifications")).not.toBeInTheDocument();
    });

    it("always renders shipping tab", () => {
      render(<ProductDescription {...defaultProps} />);

      expect(screen.getByText("Shipping & Returns")).toBeInTheDocument();
    });
  });

  describe("Tab Switching", () => {
    it("shows description content by default", () => {
      const { container } = render(<ProductDescription {...defaultProps} />);

      expect(container.querySelector(".prose")).toBeInTheDocument();
    });

    it("switches to specifications tab on click", () => {
      render(
        <ProductDescription
          {...defaultProps}
          specifications={mockSpecifications}
        />,
      );

      fireEvent.click(screen.getByText("Specifications"));

      expect(screen.getByText("Test Brand")).toBeInTheDocument();
      expect(screen.getByText("Blue")).toBeInTheDocument();
    });

    it("switches to shipping tab on click", () => {
      render(<ProductDescription {...defaultProps} />);

      fireEvent.click(screen.getByText("Shipping & Returns"));

      expect(
        screen.getByText(/Free shipping on orders above/),
      ).toBeInTheDocument();
    });

    it("highlights active tab", () => {
      render(<ProductDescription {...defaultProps} />);

      const descTab = screen.getByText("Description");
      expect(descTab).toHaveClass("text-primary");
    });

    it("changes active tab styling on switch", () => {
      render(
        <ProductDescription
          {...defaultProps}
          specifications={mockSpecifications}
        />,
      );

      fireEvent.click(screen.getByText("Specifications"));

      const specsTab = screen.getByText("Specifications");
      expect(specsTab).toHaveClass("text-primary");
    });
  });

  describe("Description Content", () => {
    it("renders HTML description", () => {
      const { container } = render(<ProductDescription {...defaultProps} />);

      const prose = container.querySelector(".prose");
      expect(prose?.innerHTML).toContain("This is a great product");
    });

    it("handles long descriptions", () => {
      const longDesc = "<p>" + "A".repeat(1000) + "</p>";
      render(<ProductDescription {...defaultProps} description={longDesc} />);

      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("handles empty description", () => {
      render(<ProductDescription {...defaultProps} description="" />);

      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });

  describe("Specifications Content", () => {
    it("renders all specification entries", () => {
      render(
        <ProductDescription
          {...defaultProps}
          specifications={mockSpecifications}
        />,
      );

      fireEvent.click(screen.getByText("Specifications"));

      expect(screen.getByText("Brand")).toBeInTheDocument();
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
      expect(screen.getByText("Color")).toBeInTheDocument();
      expect(screen.getByText("Blue")).toBeInTheDocument();
    });

    it("formats specifications as key-value pairs", () => {
      render(
        <ProductDescription
          {...defaultProps}
          specifications={mockSpecifications}
        />,
      );

      fireEvent.click(screen.getByText("Specifications"));

      expect(screen.getByText("Material")).toBeInTheDocument();
      expect(screen.getByText("Cotton")).toBeInTheDocument();
    });

    it("handles empty specifications object", () => {
      render(<ProductDescription {...defaultProps} specifications={{}} />);

      // Tab should not be visible
      expect(screen.queryByText("Specifications")).not.toBeInTheDocument();
    });

    it("handles specifications with special characters", () => {
      const specialSpecs = {
        "Model #": "ABC-123",
        "Size (cm)": "10 x 20",
      };

      render(
        <ProductDescription {...defaultProps} specifications={specialSpecs} />,
      );

      fireEvent.click(screen.getByText("Specifications"));

      expect(screen.getByText("Model #")).toBeInTheDocument();
      expect(screen.getByText("ABC-123")).toBeInTheDocument();
    });
  });

  describe("Shipping Content", () => {
    it("renders custom shipping information when provided", () => {
      const { container } = render(
        <ProductDescription {...defaultProps} shipping={mockShipping} />,
      );

      fireEvent.click(screen.getByText("Shipping & Returns"));

      const prose = container.querySelector(".prose");
      expect(prose?.innerHTML).toContain("Custom shipping information");
    });

    it("renders default shipping information when not provided", () => {
      render(<ProductDescription {...defaultProps} />);

      fireEvent.click(screen.getByText("Shipping & Returns"));

      expect(screen.getByText("Shipping Information")).toBeInTheDocument();
      expect(
        screen.getByText(/Free shipping on orders above/),
      ).toBeInTheDocument();
    });

    it("shows return policy in default shipping", () => {
      render(<ProductDescription {...defaultProps} />);

      fireEvent.click(screen.getByText("Shipping & Returns"));

      expect(screen.getByText("Return Policy")).toBeInTheDocument();
      expect(screen.getByText(/7-day return policy/)).toBeInTheDocument();
    });

    it("shows customer support in default shipping", () => {
      render(<ProductDescription {...defaultProps} />);

      fireEvent.click(screen.getByText("Shipping & Returns"));

      expect(screen.getByText("Customer Support")).toBeInTheDocument();
      expect(screen.getByText(/support@letitrip.in/)).toBeInTheDocument();
    });

    it("includes contact links", () => {
      render(<ProductDescription {...defaultProps} />);

      fireEvent.click(screen.getByText("Shipping & Returns"));

      const emailLink = screen.getByText("support@letitrip.in");
      expect(emailLink).toHaveAttribute("href", "mailto:support@letitrip.in");

      const phoneLink = screen.getByText("1800-000-0000");
      expect(phoneLink).toHaveAttribute("href", "tel:+918000000000");
    });
  });

  describe("Styling", () => {
    it("applies white background", () => {
      const { container } = render(<ProductDescription {...defaultProps} />);

      expect(container.firstChild).toHaveClass("bg-white");
    });

    it("applies rounded corners", () => {
      const { container } = render(<ProductDescription {...defaultProps} />);

      expect(container.firstChild).toHaveClass("rounded-lg");
    });

    it("applies shadow", () => {
      const { container } = render(<ProductDescription {...defaultProps} />);

      expect(container.firstChild).toHaveClass("shadow-sm");
    });

    it("shows active tab indicator", () => {
      const { container } = render(<ProductDescription {...defaultProps} />);

      const indicator = container.querySelector(".bg-primary");
      expect(indicator).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles all props together", () => {
      render(
        <ProductDescription
          description={mockDescription}
          specifications={mockSpecifications}
          shipping={mockShipping}
        />,
      );

      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Specifications")).toBeInTheDocument();
      expect(screen.getByText("Shipping & Returns")).toBeInTheDocument();
    });

    it("handles undefined specifications", () => {
      render(
        <ProductDescription {...defaultProps} specifications={undefined} />,
      );

      expect(screen.queryByText("Specifications")).not.toBeInTheDocument();
    });

    it("handles HTML in specifications values", () => {
      const htmlSpecs = {
        Feature: "<strong>Bold</strong> text",
      };

      render(
        <ProductDescription {...defaultProps} specifications={htmlSpecs} />,
      );

      fireEvent.click(screen.getByText("Specifications"));

      expect(
        screen.getByText("<strong>Bold</strong> text"),
      ).toBeInTheDocument();
    });

    it("handles switching between all tabs", () => {
      render(
        <ProductDescription
          description={mockDescription}
          specifications={mockSpecifications}
          shipping={mockShipping}
        />,
      );

      // Switch to specifications
      fireEvent.click(screen.getByText("Specifications"));
      expect(screen.getByText("Test Brand")).toBeInTheDocument();

      // Switch to shipping
      fireEvent.click(screen.getByText("Shipping & Returns"));
      expect(screen.getByText("Custom shipping information")).toBeTruthy();

      // Switch back to description
      fireEvent.click(screen.getByText("Description"));
      expect(screen.getByText("Description")).toHaveClass("text-primary");
    });
  });

  describe("Accessibility", () => {
    it("renders tabs as buttons", () => {
      render(
        <ProductDescription
          {...defaultProps}
          specifications={mockSpecifications}
        />,
      );

      const tabs = screen.getAllByRole("button");
      expect(tabs.length).toBeGreaterThan(0);
    });

    it("makes tabs clickable", () => {
      render(
        <ProductDescription
          {...defaultProps}
          specifications={mockSpecifications}
        />,
      );

      const specTab = screen.getByText("Specifications");
      fireEvent.click(specTab);

      // Should switch content
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
    });
  });
});
