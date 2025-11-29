import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileBottomSheet } from "./MobileBottomSheet";

describe("MobileBottomSheet", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders nothing when closed", () => {
    render(
      <MobileBottomSheet isOpen={false} onClose={mockOnClose}>
        <div>Content</div>
      </MobileBottomSheet>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <MobileBottomSheet isOpen={true} onClose={mockOnClose} title="Test Sheet">
        <div>Sheet Content</div>
      </MobileBottomSheet>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Sheet")).toBeInTheDocument();
    expect(screen.getByText("Sheet Content")).toBeInTheDocument();
  });

  it("renders close button when showCloseButton is true", () => {
    render(
      <MobileBottomSheet
        isOpen={true}
        onClose={mockOnClose}
        showCloseButton={true}
      >
        <div>Content</div>
      </MobileBottomSheet>,
    );

    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    render(
      <MobileBottomSheet
        isOpen={true}
        onClose={mockOnClose}
        showCloseButton={true}
      >
        <div>Content</div>
      </MobileBottomSheet>,
    );

    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", async () => {
    render(
      <MobileBottomSheet isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </MobileBottomSheet>,
    );

    // Click the overlay (first element with aria-hidden)
    const overlay = document.querySelector('[aria-hidden="true"]');
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders handle when showHandle is true", () => {
    render(
      <MobileBottomSheet isOpen={true} onClose={mockOnClose} showHandle={true}>
        <div>Content</div>
      </MobileBottomSheet>,
    );

    // Handle is a div with specific styling
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector(".w-12.h-1\\.5")).toBeInTheDocument();
  });

  it("locks body scroll when open", () => {
    const { rerender } = render(
      <MobileBottomSheet isOpen={false} onClose={mockOnClose}>
        <div>Content</div>
      </MobileBottomSheet>,
    );

    expect(document.body.style.overflow).not.toBe("hidden");

    rerender(
      <MobileBottomSheet isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </MobileBottomSheet>,
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { unmount } = render(
      <MobileBottomSheet isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </MobileBottomSheet>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("has proper aria attributes", () => {
    render(
      <MobileBottomSheet
        isOpen={true}
        onClose={mockOnClose}
        title="Accessible Sheet"
      >
        <div>Content</div>
      </MobileBottomSheet>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });
});
