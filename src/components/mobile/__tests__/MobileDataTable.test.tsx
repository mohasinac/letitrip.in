/**
 * Comprehensive Unit Tests for MobileDataTable Component
 * Testing responsive data display, mobile cards, desktop table, and accessibility
 *
 * @batch 13
 * @status NEW
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { MobileDataTable } from "../MobileDataTable";

// Test data
interface TestUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  joined: string;
}

const testUsers: TestUser[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "admin",
    joined: "2024-01-01",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "inactive",
    role: "user",
    joined: "2024-02-01",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    status: "active",
    role: "editor",
    joined: "2024-03-01",
  },
];

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "status", header: "Status" },
  { key: "role", header: "Role" },
];

const keyExtractor = (item: TestUser) => item.id;

describe("MobileDataTable - Responsive Component", () => {
  const defaultProps = {
    data: testUsers,
    columns,
    keyExtractor,
  };

  describe("Basic Rendering", () => {
    it("should render with data", () => {
      render(<MobileDataTable {...defaultProps} />);
      // Component renders both mobile and desktop views
      expect(screen.getAllByText("John Doe")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Jane Smith")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Bob Wilson")[0]).toBeInTheDocument();
    });

    it("should render all rows", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      // Mobile cards
      const mobileCards = container.querySelectorAll(".lg\\:hidden > div");
      expect(mobileCards.length).toBe(testUsers.length);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <MobileDataTable {...defaultProps} className="custom-table" />
      );
      expect(container.firstChild).toHaveClass("custom-table");
    });
  });

  describe("Mobile Card View", () => {
    it("should render mobile cards with primary column", () => {
      render(<MobileDataTable {...defaultProps} />);
      // First column (name) should be primary - component renders both views
      expect(screen.getAllByText("John Doe")[0]).toBeInTheDocument();
    });

    it("should render secondary columns in mobile view", () => {
      render(<MobileDataTable {...defaultProps} />);
      // Email and Status should be shown (first 2 secondary columns) - both views render
      expect(screen.getAllByText(/Email:/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Status:/)[0]).toBeInTheDocument();
    });

    it("should hide columns marked as mobileHide", () => {
      const columnsWithHide = [
        { key: "name", header: "Name" },
        { key: "email", header: "Email", mobileHide: true },
        { key: "status", header: "Status" },
      ];
      render(<MobileDataTable {...defaultProps} columns={columnsWithHide} />);
      // Email column should not be shown in mobile view
      expect(screen.queryByText(/Email:/)).not.toBeInTheDocument();
    });

    it("should render ChevronRight when onRowClick is provided", () => {
      const onRowClick = jest.fn();
      const { container } = render(
        <MobileDataTable {...defaultProps} onRowClick={onRowClick} />
      );
      const chevrons = container.querySelectorAll(".lucide-chevron-right");
      expect(chevrons.length).toBeGreaterThan(0);
    });

    it("should not render ChevronRight when onRowClick is not provided", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const chevrons = container.querySelectorAll(".lucide-chevron-right");
      expect(chevrons.length).toBe(0);
    });

    it("should have dark mode styles", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const card = container.querySelector(".dark\\:bg-gray-800");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Desktop Table View", () => {
    it("should render table headers on desktop", () => {
      render(<MobileDataTable {...defaultProps} />);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Role")).toBeInTheDocument();
    });

    it("should render all columns in desktop view", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const headers = container.querySelectorAll("th");
      expect(headers.length).toBe(columns.length);
    });

    it("should render table rows on desktop", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(testUsers.length);
    });

    it("should apply column className in desktop view", () => {
      const columnsWithClass = [
        { key: "name", header: "Name", className: "custom-column" },
        { key: "email", header: "Email" },
      ];
      const { container } = render(
        <MobileDataTable {...defaultProps} columns={columnsWithClass} />
      );
      const customHeader = container.querySelector(".custom-column");
      expect(customHeader).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when isLoading is true", () => {
      const { container } = render(
        <MobileDataTable {...defaultProps} isLoading={true} />
      );
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should render correct number of loading rows", () => {
      const { container } = render(
        <MobileDataTable {...defaultProps} isLoading={true} loadingRows={3} />
      );
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBe(3);
    });

    it("should not render data when loading", () => {
      render(<MobileDataTable {...defaultProps} isLoading={true} />);
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("should have dark mode loading skeleton", () => {
      const { container } = render(
        <MobileDataTable {...defaultProps} isLoading={true} />
      );
      const darkSkeleton = container.querySelector(".dark\\:bg-gray-700");
      expect(darkSkeleton).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show default empty state when no data", () => {
      render(<MobileDataTable {...defaultProps} data={[]} />);
      expect(screen.getByText("No data to display")).toBeInTheDocument();
    });

    it("should render custom empty state", () => {
      const customEmpty = <div>Custom Empty Message</div>;
      render(
        <MobileDataTable {...defaultProps} data={[]} emptyState={customEmpty} />
      );
      expect(screen.getByText("Custom Empty Message")).toBeInTheDocument();
    });

    it("should have centered empty state", () => {
      const { container } = render(
        <MobileDataTable {...defaultProps} data={[]} />
      );
      const emptyDiv = container.querySelector(".text-center");
      expect(emptyDiv).toBeInTheDocument();
    });

    it("should show empty state icon", () => {
      const { container } = render(
        <MobileDataTable {...defaultProps} data={[]} />
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Row Click Handling", () => {
    it("should call onRowClick when row is clicked", () => {
      const onRowClick = jest.fn();
      render(<MobileDataTable {...defaultProps} onRowClick={onRowClick} />);
      // Get first occurrence (mobile view)
      fireEvent.click(screen.getAllByText("John Doe")[0]);
      expect(onRowClick).toHaveBeenCalledWith(testUsers[0]);
    });

    it("should make rows clickable with cursor-pointer", () => {
      const onRowClick = jest.fn();
      const { container } = render(
        <MobileDataTable {...defaultProps} onRowClick={onRowClick} />
      );
      const clickableCard = container.querySelector(".cursor-pointer");
      expect(clickableCard).toBeInTheDocument();
    });

    it("should not make rows clickable without onRowClick", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const clickableCard = container.querySelector(".cursor-pointer");
      expect(clickableCard).not.toBeInTheDocument();
    });
  });

  describe("Keyboard Accessibility", () => {
    it("should support Enter key for row click", () => {
      const onRowClick = jest.fn();
      render(<MobileDataTable {...defaultProps} onRowClick={onRowClick} />);
      // Get first occurrence (mobile view)
      const card = screen.getAllByText("John Doe")[0].closest("div");
      fireEvent.keyDown(card!, { key: "Enter" });
      expect(onRowClick).toHaveBeenCalledWith(testUsers[0]);
    });

    it("should have tabIndex when clickable", () => {
      const onRowClick = jest.fn();
      render(<MobileDataTable {...defaultProps} onRowClick={onRowClick} />);
      // Get cards by button role (mobile cards with onRowClick get role="button")
      const buttons = screen.getAllByRole("button");
      // First 3 should be the mobile cards
      expect(buttons[0]).toHaveAttribute("tabIndex", "0");
    });

    it("should not have tabIndex when not clickable", () => {
      render(<MobileDataTable {...defaultProps} />);
      // Get first occurrence (mobile view)
      const card = screen.getAllByText("John Doe")[0].closest("div");
      expect(card).not.toHaveAttribute("tabIndex");
    });

    it("should have button role when clickable", () => {
      const onRowClick = jest.fn();
      render(<MobileDataTable {...defaultProps} onRowClick={onRowClick} />);
      // Get mobile cards by button role
      const buttons = screen.getAllByRole("button");
      // Should have button role on clickable cards
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]).toHaveAttribute("role", "button");
    });
  });

  describe("Custom Rendering", () => {
    it("should use custom render function for column", () => {
      const columnsWithRender = [
        {
          key: "name",
          header: "Name",
          render: (item: TestUser) => <strong>User: {item.name}</strong>,
        },
        { key: "email", header: "Email" },
      ];
      render(<MobileDataTable {...defaultProps} columns={columnsWithRender} />);
      // Component renders both mobile and desktop views
      expect(screen.getAllByText(/User: John Doe/)[0]).toBeInTheDocument();
    });

    it("should use custom mobile card renderer", () => {
      const renderMobileCard = (item: TestUser) => (
        <div className="custom-card">{item.name} - Custom</div>
      );
      render(
        <MobileDataTable
          {...defaultProps}
          renderMobileCard={renderMobileCard}
        />
      );
      expect(screen.getByText("John Doe - Custom")).toBeInTheDocument();
    });

    it("should call onRowClick with custom card", () => {
      const onRowClick = jest.fn();
      const renderMobileCard = (item: TestUser) => <div>{item.name}</div>;
      render(
        <MobileDataTable
          {...defaultProps}
          onRowClick={onRowClick}
          renderMobileCard={renderMobileCard}
        />
      );
      // Get first occurrence (mobile view)
      fireEvent.click(screen.getAllByText("John Doe")[0]);
      expect(onRowClick).toHaveBeenCalledWith(testUsers[0]);
    });
  });

  describe("Nested Key Access", () => {
    it("should access nested object properties", () => {
      interface NestedUser {
        id: string;
        profile: {
          name: string;
          email: string;
        };
      }

      const nestedData: NestedUser[] = [
        { id: "1", profile: { name: "John", email: "john@test.com" } },
      ];

      const nestedColumns = [
        { key: "profile.name", header: "Name" },
        { key: "profile.email", header: "Email" },
      ];

      render(
        <MobileDataTable
          data={nestedData}
          columns={nestedColumns}
          keyExtractor={(item) => item.id}
        />
      );

      // Component renders both mobile and desktop views
      expect(screen.getAllByText("John")[0]).toBeInTheDocument();
      expect(screen.getAllByText(/john@test.com/)[0]).toBeInTheDocument();
    });

    it("should handle missing nested properties gracefully", () => {
      interface PartialUser {
        id: string;
        profile?: {
          name?: string;
        };
      }

      const partialData: PartialUser[] = [{ id: "1" }];

      const nestedColumns = [{ key: "profile.name", header: "Name" }];

      const { container } = render(
        <MobileDataTable
          data={partialData}
          columns={nestedColumns}
          keyExtractor={(item) => item.id}
        />
      );

      // Should not crash
      expect(container).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should have mobile-only classes", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const mobileView = container.querySelector(".lg\\:hidden");
      expect(mobileView).toBeInTheDocument();
    });

    it("should have desktop-only classes", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const desktopView = container.querySelector(".hidden.lg\\:block");
      expect(desktopView).toBeInTheDocument();
    });

    it("should render both mobile and desktop views", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const mobileView = container.querySelector(".lg\\:hidden");
      const desktopView = container.querySelector(".hidden.lg\\:block");
      expect(mobileView).toBeInTheDocument();
      expect(desktopView).toBeInTheDocument();
    });
  });

  describe("Styling & Dark Mode", () => {
    it("should have border styling on cards", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const card = container.querySelector(".border-gray-200");
      expect(card).toBeInTheDocument();
    });

    it("should have dark mode border styling", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const card = container.querySelector(".dark\\:border-gray-700");
      expect(card).toBeInTheDocument();
    });

    it("should have hover styles on clickable rows", () => {
      const onRowClick = jest.fn();
      const { container } = render(
        <MobileDataTable {...defaultProps} onRowClick={onRowClick} />
      );
      const card = container.querySelector(".hover\\:border-gray-300");
      expect(card).toBeInTheDocument();
    });

    it("should have active styles", () => {
      const onRowClick = jest.fn();
      const { container } = render(
        <MobileDataTable {...defaultProps} onRowClick={onRowClick} />
      );
      const card = container.querySelector(".active\\:bg-gray-50");
      expect(card).toBeInTheDocument();
    });

    it("should have rounded corners on cards", () => {
      const { container } = render(<MobileDataTable {...defaultProps} />);
      const card = container.querySelector(".rounded-lg");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single row", () => {
      render(<MobileDataTable {...defaultProps} data={[testUsers[0]]} />);
      // Component renders both mobile and desktop views
      expect(screen.getAllByText("John Doe")[0]).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });

    it("should handle large dataset (100+ rows)", () => {
      const largeData = Array.from({ length: 150 }, (_, i) => ({
        id: `${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        status: "active",
        role: "user",
        joined: "2024-01-01",
      }));
      const { container } = render(
        <MobileDataTable {...defaultProps} data={largeData} />
      );
      const cards = container.querySelectorAll(".lg\\:hidden > div");
      expect(cards.length).toBe(150);
    });

    it("should handle columns without key", () => {
      const columnsNoKey = [{ key: "name" as const, header: "Name" }];
      render(<MobileDataTable {...defaultProps} columns={columnsNoKey} />);
      // Component renders both mobile and desktop views
      expect(screen.getAllByText("John Doe")[0]).toBeInTheDocument();
    });

    it("should handle special characters in data", () => {
      const specialData = [
        {
          id: "1",
          name: "John <>&\"' Doe",
          email: "test@example.com",
          status: "active",
          role: "admin",
          joined: "2024-01-01",
        },
      ];
      render(<MobileDataTable {...defaultProps} data={specialData} />);
      // Component renders both mobile and desktop views
      expect(screen.getAllByText(/John <>&"' Doe/)[0]).toBeInTheDocument();
    });

    it("should handle empty column array", () => {
      render(<MobileDataTable {...defaultProps} columns={[]} />);
      // Should not crash
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("should handle long text truncation", () => {
      const longTextData = [
        {
          id: "1",
          name: "This is a very long name that should be truncated in the mobile view to prevent layout issues",
          email: "test@example.com",
          status: "active",
          role: "admin",
          joined: "2024-01-01",
        },
      ];
      const { container } = render(
        <MobileDataTable {...defaultProps} data={longTextData} />
      );
      const truncated = container.querySelector(".truncate");
      expect(truncated).toBeInTheDocument();
    });
  });
});
