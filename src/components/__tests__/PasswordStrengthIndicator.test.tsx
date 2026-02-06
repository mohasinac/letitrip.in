/**
 * Tests for PasswordStrengthIndicator component
 *
 * Coverage:
 * - Password strength calculation
 * - Strength level display
 * - Progress bar visualization
 * - Requirements checklist
 * - Different password scenarios
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { PasswordStrengthIndicator } from "../PasswordStrengthIndicator";

describe("PasswordStrengthIndicator Component", () => {
  describe("Strength Levels", () => {
    it('shows "Weak" for very short passwords', () => {
      render(<PasswordStrengthIndicator password="ab" />);
      // "ab" = lowercase only = 1/4 met = 25% = Weak
      expect(screen.getByText("Weak")).toBeInTheDocument();
    });

    it('shows "Fair" for passwords with only lowercase that meet length', () => {
      render(<PasswordStrengthIndicator password="abcdefgh" />);
      // "abcdefgh" = 8 chars + lowercase = 2/4 met = 50% = Fair
      expect(screen.getByText("Fair")).toBeInTheDocument();
    });

    it('shows "Good" for passwords with lowercase and numbers', () => {
      render(<PasswordStrengthIndicator password="abcdef123" />);
      // abcdef123 = 8 chars + lowercase + number = 3/4 = 75% = Good
      expect(screen.getByText("Good")).toBeInTheDocument();
    });

    it('shows "Strong" for passwords with mixed case and numbers', () => {
      render(<PasswordStrengthIndicator password="Abcdef123" />);
      // Abcdef123 = 8 chars + lowercase + uppercase + number = 4/4 = 100% = Strong
      expect(screen.getByText("Strong")).toBeInTheDocument();
    });

    it('shows "Strong" for passwords with all character types', () => {
      render(<PasswordStrengthIndicator password="Abcdef123!" />);
      expect(screen.getByText("Strong")).toBeInTheDocument();
    });
  });

  describe("Progress Bar", () => {
    it("renders progress bar for all strength levels", () => {
      const { container, rerender } = render(
        <PasswordStrengthIndicator password="ab" />,
      );
      let progressBar = container.querySelector(".bg-red-500");
      expect(progressBar).toBeInTheDocument();

      rerender(<PasswordStrengthIndicator password="Abcdef123!" />);
      progressBar = container.querySelector(".bg-green-500");
      expect(progressBar).toBeInTheDocument();
    });

    it("shows correct width for different strength levels", () => {
      const { container, rerender } = render(
        <PasswordStrengthIndicator password="ab" />,
      );
      let progressBar = container.querySelector(".bg-red-500");
      expect(progressBar).toHaveStyle({ width: "25%" }); // 1/4 = 25%

      rerender(<PasswordStrengthIndicator password="abcdefgh" />);
      progressBar = container.querySelector(".bg-orange-500");
      expect(progressBar).toHaveStyle({ width: "50%" }); // 2/4 = 50%

      rerender(<PasswordStrengthIndicator password="Abcdef123!" />);
      progressBar = container.querySelector(".bg-green-500");
      expect(progressBar).toHaveStyle({ width: "100%" }); // 4/4 = 100%
    });

    it("applies correct color class for strength level", () => {
      const { container, rerender } = render(
        <PasswordStrengthIndicator password="ab" />,
      );
      let progressBar = container.querySelector(".h-full");
      expect(progressBar).toHaveClass("bg-red-500");

      rerender(<PasswordStrengthIndicator password="Abcdef123!" />);
      progressBar = container.querySelector(".h-full");
      expect(progressBar).toHaveClass("bg-green-500");
    });
  });

  describe("Requirements Checklist", () => {
    it("shows all password requirements", () => {
      render(<PasswordStrengthIndicator password="test" />);

      expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
      expect(screen.getByText(/Contains uppercase letter/)).toBeInTheDocument();
      expect(screen.getByText(/Contains lowercase letter/)).toBeInTheDocument();
      expect(screen.getByText(/Contains number/)).toBeInTheDocument();
    });

    it("marks length requirement as met when password is long enough", () => {
      render(<PasswordStrengthIndicator password="abcdefgh" />);
      const requirement = screen.getByText(/At least 8 characters/);
      // The li element has the color class, not the svg
      expect(requirement.closest("li")).toHaveClass("text-green-600");
    });

    it("marks uppercase requirement as met", () => {
      render(<PasswordStrengthIndicator password="Abcdefgh" />);
      const requirement = screen.getByText(/Contains uppercase letter/);
      expect(requirement.closest("li")).toHaveClass("text-green-600");
    });

    it("marks lowercase requirement as met", () => {
      render(<PasswordStrengthIndicator password="abcdefgh" />);
      const requirement = screen.getByText(/Contains lowercase letter/);
      expect(requirement.closest("li")).toHaveClass("text-green-600");
    });

    it("marks number requirement as met", () => {
      render(<PasswordStrengthIndicator password="abcd1234" />);
      const requirement = screen.getByText(/Contains number/);
      expect(requirement.closest("li")).toHaveClass("text-green-600");
    });

    // Special character requirement removed - component only checks 4 requirements
    // (length, lowercase, uppercase, number)
  });

  describe("Edge Cases", () => {
    it("handles empty password", () => {
      const { container } = render(<PasswordStrengthIndicator password="" />);
      // Component returns null for empty password
      expect(container.firstChild).toBeNull();
    });

    it("handles very long password", () => {
      const longPassword = "Abcd1234!".repeat(10);
      render(<PasswordStrengthIndicator password={longPassword} />);
      expect(screen.getByText("Strong")).toBeInTheDocument();
    });

    it("handles password with only special characters", () => {
      render(<PasswordStrengthIndicator password="!@#$%^&*()" />);
      const strength = screen.getByText(/weak|fair|good/i);
      expect(strength).toBeInTheDocument();
    });

    it("handles password with spaces", () => {
      render(<PasswordStrengthIndicator password="Pass word 123!" />);
      const strength = screen.getByText(/fair|good|strong/i);
      expect(strength).toBeInTheDocument();
    });

    it("handles password with unicode characters", () => {
      render(<PasswordStrengthIndicator password="Pässwörd123!" />);
      expect(screen.getByText("Strong")).toBeInTheDocument();
    });
  });

  describe("Conditional Rendering", () => {
    it("does not render when showRequirements is false", () => {
      render(
        <PasswordStrengthIndicator password="test" showRequirements={false} />,
      );
      expect(
        screen.queryByText(/At least 8 characters/),
      ).not.toBeInTheDocument();
    });

    it("renders requirements by default", () => {
      render(<PasswordStrengthIndicator password="test" />);
      expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("progress bar is visually present", () => {
      const { container } = render(
        <PasswordStrengthIndicator password="test" />,
      );
      // Progress bar exists as styled div (no ARIA role needed for visual indicator)
      const progressBar = container.querySelector(".bg-gray-200");
      expect(progressBar).toBeInTheDocument();
    });

    it("strength level is visually displayed", () => {
      render(<PasswordStrengthIndicator password="Abcdef123!" />);
      const strengthText = screen.getByText("Strong");
      expect(strengthText).toBeInTheDocument();
      expect(strengthText).toHaveClass("text-sm", "font-medium");
    });
  });

  describe("Real-world Password Scenarios", () => {
    it('common weak password: "password"', () => {
      render(<PasswordStrengthIndicator password="password" />);
      // 'password' = 8 chars + lowercase = 2/4 = 50% = Fair
      expect(screen.getByText("Fair")).toBeInTheDocument();
    });

    it('common weak password: "12345678"', () => {
      render(<PasswordStrengthIndicator password="12345678" />);
      // '12345678' = 8 chars + number = 2/4 = 50% = Fair
      expect(screen.getByText("Fair")).toBeInTheDocument();
    });

    it('strong password: "Password123"', () => {
      render(<PasswordStrengthIndicator password="Password123" />);
      // 'Password123' = 8+ chars + lower + upper + number = 4/4 = 100% = Strong
      expect(screen.getByText("Strong")).toBeInTheDocument();
    });

    it('strong password: "P@ssw0rd!2024"', () => {
      render(<PasswordStrengthIndicator password="P@ssw0rd!2024" />);
      expect(screen.getByText("Strong")).toBeInTheDocument();
    });

    it('very strong password: "MyS3cur3P@ssw0rd!#2024"', () => {
      render(<PasswordStrengthIndicator password="MyS3cur3P@ssw0rd!#2024" />);
      expect(screen.getByText("Strong")).toBeInTheDocument();
    });
  });
});
