/**
 * TextLink Component Tests
 *
 * Covers:
 * - External URLs (http/https) render as <a> with target="_blank"
 * - Mailto/Tel URLs auto-detected as external, render as <a>
 * - Internal paths render via next-intl Link (mocked)
 * - variant="bare" applies no colour/hover classes
 * - variant="default" applies indigo colour classes
 * - variant="inherit" applies underline classes
 * - explicit external={true} forces <a> rendering
 * - props (onClick, aria-label) forwarded correctly
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TextLink } from "../TextLink";

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} data-testid="internal-link" {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      textMuted: "text-gray-500",
      textSecondary: "text-gray-600",
    },
  },
}));

describe("TextLink", () => {
  describe("external URL detection", () => {
    it("renders https URL as <a> with target=_blank", () => {
      render(<TextLink href="https://example.com">Visit</TextLink>);
      const link = screen.getByRole("link");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders http URL as <a> with target=_blank", () => {
      render(<TextLink href="http://example.com">Visit</TextLink>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("renders mailto URL as <a> (auto-detected external)", () => {
      render(<TextLink href="mailto:test@example.com">Email us</TextLink>);
      const link = screen.getByRole("link");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "mailto:test@example.com");
    });

    it("renders tel URL as <a> (auto-detected external)", () => {
      render(<TextLink href="tel:+1234567890">Call us</TextLink>);
      const link = screen.getByRole("link");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "tel:+1234567890");
    });
  });

  describe("internal URL detection", () => {
    it("renders internal path via locale-aware Link", () => {
      render(<TextLink href="/products">Products</TextLink>);
      const link = screen.getByTestId("internal-link");
      expect(link).toHaveAttribute("href", "/products");
      expect(link).not.toHaveAttribute("target");
    });

    it("renders hash-only link via locale-aware Link", () => {
      render(<TextLink href="#main-content">Skip to content</TextLink>);
      const link = screen.getByTestId("internal-link");
      expect(link).toHaveAttribute("href", "#main-content");
    });
  });

  describe("external={true} override", () => {
    it("forces <a> rendering for internal path when external=true", () => {
      render(
        <TextLink href="/products" external>
          Products
        </TextLink>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).not.toHaveAttribute("data-testid", "internal-link");
    });
  });

  describe("variant='bare'", () => {
    it("applies only the custom className, no colour or underline classes", () => {
      render(
        <TextLink
          href="https://example.com"
          variant="bare"
          className="custom-class"
        >
          Link
        </TextLink>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveClass("custom-class");
      expect(link).not.toHaveClass("text-indigo-600");
      expect(link).not.toHaveClass("hover:underline");
    });
  });

  describe("variant='default'", () => {
    it("applies indigo colour classes", () => {
      render(<TextLink href="https://example.com">Link</TextLink>);
      const link = screen.getByRole("link");
      expect(link.className).toContain("text-indigo-600");
    });
  });

  describe("prop forwarding", () => {
    it("forwards onClick to external <a>", () => {
      const onClick = jest.fn();
      render(
        <TextLink href="https://example.com" onClick={onClick}>
          Link
        </TextLink>,
      );
      fireEvent.click(screen.getByRole("link"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("forwards aria-label for accessibility", () => {
      render(
        <TextLink href="https://twitter.com/test" aria-label="Twitter profile">
          <svg />
        </TextLink>,
      );
      expect(
        screen.getByRole("link", { name: "Twitter profile" }),
      ).toBeInTheDocument();
    });

    it("applies custom className alongside variant classes", () => {
      render(
        <TextLink href="https://example.com" className="break-all">
          Link
        </TextLink>,
      );
      const link = screen.getByRole("link");
      expect(link.className).toContain("break-all");
      expect(link.className).toContain("text-indigo-600");
    });
  });
});
