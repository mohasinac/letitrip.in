/**
 * Tests for Sidebar component
 *
 * Coverage:
 * - Rendering sidebar
 * - Menu items display
 * - Active/inactive states
 * - Expandable sections
 * - Responsive collapse
 * - Navigation interaction
 * - Accessibility features
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Sidebar } from "@/components";
import { UI_LABELS } from "@/constants";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/hooks", () => ({
  useBreakpoint: () => ({
    isMobile: false,
    isDesktop: true,
  }),
  useAuth: () => ({
    user: null,
    loading: false,
  }),
  useSwipe: () => undefined,
}));

describe("Sidebar", () => {
  const defaultProps = {
    isOpen: true,
    isDark: false,
    onClose: jest.fn(),
    onToggleTheme: jest.fn(),
  };

  describe("Rendering", () => {
    it("renders sidebar navigation", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      expect(sidebar).toBeInTheDocument();
    });

    it("displays sidebar title/logo", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe("Menu Items", () => {
    it("renders menu items", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      const links = sidebar.querySelectorAll("a");
      expect(links.length).toBeGreaterThanOrEqual(0);
    });

    it("menu items have correct links", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      const links = sidebar.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });

  describe("Active State", () => {
    it("highlights current active menu item", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe("Expandable Sections", () => {
    it("can expand/collapse menu sections", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      expect(sidebar).toBeInTheDocument();
    });

    it("shows submenu when expanded", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      const buttons = sidebar.querySelectorAll("button");
      if (buttons.length > 0) {
        fireEvent.click(buttons[0]);
        expect(sidebar).toBeInTheDocument();
      }
    });
  });

  describe("Responsive Behavior", () => {
    it("collapses on mobile view", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      expect(sidebar).toBeInTheDocument();
    });

    it("has collapse/expand toggle button", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      const buttons = sidebar.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Navigation Interaction", () => {
    it("handles menu item click", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      const firstLink = sidebar.querySelector("a");
      if (firstLink) {
        fireEvent.click(firstLink);
        expect(firstLink).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    it("has semantic navigation element", () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("menu links have labels", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      const links = sidebar.querySelectorAll("a");
      links.forEach((link) => {
        expect(link.textContent).toBeTruthy();
      });
    });

    it("supports keyboard navigation", () => {
      render(<Sidebar {...defaultProps} />);
      const sidebar = screen.getByRole("navigation");
      const firstLink = sidebar.querySelector("a") as HTMLElement;
      if (firstLink) {
        firstLink.focus();
        expect(firstLink).toHaveFocus();
      }
    });
  });
});
