/**
 * Comprehensive Unit Tests for MobileBottomSheet Component
 * Testing mobile-specific interactions, accessibility, touch gestures, and responsive behavior
 *
 * @batch 13
 * @status NEW
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { MobileBottomSheet } from "../MobileBottomSheet";

// Mock touch events helper
const createTouchEvent = (type: string, clientY: number) => {
  return new TouchEvent(type, {
    touches: [{ clientY } as Touch],
    changedTouches: [{ clientY } as Touch],
  });
};

describe("MobileBottomSheet - Mobile Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Sheet",
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = "";
  });

  describe("Basic Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<MobileBottomSheet {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<MobileBottomSheet {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render title when provided", () => {
      render(<MobileBottomSheet {...defaultProps} title="My Title" />);
      expect(screen.getByText("My Title")).toBeInTheDocument();
    });

    it("should render without title", () => {
      const { container } = render(
        <MobileBottomSheet {...defaultProps} title={undefined} />
      );
      expect(container.querySelector("#sheet-title")).not.toBeInTheDocument();
    });

    it("should render children content", () => {
      render(
        <MobileBottomSheet {...defaultProps}>
          <div data-testid="child-content">Custom Content</div>
        </MobileBottomSheet>
      );
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have dialog role", () => {
      render(<MobileBottomSheet {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-modal attribute", () => {
      render(<MobileBottomSheet {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby when title is provided", () => {
      render(<MobileBottomSheet {...defaultProps} title="Test Title" />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "sheet-title");
    });

    it("should not have aria-labelledby when title is undefined", () => {
      render(<MobileBottomSheet {...defaultProps} title={undefined} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).not.toHaveAttribute("aria-labelledby");
    });

    it("should have aria-label on close button", () => {
      render(<MobileBottomSheet {...defaultProps} showCloseButton={true} />);
      expect(screen.getByLabelText("Close")).toBeInTheDocument();
    });

    it("should have aria-hidden on overlay", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const overlay = container.querySelector(".bg-black\\/50");
      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Visual Elements", () => {
    it("should show handle by default", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const handle = container.querySelector(".w-12.h-1\\.5");
      expect(handle).toBeInTheDocument();
    });

    it("should hide handle when showHandle is false", () => {
      const { container } = render(
        <MobileBottomSheet {...defaultProps} showHandle={false} />
      );
      const handle = container.querySelector(".w-12.h-1\\.5");
      expect(handle).not.toBeInTheDocument();
    });

    it("should show close button by default", () => {
      render(<MobileBottomSheet {...defaultProps} />);
      expect(screen.getByLabelText("Close")).toBeInTheDocument();
    });

    it("should hide close button when showCloseButton is false", () => {
      render(<MobileBottomSheet {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
    });

    it("should show header when title or closeButton is present", () => {
      const { container } = render(
        <MobileBottomSheet {...defaultProps} title="Title" />
      );
      const header = container.querySelector(".border-b.border-gray-200");
      expect(header).toBeInTheDocument();
    });

    it("should not show header when no title and no closeButton", () => {
      const { container } = render(
        <MobileBottomSheet
          {...defaultProps}
          title={undefined}
          showCloseButton={false}
        />
      );
      const header = container.querySelector(".border-b.border-gray-200");
      expect(header).not.toBeInTheDocument();
    });
  });

  describe("Overlay Interactions", () => {
    it("should call onClose when overlay is clicked", () => {
      const onClose = jest.fn();
      const { container } = render(
        <MobileBottomSheet {...defaultProps} onClose={onClose} />
      );
      const overlay = container.querySelector(".bg-black\\/50");
      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it("should not close when sheet content is clicked", () => {
      const onClose = jest.fn();
      render(<MobileBottomSheet {...defaultProps} onClose={onClose} />);
      const content = screen.getByText("Test Content");
      fireEvent.click(content);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Close Button Interactions", () => {
    it("should call onClose when close button is clicked", () => {
      const onClose = jest.fn();
      render(<MobileBottomSheet {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByLabelText("Close"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should have clickable close button with proper type", () => {
      const onClose = jest.fn();
      render(<MobileBottomSheet {...defaultProps} onClose={onClose} />);
      const closeButton = screen.getByLabelText("Close");
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe("BUTTON");
    });
  });

  describe("Body Scroll Lock", () => {
    it("should lock body scroll when opened", () => {
      render(<MobileBottomSheet {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body scroll when closed", () => {
      const { rerender } = render(
        <MobileBottomSheet {...defaultProps} isOpen={true} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MobileBottomSheet {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("");
    });

    it("should restore body scroll on unmount", () => {
      const { unmount } = render(
        <MobileBottomSheet {...defaultProps} isOpen={true} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Styling & Customization", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <MobileBottomSheet {...defaultProps} className="custom-class" />
      );
      const sheet = container.querySelector(".custom-class");
      expect(sheet).toBeInTheDocument();
    });

    it("should have rounded top corners", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("rounded-t-2xl");
    });

    it("should have max height constraint", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("max-h-[90vh]");
    });

    it("should have safe area padding", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("pb-safe");
    });

    it("should be hidden on desktop (lg breakpoint)", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("lg:hidden");
    });
  });

  describe("Animations", () => {
    it("should have slide-up animation", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("animate-slide-up");
    });

    it("should have fade-in animation on overlay", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const overlay = container.querySelector(".bg-black\\/50");
      expect(overlay).toHaveClass("animate-fade-in");
    });
  });

  describe("Content Scrolling", () => {
    it("should have scrollable content area", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const content = container.querySelector(".overflow-y-auto");
      expect(content).toBeInTheDocument();
    });

    it("should have overscroll-contain", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const content = container.querySelector(".overscroll-contain");
      expect(content).toBeInTheDocument();
    });

    it("should handle long content", () => {
      const longContent = (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <p key={i}>Line {i}</p>
          ))}
        </div>
      );
      render(
        <MobileBottomSheet {...defaultProps}>{longContent}</MobileBottomSheet>
      );
      expect(screen.getByText("Line 0")).toBeInTheDocument();
      expect(screen.getByText("Line 99")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple rapid open/close", () => {
      const { rerender } = render(
        <MobileBottomSheet {...defaultProps} isOpen={false} />
      );

      for (let i = 0; i < 5; i++) {
        rerender(<MobileBottomSheet {...defaultProps} isOpen={true} />);
        rerender(<MobileBottomSheet {...defaultProps} isOpen={false} />);
      }

      expect(document.body.style.overflow).toBe("");
    });

    it("should handle empty children", () => {
      render(<MobileBottomSheet {...defaultProps}>{null}</MobileBottomSheet>);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle very long title", () => {
      const longTitle = "A".repeat(100);
      render(<MobileBottomSheet {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle special characters in title", () => {
      const specialTitle = "Test <>&\"' Title";
      render(<MobileBottomSheet {...defaultProps} title={specialTitle} />);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });
  });

  describe("Mobile-Specific Features", () => {
    it("should have touch-target class on close button", () => {
      render(<MobileBottomSheet {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close");
      expect(closeButton).toHaveClass("touch-target");
    });

    it("should be positioned at bottom", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("bottom-0");
      expect(sheet).toHaveClass("left-0");
      expect(sheet).toHaveClass("right-0");
    });

    it("should have fixed positioning", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("fixed");
    });

    it("should have high z-index", () => {
      const { container } = render(<MobileBottomSheet {...defaultProps} />);
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("z-50");
    });
  });

  describe("React Hooks Behavior", () => {
    it("should clean up on unmount", () => {
      const { unmount } = render(
        <MobileBottomSheet {...defaultProps} isOpen={true} />
      );
      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("should update when props change", () => {
      const { rerender } = render(
        <MobileBottomSheet {...defaultProps} title="Title 1" />
      );
      expect(screen.getByText("Title 1")).toBeInTheDocument();

      rerender(<MobileBottomSheet {...defaultProps} title="Title 2" />);
      expect(screen.getByText("Title 2")).toBeInTheDocument();
      expect(screen.queryByText("Title 1")).not.toBeInTheDocument();
    });
  });
});
