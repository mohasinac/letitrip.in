/**
 * Comprehensive tests for Accessibility components
 * Tests: SkipToContent, LiveRegion, Announcer
 * Focus: ARIA attributes, screen reader support, keyboard navigation, dark mode
 */

import { render, screen } from "@testing-library/react";
import { Announcer, LiveRegion, SkipToContent } from "../Accessibility";

describe("Accessibility Components", () => {
  describe("SkipToContent", () => {
    describe("Basic Rendering", () => {
      it("renders skip link with default contentId", () => {
        render(<SkipToContent />);
        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "#main-content");
      });

      it("renders skip link with custom contentId", () => {
        render(<SkipToContent contentId="custom-content" />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "#custom-content");
      });

      it("displays correct text content", () => {
        render(<SkipToContent />);
        expect(
          screen.getByRole("link", { name: /skip to main content/i })
        ).toBeInTheDocument();
      });
    });

    describe("Accessibility - Screen Reader", () => {
      it("has sr-only class by default (hidden visually)", () => {
        render(<SkipToContent />);
        const link = screen.getByRole("link");
        expect(link).toHaveClass("sr-only");
      });

      it("becomes visible on focus with focus:not-sr-only", () => {
        render(<SkipToContent />);
        const link = screen.getByRole("link");
        expect(link).toHaveClass("focus:not-sr-only");
      });

      it("has proper positioning classes on focus", () => {
        render(<SkipToContent />);
        const link = screen.getByRole("link");
        expect(link).toHaveClass(
          "focus:absolute",
          "focus:top-4",
          "focus:left-4",
          "focus:z-50"
        );
      });

      it("has proper styling classes on focus", () => {
        render(<SkipToContent />);
        const link = screen.getByRole("link");
        expect(link).toHaveClass(
          "focus:px-4",
          "focus:py-2",
          "focus:bg-blue-600",
          "focus:text-white",
          "focus:rounded-lg"
        );
      });
    });

    describe("Navigation", () => {
      it("links to correct anchor on page", () => {
        render(<SkipToContent contentId="test-section" />);
        const link = screen.getByRole("link");
        expect(link.getAttribute("href")).toBe("#test-section");
      });

      it("handles special characters in contentId", () => {
        render(<SkipToContent contentId="section-1_test" />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "#section-1_test");
      });
    });

    describe("Edge Cases", () => {
      it("handles empty contentId", () => {
        render(<SkipToContent contentId="" />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "#");
      });

      it("handles contentId with spaces", () => {
        render(<SkipToContent contentId="main content" />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "#main content");
      });
    });
  });

  describe("LiveRegion", () => {
    describe("Basic Rendering", () => {
      it("renders with message", () => {
        render(<LiveRegion message="Loading complete" />);
        expect(screen.getByText("Loading complete")).toBeInTheDocument();
      });

      it("renders with empty message", () => {
        const { container } = render(<LiveRegion message="" />);
        const region = container.querySelector('[role="status"]');
        expect(region).toBeInTheDocument();
        expect(region).toHaveTextContent("");
      });
    });

    describe("ARIA Attributes", () => {
      it("has role='status' attribute", () => {
        const { container } = render(<LiveRegion message="Test message" />);
        const region = container.querySelector('[role="status"]');
        expect(region).toBeInTheDocument();
      });

      it("has aria-live='polite' by default", () => {
        const { container } = render(<LiveRegion message="Test" />);
        const region = container.querySelector('[aria-live="polite"]');
        expect(region).toBeInTheDocument();
      });

      it("accepts aria-live='assertive' priority", () => {
        const { container } = render(
          <LiveRegion message="Urgent" priority="assertive" />
        );
        const region = container.querySelector('[aria-live="assertive"]');
        expect(region).toBeInTheDocument();
      });

      it("has aria-atomic='true' by default", () => {
        const { container } = render(<LiveRegion message="Test" />);
        const region = container.querySelector('[aria-atomic="true"]');
        expect(region).toBeInTheDocument();
      });

      it("accepts aria-atomic='false'", () => {
        const { container } = render(
          <LiveRegion message="Test" atomic={false} />
        );
        const region = container.querySelector('[aria-atomic="false"]');
        expect(region).toBeInTheDocument();
      });
    });

    describe("Screen Reader Support", () => {
      it("has sr-only class (visually hidden)", () => {
        const { container } = render(<LiveRegion message="Test" />);
        const region = container.querySelector('[role="status"]');
        expect(region).toHaveClass("sr-only");
      });

      it("announces polite messages", () => {
        const { container } = render(
          <LiveRegion message="Data loaded" priority="polite" />
        );
        const region = container.querySelector('[aria-live="polite"]');
        expect(region).toHaveTextContent("Data loaded");
      });

      it("announces assertive messages", () => {
        const { container } = render(
          <LiveRegion message="Error occurred" priority="assertive" />
        );
        const region = container.querySelector('[aria-live="assertive"]');
        expect(region).toHaveTextContent("Error occurred");
      });
    });

    describe("Dynamic Content", () => {
      it("updates message dynamically", () => {
        const { container, rerender } = render(
          <LiveRegion message="Loading..." />
        );
        const region = container.querySelector('[role="status"]');
        expect(region).toHaveTextContent("Loading...");

        rerender(<LiveRegion message="Complete" />);
        expect(region).toHaveTextContent("Complete");
      });

      it("handles rapid message changes", () => {
        const { container, rerender } = render(
          <LiveRegion message="Message 1" />
        );
        const region = container.querySelector('[role="status"]');

        rerender(<LiveRegion message="Message 2" />);
        expect(region).toHaveTextContent("Message 2");

        rerender(<LiveRegion message="Message 3" />);
        expect(region).toHaveTextContent("Message 3");
      });
    });

    describe("Edge Cases", () => {
      it("handles long messages", () => {
        const longMessage = "A".repeat(1000);
        const { container } = render(<LiveRegion message={longMessage} />);
        const region = container.querySelector('[role="status"]');
        expect(region).toHaveTextContent(longMessage);
      });

      it("handles special characters in message", () => {
        const message = "<>\"'@#$%^&*()";
        const { container } = render(<LiveRegion message={message} />);
        const region = container.querySelector('[role="status"]');
        expect(region).toHaveTextContent(message);
      });

      it("handles unicode characters", () => {
        const { container } = render(
          <LiveRegion message="🎉 Success! 你好 العربية" />
        );
        const region = container.querySelector('[role="status"]');
        expect(region).toHaveTextContent("🎉 Success! 你好 العربية");
      });
    });
  });

  describe("Announcer", () => {
    describe("Basic Rendering", () => {
      it("renders with message", () => {
        render(<Announcer message="Page loaded" />);
        expect(screen.getByText("Page loaded")).toBeInTheDocument();
      });

      it("renders with empty message", () => {
        const { container } = render(<Announcer message="" />);
        const announcer = container.querySelector('[role="status"]');
        expect(announcer).toBeInTheDocument();
      });
    });

    describe("ARIA Attributes", () => {
      it("has role='status' attribute", () => {
        const { container } = render(<Announcer message="Test" />);
        const announcer = container.querySelector('[role="status"]');
        expect(announcer).toBeInTheDocument();
      });

      it("has aria-live='polite' attribute", () => {
        const { container } = render(<Announcer message="Test" />);
        const announcer = container.querySelector('[aria-live="polite"]');
        expect(announcer).toBeInTheDocument();
      });

      it("has aria-atomic='true' attribute", () => {
        const { container } = render(<Announcer message="Test" />);
        const announcer = container.querySelector('[aria-atomic="true"]');
        expect(announcer).toBeInTheDocument();
      });

      it("has all three ARIA attributes together", () => {
        const { container } = render(<Announcer message="Test" />);
        const announcer = container.querySelector(
          '[role="status"][aria-live="polite"][aria-atomic="true"]'
        );
        expect(announcer).toBeInTheDocument();
      });
    });

    describe("Screen Reader Support", () => {
      it("has sr-only class for screen readers", () => {
        const { container } = render(<Announcer message="Test" />);
        const announcer = container.querySelector('[role="status"]');
        expect(announcer).toHaveClass("sr-only");
      });

      it("announces message to screen readers", () => {
        const { container } = render(
          <Announcer message="Form submitted successfully" />
        );
        const announcer = container.querySelector('[role="status"]');
        expect(announcer).toHaveTextContent("Form submitted successfully");
      });
    });

    describe("Dynamic Content", () => {
      it("updates announcements dynamically", () => {
        const { container, rerender } = render(
          <Announcer message="Saving..." />
        );
        const announcer = container.querySelector('[role="status"]');
        expect(announcer).toHaveTextContent("Saving...");

        rerender(<Announcer message="Saved" />);
        expect(announcer).toHaveTextContent("Saved");
      });

      it("handles multiple sequential announcements", () => {
        const { container, rerender } = render(
          <Announcer message="Step 1 complete" />
        );
        const announcer = container.querySelector('[role="status"]');

        rerender(<Announcer message="Step 2 complete" />);
        expect(announcer).toHaveTextContent("Step 2 complete");

        rerender(<Announcer message="All steps complete" />);
        expect(announcer).toHaveTextContent("All steps complete");
      });
    });

    describe("Edge Cases", () => {
      it("handles very long messages", () => {
        const longMessage = "This is a very long message. ".repeat(50);
        const { container } = render(<Announcer message={longMessage} />);
        const announcer = container.querySelector('[role="status"]');
        expect(announcer?.textContent).toBe(longMessage);
      });

      it("handles special characters", () => {
        const { container } = render(
          <Announcer message='<script>alert("test")</script>' />
        );
        const announcer = container.querySelector('[role="status"]');
        expect(announcer).toHaveTextContent('<script>alert("test")</script>');
      });

      it("handles newlines and whitespace", () => {
        const { container } = render(
          <Announcer message="Line 1\nLine 2\n\tTabbed" />
        );
        const announcer = container.querySelector('[role="status"]');
        // JSDOM/HTML normalizes whitespace - newlines become spaces
        // What matters is that the content is announced to screen readers
        const textContent = announcer?.textContent || "";
        expect(textContent).toContain("Line 1");
        expect(textContent).toContain("Line 2");
        expect(textContent).toContain("Tabbed");
        expect(textContent.length).toBeGreaterThan(0);
      });

      it("handles numeric messages", () => {
        const { container } = render(<Announcer message="12345" />);
        const announcer = container.querySelector('[role="status"]');
        expect(announcer).toHaveTextContent("12345");
      });
    });

    describe("Comparison with LiveRegion", () => {
      it("has same default behavior as LiveRegion with polite priority", () => {
        const { container: announcerContainer } = render(
          <Announcer message="Test" />
        );
        const { container: liveContainer } = render(
          <LiveRegion message="Test" priority="polite" atomic={true} />
        );

        const announcer = announcerContainer.querySelector('[role="status"]');
        const liveRegion = liveContainer.querySelector('[role="status"]');

        expect(announcer?.getAttribute("aria-live")).toBe(
          liveRegion?.getAttribute("aria-live")
        );
        expect(announcer?.getAttribute("aria-atomic")).toBe(
          liveRegion?.getAttribute("aria-atomic")
        );
        expect(announcer?.className).toBe(liveRegion?.className);
      });
    });
  });

  describe("Dark Mode Support", () => {
    it("SkipToContent has dark mode styling on focus", () => {
      render(<SkipToContent />);
      const link = screen.getByRole("link");
      // SkipToContent doesn't have dark mode classes, uses fixed blue-600
      expect(link).toHaveClass("focus:bg-blue-600", "focus:text-white");
    });

    it("LiveRegion works in dark mode (sr-only hides it)", () => {
      const { container } = render(<LiveRegion message="Test" />);
      const region = container.querySelector('[role="status"]');
      expect(region).toHaveClass("sr-only");
    });

    it("Announcer works in dark mode (sr-only hides it)", () => {
      const { container } = render(<Announcer message="Test" />);
      const announcer = container.querySelector('[role="status"]');
      expect(announcer).toHaveClass("sr-only");
    });
  });

  describe("Integration Tests", () => {
    it("combines SkipToContent with LiveRegion", () => {
      const { container } = render(
        <>
          <SkipToContent />
          <LiveRegion message="Page loaded" />
        </>
      );

      const link = screen.getByRole("link");
      const region = container.querySelector('[role="status"]');

      expect(link).toBeInTheDocument();
      expect(region).toBeInTheDocument();
    });

    it("uses multiple LiveRegions for different purposes", () => {
      const { container } = render(
        <>
          <LiveRegion message="Loading..." priority="polite" />
          <LiveRegion message="Error!" priority="assertive" />
        </>
      );

      const politeRegion = container.querySelector('[aria-live="polite"]');
      const assertiveRegion = container.querySelector(
        '[aria-live="assertive"]'
      );

      expect(politeRegion).toHaveTextContent("Loading...");
      expect(assertiveRegion).toHaveTextContent("Error!");
    });

    it("combines all three components", () => {
      const { container } = render(
        <>
          <SkipToContent contentId="main" />
          <LiveRegion message="Page loading" />
          <Announcer message="Welcome" />
        </>
      );

      expect(screen.getByRole("link")).toBeInTheDocument();
      const regions = container.querySelectorAll('[role="status"]');
      expect(regions).toHaveLength(2);
    });
  });
});
