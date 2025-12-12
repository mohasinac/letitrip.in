import type { Tab } from "@/constants/tabs";
import { render, screen } from "@testing-library/react";
import { TabbedLayout } from "../TabbedLayout";

// Mock dependencies
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/dashboard"),
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
  { id: "settings", label: "Settings", href: "/dashboard/settings" },
];

describe("TabbedLayout", () => {
  describe("Basic Rendering", () => {
    it("renders children content", () => {
      render(
        <TabbedLayout tabs={mockTabs}>
          <div>Child content</div>
        </TabbedLayout>
      );
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("renders tabs navigation", () => {
      render(
        <TabbedLayout tabs={mockTabs}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("renders without title when not provided", () => {
      render(
        <TabbedLayout tabs={mockTabs}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("renders without description when not provided", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(container.querySelector(".text-gray-600")).not.toBeInTheDocument();
    });
  });

  describe("Title and Description", () => {
    it("renders title when provided", () => {
      render(
        <TabbedLayout tabs={mockTabs} title="Dashboard">
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Dashboard").tagName).toBe("H1");
    });

    it("renders description when provided", () => {
      render(
        <TabbedLayout
          tabs={mockTabs}
          title="Dashboard"
          description="Manage your account"
        >
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.getByText("Manage your account")).toBeInTheDocument();
    });

    it("does not render description without title", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs} description="No title here">
          <div>Content</div>
        </TabbedLayout>
      );
      // Description only renders when there's a title or actions
      expect(screen.queryByText("No title here")).not.toBeInTheDocument();
    });

    it("applies title classes correctly", () => {
      render(
        <TabbedLayout tabs={mockTabs} title="Dashboard">
          <div>Content</div>
        </TabbedLayout>
      );
      const title = screen.getByText("Dashboard");
      expect(title).toHaveClass("text-2xl", "font-bold", "text-gray-900");
    });

    it("applies description classes correctly", () => {
      render(
        <TabbedLayout
          tabs={mockTabs}
          title="Dashboard"
          description="Test description"
        >
          <div>Content</div>
        </TabbedLayout>
      );
      const description = screen.getByText("Test description");
      expect(description).toHaveClass(
        "text-sm",
        "text-gray-500",
        "dark:text-gray-400",
        "mt-1"
      );
    });
  });

  describe("Actions Slot", () => {
    it("renders actions when provided", () => {
      const actions = <button>Create New</button>;
      render(
        <TabbedLayout tabs={mockTabs} actions={actions}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.getByText("Create New")).toBeInTheDocument();
    });

    it("does not render actions when not provided", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(container.querySelector("button")).not.toBeInTheDocument();
    });

    it("renders multiple action buttons", () => {
      const actions = (
        <>
          <button>Save</button>
          <button>Cancel</button>
        </>
      );
      render(
        <TabbedLayout tabs={mockTabs} actions={actions}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  describe("Variant Passthrough", () => {
    it("passes variant prop to TabNav", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs} variant="pills">
          <div>Content</div>
        </TabbedLayout>
      );
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("flex-wrap", "gap-2");
    });

    it("passes default variant to TabNav", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs} variant="default">
          <div>Content</div>
        </TabbedLayout>
      );
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("bg-gray-100", "rounded-lg");
    });

    it("uses underline variant when not specified", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs}>
          <div>Content</div>
        </TabbedLayout>
      );
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("border-b");
    });
  });

  describe("Layout Structure", () => {
    it("renders main container with correct classes", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs}>
          <div>Content</div>
        </TabbedLayout>
      );
      const main = container.querySelector("div");
      expect(main).toHaveClass("flex", "flex-col", "min-h-full");
    });

    it("renders header when title, description, or actions provided", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs} title="Dashboard">
          <div>Content</div>
        </TabbedLayout>
      );
      const header = container.querySelector("div > div > div");
      expect(header).toBeInTheDocument();
    });

    it("does not render header when title and actions absent", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs}>
          <div>Content</div>
        </TabbedLayout>
      );
      // Header only renders when title or actions exist
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(
        container.querySelector(".flex.flex-col.sm\\:flex-row")
      ).not.toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive flex classes to header", () => {
      const { container } = render(
        <TabbedLayout
          tabs={mockTabs}
          title="Dashboard"
          actions={<button>Action</button>}
        >
          <div>Content</div>
        </TabbedLayout>
      );
      const header = container.querySelector("div > div > div");
      expect(header).toHaveClass(
        "flex",
        "flex-col",
        "sm:flex-row",
        "sm:items-center",
        "sm:justify-between"
      );
    });

    it("applies responsive gap classes", () => {
      const { container } = render(
        <TabbedLayout
          tabs={mockTabs}
          title="Dashboard"
          actions={<button>Action</button>}
        >
          <div>Content</div>
        </TabbedLayout>
      );
      const header = container.querySelector("div > div > div");
      expect(header).toHaveClass("gap-4", "mb-4");
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to title", () => {
      render(
        <TabbedLayout tabs={mockTabs} title="Dashboard">
          <div>Content</div>
        </TabbedLayout>
      );
      const title = screen.getByText("Dashboard");
      expect(title).toHaveClass("dark:text-white");
    });

    it("applies dark mode classes to description", () => {
      render(
        <TabbedLayout
          tabs={mockTabs}
          title="Dashboard"
          description="Description text"
        >
          <div>Content</div>
        </TabbedLayout>
      );
      const description = screen.getByText("Description text");
      expect(description).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Children Rendering", () => {
    it("renders multiple children", () => {
      render(
        <TabbedLayout tabs={mockTabs}>
          <div>First</div>
          <div>Second</div>
        </TabbedLayout>
      );
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });

    it("renders complex nested children", () => {
      render(
        <TabbedLayout tabs={mockTabs}>
          <div>
            <p>Paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </TabbedLayout>
      );
      expect(screen.getByText("Paragraph")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  describe("Tab Integration", () => {
    it("renders all provided tabs", () => {
      const multiTabs: Tab[] = [
        { id: "tab1", label: "Tab 1", href: "/tab1" },
        { id: "tab2", label: "Tab 2", href: "/tab2" },
        { id: "tab3", label: "Tab 3", href: "/tab3" },
      ];
      render(
        <TabbedLayout tabs={multiTabs}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
      expect(screen.getByText("Tab 3")).toBeInTheDocument();
    });

    it("handles empty tabs array", () => {
      const { container } = render(
        <TabbedLayout tabs={[]}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(container.querySelector("nav")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic heading for title", () => {
      render(
        <TabbedLayout tabs={mockTabs} title="Dashboard">
          <div>Content</div>
        </TabbedLayout>
      );
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Dashboard");
    });

    it("maintains semantic structure with header and content", () => {
      const { container } = render(
        <TabbedLayout tabs={mockTabs} title="Dashboard">
          <div>Content</div>
        </TabbedLayout>
      );
      expect(container.querySelector("nav")).toBeInTheDocument();
      expect(screen.getByRole("heading")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null children gracefully", () => {
      render(<TabbedLayout tabs={mockTabs}>{null}</TabbedLayout>);
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });

    it("handles undefined actions", () => {
      render(
        <TabbedLayout tabs={mockTabs} actions={undefined}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("handles very long title text", () => {
      const longTitle =
        "This is a very long title that might wrap on mobile devices";
      render(
        <TabbedLayout tabs={mockTabs} title={longTitle}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles very long description text", () => {
      const longDesc =
        "This is a very long description that provides detailed information about the dashboard and its capabilities";
      render(
        <TabbedLayout tabs={mockTabs} title="Dashboard" description={longDesc}>
          <div>Content</div>
        </TabbedLayout>
      );
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });
  });

  describe("Combined Scenarios", () => {
    it("renders complete layout with all props", () => {
      const actions = <button>Create</button>;
      render(
        <TabbedLayout
          tabs={mockTabs}
          title="Dashboard"
          description="Manage your settings"
          actions={actions}
          variant="pills"
        >
          <div>Main content</div>
        </TabbedLayout>
      );

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Manage your settings")).toBeInTheDocument();
      expect(screen.getByText("Create")).toBeInTheDocument();
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Main content")).toBeInTheDocument();
    });

    it("renders with title and actions but no description", () => {
      render(
        <TabbedLayout
          tabs={mockTabs}
          title="Settings"
          actions={<button>Save</button>}
        >
          <div>Content</div>
        </TabbedLayout>
      );

      expect(
        screen.getByRole("heading", { level: 1, name: "Settings" })
      ).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("renders description with actions but no title", () => {
      render(
        <TabbedLayout
          tabs={mockTabs}
          description="Configure your preferences"
          actions={<button>Apply</button>}
        >
          <div>Content</div>
        </TabbedLayout>
      );

      // Description renders when header exists (actions trigger header)
      expect(
        screen.getByText("Configure your preferences")
      ).toBeInTheDocument();
      expect(screen.getByText("Apply")).toBeInTheDocument();
    });
  });
});
