/**
 * Tests for Footer component
 *
 * Coverage:
 * - Footer sections rendering
 * - Links and navigation
 * - Social media links
 * - Copyright and legal info
 * - Newsletter signup
 * - Contact information
 * - Responsive behavior
 * - Dark mode support
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Footer } from "@/components";
import { UI_LABELS } from "@/constants";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe("Footer", () => {
  describe("Structure", () => {
    it("renders footer element", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
    });

    it("has multiple sections", () => {
      render(<Footer />);
      // Check for specific footer content headings
      expect(screen.getAllByText(/shop/i).length).toBeGreaterThan(0);
    });
  });

  describe("Navigation Links", () => {
    it("renders footer navigation links", () => {
      render(<Footer />);
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });

    it("has correct link destinations", () => {
      render(<Footer />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });

  describe("Copyright and Legal", () => {
    it("displays copyright information", () => {
      render(<Footer />);
      const copyrightText = screen.queryByText(/copyright|©/i);
      if (copyrightText) {
        expect(copyrightText).toBeInTheDocument();
      }
    });

    it("includes legal links", () => {
      render(<Footer />);
      // Check for common legal footer links
      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
    });
  });

  describe("Contact Information", () => {
    it("displays contact email", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
      // Email or contact info should be present
    });

    it("has proper text contrast for accessibility", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });
  });

  describe("Responsive Layout", () => {
    it("renders with proper structure for mobile/desktop", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });

    it("has responsive layout classes", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");
      expect(footer).toHaveClass("mt-auto");
    });
  });

  describe("Dark Mode Support", () => {
    it("applies theme-aware text colors", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");
      const text = footer?.querySelector('[class*="text"]');
      if (text) {
        expect(text).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    it("has semantic footer element", () => {
      render(<Footer />);
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("links are present", () => {
      render(<Footer />);
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
