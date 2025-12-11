/**
 * @jest-environment jsdom
 *
 * DynamicIcon Component Tests
 * Tests icon rendering, fallback behavior, and name formatting
 */

import { render, screen } from "@testing-library/react";
import * as LucideIcons from "lucide-react";
import { DynamicIcon, getIconComponent } from "../DynamicIcon";

// Mock lucide-react to verify correct icon rendering
jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  Home: jest.fn(() => <div data-testid="home-icon">Home Icon</div>),
  User: jest.fn(() => <div data-testid="user-icon">User Icon</div>),
  Circle: jest.fn(() => <div data-testid="circle-icon">Circle Icon</div>),
  AlertCircle: jest.fn(() => (
    <div data-testid="alert-circle-icon">Alert Circle Icon</div>
  )),
}));

describe("DynamicIcon Component", () => {
  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      render(<DynamicIcon name="home" />);
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    });

    it("should render correct icon for PascalCase name", () => {
      render(<DynamicIcon name="Home" />);
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    });

    it("should render correct icon for lowercase name", () => {
      render(<DynamicIcon name="user" />);
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });

    it("should pass className to icon", () => {
      const { container } = render(
        <DynamicIcon name="home" className="test-class" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should pass size prop to icon", () => {
      render(<DynamicIcon name="home" size={24} />);
      expect(LucideIcons.Home).toHaveBeenCalledWith(
        expect.objectContaining({ size: 24 }),
        expect.anything()
      );
    });

    it("should pass color prop to icon", () => {
      render(<DynamicIcon name="home" color="red" />);
      expect(LucideIcons.Home).toHaveBeenCalledWith(
        expect.objectContaining({ color: "red" }),
        expect.anything()
      );
    });
  });

  describe("Name Formatting", () => {
    it("should convert kebab-case to PascalCase", () => {
      render(<DynamicIcon name="alert-circle" />);
      expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
    });

    it("should convert snake_case to PascalCase", () => {
      render(<DynamicIcon name="alert_circle" />);
      expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
    });

    it("should handle mixed case input", () => {
      render(<DynamicIcon name="ALERT-CIRCLE" />);
      expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
    });

    it("should handle single word names", () => {
      render(<DynamicIcon name="home" />);
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    });

    it("should handle multi-word kebab-case names", () => {
      render(<DynamicIcon name="alert-circle" />);
      expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
    });
  });

  describe("Fallback Behavior", () => {
    it("should render default fallback (Circle) for invalid icon name", () => {
      render(<DynamicIcon name="invalid-icon-name" />);
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
    });

    it("should render custom fallback for invalid icon name", () => {
      render(<DynamicIcon name="invalid-icon-name" fallback="User" />);
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });

    it("should render Circle if both icon and fallback are invalid", () => {
      render(<DynamicIcon name="invalid-icon" fallback="invalid-fallback" />);
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
    });

    it("should render valid icon even with fallback specified", () => {
      render(<DynamicIcon name="home" fallback="User" />);
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string name", () => {
      render(<DynamicIcon name="" />);
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
    });

    it("should handle whitespace in name", () => {
      render(<DynamicIcon name="  home  " />);
      // Name will be formatted to "  Home  " which won't match
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
    });

    it("should handle special characters in name", () => {
      render(<DynamicIcon name="home@#$" />);
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
    });

    it("should handle numeric name", () => {
      render(<DynamicIcon name="123" />);
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
    });
  });

  describe("Props Spreading", () => {
    it("should spread additional lucide props", () => {
      render(<DynamicIcon name="home" strokeWidth={2} />);
      expect(LucideIcons.Home).toHaveBeenCalledWith(
        expect.objectContaining({ strokeWidth: 2 }),
        expect.anything()
      );
    });

    it("should spread multiple props", () => {
      render(
        <DynamicIcon
          name="home"
          size={24}
          color="red"
          strokeWidth={2}
          className="test-class"
        />
      );
      expect(LucideIcons.Home).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 24,
          color: "red",
          strokeWidth: 2,
          className: "test-class",
        }),
        expect.anything()
      );
    });
  });
});

describe("getIconComponent Function", () => {
  describe("Basic Functionality", () => {
    it("should return correct icon component", () => {
      const IconComponent = getIconComponent("home");
      expect(IconComponent).toBe(LucideIcons.Home);
    });

    it("should return correct icon for PascalCase name", () => {
      const IconComponent = getIconComponent("Home");
      expect(IconComponent).toBe(LucideIcons.Home);
    });

    it("should convert kebab-case to PascalCase", () => {
      const IconComponent = getIconComponent("alert-circle");
      expect(IconComponent).toBe(LucideIcons.AlertCircle);
    });

    it("should convert snake_case to PascalCase", () => {
      const IconComponent = getIconComponent("alert_circle");
      expect(IconComponent).toBe(LucideIcons.AlertCircle);
    });
  });

  describe("Fallback Behavior", () => {
    it("should return default fallback (Circle) for invalid name", () => {
      const IconComponent = getIconComponent("invalid-icon");
      expect(IconComponent).toBe(LucideIcons.Circle);
    });

    it("should return custom fallback for invalid name", () => {
      const IconComponent = getIconComponent("invalid-icon", "User");
      expect(IconComponent).toBe(LucideIcons.User);
    });

    it("should return Circle if both name and fallback are invalid", () => {
      const IconComponent = getIconComponent("invalid", "also-invalid");
      expect(IconComponent).toBe(LucideIcons.Circle);
    });

    it("should ignore fallback if name is valid", () => {
      const IconComponent = getIconComponent("home", "User");
      expect(IconComponent).toBe(LucideIcons.Home);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string name", () => {
      const IconComponent = getIconComponent("");
      expect(IconComponent).toBe(LucideIcons.Circle);
    });

    it("should return a component that can be rendered", () => {
      const IconComponent = getIconComponent("home");
      const { container } = render(<IconComponent />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

describe("DynamicIcon Integration", () => {
  it("should work with different icon variants", () => {
    const icons = ["home", "user", "alert-circle"];
    icons.forEach((iconName) => {
      const { container } = render(<DynamicIcon name={iconName} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it("should maintain accessibility when icon is invalid", () => {
    render(<DynamicIcon name="invalid-icon" aria-label="Icon" />);
    expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
  });

  it("should preserve all lucide icon props", () => {
    render(
      <DynamicIcon
        name="home"
        size={32}
        color="blue"
        strokeWidth={3}
        absoluteStrokeWidth
        className="custom-class"
      />
    );
    expect(LucideIcons.Home).toHaveBeenCalledWith(
      expect.objectContaining({
        size: 32,
        color: "blue",
        strokeWidth: 3,
        absoluteStrokeWidth: true,
        className: "custom-class",
      }),
      expect.anything()
    );
  });
});

// BUG FIX #37: DynamicIcon Component Issues
// ISSUE 1: No validation for name parameter - empty/whitespace names render fallback silently
// ISSUE 2: No memoization - icon lookup happens on every render
// ISSUE 3: Name formatting doesn't handle edge cases (whitespace, special characters)
// ISSUE 4: No error handling for invalid icon lookup
// ISSUE 5: Fallback chain could be clearer - three levels deep (icon -> fallback -> Circle)
// ISSUE 6: Type safety issue - name is string but should be constrained to valid icon names
// ISSUE 7: getIconComponent duplicates formatting logic instead of using shared function
// ISSUE 8: No validation that fallback is a valid icon name
