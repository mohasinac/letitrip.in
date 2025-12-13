import { fireEvent, render, screen } from "@testing-library/react";
import { InlineFormModal } from "../InlineFormModal";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  X: ({ className }: { className?: string }) => (
    <svg data-testid="x-icon" className={className} />
  ),
}));

describe("InlineFormModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Modal",
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders when isOpen is true", () => {
      render(<InlineFormModal {...defaultProps} />);
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(<InlineFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    });

    it("renders children content", () => {
      render(<InlineFormModal {...defaultProps} />);
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("returns null when closed", () => {
      const { container } = render(
        <InlineFormModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Title", () => {
    it("renders title text", () => {
      render(<InlineFormModal {...defaultProps} title="Custom Title" />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("title has correct id for aria-labelledby", () => {
      render(<InlineFormModal {...defaultProps} />);
      const title = screen.getByText("Test Modal");
      expect(title).toHaveAttribute("id", "inline-modal-title");
    });

    it("title has proper styling", () => {
      render(<InlineFormModal {...defaultProps} />);
      const title = screen.getByText("Test Modal");
      expect(title).toHaveClass("text-lg", "font-semibold");
    });

    it("handles long titles", () => {
      const longTitle = "A".repeat(100);
      render(<InlineFormModal {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles special characters in title", () => {
      render(<InlineFormModal {...defaultProps} title="Title & Special <>" />);
      expect(screen.getByText("Title & Special <>")).toBeInTheDocument();
    });
  });

  describe("Children Content", () => {
    it("renders simple text children", () => {
      render(
        <InlineFormModal {...defaultProps}>
          <p>Simple text</p>
        </InlineFormModal>
      );
      expect(screen.getByText("Simple text")).toBeInTheDocument();
    });

    it("renders complex children", () => {
      render(
        <InlineFormModal {...defaultProps}>
          <div>
            <h1>Heading</h1>
            <p>Paragraph</p>
            <button>Button</button>
          </div>
        </InlineFormModal>
      );
      expect(screen.getByText("Heading")).toBeInTheDocument();
      expect(screen.getByText("Paragraph")).toBeInTheDocument();
      expect(screen.getByText("Button")).toBeInTheDocument();
    });

    it("renders form elements", () => {
      render(
        <InlineFormModal {...defaultProps}>
          <form>
            <input type="text" placeholder="Input field" />
            <textarea placeholder="Text area" />
          </form>
        </InlineFormModal>
      );
      expect(screen.getByPlaceholderText("Input field")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Text area")).toBeInTheDocument();
    });

    it("renders multiple children", () => {
      render(
        <InlineFormModal {...defaultProps}>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </InlineFormModal>
      );
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it("renders close button", () => {
      render(<InlineFormModal {...defaultProps} />);
      const closeButtons = screen.getAllByLabelText("Close modal");
      const buttonElement = closeButtons.find((el) => el.tagName === "BUTTON");
      expect(buttonElement).toBeInTheDocument();
    });

    it("close button has X icon", () => {
      render(<InlineFormModal {...defaultProps} />);
      const xIcon = screen.getByTestId("x-icon");
      expect(xIcon).toBeInTheDocument();
    });

    it("calls onClose when close button clicked", () => {
      const onClose = jest.fn();
      render(<InlineFormModal {...defaultProps} onClose={onClose} />);

      const closeElements = screen.getAllByLabelText("Close modal");
      const closeButton = closeElements.find((el) => el.tagName === "BUTTON");
      fireEvent.click(closeButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when backdrop clicked", () => {
      const onClose = jest.fn();
      render(<InlineFormModal {...defaultProps} onClose={onClose} />);

      const closeElements = screen.getAllByLabelText("Close modal");
      const backdrop = closeElements.find((el) => el.tagName === "DIV");
      fireEvent.click(backdrop!);

      expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose on Escape key", () => {
      const onClose = jest.fn();
      render(<InlineFormModal {...defaultProps} onClose={onClose} />);

      const closeElements = screen.getAllByLabelText("Close modal");
      const backdrop = closeElements.find((el) => el.tagName === "DIV");
      fireEvent.keyDown(backdrop!, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose on other keys", () => {
      const onClose = jest.fn();
      render(<InlineFormModal {...defaultProps} onClose={onClose} />);

      const closeElements = screen.getAllByLabelText("Close modal");
      const backdrop = closeElements.find((el) => el.tagName === "DIV");
      fireEvent.keyDown(backdrop!, { key: "Enter" });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Size Variants", () => {
    it("renders with default size (md)", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("max-w-2xl");
    });

    it("renders with small size", () => {
      const { container } = render(
        <InlineFormModal {...defaultProps} size="sm" />
      );
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("max-w-md");
    });

    it("renders with medium size", () => {
      const { container } = render(
        <InlineFormModal {...defaultProps} size="md" />
      );
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("max-w-2xl");
    });

    it("renders with large size", () => {
      const { container } = render(
        <InlineFormModal {...defaultProps} size="lg" />
      );
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("max-w-4xl");
    });

    it("renders with extra large size", () => {
      const { container } = render(
        <InlineFormModal {...defaultProps} size="xl" />
      );
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("max-w-6xl");
    });
  });

  describe("Accessibility", () => {
    it("has role='dialog'", () => {
      render(<InlineFormModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has aria-modal='true'", () => {
      render(<InlineFormModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("has aria-labelledby pointing to title", () => {
      render(<InlineFormModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "inline-modal-title");
    });

    it("close button has aria-label", () => {
      render(<InlineFormModal {...defaultProps} />);
      const closeButtons = screen.getAllByLabelText("Close modal");
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it("backdrop is focusable", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const backdrop = container.querySelector('[role="button"]');
      expect(backdrop).toHaveAttribute("tabIndex", "-1");
    });

    it("backdrop has role='button'", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const backdrop = container.querySelector('[role="button"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("backdrop has proper opacity classes", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black");
      expect(backdrop).toHaveClass("bg-opacity-50");
    });

    it("modal has rounded corners", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("rounded-lg");
    });

    it("modal has shadow", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("shadow-xl");
    });

    it("header has border", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const header = container.querySelector(".border-b");
      expect(header).toBeInTheDocument();
    });

    it("close button has hover styles", () => {
      render(<InlineFormModal {...defaultProps} />);
      const closeElements = screen.getAllByLabelText("Close modal");
      const closeButton = closeElements.find((el) => el.tagName === "BUTTON");
      expect(closeButton?.className).toContain("hover:bg-gray-100");
    });
  });

  describe("Dark Mode", () => {
    it("modal has dark mode background", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const modal = container.querySelector('[role="dialog"]');
      expect(modal?.className).toContain("dark:bg-gray-800");
    });

    it("header has dark mode border", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const header = container.querySelector(".border-b");
      expect(header?.className).toContain("dark:border-gray-700");
    });

    it("title has dark mode text color", () => {
      render(<InlineFormModal {...defaultProps} />);
      const title = screen.getByText("Test Modal");
      expect(title.className).toContain("dark:text-white");
    });

    it("close button has dark mode hover", () => {
      render(<InlineFormModal {...defaultProps} />);
      const closeElements = screen.getAllByLabelText("Close modal");
      const closeButton = closeElements.find((el) => el.tagName === "BUTTON");
      expect(closeButton?.className).toContain("dark:hover:bg-gray-700");
    });

    it("close button has dark mode text color", () => {
      render(<InlineFormModal {...defaultProps} />);
      const closeElements = screen.getAllByLabelText("Close modal");
      const closeButton = closeElements.find((el) => el.tagName === "BUTTON");
      expect(closeButton?.className).toContain("dark:text-gray-500");
    });
  });

  describe("Layout", () => {
    it("uses fixed positioning", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const wrapper = container.querySelector(".fixed");
      expect(wrapper).toHaveClass("inset-0");
    });

    it("centers modal on screen", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const flex = container.querySelector(".flex");
      expect(flex).toHaveClass(
        "min-h-screen",
        "items-center",
        "justify-center"
      );
    });

    it("has proper z-index", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const wrapper = container.querySelector(".z-50");
      expect(wrapper).toBeInTheDocument();
    });

    it("allows scrolling when content overflows", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const wrapper = container.querySelector(".overflow-y-auto");
      expect(wrapper).toBeInTheDocument();
    });

    it("has padding around modal", () => {
      const { container } = render(<InlineFormModal {...defaultProps} />);
      const flex = container.querySelector(".p-4");
      expect(flex).toBeInTheDocument();
    });
  });

  describe("State Changes", () => {
    it("opens when isOpen changes to true", () => {
      const { rerender } = render(
        <InlineFormModal {...defaultProps} isOpen={false} />
      );
      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();

      rerender(<InlineFormModal {...defaultProps} isOpen={true} />);
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });

    it("closes when isOpen changes to false", () => {
      const { rerender } = render(
        <InlineFormModal {...defaultProps} isOpen={true} />
      );
      expect(screen.getByText("Test Modal")).toBeInTheDocument();

      rerender(<InlineFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    });

    it("updates content when children change", () => {
      const { rerender } = render(
        <InlineFormModal {...defaultProps}>
          <div>Original</div>
        </InlineFormModal>
      );
      expect(screen.getByText("Original")).toBeInTheDocument();

      rerender(
        <InlineFormModal {...defaultProps}>
          <div>Updated</div>
        </InlineFormModal>
      );
      expect(screen.getByText("Updated")).toBeInTheDocument();
      expect(screen.queryByText("Original")).not.toBeInTheDocument();
    });

    it("updates title when prop changes", () => {
      const { rerender } = render(
        <InlineFormModal {...defaultProps} title="First Title" />
      );
      expect(screen.getByText("First Title")).toBeInTheDocument();

      rerender(<InlineFormModal {...defaultProps} title="Second Title" />);
      expect(screen.getByText("Second Title")).toBeInTheDocument();
      expect(screen.queryByText("First Title")).not.toBeInTheDocument();
    });

    it("updates size when prop changes", () => {
      const { container, rerender } = render(
        <InlineFormModal {...defaultProps} size="sm" />
      );
      let modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("max-w-md");

      rerender(<InlineFormModal {...defaultProps} size="xl" />);
      modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass("max-w-6xl");
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid open/close cycles", () => {
      const { rerender } = render(
        <InlineFormModal {...defaultProps} isOpen={false} />
      );

      for (let i = 0; i < 10; i++) {
        rerender(<InlineFormModal {...defaultProps} isOpen={i % 2 === 0} />);
      }

      // After 10 iterations (0-9), i=10 which is even, so last state should be open (isOpen=true when i=9 is odd=false, then loop ends)
      // Actually the loop ends with i=9 (odd), so isOpen=false. Modal should not be visible.
      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    });

    it("handles empty children", () => {
      render(<InlineFormModal {...defaultProps}>{null}</InlineFormModal>);
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });

    it("handles empty string title", () => {
      render(<InlineFormModal {...defaultProps} title="" />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("handles multiple close button clicks", () => {
      const onClose = jest.fn();
      render(<InlineFormModal {...defaultProps} onClose={onClose} />);

      const closeElements = screen.getAllByLabelText("Close modal");
      const closeButton = closeElements.find((el) => el.tagName === "BUTTON");
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);

      expect(onClose).toHaveBeenCalledTimes(3);
    });
  });

  describe("Multiple Instances", () => {
    it("can render multiple modals", () => {
      render(
        <>
          <InlineFormModal isOpen={true} onClose={jest.fn()} title="Modal 1">
            <div>Content 1</div>
          </InlineFormModal>
          <InlineFormModal isOpen={true} onClose={jest.fn()} title="Modal 2">
            <div>Content 2</div>
          </InlineFormModal>
        </>
      );

      expect(screen.getByText("Modal 1")).toBeInTheDocument();
      expect(screen.getByText("Modal 2")).toBeInTheDocument();
    });

    it("each modal has independent close handler", () => {
      const onClose1 = jest.fn();
      const onClose2 = jest.fn();

      render(
        <>
          <InlineFormModal isOpen={true} onClose={onClose1} title="Modal 1">
            <div>Content 1</div>
          </InlineFormModal>
          <InlineFormModal isOpen={true} onClose={onClose2} title="Modal 2">
            <div>Content 2</div>
          </InlineFormModal>
        </>
      );

      const closeButtons = screen.getAllByLabelText("Close modal");
      fireEvent.click(closeButtons[0]);

      expect(onClose1).toHaveBeenCalled();
      expect(onClose2).not.toHaveBeenCalled();
    });
  });
});
