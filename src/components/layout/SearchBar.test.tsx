import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar, { SearchBarRef } from "./SearchBar";
import { categoriesService } from "@/services/categories.service";
import { createRef } from "react";

// Mock dependencies
jest.mock("@/services/categories.service");
jest.mock("@/components/common/CategorySelector", () => ({
  __esModule: true,
  default: ({ categories, value, onChange, placeholder, className }: any) => (
    <select
      data-testid="category-selector"
      value={value || ""}
      onChange={(e) => {
        const cat = categories.find((c: any) => c.id === e.target.value);
        onChange(e.target.value || null, cat || null);
      }}
      className={className}
    >
      <option value="">{placeholder}</option>
      {categories.map((cat: any) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  ),
}));

const mockCategories = [
  {
    id: "cat1",
    name: "Electronics",
    slug: "electronics",
    parent_id: null,
    level: 0,
    has_children: true,
    is_active: true,
    product_count: 50,
  },
  {
    id: "cat2",
    name: "Toys",
    slug: "toys",
    parent_id: null,
    level: 0,
    has_children: false,
    is_active: true,
    product_count: 30,
  },
];

describe("SearchBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (categoriesService.list as jest.Mock).mockResolvedValue(mockCategories);

    // Mock scrollIntoView (not implemented in jsdom)
    Element.prototype.scrollIntoView = jest.fn();
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders search bar", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Enter a brand name/)
        ).toBeInTheDocument();
      });
    });

    it("renders search input", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
    });

    it("renders search button", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByText("Search")).toBeInTheDocument();
      });
    });

    it("renders category selector", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByTestId("category-selector")).toBeInTheDocument();
      });
    });

    it("has form element", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(document.querySelector("form")).toBeInTheDocument();
      });
    });
  });

  // Visibility Control
  describe("Visibility Control", () => {
    it("renders when isVisible is true", () => {
      render(<SearchBar isVisible={true} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("does not render when isVisible is false", () => {
      render(<SearchBar isVisible={false} />);
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("renders by default", () => {
      render(<SearchBar />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  // Category Loading
  describe("Category Loading", () => {
    it("fetches categories on mount", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(categoriesService.list).toHaveBeenCalled();
      });
    });

    it("displays loading state", () => {
      (categoriesService.list as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      render(<SearchBar />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("displays categories after loading", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Toys")).toBeInTheDocument();
      });
    });

    it("handles API error gracefully", async () => {
      (categoriesService.list as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      render(<SearchBar />);
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to fetch categories:",
          expect.any(Error)
        );
      });
      consoleSpy.mockRestore();
    });

    it("transforms categories to correct format", async () => {
      (categoriesService.list as jest.Mock).mockResolvedValue([
        {
          id: "1",
          name: "Test",
          slug: "test",
          parentId: null,
          level: 0,
          hasChildren: false,
          isActive: true,
          productCount: 10,
        },
      ]);
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });
    });

    it("handles nested response data", async () => {
      (categoriesService.list as jest.Mock).mockResolvedValue({
        data: [
          {
            id: "1",
            name: "Nested",
            slug: "nested",
            parentId: null,
            level: 0,
            hasChildren: false,
            isActive: true,
            productCount: 5,
          },
        ],
      });
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByText("Nested")).toBeInTheDocument();
      });
    });
  });

  // Search Input
  describe("Search Input", () => {
    it("updates search query on input", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "test query" } });
        expect(input).toHaveValue("test query");
      });
    });

    it("has correct placeholder text", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(
            /Enter a brand name, item name or item URL for search/
          )
        ).toBeInTheDocument();
      });
    });

    it("clears input when hidden", async () => {
      const ref = createRef<SearchBarRef>();
      render(<SearchBar ref={ref} />);
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "test" } });
      });
      ref.current?.hide();
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toHaveValue("");
      });
    });
  });

  // Category Selection
  describe("Category Selection", () => {
    it("updates selected category", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const selector = screen.getByTestId("category-selector");
        fireEvent.change(selector, { target: { value: "cat1" } });
        expect(selector).toHaveValue("cat1");
      });
    });

    it("shows All Categories by default", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByText("All Categories")).toBeInTheDocument();
      });
    });
  });

  // Form Submission
  describe("Form Submission", () => {
    it("handles form submission", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      render(<SearchBar />);
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "test query" } });
        const form = document.querySelector("form");
        fireEvent.submit(form!);
      });
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Search:",
          "test query",
          "Category:",
          "all"
        );
      });
      consoleSpy.mockRestore();
    });

    it("includes selected category in search", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      render(<SearchBar />);
      await waitFor(() => {
        const selector = screen.getByTestId("category-selector");
        fireEvent.change(selector, { target: { value: "cat1" } });
        const form = document.querySelector("form");
        fireEvent.submit(form!);
      });
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Search:",
          "",
          "Category:",
          "cat1"
        );
      });
      consoleSpy.mockRestore();
    });

    it("handles Enter key press", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      render(<SearchBar />);
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "enter test" } });
        fireEvent.keyPress(input, {
          key: "Enter",
          code: "Enter",
          charCode: 13,
        });
      });
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      consoleSpy.mockRestore();
    });

    it("prevents default form submission", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const form = document.querySelector("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        const preventDefaultSpy = jest.spyOn(event, "preventDefault");
        form?.dispatchEvent(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });
  });

  // Close Button
  describe("Close Button", () => {
    it("renders close button when onClose provided", () => {
      render(<SearchBar onClose={() => {}} />);
      expect(screen.getByLabelText("Close search")).toBeInTheDocument();
    });

    it("does not render close button without onClose", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.queryByLabelText("Close search")).not.toBeInTheDocument();
      });
    });

    it("calls onClose when clicked", () => {
      const onClose = jest.fn();
      render(<SearchBar onClose={onClose} />);
      const closeButton = screen.getByLabelText("Close search");
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });

  // Ref Methods
  describe("Ref Methods", () => {
    it("exposes focusSearch method", async () => {
      const ref = createRef<SearchBarRef>();
      render(<SearchBar ref={ref} />);
      await waitFor(() => {
        expect(ref.current?.focusSearch).toBeDefined();
      });
    });

    it("exposes show method", async () => {
      const ref = createRef<SearchBarRef>();
      render(<SearchBar ref={ref} />);
      await waitFor(() => {
        expect(ref.current?.show).toBeDefined();
      });
    });

    it("exposes hide method", async () => {
      const ref = createRef<SearchBarRef>();
      render(<SearchBar ref={ref} />);
      await waitFor(() => {
        expect(ref.current?.hide).toBeDefined();
      });
    });

    it("focusSearch focuses the input", async () => {
      const ref = createRef<SearchBarRef>();
      render(<SearchBar ref={ref} />);
      await waitFor(() => {
        ref.current?.focusSearch();
        expect(document.activeElement).toBe(screen.getByRole("textbox"));
      });
    });

    it("show focuses the input", async () => {
      const ref = createRef<SearchBarRef>();
      render(<SearchBar ref={ref} />);
      await waitFor(() => {
        ref.current?.show();
        expect(document.activeElement).toBe(screen.getByRole("textbox"));
      });
    });
  });

  // Styling
  describe("Styling", () => {
    it("has yellow background", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const container = document.querySelector(".bg-yellow-50");
        expect(container).toBeInTheDocument();
      });
    });

    it("has border bottom", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const container = document.querySelector(".border-b");
        expect(container).toBeInTheDocument();
      });
    });

    it("has focus ring on input", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const inputContainer = document.querySelector(".focus-within\\:ring-2");
        expect(inputContainer).toBeInTheDocument();
      });
    });

    it("has yellow search button", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const button = screen.getByText("Search").closest("button");
        expect(button).toHaveClass("bg-yellow-500");
      });
    });

    it("has rounded corners", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const container = document.querySelector(".rounded-lg");
        expect(container).toBeInTheDocument();
      });
    });
  });

  // Responsive Design
  describe("Responsive Design", () => {
    it("has responsive max-width", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const form = document.querySelector("form");
        expect(form).toHaveClass("max-w-full", "lg:max-w-6xl");
      });
    });

    it("hides search text on small screens", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const searchText = screen.getByText("Search");
        expect(searchText).toHaveClass("hidden", "sm:inline");
      });
    });

    it("has responsive category selector width", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const selectorContainer = document.querySelector(".min-w-\\[70px\\]");
        expect(selectorContainer).toBeInTheDocument();
      });
    });
  });

  // Search Button
  describe("Search Button", () => {
    it("has search icon", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const button = screen.getByText("Search").closest("button");
        expect(button?.querySelector("svg")).toBeInTheDocument();
      });
    });

    it("triggers search on click", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      render(<SearchBar />);
      await waitFor(() => {
        const button = screen.getByText("Search");
        fireEvent.click(button);
      });
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      consoleSpy.mockRestore();
    });

    it("has hover effect", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        const button = screen.getByText("Search").closest("button");
        expect(button).toHaveClass("hover:bg-yellow-600");
      });
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles empty search query", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      render(<SearchBar />);
      await waitFor(() => {
        const form = document.querySelector("form");
        fireEvent.submit(form!);
      });
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Search:",
          "",
          "Category:",
          "all"
        );
      });
      consoleSpy.mockRestore();
    });

    it("handles empty categories array", async () => {
      (categoriesService.list as jest.Mock).mockResolvedValue([]);
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByText("All Categories")).toBeInTheDocument();
      });
    });

    it("handles null category selection", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      render(<SearchBar />);
      await waitFor(() => {
        const selector = screen.getByTestId("category-selector");
        fireEvent.change(selector, { target: { value: "" } });
        const form = document.querySelector("form");
        fireEvent.submit(form!);
      });
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Search:",
          "",
          "Category:",
          "all"
        );
      });
      consoleSpy.mockRestore();
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("has search input accessible", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
    });

    it("has close button aria-label", () => {
      render(<SearchBar onClose={() => {}} />);
      expect(screen.getByLabelText("Close search")).toBeInTheDocument();
    });

    it("has search bar id", async () => {
      render(<SearchBar />);
      await waitFor(() => {
        expect(document.getElementById("search-bar")).toBeInTheDocument();
      });
    });
  });
});
