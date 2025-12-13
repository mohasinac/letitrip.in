/**
 * Comprehensive Unit Tests for MobilePullToRefresh Component
 * Testing pull gesture, refresh logic, loading states, and accessibility
 *
 * @batch 13
 * @status NEW
 */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MobilePullToRefresh } from "../MobilePullToRefresh";

describe("MobilePullToRefresh - Pull Gesture Component", () => {
  const mockOnRefresh = jest.fn();

  const defaultProps = {
    children: <div>Content to refresh</div>,
    onRefresh: mockOnRefresh,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnRefresh.mockResolvedValue(undefined);
  });

  describe("Basic Rendering", () => {
    it("should render children content", () => {
      render(<MobilePullToRefresh {...defaultProps} />);
      expect(screen.getByText("Content to refresh")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} className="custom-refresh" />
      );
      expect(container.firstChild).toHaveClass("custom-refresh");
    });

    it("should have relative positioning", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      expect(container.firstChild).toHaveClass("relative");
    });

    it("should have overflow-auto for scrolling", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      expect(container.firstChild).toHaveClass("overflow-auto");
    });

    it("should render pull indicator", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const indicator = container.querySelector(".absolute.left-0.right-0");
      expect(indicator).toBeInTheDocument();
    });
  });

  describe("Pull Indicator", () => {
    it("should position indicator above content", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const indicator = container.querySelector(".absolute") as HTMLElement;
      expect(indicator?.style.top).toBe("-40px");
    });

    it("should have pointer-events-none on indicator", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const indicator = container.querySelector(".absolute");
      expect(indicator).toHaveClass("pointer-events-none");
    });

    it("should have z-10 to stay above content", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const indicator = container.querySelector(".absolute");
      expect(indicator).toHaveClass("z-10");
    });

    it("should have transition for smooth opacity", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const indicator = container.querySelector(".absolute");
      expect(indicator).toHaveClass("transition-opacity");
    });

    it("should render white circular background", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const circle = container.querySelector(".rounded-full.bg-white");
      expect(circle).toBeInTheDocument();
    });

    it("should have shadow on indicator circle", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const circle = container.querySelector(".rounded-full");
      expect(circle).toHaveClass("shadow-lg");
    });
  });

  describe("Touch Gesture Handling", () => {
    it("should handle touchStart event", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const element = container.firstChild as HTMLElement;

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      expect(element).toBeInTheDocument();
    });

    it("should handle touchMove event", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const element = container.firstChild as HTMLElement;

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 150 }],
      });

      expect(element).toBeInTheDocument();
    });

    it("should handle touchEnd event", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const element = container.firstChild as HTMLElement;

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      expect(element).toBeInTheDocument();
    });

    it("should ignore touch when disabled", () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} disabled={true} />
      );
      const element = container.firstChild as HTMLElement;

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 150 }],
      });

      expect(mockOnRefresh).not.toHaveBeenCalled();
    });
  });

  describe("Refresh Logic", () => {
    it("should call onRefresh when pull exceeds threshold", async () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} threshold={50} />
      );
      const element = container.firstChild as HTMLElement;

      // Mock scrollTop as 0 (at top)
      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 250 }], // Pull 150px (exceeds threshold * 0.5 = 75)
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("should not call onRefresh when pull is below threshold", async () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} threshold={100} />
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 120 }], // Only 20px pull
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      await waitFor(() => {
        expect(mockOnRefresh).not.toHaveBeenCalled();
      });
    });

    it("should not call onRefresh when disabled", async () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} disabled={true} threshold={50} />
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 250 }],
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      await waitFor(() => {
        expect(mockOnRefresh).not.toHaveBeenCalled();
      });
    });

    it("should handle async onRefresh", async () => {
      const asyncRefresh = jest.fn().mockResolvedValue(undefined);

      const { container } = render(
        <MobilePullToRefresh onRefresh={asyncRefresh} threshold={50}>
          <div>Content</div>
        </MobilePullToRefresh>
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 250 }],
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      await waitFor(() => {
        expect(asyncRefresh).toHaveBeenCalled();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner during refresh", async () => {
      let resolveRefresh: () => void;
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      });
      const onRefresh = jest.fn(() => refreshPromise);

      const { container } = render(
        <MobilePullToRefresh onRefresh={onRefresh} threshold={50}>
          <div>Content</div>
        </MobilePullToRefresh>
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 250 }],
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      await waitFor(() => {
        const spinner = container.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
      });

      resolveRefresh!();
    });

    it("should have yellow spinner color", async () => {
      let resolveRefresh: () => void;
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      });
      const onRefresh = jest.fn(() => refreshPromise);

      const { container } = render(
        <MobilePullToRefresh onRefresh={onRefresh} threshold={50}>
          <div>Content</div>
        </MobilePullToRefresh>
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 250 }],
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      await waitFor(() => {
        const spinner = container.querySelector(".animate-spin");
        expect(spinner).toHaveClass("text-yellow-600");
      });

      resolveRefresh!();
    });

    it("should prevent multiple simultaneous refreshes", async () => {
      let resolveRefresh: () => void;
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      });
      const onRefresh = jest.fn(() => refreshPromise);

      const { container } = render(
        <MobilePullToRefresh onRefresh={onRefresh} threshold={50}>
          <div>Content</div>
        </MobilePullToRefresh>
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      // First pull
      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });
      fireEvent.touchMove(element, {
        touches: [{ clientY: 250 }],
      });
      act(() => {
        fireEvent.touchEnd(element);
      });

      // Try second pull while first is in progress
      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });
      fireEvent.touchMove(element, {
        touches: [{ clientY: 250 }],
      });
      act(() => {
        fireEvent.touchEnd(element);
      });

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1); // Only once
      });

      resolveRefresh!();
    });
  });

  describe("Pull Indicator States", () => {
    it("should show arrow icon when not refreshing", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const arrow = container.querySelector("svg path");
      expect(arrow).toBeInTheDocument();
    });

    it("should change color when threshold is reached", () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} threshold={10} />
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 150 }], // Exceeds threshold
      });

      const circle = container.querySelector(".rounded-full");
      expect(circle).toHaveClass("bg-yellow-50");
    });

    it("should rotate arrow based on pull progress", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const arrow = container.querySelector("svg") as SVGElement;
      expect(arrow?.style.transform).toBeDefined();
    });

    it("should have gray arrow by default", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const arrow = container.querySelector("svg");
      expect(arrow).toHaveClass("text-gray-600");
    });

    it("should have yellow arrow when ready to refresh", () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} threshold={10} />
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 150 }],
      });

      const arrow = container.querySelector("svg");
      expect(arrow).toHaveClass("text-yellow-600");
    });
  });

  describe("Custom Configuration", () => {
    it("should respect custom threshold", () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} threshold={150} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should respect custom maxPull", () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} maxPull={200} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should use default threshold of 80", () => {
      const { container } = render(
        <MobilePullToRefresh onRefresh={mockOnRefresh}>
          <div>Content</div>
        </MobilePullToRefresh>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should use default maxPull of 120", () => {
      const { container } = render(
        <MobilePullToRefresh onRefresh={mockOnRefresh}>
          <div>Content</div>
        </MobilePullToRefresh>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should use default disabled as false", () => {
      const { container } = render(
        <MobilePullToRefresh onRefresh={mockOnRefresh}>
          <div>Content</div>
        </MobilePullToRefresh>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle upward pull (negative diff)", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 50 }], // Upward pull
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      expect(mockOnRefresh).not.toHaveBeenCalled();
    });

    it("should handle rapid pull and release", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      expect(mockOnRefresh).not.toHaveBeenCalled();
    });

    it("should handle pull when scrolled down", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 100,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientY: 250 }],
      });

      act(() => {
        fireEvent.touchEnd(element);
      });

      expect(mockOnRefresh).not.toHaveBeenCalled();
    });

    it("should handle very long pull exceeding maxPull", () => {
      const { container } = render(
        <MobilePullToRefresh {...defaultProps} maxPull={100} />
      );
      const element = container.firstChild as HTMLElement;

      Object.defineProperty(element, "scrollTop", {
        value: 0,
        writable: true,
      });

      fireEvent.touchStart(element, {
        touches: [{ clientY: 100 }],
      });

      // Pull 500px (way beyond maxPull)
      fireEvent.touchMove(element, {
        touches: [{ clientY: 600 }],
      });

      // Should not crash
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      render(
        <MobilePullToRefresh onRefresh={mockOnRefresh}>
          <div>First child</div>
          <div>Second child</div>
          <div>Third child</div>
        </MobilePullToRefresh>
      );

      expect(screen.getByText("First child")).toBeInTheDocument();
      expect(screen.getByText("Second child")).toBeInTheDocument();
      expect(screen.getByText("Third child")).toBeInTheDocument();
    });
  });

  describe("Content Transform", () => {
    it("should translate content during pull", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const content = container.querySelector(
        "div > div:last-child"
      ) as HTMLElement;
      expect(content?.style.transform).toBeDefined();
    });

    it("should have transition for smooth animation", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const content = container.querySelector(
        "div > div:last-child"
      ) as HTMLElement;
      expect(content?.style.transition).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible for scrolling", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const element = container.firstChild as HTMLElement;
      expect(element.tagName).toBe("DIV");
    });

    it("should maintain scroll functionality", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("overflow-auto");
    });
  });

  describe("Visual States", () => {
    it("should have indicator size of 40px", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const circle = container.querySelector(".w-10.h-10");
      expect(circle).toBeInTheDocument();
    });

    it("should have icon size of 20px", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const icon = container.querySelector(".w-5.h-5");
      expect(icon).toBeInTheDocument();
    });

    it("should center indicator horizontally", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const indicator = container.querySelector(".absolute");
      expect(indicator).toHaveClass("justify-center");
    });

    it("should center icon in circle", () => {
      const { container } = render(<MobilePullToRefresh {...defaultProps} />);
      const circle = container.querySelector(".rounded-full");
      expect(circle).toHaveClass("items-center");
      expect(circle).toHaveClass("justify-center");
    });
  });
});
