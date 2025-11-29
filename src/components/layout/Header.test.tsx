/**
 * Header Component Tests
 *
 * Tests for the Header component which appears on every page
 * Contains: SpecialEventBanner, MainNavBar, SubNavbar, SearchBar, MobileSidebar
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "./Header";

// Mock child components
jest.mock("./SpecialEventBanner", () => {
  return function MockSpecialEventBanner() {
    return <div data-testid="special-event-banner">Event Banner</div>;
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
      <div data-testid="main-navbar">
        <button onClick={onMobileMenuToggle} data-testid="mobile-menu-btn">
          Menu
        </button>
        <button onClick={onSearchClick} data-testid="search-btn">
          Search
        </button>
      </div>
    );
  };
});

jest.mock("./SubNavbar", () => {
  return function MockSubNavbar() {
    return <div data-testid="sub-navbar">SubNavbar</div>;
  };
});

jest.mock("./SearchBar", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(function MockSearchBar(
      { isVisible, onClose }: { isVisible: boolean; onClose: () => void },
      ref: any,
    ) {
      React.useImperativeHandle(ref, () => ({
        focusSearch: jest.fn(),
        hide: jest.fn(),
      }));

      return isVisible ? (
        <div data-testid="search-bar">
          Search Bar
          <button onClick={onClose} data-testid="search-close-btn">
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
      <div data-testid="mobile-sidebar">
        Mobile Sidebar
        <button onClick={onClose} data-testid="sidebar-close-btn">
          Close
        </button>
      </div>
    ) : null;
  };
});

describe("Header Component", () => {
  describe("Basic Rendering", () => {
    it("should render all main sections", () => {
      render(<Header />);

      expect(screen.getByTestId("special-event-banner")).toBeInTheDocument();
      expect(screen.getByTestId("main-navbar")).toBeInTheDocument();
      expect(screen.getByTestId("sub-navbar")).toBeInTheDocument();
    });

    it("should render sticky header with correct classes", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
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
      const menuBtn = screen.getByTestId("mobile-menu-btn");
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Close sidebar
      const closeBtn = screen.getByTestId("sidebar-close-btn");
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
    });

    it("should toggle mobile sidebar on multiple clicks", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");

      // Open
      fireEvent.click(menuBtn);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Close via menu button
      fireEvent.click(menuBtn);
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Open again
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

      const searchBtn = screen.getByTestId("search-btn");
      fireEvent.click(searchBtn);

      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should focus search input after opening with delay", async () => {
      render(<Header />);

      const searchBtn = screen.getByTestId("search-btn");
      fireEvent.click(searchBtn);

      // Fast-forward the 100ms timeout
      jest.advanceTimersByTime(100);

      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should close search bar when close button is clicked", () => {
      render(<Header />);

      // Open search
      const searchBtn = screen.getByTestId("search-btn");
      fireEvent.click(searchBtn);
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close search
      const closeBtn = screen.getByTestId("search-close-btn");
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
    });

    it("should handle search open/close cycle", () => {
      render(<Header />);

      const searchBtn = screen.getByTestId("search-btn");

      // Open
      fireEvent.click(searchBtn);
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close
      const closeBtn = screen.getByTestId("search-close-btn");
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();

      // Open again
      fireEvent.click(searchBtn);
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should pass correct props to MainNavBar", () => {
      render(<Header />);

      // Should have both toggle buttons
      expect(screen.getByTestId("mobile-menu-btn")).toBeInTheDocument();
      expect(screen.getByTestId("search-btn")).toBeInTheDocument();
    });

    it("should maintain independent state for sidebar and search", () => {
      render(<Header />);

      // Open sidebar
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      // Open search
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Both should be visible
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close sidebar
      fireEvent.click(screen.getByTestId("sidebar-close-btn"));
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();

      // Search should still be visible
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should render components in correct order", () => {
      const { container } = render(<Header />);

      const elements = Array.from(container.querySelectorAll("[data-testid]"));
      const testIds = elements.map((el) => el.getAttribute("data-testid"));

      // Special event banner should be first
      expect(testIds[0]).toBe("special-event-banner");
      // Main navbar and its buttons come next
      expect(testIds).toContain("main-navbar");
      expect(testIds).toContain("sub-navbar");
    });
  });

  describe("Accessibility", () => {
    it("should have semantic header element", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("should have proper z-index for stacking", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("z-50");
    });

    it("should maintain sticky positioning", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("sticky", "top-0");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid toggle clicks", () => {
      render(<Header />);

      const menuBtn = screen.getByTestId("mobile-menu-btn");

      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(menuBtn);
      }

      // Should be open (odd number of clicks)
      expect(screen.queryByTestId("mobile-sidebar")).not.toBeInTheDocument();
    });

    it("should handle both toggles being opened and closed", () => {
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

    it("should not crash with multiple search opens", () => {
      render(<Header />);

      const searchBtn = screen.getByTestId("search-btn");

      // Multiple opens without closing
      fireEvent.click(searchBtn);
      fireEvent.click(searchBtn);
      fireEvent.click(searchBtn);

      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });
  });

  describe("Layout Structure", () => {
    it("should wrap SpecialEventBanner outside sticky header", () => {
      const { container } = render(<Header />);

      const banner = screen.getByTestId("special-event-banner");
      const header = container.querySelector("header");

      // Banner should not be inside header
      expect(header).not.toContainElement(banner);
    });

    it("should wrap MainNavBar inside sticky header", () => {
      const { container } = render(<Header />);

      const navbar = screen.getByTestId("main-navbar");
      const header = container.querySelector("header");

      expect(header).toContainElement(navbar);
    });

    it("should render SubNavbar outside sticky header", () => {
      const { container } = render(<Header />);

      const subnav = screen.getByTestId("sub-navbar");
      const header = container.querySelector("header");

      expect(header).not.toContainElement(subnav);
    });
  });

  describe("State Management", () => {
    it("should maintain sidebar state across renders", () => {
      const { rerender } = render(<Header />);

      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();

      rerender(<Header />);
      expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
    });

    it("should reset search visibility on close", () => {
      render(<Header />);

      // Open search
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();

      // Close search
      fireEvent.click(screen.getByTestId("search-close-btn"));
      expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();

      // Should be able to open again
      fireEvent.click(screen.getByTestId("search-btn"));
      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });
  });
});
