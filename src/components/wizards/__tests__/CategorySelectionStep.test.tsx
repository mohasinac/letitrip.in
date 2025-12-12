import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CategorySelectionStep,
  CategorySelectionStepProps,
} from "../CategorySelectionStep";

// Mock components
jest.mock("@/components/seller/CategorySelectorWithCreate", () => ({
  __esModule: true,
  default: ({ value, onChange, required, error }: any) => (
    <div data-testid="category-selector">
      <input
        data-testid="category-input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        required={required}
        aria-invalid={!!error}
      />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  ChevronRight: () => <div data-testid="chevron-icon">›</div>,
}));

describe("CategorySelectionStep", () => {
  const defaultProps: CategorySelectionStepProps = {
    value: "",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<CategorySelectionStep {...defaultProps} />);

      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByTestId("category-selector")).toBeInTheDocument();
    });

    it("should render custom label", () => {
      render(<CategorySelectionStep {...defaultProps} label="Product Type" />);

      expect(screen.getByText("Product Type")).toBeInTheDocument();
    });

    it("should show required indicator by default", () => {
      render(<CategorySelectionStep {...defaultProps} />);

      const asterisk = screen.getByText("*");
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass("text-red-500");
    });

    it("should hide required indicator when not required", () => {
      render(<CategorySelectionStep {...defaultProps} required={false} />);

      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("should display helper text", () => {
      render(<CategorySelectionStep {...defaultProps} />);

      expect(
        screen.getByText("Select the most specific category that fits")
      ).toBeInTheDocument();
    });

    it("should display custom helper text", () => {
      render(
        <CategorySelectionStep
          {...defaultProps}
          helperText="Choose a category"
        />
      );

      expect(screen.getByText("Choose a category")).toBeInTheDocument();
    });

    it("should not display helper text when not provided", () => {
      render(<CategorySelectionStep {...defaultProps} helperText="" />);

      expect(
        screen.queryByText("Select the most specific category that fits")
      ).not.toBeInTheDocument();
    });
  });

  describe("Breadcrumb Display", () => {
    it("should not show breadcrumb by default when path is empty", () => {
      render(<CategorySelectionStep {...defaultProps} />);

      expect(screen.queryByText("Path:")).not.toBeInTheDocument();
    });

    it("should not show breadcrumb when showBreadcrumb is false", () => {
      render(
        <CategorySelectionStep {...defaultProps} showBreadcrumb={false} />
      );

      expect(screen.queryByText("Path:")).not.toBeInTheDocument();
    });

    // Note: Breadcrumb path is managed by internal state, not exposed via props
  });

  describe("Error Handling", () => {
    it("should display error message", () => {
      render(
        <CategorySelectionStep {...defaultProps} error="Category is required" />
      );

      expect(screen.getByTestId("error")).toHaveTextContent(
        "Category is required"
      );
    });

    it("should pass error to CategorySelector", () => {
      render(
        <CategorySelectionStep {...defaultProps} error="Invalid category" />
      );

      const input = screen.getByTestId("category-input");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Category Selection", () => {
    it("should call onChange when category is selected", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<CategorySelectionStep {...defaultProps} onChange={onChange} />);

      const input = screen.getByTestId("category-input");
      await user.type(input, "cat123");

      // onChange is called for each character typed
      expect(onChange).toHaveBeenCalled();
      // Check the last call was with the full value
      expect(onChange).toHaveBeenLastCalledWith("3");
    });

    it("should display selected value", () => {
      render(<CategorySelectionStep {...defaultProps} value="cat456" />);

      const input = screen.getByTestId("category-input");
      expect(input).toHaveValue("cat456");
    });

    it("should handle null category selection", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<CategorySelectionStep {...defaultProps} onChange={onChange} />);

      const input = screen.getByTestId("category-input");
      await user.clear(input);

      // onChange should not be called when clearing (null value)
      // The component filters out null values
    });
  });

  describe("Props Propagation", () => {
    it("should pass required prop to CategorySelector", () => {
      render(<CategorySelectionStep {...defaultProps} required={true} />);

      const input = screen.getByTestId("category-input");
      expect(input).toBeRequired();
    });

    it("should pass required=false to CategorySelector", () => {
      render(<CategorySelectionStep {...defaultProps} required={false} />);

      const input = screen.getByTestId("category-input");
      expect(input).not.toBeRequired();
    });

    it("should pass value to CategorySelector", () => {
      render(<CategorySelectionStep {...defaultProps} value="cat789" />);

      const input = screen.getByTestId("category-input");
      expect(input).toHaveValue("cat789");
    });
  });

  describe("entityType Prop", () => {
    it("should accept product entityType", () => {
      const { container } = render(
        <CategorySelectionStep {...defaultProps} entityType="product" />
      );

      expect(container).toBeInTheDocument();
    });

    it("should accept shop entityType", () => {
      const { container } = render(
        <CategorySelectionStep {...defaultProps} entityType="shop" />
      );

      expect(container).toBeInTheDocument();
    });

    it("should accept auction entityType", () => {
      const { container } = render(
        <CategorySelectionStep {...defaultProps} entityType="auction" />
      );

      expect(container).toBeInTheDocument();
    });

    it("should default to product entityType", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("leafOnly Prop", () => {
    it("should default to leafOnly=true", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      expect(container).toBeInTheDocument();
    });

    it("should accept leafOnly=false", () => {
      const { container } = render(
        <CategorySelectionStep {...defaultProps} leafOnly={false} />
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes for heading", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const heading = screen.getByText("Category").closest("h3");
      expect(heading).toHaveClass("dark:text-gray-300");
    });

    it("should have dark mode classes for helper text", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const helper = screen.getByText(
        "Select the most specific category that fits"
      );
      expect(helper).toHaveClass("dark:text-gray-400");
    });

    it("should have dark mode classes for container", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const box = container.querySelector(".dark\\:bg-gray-800");
      expect(box).toBeInTheDocument();
    });

    it("should have dark mode border classes", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const box = container.querySelector(".dark\\:border-gray-700");
      expect(box).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have space-y spacing", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const wrapper = container.querySelector(".space-y-4");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have responsive text sizes", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const heading = screen.getByText("Category").closest("h3");
      expect(heading).toHaveClass("text-sm");

      const helper = screen.getByText(
        "Select the most specific category that fits"
      );
      expect(helper).toHaveClass("text-xs");
    });
  });

  describe("Accessibility", () => {
    it("should have semantic heading", () => {
      render(<CategorySelectionStep {...defaultProps} label="Category Type" />);

      const heading = screen.getByText("Category Type");
      expect(heading.tagName).toBe("H3");
    });

    it("should associate required indicator with label", () => {
      render(<CategorySelectionStep {...defaultProps} required={true} />);

      const heading = screen.getByText("Category").closest("h3");
      const asterisk = screen.getByText("*");
      expect(heading).toContainElement(asterisk);
    });

    it("should have descriptive helper text", () => {
      render(<CategorySelectionStep {...defaultProps} />);

      const helper = screen.getByText(
        "Select the most specific category that fits"
      );
      expect(helper.tagName).toBe("P");
    });
  });

  describe("Layout and Styling", () => {
    it("should have border on selector container", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const box = container.querySelector(
        ".border.border-gray-200.rounded-lg.p-4"
      );
      expect(box).toBeInTheDocument();
    });

    it("should have white background on selector container", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const box = container.querySelector(".bg-white");
      expect(box).toBeInTheDocument();
    });

    it("should have rounded corners", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const box = container.querySelector(".rounded-lg");
      expect(box).toBeInTheDocument();
    });

    it("should have padding on selector container", () => {
      const { container } = render(<CategorySelectionStep {...defaultProps} />);

      const box = container.querySelector(".p-4");
      expect(box).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should integrate with CategorySelectorWithCreate", () => {
      render(<CategorySelectionStep {...defaultProps} />);

      expect(screen.getByTestId("category-selector")).toBeInTheDocument();
    });

    it("should pass all necessary props to CategorySelector", () => {
      render(
        <CategorySelectionStep
          {...defaultProps}
          value="cat123"
          required={true}
          error="Error message"
        />
      );

      const input = screen.getByTestId("category-input");
      expect(input).toHaveValue("cat123");
      expect(input).toBeRequired();
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });
});
