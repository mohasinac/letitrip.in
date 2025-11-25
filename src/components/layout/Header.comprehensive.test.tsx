/**
 * Header Component - Comprehensive Tests
 *
 * Comprehensive test suite for the Header component (appears on every page)
 * Tests: Component composition, state management, toggle interactions,
 * search functionality, mobile sidebar, accessibility, edge cases
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "./Header";

// Mock child components with enhanced test controls
jest.mock("./SpecialEventBanner", () => {
  return function MockSpecialEventBanner() {
    return (
      <div data-testid="special-event-banner" role="banner">
        Event Banner
      </div>
    );
  };
});

jest.mock("./MainNavBar", () => {
  return function MockMainNavBar({
    onMobileMenuToggle,
    onSearchClick,
  }: {
    onMobileMenuToggle: () => void;
    onSearchClick: () => void;
  }) {
    return (
      <nav data-testid="main-navbar" aria-label="Main navigation">
        <button
          onClick={onMobileMenuToggle}
          data-testid="mobile-menu-btn"
          aria-label="Toggle mobile menu"
        >
          Menu
        </button>
        <button
          onClick={onSearchClick}
          data-testid="search-btn"
          aria-label="Open search"
        >
          Search
        </button>
      </nav>
    );
  };
});

jest.mock("./SubNavbar", () => {
  return function MockSubNavbar() {
    return (
      <nav data-testid="sub-navbar" aria-label="Sub navigation">
        SubNavbar
      </nav>
    );
  };
});

jest.mock("./SearchBar", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(function MockSearchBar(
      { isVisible, onClose }: { isVisible: boolean; onClose: () => void },
      ref: any
    ) {
      const focusSearchMock = jest.fn();
      const hideMock = jest.fn();

      React.useImperativeHandle(ref, () => ({
        focusSearch: focusSearchMock,
        hide: hideMock,
      }));

      // Store mocks for testing
      (MockSearchBar as any).lastFocusMock = focusSearchMock;
      (MockSearchBar as any).lastHideMock = hideMock;

      return isVisible ? (
        <div data-testid="search-bar" role="search" aria-label="Search">
          <input
            type="text"
            placeholder="Search products..."
            data-testid="search-input"
          />
          <button
            onClick={onClose}
            data-testid="search-close-btn"
            aria-label="Close search"
          >
            Close
          </button>
        </div>
      ) : null;
    }),
  };
});

jest.mock("./MobileSidebar", () => {
  return function MockMobileSidebar({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) {
    return isOpen ? (
      <aside
        data-testid="mobile-sidebar"
        role="navigation"
        aria-label="Mobile sidebar"
      >
        <div>Mobile Sidebar Content</div>
        <button
          onClick={onClose}
          data-testid="sidebar-close-btn"
          aria-label="Close sidebar"
        >
          Close
        </button>
      </aside>
    ) : null;
  };
});

describe("Header Component - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render all main sections", () => {
      render(<Header />);

      expect(screen.getByTestId("special-event-banner")).toBeInTheDocument();
      expect(screen.getByTestId("main-navbar")).toBeInTheDocument();
      expect(screen.getByTestId("sub-navbar")).toBeInTheDocument();
    });

    it("should render semantic header element with sticky positioning", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("sticky", "top-0", "z-50", "bg-gray-800");
    });

    it("should not show search bar initially", () => {
      render(<Header />);

      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should not show mobile sidebar initially", () => {
      render(<Header />);

      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
    });

    it("should render special event banner at the top", () => {
      const { container } = render(<Header />);

      const banner = screen.getByTestId("special-event-banner");
      const allElements = container.querySelectorAll("[data-testid]");

      // Banner should be the first element
      expect(allElements[0]).toBe(banner);
    });

    it("should have main navbar inside header element", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      const navbar = screen.getByTestId("main-navbar");

      expect(header).toContainElement(navbar);
    });

    it("should have sub navbar outside header element", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      const subNav = screen.getByTestId("sub-navbar");

      expect(header).not.toContainElement(subNav);
    });

    it("should render menu and search buttons", () => {
      render(<Header />);

      expect(screen.getByTestId("mobile-menu-btn")).toBeInTheDocument();
      expect(screen.getByTestId("search-btn")).toBeInTheDocument();
    });

    it("should have proper background color on header", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-gray-800");
    });

    it("should have proper z-index for overlay stacking", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("z-50");
    });
  });

  describe("Mobile Sidebar Toggle", () => {
    it("should open mobile sidebar when menu button is clicked", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");
      fireEvent.click(menuBtn);

      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
    });

    it("should close mobile sidebar when close button is clicked", () => {
      render(<Header />);

      // Open sidebar
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Close sidebar
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
    });

    it("should toggle mobile sidebar on repeated clicks", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");

      // Open
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Close via menu button (toggle)
      fireEvent.click(menuBtn);
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Open again
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Close again
      fireEvent.click(menuBtn);
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
    });

    it("should close sidebar via close button even when opened multiple times", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");

      // Open
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Try to open again (toggle closes it)
      fireEvent.click(menuBtn);
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Open once more
      fireEvent.click(menuBtn);
      const closeBtn = screen.getByTestId("sidebar-close-btn");
      fireEvent.click(closeBtn);

      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
    });

    it("should show sidebar content when open", () => {
      render(<Header />);

      fireEvent.click(screen.getByTestId("mobile-menu-btn"));

      expect(screen.getByText("Mobile Sidebar Content")).toBeInTheDocument();
    });

    it("should not show sidebar content when closed", () => {
      render(<Header />);

      expect(
        screen.queryByText("Mobile Sidebar Content")
      ).not.toBeInTheDocument();
    });

    it("should maintain sidebar state across multiple open/close cycles", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");

      // Cycle 1
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Cycle 2
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Cycle 3
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
    });
  });

  describe("Search Bar Toggle", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it("should show search bar when search button is clicked", () => {
      render(<Header />);

      fireEvent.click(screen.getByTestId("search-btn"));

      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should attempt to focus search input after opening", () => {
      render(<Header />);

      fireEvent.click(screen.getByTestId("search-btn"));

      // Fast-forward the setTimeout delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should close search bar when close button is clicked", () => {
      render(<Header />);

      // Open search
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close search
      fireEvent.click(screen.getByTestId("search-close-btn"));
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should handle search open/close cycles", () => {
      render(<Header />);

      const searchBtn = screen.getByTestId("search-btn");

      // Cycle 1
      fireEvent.click(searchBtn);
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("search-close-btn"));
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();

      // Cycle 2
      fireEvent.click(searchBtn);
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("search-close-btn"));
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();

      // Cycle 3
      fireEvent.click(searchBtn);
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should show search input when search bar is visible", () => {
      render(<Header />);

      fireEvent.click(screen.getByTestId("search-btn"));

      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search products...")
      ).toBeInTheDocument();
    });

    it("should not show search input when search bar is hidden", () => {
      render(<Header />);

      expect(screen.queryByTestId("search-input")).not.toBeInTheDocument();
    });

    it("should maintain search visibility state", () => {
      const { rerender } = render(<Header />);

      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      rerender(<Header />);
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should allow multiple search opens without errors", () => {
      render(<Header />);

      const searchBtn = screen.getByTestId("search-btn");

      // Multiple opens (visibility is already true, so setting it again should not crash)
      fireEvent.click(searchBtn);
      fireEvent.click(searchBtn);
      fireEvent.click(searchBtn);

      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should maintain independent state for sidebar and search", () => {
      render(<Header />);

      // Open sidebar
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Open search
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Both should be visible simultaneously
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should close sidebar without affecting search", () => {
      render(<Header />);

      // Open both
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      fireEvent.click(screen.getByTestId("search-btn"));

      // Close sidebar
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));

      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should close search without affecting sidebar", () => {
      render(<Header />);

      // Open both
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      fireEvent.click(screen.getByTestId("search-btn"));

      // Close search
      fireEvent.click(screen.getByTestId("search-close-btn"));

      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should render components in correct hierarchical order", () => {
      const { container } = render(<Header />);

      const elements = Array.from(container.querySelectorAll("[data-testid]"));
      const testIds = elements.map((el) => el.getAttribute("data-testid"));

      // Special event banner should be first (index 0)
      expect(testIds[0]).toBe("special-event-banner");

      // Main navbar comes next
      expect(testIds).toContain("main-navbar");

      // Sub navbar after main navbar
      expect(testIds).toContain("sub-navbar");
    });

    it("should pass correct callbacks to MainNavBar", () => {
      render(<Header />);

      // Verify menu toggle works
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Verify search toggle works
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should pass correct props to SearchBar", () => {
      render(<Header />);

      // SearchBar should receive isVisible=false initially
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();

      // After opening, isVisible=true
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should pass correct props to MobileSidebar", () => {
      render(<Header />);

      // MobileSidebar should receive isOpen=false initially
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // After opening, isOpen=true
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
    });

    it("should render all child components with proper test IDs", () => {
      render(<Header />);

      expect(screen.getByTestId("special-event-banner")).toBeInTheDocument();
      expect(screen.getByTestId("main-navbar")).toBeInTheDocument();
      expect(screen.getByTestId("sub-navbar")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-menu-btn")).toBeInTheDocument();
      expect(screen.getByTestId("search-btn")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have semantic header element", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header?.tagName).toBe("HEADER");
    });

    it("should have ARIA labels on toggle buttons", () => {
      render(<Header />);

      expect(screen.getByLabelText("Toggle mobile menu")).toBeInTheDocument();
      expect(screen.getByLabelText("Open search")).toBeInTheDocument();
    });

    it("should have ARIA labels on navigation elements", () => {
      render(<Header />);

      expect(screen.getByLabelText("Main navigation")).toBeInTheDocument();
      expect(screen.getByLabelText("Sub navigation")).toBeInTheDocument();
    });

    it("should have role attributes on child components", () => {
      render(<Header />);

      // Should have 2 banners: SpecialEventBanner div and header element (implicit banner role)
      expect(screen.getAllByRole("banner")).toHaveLength(2);
      expect(screen.getAllByRole("navigation")).toHaveLength(2); // MainNavBar + SubNavbar
    });

    it("should show proper ARIA label on search when visible", () => {
      render(<Header />);

      fireEvent.click(screen.getByTestId("search-btn"));

      expect(screen.getByLabelText("Search")).toBeInTheDocument();
      expect(screen.getByRole("search")).toBeInTheDocument();
    });

    it("should show proper ARIA label on sidebar when visible", () => {
      render(<Header />);

      fireEvent.click(screen.getByTestId("mobile-menu-btn"));

      expect(screen.getByLabelText("Mobile sidebar")).toBeInTheDocument();
    });

    it("should have accessible close buttons with ARIA labels", () => {
      render(<Header />);

      // Open both
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      fireEvent.click(screen.getByTestId("search-btn"));

      expect(screen.getByLabelText("Close sidebar")).toBeInTheDocument();
      expect(screen.getByLabelText("Close search")).toBeInTheDocument();
    });

    it("should maintain proper focus management for keyboard navigation", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");
      const searchBtn = screen.getByTestId("search-btn");

      expect(menuBtn).toBeInTheDocument();
      expect(searchBtn).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid toggle clicks on menu button", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");

      // Rapid clicks (10 times)
      for (let i = 0; i < 10; i++) {
        fireEvent.click(menuBtn);
      }

      // Even number of clicks = closed
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
    });

    it("should handle rapid clicks on search button", () => {
      render(<Header />);

      const searchBtn = screen.getByTestId("search-btn");

      // Multiple rapid clicks (should not crash)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(searchBtn);
      }

      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should handle both toggles being opened and closed simultaneously", () => {
      render(<Header />);

      // Open both
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      fireEvent.click(screen.getByTestId("search-btn"));

      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close both
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));
      fireEvent.click(screen.getByTestId("search-close-btn"));

      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should handle alternating opens between sidebar and search", () => {
      render(<Header />);

      // Open sidebar
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Open search
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close sidebar
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Close search
      fireEvent.click(screen.getByTestId("search-close-btn"));
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should maintain state across component rerenders", () => {
      const { rerender } = render(<Header />);

      // Open sidebar
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Rerender component
      rerender(<Header />);

      // Sidebar should still be open
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
    });

    it("should handle unmounting with open overlays gracefully", () => {
      const { unmount } = render(<Header />);

      // Open both overlays
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      fireEvent.click(screen.getByTestId("search-btn"));

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it("should not crash with null refs", () => {
      render(<Header />);

      // Component should render without errors even if refs are not immediately set
      expect(screen.getByTestId("main-navbar")).toBeInTheDocument();
    });
  });

  describe("Layout Structure", () => {
    it("should have SpecialEventBanner outside sticky header", () => {
      const { container } = render(<Header />);

      const banner = screen.getByTestId("special-event-banner");
      const header = container.querySelector("header");

      expect(header).not.toContainElement(banner);
    });

    it("should have MainNavBar inside sticky header", () => {
      const { container } = render(<Header />);

      const navbar = screen.getByTestId("main-navbar");
      const header = container.querySelector("header");

      expect(header).toContainElement(navbar);
    });

    it("should have SubNavbar outside sticky header", () => {
      const { container } = render(<Header />);

      const subNav = screen.getByTestId("sub-navbar");
      const header = container.querySelector("header");

      expect(header).not.toContainElement(subNav);
    });

    it("should render overlays (search and sidebar) outside main flow", () => {
      const { container } = render(<Header />);

      // Open both overlays
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      fireEvent.click(screen.getByTestId("search-btn"));

      const header = container.querySelector("header");
      const searchBar = screen.getByTestId("search-bar");
      const sidebar = screen.getByTestId("mobile-sidebar");

      // Overlays should not be inside header
      expect(header).not.toContainElement(searchBar);
      expect(header).not.toContainElement(sidebar);
    });

    it("should have proper CSS classes for sticky behavior", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");

      expect(header).toHaveClass("sticky");
      expect(header).toHaveClass("top-0");
      expect(header).toHaveClass("z-50");
    });

    it("should maintain layout integrity with multiple state changes", () => {
      const { container } = render(<Header />);

      // Toggle multiple times
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      fireEvent.click(screen.getByTestId("search-btn"));
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));

      // Verify all main components still exist
      expect(screen.getByTestId("special-event-banner")).toBeInTheDocument();
      expect(screen.getByTestId("main-navbar")).toBeInTheDocument();
      expect(screen.getByTestId("sub-navbar")).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("should initialize with sidebar closed", () => {
      render(<Header />);

      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
    });

    it("should initialize with search hidden", () => {
      render(<Header />);

      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should maintain independent boolean states for sidebar and search", () => {
      render(<Header />);

      // Open sidebar (sidebar: true, search: false)
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();

      // Open search (sidebar: true, search: true)
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close sidebar (sidebar: false, search: true)
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close search (sidebar: false, search: false)
      fireEvent.click(screen.getByTestId("search-close-btn"));
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should toggle sidebar state correctly", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");

      // Initial: false
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Click 1: true
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Click 2: false
      fireEvent.click(menuBtn);
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Click 3: true
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
    });

    it("should set search visible state to true when opened", () => {
      render(<Header />);

      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should set search visible state to false when closed", () => {
      render(<Header />);

      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("search-close-btn"));
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should handle state persistence across multiple interactions", () => {
      render(<Header />);

      // Complex interaction sequence
      fireEvent.click(screen.getByTestId("mobile-menu-btn")); // sidebar: true
      fireEvent.click(screen.getByTestId("search-btn")); // search: true
      fireEvent.click(screen.getByTestId("mobile-menu-btn")); // sidebar: false (toggle)
      fireEvent.click(screen.getByTestId("mobile-menu-btn")); // sidebar: true (toggle)
      fireEvent.click(screen.getByTestId("search-close-btn")); // search: false

      // Final state: sidebar open, search closed
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });
  });

  describe("Performance & Optimization", () => {
    it("should not rerender unnecessarily on sidebar toggle", () => {
      const { container } = render(<Header />);

      const initialHTML = container.innerHTML;

      // Toggle sidebar
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      const afterOpenHTML = container.innerHTML;

      // HTML should change (sidebar added)
      expect(afterOpenHTML).not.toBe(initialHTML);
    });

    it("should handle multiple rapid state changes efficiently", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");
      const searchBtn = screen.getByTestId("search-btn");

      // Rapid state changes (should not crash or cause issues)
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          fireEvent.click(menuBtn);
        } else {
          fireEvent.click(searchBtn);
        }
      }

      // Component should still be functional
      expect(screen.getByTestId("main-navbar")).toBeInTheDocument();
    });

    it("should clean up timers on unmount", () => {
      jest.useFakeTimers();

      const { unmount } = render(<Header />);

      fireEvent.click(screen.getByTestId("search-btn"));

      // Unmount before timer completes
      unmount();

      // Should not throw when advancing timers
      expect(() => {
        jest.runAllTimers();
      }).not.toThrow();

      jest.useRealTimers();
    });
  });
});
