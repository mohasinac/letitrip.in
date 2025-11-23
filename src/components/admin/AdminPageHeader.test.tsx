import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminPageHeader } from "./AdminPageHeader";

describe("AdminPageHeader Component", () => {
  describe("Basic Rendering", () => {
    it("renders the title", () => {
      render(<AdminPageHeader title="Dashboard" />);
      expect(
        screen.getByRole("heading", { name: "Dashboard" })
      ).toBeInTheDocument();
    });

    it("applies correct heading level (h1)", () => {
      render(<AdminPageHeader title="Dashboard" />);
      const heading = screen.getByRole("heading", { name: "Dashboard" });
      expect(heading.tagName).toBe("H1");
    });

    it("renders without description when not provided", () => {
      render(<AdminPageHeader title="Dashboard" />);
      const descriptions = screen.queryByText(/./);
      // Should only have title, no description
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("renders without actions when not provided", () => {
      const { container } = render(<AdminPageHeader title="Dashboard" />);
      // No action buttons should exist
      expect(container.querySelector("button")).not.toBeInTheDocument();
    });

    it("renders without breadcrumbs when not provided", () => {
      render(<AdminPageHeader title="Dashboard" />);
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });
  });

  describe("Description", () => {
    it("renders description when provided", () => {
      render(
        <AdminPageHeader title="Dashboard" description="View your analytics" />
      );
      expect(screen.getByText("View your analytics")).toBeInTheDocument();
    });

    it("applies correct styling to description", () => {
      render(
        <AdminPageHeader title="Dashboard" description="Test description" />
      );
      const description = screen.getByText("Test description");
      expect(description).toHaveClass("text-sm", "text-gray-500", "mt-1");
    });

    it("renders long description correctly", () => {
      const longDescription = "A".repeat(200);
      render(
        <AdminPageHeader title="Dashboard" description={longDescription} />
      );
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("renders description with special characters", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          description="View <analytics> & reports!"
        />
      );
      expect(
        screen.getByText("View <analytics> & reports!")
      ).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("renders action button", () => {
      render(
        <AdminPageHeader title="Dashboard" actions={<button>Add New</button>} />
      );
      expect(
        screen.getByRole("button", { name: "Add New" })
      ).toBeInTheDocument();
    });

    it("renders multiple actions", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          actions={
            <>
              <button>Export</button>
              <button>Settings</button>
            </>
          }
        />
      );
      expect(
        screen.getByRole("button", { name: "Export" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Settings" })
      ).toBeInTheDocument();
    });

    it("applies gap-3 class to actions container", () => {
      const { container } = render(
        <AdminPageHeader title="Dashboard" actions={<button>Add New</button>} />
      );
      const actionsContainer = container.querySelector(".gap-3");
      expect(actionsContainer).toBeInTheDocument();
    });

    it("renders complex actions with icons", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          actions={
            <button>
              <span>+</span> Add New
            </button>
          }
        />
      );
      expect(screen.getByText("Add New")).toBeInTheDocument();
      expect(screen.getByText("+")).toBeInTheDocument();
    });
  });

  describe("Breadcrumbs", () => {
    it("renders breadcrumbs navigation", () => {
      render(
        <AdminPageHeader
          title="User Details"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: "John Doe" },
          ]}
        />
      );
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders breadcrumb with aria-label", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[{ label: "Admin", href: "/admin" }]}
        />
      );
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
    });

    it("renders all breadcrumb items", () => {
      render(
        <AdminPageHeader
          title="User Details"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: "John Doe" },
          ]}
        />
      );
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("renders breadcrumb links with href", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/admin/users" },
          ]}
        />
      );
      const adminLink = screen.getByText("Admin").closest("a");
      const usersLink = screen.getByText("Users").closest("a");

      expect(adminLink).toHaveAttribute("href", "/admin");
      expect(usersLink).toHaveAttribute("href", "/admin/users");
    });

    it("renders last breadcrumb without link", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Current Page" },
          ]}
        />
      );
      const currentPage = screen.getByText("Current Page");
      expect(currentPage.closest("a")).not.toBeInTheDocument();
      expect(currentPage).toHaveClass("font-medium");
    });

    it("renders breadcrumb separators", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: "Current" },
          ]}
        />
      );
      // Should have 2 separators for 3 breadcrumbs
      const separators = screen.getAllByText("/");
      expect(separators).toHaveLength(2);
    });

    it("does not render breadcrumbs when empty array", () => {
      render(<AdminPageHeader title="Dashboard" breadcrumbs={[]} />);
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("applies hover styling to breadcrumb links", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[{ label: "Admin", href: "/admin" }]}
        />
      );
      const link = screen.getByText("Admin").closest("a");
      expect(link).toHaveClass("hover:text-gray-900");
    });
  });

  describe("Layout", () => {
    it("applies correct flex layout for header", () => {
      const { container } = render(
        <AdminPageHeader title="Dashboard" actions={<button>Add</button>} />
      );
      // Header should use flex with space-between
      const header = container.querySelector(
        ".flex.items-center.justify-between"
      );
      expect(header).toBeInTheDocument();
    });

    it("applies margin bottom to container", () => {
      const { container } = render(<AdminPageHeader title="Dashboard" />);
      const mainContainer = container.querySelector(".mb-6");
      expect(mainContainer).toBeInTheDocument();
    });

    it("renders breadcrumbs above title", () => {
      const { container } = render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[{ label: "Admin", href: "/admin" }]}
        />
      );
      const nav = screen.getByRole("navigation");
      const heading = screen.getByRole("heading");

      // Nav should come before heading in DOM order
      expect(nav.compareDocumentPosition(heading)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it("applies margin bottom to breadcrumbs", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[{ label: "Admin", href: "/admin" }]}
        />
      );
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("mb-3");
    });
  });

  describe("Styling", () => {
    it("applies correct title styling", () => {
      render(<AdminPageHeader title="Dashboard" />);
      const title = screen.getByRole("heading");
      expect(title).toHaveClass("text-2xl", "font-bold", "text-gray-900");
    });

    it("applies correct breadcrumb link styling", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[{ label: "Admin", href: "/admin" }]}
        />
      );
      const link = screen.getByText("Admin").closest("a");
      expect(link).toHaveClass("text-gray-600", "hover:text-gray-900");
    });

    it("applies correct current breadcrumb styling", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Current" },
          ]}
        />
      );
      const current = screen.getByText("Current");
      expect(current).toHaveClass("text-gray-900", "font-medium");
    });

    it("applies text-sm to breadcrumbs", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[{ label: "Admin", href: "/admin" }]}
        />
      );
      const ol = screen.getByRole("list");
      expect(ol).toHaveClass("text-sm");
    });
  });

  describe("Complex Scenarios", () => {
    it("renders complete header with all props", () => {
      render(
        <AdminPageHeader
          title="User Management"
          description="Manage all users in the system"
          breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
          actions={
            <>
              <button>Export</button>
              <button>Add User</button>
            </>
          }
        />
      );

      expect(
        screen.getByRole("heading", { name: "User Management" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Manage all users in the system")
      ).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Export" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add User" })
      ).toBeInTheDocument();
    });

    it("renders with only title and description", () => {
      render(
        <AdminPageHeader title="Dashboard" description="View your analytics" />
      );
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("View your analytics")).toBeInTheDocument();
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("renders with only title and actions", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          actions={<button>Settings</button>}
        />
      );
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Settings" })
      ).toBeInTheDocument();
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("renders with only title and breadcrumbs", () => {
      render(
        <AdminPageHeader
          title="Dashboard"
          breadcrumbs={[{ label: "Admin", href: "/admin" }]}
        />
      );
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles very long title", () => {
      const longTitle = "A".repeat(100);
      render(<AdminPageHeader title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles title with special characters", () => {
      render(<AdminPageHeader title="User's <Profile> & Settings" />);
      expect(
        screen.getByText("User's <Profile> & Settings")
      ).toBeInTheDocument();
    });

    it("handles many breadcrumb items", () => {
      const breadcrumbs = [
        { label: "Level 1", href: "/1" },
        { label: "Level 2", href: "/2" },
        { label: "Level 3", href: "/3" },
        { label: "Level 4", href: "/4" },
        { label: "Level 5" },
      ];
      render(<AdminPageHeader title="Dashboard" breadcrumbs={breadcrumbs} />);
      breadcrumbs.forEach((crumb) => {
        expect(screen.getByText(crumb.label)).toBeInTheDocument();
      });
    });

    it("handles empty string title", () => {
      render(<AdminPageHeader title="" />);
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("");
    });

    it("handles empty string description", () => {
      const { container } = render(
        <AdminPageHeader title="Dashboard" description="" />
      );
      // Empty description should NOT render (falsy check in component)
      const description = container.querySelector("p");
      expect(description).not.toBeInTheDocument();
    });
  });
});
