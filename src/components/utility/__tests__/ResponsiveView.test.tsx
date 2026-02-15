/**
 * Tests for ResponsiveView component
 *
 * Coverage:
 * - Mobile view rendering
 * - Tablet view rendering
 * - Desktop view rendering
 * - Conditional rendering based on breakpoints
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ResponsiveView } from "../ResponsiveView";

const mockUseBreakpoint = jest.fn();

jest.mock("@/hooks", () => ({
  useBreakpoint: () => mockUseBreakpoint(),
}));

describe("ResponsiveView", () => {
  describe("Mobile Rendering", () => {
    it("renders mobile content on mobile screens", () => {
      mockUseBreakpoint.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
      });

      render(
        <ResponsiveView
          mobile={<div>Mobile Content</div>}
          desktop={<div>Desktop Content</div>}
        />,
      );

      expect(screen.getByText("Mobile Content")).toBeInTheDocument();
      expect(screen.queryByText("Desktop Content")).not.toBeInTheDocument();
    });
  });

  describe("Desktop Rendering", () => {
    it("renders desktop content on desktop screens", () => {
      mockUseBreakpoint.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      });

      render(
        <ResponsiveView
          mobile={<div>Mobile Content</div>}
          desktop={<div>Desktop Content</div>}
        />,
      );

      expect(screen.getByText("Desktop Content")).toBeInTheDocument();
      expect(screen.queryByText("Mobile Content")).not.toBeInTheDocument();
    });
  });

  describe("Tablet Rendering", () => {
    it("renders tablet content when provided", () => {
      mockUseBreakpoint.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
      });

      render(
        <ResponsiveView
          mobile={<div>Mobile Content</div>}
          tablet={<div>Tablet Content</div>}
          desktop={<div>Desktop Content</div>}
        />,
      );

      expect(screen.getByText("Tablet Content")).toBeInTheDocument();
      expect(screen.queryByText("Mobile Content")).not.toBeInTheDocument();
      expect(screen.queryByText("Desktop Content")).not.toBeInTheDocument();
    });

    it("falls back to mobile content when tablet not provided", () => {
      mockUseBreakpoint.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
      });

      render(
        <ResponsiveView
          mobile={<div>Mobile Content</div>}
          desktop={<div>Desktop Content</div>}
        />,
      );

      expect(screen.getByText("Mobile Content")).toBeInTheDocument();
      expect(screen.queryByText("Desktop Content")).not.toBeInTheDocument();
    });
  });
});
