import type { Tab } from "@/constants/tabs";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { TabNav } from "../TabNav";

// Mock dependencies
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const mockTabs: Tab[] = [
  { id: "overview", label: "Overview", href: "/dashboard" },
  { id: "products", label: "Products", href: "/dashboard/products" },
  { id: "orders", label: "Orders", href: "/dashboard/orders" },
  { id: "analytics", label: "Analytics", href: "/dashboard/analytics" },
];

describe("TabNav", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
  });

  describe("Rendering", () => {
    it("renders all tabs", () => {
      render(<TabNav tabs={mockTabs} />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });

    it("renders tabs as links", () => {
      render(<TabNav tabs={mockTabs} />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(4);
      expect(links[0]).toHaveAttribute("href", "/dashboard");
      expect(links[1]).toHaveAttribute("href", "/dashboard/products");
    });

    it("renders with default underline variant", () => {
      const { container } = render(<TabNav tabs={mockTabs} />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("border-b");
    });

    it("applies custom className", () => {
      const { container } = render(
        <TabNav tabs={mockTabs} className="custom-class" />
      );
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("custom-class");
    });
  });

  describe("Active State - Underline Variant", () => {
    it("highlights active tab with exact match", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard");
      render(<TabNav tabs={mockTabs} />);
      const overviewLink = screen.getByText("Overview").closest("a");
      expect(overviewLink?.className).toContain("border-blue-600");
      expect(overviewLink?.className).toContain("text-blue-600");
    });

    it("highlights active tab for nested routes", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard/products/123");
      render(<TabNav tabs={mockTabs} />);
      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink?.className).toContain("border-blue-600");
    });

    it("does not highlight inactive tabs", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard/orders");
      render(<TabNav tabs={mockTabs} />);
      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink?.className).toContain("border-transparent");
    });

    it("does not match parent route for query-based tabs", () => {
      const queryTabs: Tab[] = [
        { id: "all", label: "All", href: "/products" },
        { id: "active", label: "Active", href: "/products?status=active" },
      ];
      (usePathname as jest.Mock).mockReturnValue("/products/123");
      render(<TabNav tabs={queryTabs} />);

      const activeLink = screen.getByText("Active").closest("a");
      expect(activeLink?.className).not.toContain("border-blue-600");
    });
  });

  describe("Pills Variant", () => {
    it("renders pills variant correctly", () => {
      const { container } = render(<TabNav tabs={mockTabs} variant="pills" />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("flex-wrap", "gap-2");
      expect(nav).not.toHaveClass("border-b");
    });

    it("applies rounded-full to links in pills variant", () => {
      render(<TabNav tabs={mockTabs} variant="pills" />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.className).toContain("rounded-full");
      });
    });

    it("highlights active pill with blue background", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard/products");
      render(<TabNav tabs={mockTabs} variant="pills" />);
      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink?.className).toContain("bg-blue-600");
      expect(productsLink?.className).toContain("text-white");
    });

    it("applies gray background to inactive pills", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard/products");
      render(<TabNav tabs={mockTabs} variant="pills" />);
      const ordersLink = screen.getByText("Orders").closest("a");
      expect(ordersLink?.className).toContain("bg-gray-100");
    });
  });

  describe("Default Variant", () => {
    it("renders default variant correctly", () => {
      const { container } = render(
        <TabNav tabs={mockTabs} variant="default" />
      );
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("bg-gray-100", "rounded-lg", "p-1");
    });

    it("applies rounded-md to links in default variant", () => {
      render(<TabNav tabs={mockTabs} variant="default" />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.className).toContain("rounded-md");
      });
    });

    it("highlights active tab with white background", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard/analytics");
      render(<TabNav tabs={mockTabs} variant="default" />);
      const analyticsLink = screen.getByText("Analytics").closest("a");
      expect(analyticsLink?.className).toContain("bg-white");
      expect(analyticsLink?.className).toContain("shadow-sm");
    });

    it("does not apply background to inactive tabs", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard/analytics");
      render(<TabNav tabs={mockTabs} variant="default" />);
      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink?.className).not.toContain("bg-white");
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes in underline variant", () => {
      render(<TabNav tabs={mockTabs} />);
      const links = screen.getAllByRole("link");
      expect(links[0].className).toContain("dark:text-blue-400");
    });

    it("applies dark mode classes in pills variant", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard");
      render(<TabNav tabs={mockTabs} variant="pills" />);
      const inactiveLink = screen.getByText("Products").closest("a");
      expect(inactiveLink?.className).toContain("dark:bg-gray-800");
    });

    it("applies dark mode classes in default variant", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard");
      render(<TabNav tabs={mockTabs} variant="default" />);
      const { container } = render(
        <TabNav tabs={mockTabs} variant="default" />
      );
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("dark:bg-gray-800");
    });

    it("applies dark mode border color in underline variant", () => {
      const { container } = render(<TabNav tabs={mockTabs} />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("dark:border-gray-700");
    });
  });

  describe("Responsive Design", () => {
    it("applies whitespace-nowrap to prevent text wrapping", () => {
      render(<TabNav tabs={mockTabs} />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.className).toContain("whitespace-nowrap");
      });
    });

    it("applies overflow-x-auto for horizontal scrolling in underline variant", () => {
      const { container } = render(<TabNav tabs={mockTabs} />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("overflow-x-auto");
    });

    it("applies scrollbar-hide class", () => {
      const { container } = render(<TabNav tabs={mockTabs} />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("scrollbar-hide");
    });

    it("applies flex-wrap in pills variant for responsive wrapping", () => {
      const { container } = render(<TabNav tabs={mockTabs} variant="pills" />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("flex-wrap");
    });
  });

  describe("Accessibility", () => {
    it("uses nav element for semantic HTML", () => {
      const { container } = render(<TabNav tabs={mockTabs} />);
      expect(container.querySelector("nav")).toBeInTheDocument();
    });

    it("renders links as anchor elements", () => {
      render(<TabNav tabs={mockTabs} />);
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });

    it("provides accessible text for all tabs", () => {
      render(<TabNav tabs={mockTabs} />);
      mockTabs.forEach((tab) => {
        expect(screen.getByText(tab.label)).toBeInTheDocument();
      });
    });
  });

  describe("Hover Effects", () => {
    it("applies hover classes in underline variant", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard");
      render(<TabNav tabs={mockTabs} />);
      const inactiveLink = screen.getByText("Products").closest("a");
      expect(inactiveLink?.className).toContain("hover:text-gray-700");
      expect(inactiveLink?.className).toContain("hover:border-gray-300");
    });

    it("applies hover classes in pills variant", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard");
      render(<TabNav tabs={mockTabs} variant="pills" />);
      const inactiveLink = screen.getByText("Products").closest("a");
      expect(inactiveLink?.className).toContain("hover:bg-gray-200");
    });

    it("applies hover classes in default variant", () => {
      (usePathname as jest.Mock).mockReturnValue("/dashboard");
      render(<TabNav tabs={mockTabs} variant="default" />);
      const inactiveLink = screen.getByText("Products").closest("a");
      expect(inactiveLink?.className).toContain("hover:text-gray-900");
    });
  });

  describe("Transition Effects", () => {
    it("applies transition-colors to all variants", () => {
      render(<TabNav tabs={mockTabs} />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.className).toContain("transition-colors");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty tabs array", () => {
      const { container } = render(<TabNav tabs={[]} />);
      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
      expect(screen.queryAllByRole("link")).toHaveLength(0);
    });

    it("handles single tab", () => {
      const singleTab: Tab[] = [
        { id: "overview", label: "Overview", href: "/dashboard" },
      ];
      render(<TabNav tabs={singleTab} />);
      expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("handles tabs with very long labels", () => {
      const longLabelTabs: Tab[] = [
        {
          id: "long",
          label: "This is a very long tab label that should not wrap",
          href: "/test",
        },
      ];
      render(<TabNav tabs={longLabelTabs} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("whitespace-nowrap");
    });

    it("handles pathname at root level", () => {
      (usePathname as jest.Mock).mockReturnValue("/");
      const rootTabs: Tab[] = [
        { id: "home", label: "Home", href: "/" },
        { id: "about", label: "About", href: "/about" },
      ];
      render(<TabNav tabs={rootTabs} />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink?.className).toContain("border-blue-600");
    });
  });
});
