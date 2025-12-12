import { fireEvent, render, screen } from "@testing-library/react";
import { FormModal } from "../FormModal";

describe("FormModal Component", () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: "Test Modal",
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    document.body.style.overflow = "unset";
  });

  describe("Basic Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<FormModal {...defaultProps} />);
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal content")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<FormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    });

    it("should render title", () => {
      render(<FormModal {...defaultProps} title="Custom Title" />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(<FormModal {...defaultProps}>{<p>Custom content</p>}</FormModal>);
      expect(screen.getByText("Custom content")).toBeInTheDocument();
    });

    it("should render with default size md", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const modal = container.querySelector(".max-w-lg");
      expect(modal).toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("should render with size sm", () => {
      const { container } = render(<FormModal {...defaultProps} size="sm" />);
      const modal = container.querySelector(".max-w-md");
      expect(modal).toBeInTheDocument();
    });

    it("should render with size md", () => {
      const { container } = render(<FormModal {...defaultProps} size="md" />);
      const modal = container.querySelector(".max-w-lg");
      expect(modal).toBeInTheDocument();
    });

    it("should render with size lg", () => {
      const { container } = render(<FormModal {...defaultProps} size="lg" />);
      const modal = container.querySelector(".max-w-2xl");
      expect(modal).toBeInTheDocument();
    });

    it("should render with size xl", () => {
      const { container } = render(<FormModal {...defaultProps} size="xl" />);
      const modal = container.querySelector(".max-w-4xl");
      expect(modal).toBeInTheDocument();
    });

    it("should render with size full", () => {
      const { container } = render(<FormModal {...defaultProps} size="full" />);
      const modal = container.querySelector(".max-w-7xl");
      expect(modal).toBeInTheDocument();
    });
  });

  describe("Close Button", () => {
    it("should render close button by default", () => {
      render(<FormModal {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close modal");
      expect(closeButton).toBeInTheDocument();
    });

    it("should hide close button when showCloseButton is false", () => {
      render(<FormModal {...defaultProps} showCloseButton={false} />);
      const closeButton = screen.queryByLabelText("Close modal");
      expect(closeButton).not.toBeInTheDocument();
    });

    it("should call onClose when close button clicked", () => {
      render(<FormModal {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close modal");
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should render SVG icon in close button", () => {
      render(<FormModal {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close modal");
      const svg = closeButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Backdrop Interaction", () => {
    it("should render backdrop", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black.bg-opacity-50");
      expect(backdrop).toBeInTheDocument();
    });

    it("should call onClose when backdrop clicked", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black.bg-opacity-50");
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have role=button on backdrop", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black.bg-opacity-50");
      expect(backdrop).toHaveAttribute("role", "button");
    });

    it("should have tabIndex=-1 on backdrop", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black.bg-opacity-50");
      expect(backdrop).toHaveAttribute("tabIndex", "-1");
    });

    it("should have aria-label on backdrop", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black.bg-opacity-50");
      expect(backdrop).toHaveAttribute("aria-label", "Close modal");
    });

    it("should call onClose when Escape pressed on backdrop", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black.bg-opacity-50");
      fireEvent.keyDown(backdrop!, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Keyboard Interaction", () => {
    it("should close modal when Escape key pressed", () => {
      render(<FormModal {...defaultProps} />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not close modal when other keys pressed", () => {
      render(<FormModal {...defaultProps} />);
      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: "Tab" });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should add escape listener when modal opens", () => {
      const addEventListenerSpy = jest.spyOn(document, "addEventListener");
      render(<FormModal {...defaultProps} isOpen={true} />);
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });

    it("should remove escape listener when modal closes", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener"
      );
      const { rerender } = render(
        <FormModal {...defaultProps} isOpen={true} />
      );
      rerender(<FormModal {...defaultProps} isOpen={false} />);
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });

    it("should cleanup listeners on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener"
      );
      const { unmount } = render(<FormModal {...defaultProps} isOpen={true} />);
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });
  });

  describe("Body Scroll Lock", () => {
    it("should lock body scroll when modal opens", () => {
      render(<FormModal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should unlock body scroll when modal closes", () => {
      const { rerender } = render(
        <FormModal {...defaultProps} isOpen={true} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<FormModal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("unset");
    });

    it("should unlock body scroll on unmount", () => {
      const { unmount } = render(<FormModal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("unset");
    });

    it("should handle rapid open/close", () => {
      const { rerender } = render(
        <FormModal {...defaultProps} isOpen={false} />
      );

      rerender(<FormModal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<FormModal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("unset");
    });
  });

  describe("Accessibility", () => {
    it("should have role=dialog", () => {
      render(<FormModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should have aria-modal=true", () => {
      render(<FormModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby pointing to title", () => {
      render(<FormModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    });

    it("should have id on title matching aria-labelledby", () => {
      render(<FormModal {...defaultProps} />);
      const title = screen.getByText("Test Modal");
      expect(title).toHaveAttribute("id", "modal-title");
    });

    it("should have aria-label on close button", () => {
      render(<FormModal {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close modal");
      expect(closeButton).toHaveAttribute("aria-label", "Close modal");
    });
  });

  describe("Layout and Positioning", () => {
    it("should have fixed positioning covering full viewport", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const wrapper = container.querySelector(".fixed.inset-0");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have z-50 for layering", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const wrapper = container.querySelector(".z-50");
      expect(wrapper).toBeInTheDocument();
    });

    it("should make content scrollable", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const wrapper = container.querySelector(".overflow-y-auto");
      expect(wrapper).toBeInTheDocument();
    });

    it("should center modal vertically and horizontally", () => {
      const { container } = render(<FormModal {...defaultProps} />);
      const centerer = container.querySelector(
        ".flex.min-h-full.items-center.justify-center"
      );
      expect(centerer).toBeInTheDocument();
    });
  });

  describe("Header Styling", () => {
    it("should have border bottom on header", () => {
      render(<FormModal {...defaultProps} />);
      const header = screen.getByText("Test Modal").closest("div");
      expect(header).toHaveClass(
        "border-b",
        "border-gray-200",
        "dark:border-gray-700"
      );
    });

    it("should apply padding to header", () => {
      render(<FormModal {...defaultProps} />);
      const header = screen.getByText("Test Modal").closest("div");
      expect(header).toHaveClass("p-6");
    });

    it("should style title as semibold", () => {
      render(<FormModal {...defaultProps} />);
      const title = screen.getByText("Test Modal");
      expect(title).toHaveClass("text-xl", "font-semibold");
    });
  });

  describe("Dark Mode Support", () => {
    it("should apply dark mode classes to modal", () => {
      render(<FormModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("dark:bg-gray-800");
    });

    it("should apply dark mode classes to title", () => {
      render(<FormModal {...defaultProps} />);
      const title = screen.getByText("Test Modal");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should apply dark mode classes to header border", () => {
      render(<FormModal {...defaultProps} />);
      const header = screen.getByText("Test Modal").closest("div");
      expect(header).toHaveClass("dark:border-gray-700");
    });

    it("should apply dark mode classes to close button", () => {
      render(<FormModal {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close modal");
      expect(closeButton).toHaveClass(
        "dark:text-gray-500",
        "dark:hover:text-gray-300"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      render(<FormModal {...defaultProps} title="" />);
      const title = screen.getByText("");
      expect(title).toBeInTheDocument();
    });

    it("should handle null children", () => {
      render(<FormModal {...defaultProps}>{null}</FormModal>);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should handle complex children", () => {
      const complexChildren = (
        <div>
          <h3>Section 1</h3>
          <p>Content 1</p>
          <button>Action</button>
        </div>
      );
      render(<FormModal {...defaultProps}>{complexChildren}</FormModal>);
      expect(screen.getByText("Section 1")).toBeInTheDocument();
      expect(screen.getByText("Content 1")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    it("should not throw when clicking modal content", () => {
      render(<FormModal {...defaultProps} />);
      const content = screen.getByText("Modal content");
      expect(() => fireEvent.click(content)).not.toThrow();
    });

    it("should handle multiple close attempts", () => {
      render(<FormModal {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close modal");

      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe("Multiple Modals", () => {
    it("should support multiple modals independently", () => {
      const mockOnClose1 = jest.fn();
      const mockOnClose2 = jest.fn();

      render(
        <div>
          <FormModal isOpen={true} onClose={mockOnClose1} title="Modal 1">
            Content 1
          </FormModal>
          <FormModal isOpen={true} onClose={mockOnClose2} title="Modal 2">
            Content 2
          </FormModal>
        </div>
      );

      expect(screen.getByText("Modal 1")).toBeInTheDocument();
      expect(screen.getByText("Modal 2")).toBeInTheDocument();
    });
  });

  describe("Content Rendering", () => {
    it("should render form elements in children", () => {
      const formContent = (
        <form>
          <input type="text" placeholder="Name" />
          <textarea placeholder="Description" />
          <button type="submit">Submit</button>
        </form>
      );
      render(<FormModal {...defaultProps}>{formContent}</FormModal>);

      expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it("should render long scrollable content", () => {
      const longContent = (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <p key={i}>Line {i}</p>
          ))}
        </div>
      );
      render(<FormModal {...defaultProps}>{longContent}</FormModal>);

      expect(screen.getByText("Line 0")).toBeInTheDocument();
      expect(screen.getByText("Line 99")).toBeInTheDocument();
    });
  });

  describe("State Changes", () => {
    it("should update when title changes", () => {
      const { rerender } = render(
        <FormModal {...defaultProps} title="Title 1" />
      );
      expect(screen.getByText("Title 1")).toBeInTheDocument();

      rerender(<FormModal {...defaultProps} title="Title 2" />);
      expect(screen.getByText("Title 2")).toBeInTheDocument();
    });

    it("should update when children change", () => {
      const { rerender } = render(
        <FormModal {...defaultProps}>Content 1</FormModal>
      );
      expect(screen.getByText("Content 1")).toBeInTheDocument();

      rerender(<FormModal {...defaultProps}>Content 2</FormModal>);
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });

    it("should update when size changes", () => {
      const { container, rerender } = render(
        <FormModal {...defaultProps} size="sm" />
      );
      expect(container.querySelector(".max-w-md")).toBeInTheDocument();

      rerender(<FormModal {...defaultProps} size="xl" />);
      expect(container.querySelector(".max-w-4xl")).toBeInTheDocument();
    });

    it("should update when showCloseButton changes", () => {
      const { rerender } = render(
        <FormModal {...defaultProps} showCloseButton={true} />
      );
      expect(screen.getByLabelText("Close modal")).toBeInTheDocument();

      rerender(<FormModal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByLabelText("Close modal")).not.toBeInTheDocument();
    });
  });
});
