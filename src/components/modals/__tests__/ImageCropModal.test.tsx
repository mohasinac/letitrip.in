import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ImageCropModal } from "../ImageCropModal";
import { UI_LABELS } from "@/constants";

// Mock the Modal and Button components to avoid circular dependencies
jest.mock("@/components/feedback/Modal", () => ({
  __esModule: true,
  default: ({ isOpen, children, title }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <div>{children}</div>
      </div>
    ) : null,
}));

jest.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} data-variant={variant} className={className}>
      {children}
    </button>
  ),
}));

describe("ImageCropModal", () => {
  const mockImageUrl = "https://example.com/test-image.jpg";
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders when isOpen is true", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText(UI_LABELS.AVATAR.TITLE)).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(
        <ImageCropModal
          isOpen={false}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("displays the instruction text", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(
        screen.getByText(UI_LABELS.AVATAR.INSTRUCTION),
      ).toBeInTheDocument();
    });

    it("displays zoom control label", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByText(UI_LABELS.AVATAR.ZOOM)).toBeInTheDocument();
    });

    it("displays the image preview", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const img = screen.getByAltText(UI_LABELS.AVATAR.ALT_PREVIEW);
      expect(img).toHaveAttribute("src", mockImageUrl);
    });
  });

  describe("Initial Crop Data", () => {
    it("uses default zoom and position when not provided", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // Zoom label and percentage are siblings
      expect(screen.getByText(UI_LABELS.AVATAR.ZOOM)).toBeInTheDocument();
      // The zoom percentage is right after the label
      const zoomSection = screen.getByText(UI_LABELS.AVATAR.ZOOM).parentElement;
      expect(zoomSection).toHaveTextContent("100%");
    });

    it("uses provided initial crop data", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialCropData={{
            url: mockImageUrl,
            position: { x: 30, y: 70 },
            zoom: 1.5,
          }}
        />,
      );

      const zoomSection = screen.getByText(UI_LABELS.AVATAR.ZOOM).parentElement;
      expect(zoomSection).toHaveTextContent("150%");
    });
  });

  describe("Zoom Controls", () => {
    it("displays current zoom percentage", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const zoomSection = screen.getByText(UI_LABELS.AVATAR.ZOOM).parentElement;
      expect(zoomSection).toHaveTextContent("100%");
    });

    it("updates zoom with slider", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "1.8" } });

      const zoomSection = screen.getByText(UI_LABELS.AVATAR.ZOOM).parentElement;
      expect(zoomSection).toHaveTextContent("180%");
    });

    it("has zoom in button with correct aria label", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const zoomInBtn = screen.getByLabelText(UI_LABELS.AVATAR.ZOOM_IN);
      expect(zoomInBtn).toBeInTheDocument();
    });

    it("has zoom out button with correct aria label", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const zoomOutBtn = screen.getByLabelText(UI_LABELS.AVATAR.ZOOM_OUT);
      expect(zoomOutBtn).toBeInTheDocument();
    });

    it("increases zoom when zoom in button is clicked", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const zoomInBtn = screen.getByLabelText(UI_LABELS.AVATAR.ZOOM_IN);
      fireEvent.click(zoomInBtn);

      const zoomSection = screen.getByText(UI_LABELS.AVATAR.ZOOM).parentElement;
      expect(zoomSection).toHaveTextContent("110%");
    });

    it("decreases zoom when zoom out button is clicked", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const zoomOutBtn = screen.getByLabelText(UI_LABELS.AVATAR.ZOOM_OUT);
      fireEvent.click(zoomOutBtn);

      expect(screen.getByText("90%")).toBeInTheDocument();
    });

    it("does not zoom below minimum (0.1)", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialCropData={{
            url: mockImageUrl,
            position: { x: 50, y: 50 },
            zoom: 0.15,
          }}
        />,
      );

      const zoomOutBtn = screen.getByLabelText(UI_LABELS.AVATAR.ZOOM_OUT);
      fireEvent.click(zoomOutBtn);

      expect(screen.getByText("10%")).toBeInTheDocument(); // Should stay at 0.1 minimum
    });

    it("does not zoom above maximum (3.0)", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialCropData={{
            url: mockImageUrl,
            position: { x: 50, y: 50 },
            zoom: 2.95,
          }}
        />,
      );

      const zoomInBtn = screen.getByLabelText(UI_LABELS.AVATAR.ZOOM_IN);
      fireEvent.click(zoomInBtn);

      expect(screen.getByText("300%")).toBeInTheDocument(); // Should stay at 3.0 maximum
    });

    it("displays zoom preset buttons", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // Use getAllByText since there might be multiple "100%" (one in display, one in button)
      expect(screen.getAllByText("50%").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("100%").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("150%").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("200%").length).toBeGreaterThanOrEqual(1);
    });

    it("sets zoom to preset value when preset button is clicked", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // Find and click the 150% preset button (not the display)
      const preset150Buttons = screen.getAllByText("150%");
      const preset150Button = preset150Buttons.find((el) =>
        el.closest("button"),
      );
      if (preset150Button) fireEvent.click(preset150Button.closest("button")!);

      // Should now show 150% in the zoom display
      const zoomSection = screen.getByText(UI_LABELS.AVATAR.ZOOM).parentElement;
      expect(zoomSection).toHaveTextContent("150%");
    });
  });

  describe("Zoom Warning", () => {
    it("shows warning when zoom is below 0.5", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialCropData={{
            url: mockImageUrl,
            position: { x: 50, y: 50 },
            zoom: 0.4,
          }}
        />,
      );

      expect(
        screen.getByText(UI_LABELS.AVATAR.ZOOM_WARNING_TITLE),
      ).toBeInTheDocument();
      expect(
        screen.getByText(UI_LABELS.AVATAR.ZOOM_WARNING_MESSAGE),
      ).toBeInTheDocument();
    });

    it("does not show warning when zoom is 0.5 or above", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialCropData={{
            url: mockImageUrl,
            position: { x: 50, y: 50 },
            zoom: 0.5,
          }}
        />,
      );

      expect(
        screen.queryByText(UI_LABELS.AVATAR.ZOOM_WARNING_TITLE),
      ).not.toBeInTheDocument();
    });
  });

  describe("Position Display", () => {
    it("displays current position coordinates", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByText(/Position: 50%, 50%/)).toBeInTheDocument();
    });

    it("displays reset button", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByText(UI_LABELS.AVATAR.RESET)).toBeInTheDocument();
    });

    it("resets position and zoom when reset button is clicked", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialCropData={{
            url: mockImageUrl,
            position: { x: 30, y: 70 },
            zoom: 2,
          }}
        />,
      );

      const resetBtn = screen.getByText(UI_LABELS.AVATAR.RESET);
      fireEvent.click(resetBtn);

      // Check zoom was reset to 100%
      const zoomSection = screen.getByText(UI_LABELS.AVATAR.ZOOM).parentElement;
      expect(zoomSection).toHaveTextContent("100%");
      expect(screen.getByText(/Position: 50%, 50%/)).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("displays save and cancel buttons", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(
        screen.getByText(UI_LABELS.AVATAR.SAVE_CHANGES),
      ).toBeInTheDocument();
      expect(screen.getByText(UI_LABELS.ACTIONS.CANCEL)).toBeInTheDocument();
    });

    it("calls onSave with crop data when save button is clicked", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const saveBtn = screen.getByText(UI_LABELS.AVATAR.SAVE_CHANGES);
      fireEvent.click(saveBtn);

      expect(mockOnSave).toHaveBeenCalledWith({
        url: mockImageUrl,
        position: { x: 50, y: 50 },
        zoom: 1,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when cancel button is clicked", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const cancelBtn = screen.getByText(UI_LABELS.ACTIONS.CANCEL);
      fireEvent.click(cancelBtn);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("saves current zoom and position values", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // Change zoom
      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "1.5" } });

      // Save
      const saveBtn = screen.getByText(UI_LABELS.AVATAR.SAVE_CHANGES);
      fireEvent.click(saveBtn);

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          zoom: 1.5,
        }),
      );
    });
  });

  describe("Image Display", () => {
    it("makes image non-draggable", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const img = screen.getByAltText(UI_LABELS.AVATAR.ALT_PREVIEW);
      expect(img).toHaveAttribute("draggable", "false");
    });

    it("makes image non-selectable", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const img = screen.getByAltText(UI_LABELS.AVATAR.ALT_PREVIEW);
      expect(img).toHaveClass("select-none");
    });

    it("makes image pointer-events-none", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const img = screen.getByAltText(UI_LABELS.AVATAR.ALT_PREVIEW);
      expect(img).toHaveClass("pointer-events-none");
    });
  });

  describe("Compact Layout", () => {
    it("uses compact text sizing (text-xs)", () => {
      const { container } = render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // Check for text-xs class in instruction text
      const instruction = screen.getByText(UI_LABELS.AVATAR.INSTRUCTION);
      expect(instruction).toHaveClass("text-xs");
    });

    it("uses compact spacing (space-y-3)", () => {
      const { container } = render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // Check for space-y-3 in main container
      const mainContainer = container.querySelector(".space-y-3");
      expect(mainContainer).toBeInTheDocument();
    });

    it("uses compact button spacing (gap-2)", () => {
      const { container } = render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // Check for gap-2 in button container
      const buttonContainer = container.querySelector(".gap-2.pt-2");
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has accessible zoom slider", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("min", "0.1");
      expect(slider).toHaveAttribute("max", "3");
      expect(slider).toHaveAttribute("step", "0.01");
    });

    it("provides aria labels for zoom buttons", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(
        screen.getByLabelText(UI_LABELS.AVATAR.ZOOM_IN),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(UI_LABELS.AVATAR.ZOOM_OUT),
      ).toBeInTheDocument();
    });

    it("provides alt text for preview image", () => {
      render(
        <ImageCropModal
          isOpen={true}
          imageUrl={mockImageUrl}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const img = screen.getByAltText(UI_LABELS.AVATAR.ALT_PREVIEW);
      expect(img).toBeInTheDocument();
    });
  });
});
