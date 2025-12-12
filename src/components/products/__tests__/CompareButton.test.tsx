import { useComparison } from "@/contexts/ComparisonContext";
import type { ComparisonProduct } from "@/services/comparison.service";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompareButton } from "../CompareButton";

// Mock dependencies
jest.mock("@/contexts/ComparisonContext");

const mockProduct: ComparisonProduct = {
  id: "prod123",
  name: "Test Product",
  slug: "test-product",
  price: 1000,
  image: "https://example.com/product.jpg",
  category: "electronics",
};

describe("CompareButton", () => {
  const mockAddToComparison = jest.fn();
  const mockRemoveFromComparison = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useComparison as jest.Mock).mockReturnValue({
      addToComparison: mockAddToComparison,
      removeFromComparison: mockRemoveFromComparison,
      isInComparison: jest.fn().mockReturnValue(false),
      canAddMore: true,
    });
  });

  describe("Icon Variant", () => {
    it("renders GitCompare icon when not in comparison", () => {
      const { container } = render(<CompareButton product={mockProduct} />);
      expect(
        container.querySelector(".lucide-git-compare")
      ).toBeInTheDocument();
    });

    it("renders Check icon when in comparison", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(true),
        canAddMore: true,
      });

      const { container } = render(<CompareButton product={mockProduct} />);
      expect(container.querySelector(".lucide-check")).toBeInTheDocument();
    });

    it("has aria-label for add to compare", () => {
      render(<CompareButton product={mockProduct} variant="icon" />);
      expect(screen.getByLabelText("Add to compare")).toBeInTheDocument();
    });

    it("has aria-label for remove from compare when added", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(true),
        canAddMore: true,
      });

      render(<CompareButton product={mockProduct} variant="icon" />);
      expect(screen.getByLabelText("Remove from compare")).toBeInTheDocument();
    });

    it("applies small size classes", () => {
      const { container } = render(
        <CompareButton product={mockProduct} size="sm" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("p-1.5");
    });

    it("applies medium size classes by default", () => {
      const { container } = render(<CompareButton product={mockProduct} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("p-2");
    });

    it("applies large size classes", () => {
      const { container } = render(
        <CompareButton product={mockProduct} size="lg" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("p-3");
    });
  });

  describe("Button Variant", () => {
    it("renders Compare text when not in comparison", () => {
      render(<CompareButton product={mockProduct} variant="button" />);
      expect(screen.getByText("Compare")).toBeInTheDocument();
    });

    it("renders In Compare text when in comparison", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(true),
        canAddMore: true,
      });

      render(<CompareButton product={mockProduct} variant="button" />);
      expect(screen.getByText("In Compare")).toBeInTheDocument();
    });

    it("applies button layout classes", () => {
      const { container } = render(
        <CompareButton product={mockProduct} variant="button" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("px-4", "py-2", "rounded-lg", "font-medium");
    });
  });

  describe("Text Variant", () => {
    it("renders Compare text when not in comparison", () => {
      render(<CompareButton product={mockProduct} variant="text" />);
      expect(screen.getByText("Compare")).toBeInTheDocument();
    });

    it("renders Added text when in comparison", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(true),
        canAddMore: true,
      });

      render(<CompareButton product={mockProduct} variant="text" />);
      expect(screen.getByText("Added")).toBeInTheDocument();
    });

    it("applies text variant classes", () => {
      const { container } = render(
        <CompareButton product={mockProduct} variant="text" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("text-sm");
    });
  });

  describe("Interaction", () => {
    it("adds product to comparison when clicked and not in comparison", async () => {
      const user = userEvent.setup();
      render(<CompareButton product={mockProduct} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockAddToComparison).toHaveBeenCalledWith(mockProduct);
    });

    it("removes product from comparison when clicked and in comparison", async () => {
      const user = userEvent.setup();
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(true),
        canAddMore: true,
      });

      render(<CompareButton product={mockProduct} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockRemoveFromComparison).toHaveBeenCalledWith("prod123");
    });

    it("prevents event propagation on click", async () => {
      const user = userEvent.setup();
      const parentClickHandler = jest.fn();

      const { container } = render(
        <div onClick={parentClickHandler}>
          <CompareButton product={mockProduct} />
        </div>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockAddToComparison).toHaveBeenCalled();
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("disables button when cannot add more and not in comparison", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(false),
        canAddMore: false,
      });

      render(<CompareButton product={mockProduct} />);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("does not disable when product is in comparison", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(true),
        canAddMore: false,
      });

      render(<CompareButton product={mockProduct} />);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("shows disabled styling when maximum reached", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(false),
        canAddMore: false,
      });

      const { container } = render(<CompareButton product={mockProduct} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("cursor-not-allowed");
    });

    it("shows tooltip for maximum products reached", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(false),
        canAddMore: false,
      });

      render(<CompareButton product={mockProduct} variant="icon" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Maximum products reached");
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes when not in comparison", () => {
      const { container } = render(<CompareButton product={mockProduct} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("dark:bg-gray-700");
    });

    it("applies dark mode classes for disabled state", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(false),
        canAddMore: false,
      });

      const { container } = render(<CompareButton product={mockProduct} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("dark:bg-gray-700");
    });
  });

  describe("Custom className", () => {
    it("applies custom className", () => {
      const { container } = render(
        <CompareButton product={mockProduct} className="custom-class" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("Active State Styling", () => {
    it("applies active background when in comparison", () => {
      (useComparison as jest.Mock).mockReturnValue({
        addToComparison: mockAddToComparison,
        removeFromComparison: mockRemoveFromComparison,
        isInComparison: jest.fn().mockReturnValue(true),
        canAddMore: true,
      });

      const { container } = render(<CompareButton product={mockProduct} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-blue-600");
    });

    it("applies inactive background when not in comparison", () => {
      const { container } = render(<CompareButton product={mockProduct} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-white");
    });
  });

  describe("Accessibility", () => {
    it("provides accessible button role", () => {
      render(<CompareButton product={mockProduct} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("provides title attribute for tooltip", () => {
      render(<CompareButton product={mockProduct} variant="icon" />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Add to compare"
      );
    });
  });

  describe("Transition Effects", () => {
    it("applies transition classes", () => {
      const { container } = render(<CompareButton product={mockProduct} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("transition-all", "duration-200");
    });
  });
});
