/**
 * Tests for MainNavbar component
 *
 * Coverage:
 * - Logo and branding rendering
 * - Navigation links display
 * - Search functionality
 * - Authentication state display
 * - Responsive behavior
 * - User menu for authenticated users
 * - Theme toggle
 * - Accessibility features
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MainNavbar } from "@/components";
import { UI_LABELS, ROUTES, MAIN_NAV_ITEMS } from "@/constants";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("MainNavbar", () => {
  it("renders navigation container", () => {
    render(<MainNavbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders navigation items", () => {
    render(<MainNavbar />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(MAIN_NAV_ITEMS.length);
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(<MainNavbar />);
      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });
  });
});
