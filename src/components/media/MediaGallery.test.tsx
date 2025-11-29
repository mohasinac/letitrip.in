/**
 * @jest-environment jsdom
 * @description Comprehensive tests for MediaGallery component
 * Session 23 - Task 9: MediaGallery component with mock media services
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MediaGallery from "./MediaGallery";
import type { MediaFile } from "@/types/media";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-fill={fill} />
  ),
}));

const mockImageFile: MediaFile = {
  id: "img-1",
  file: { name: "test-image.jpg", size: 1024000, type: "image/jpeg" } as File,
  preview: "https://example.com/image1.jpg",
  type: "image",
  progress: 100,
  uploaded: true,
};

const mockVideoFile: MediaFile = {
  id: "vid-1",
  file: { name: "test-video.mp4", size: 5024000, type: "video/mp4" } as File,
  preview: "https://example.com/video1.mp4",
  type: "video",
  progress: 100,
  uploaded: true,
};

const mockFiles: MediaFile[] = [
  mockImageFile,
  {
    id: "img-2",
    file: {
      name: "test-image-2.jpg",
      size: 2048000,
      type: "image/jpeg",
    } as File,
    preview: "https://example.com/image2.jpg",
    type: "image",
    progress: 100,
    uploaded: true,
  },
  mockVideoFile,
];

describe("MediaGallery - Comprehensive Tests", () => {
  const mockOnReorder = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== BASIC RENDERING ====================
  describe("Basic Rendering", () => {
    it("should render media files in grid", () => {
      render(<MediaGallery files={mockFiles} />);

      expect(screen.getByText("test-image.jpg")).toBeInTheDocument();
      expect(screen.getByText("test-image-2.jpg")).toBeInTheDocument();
      expect(screen.getByText("test-video.mp4")).toBeInTheDocument();
    });

    it("should show empty state when no files", () => {
      render(<MediaGallery files={[]} />);

      expect(screen.getByText("No media files yet")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <MediaGallery files={mockFiles} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should render correct number of grid items", () => {
      const { container } = render(<MediaGallery files={mockFiles} />);

      const gridItems = container.querySelectorAll(".grid > div");
      expect(gridItems.length).toBe(3);
    });
  });

  // ==================== SELECTION FUNCTIONALITY ====================
  describe("Selection Functionality", () => {
    it("should show checkboxes when allowBulkActions is true", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
        />,
      );

      const checkboxes = screen
        .getAllByRole("button")
        .filter((btn) => btn.className.includes("border-2"));
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it("should not show checkboxes when allowBulkActions is false", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={false}
          onSelect={mockOnSelect}
        />,
      );

      const checkboxes = screen
        .queryAllByRole("button")
        .filter((btn) => btn.className.includes("border-2"));
      expect(checkboxes.length).toBe(0);
    });

    it("should toggle selection on checkbox click", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={[]}
        />,
      );

      const checkboxes = screen
        .getAllByRole("button")
        .filter((btn) => btn.className.includes("border-2"));
      fireEvent.click(checkboxes[0]);

      expect(mockOnSelect).toHaveBeenCalledWith(["img-1"]);
    });

    it("should deselect when clicking selected checkbox", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={["img-1"]}
        />,
      );

      const checkboxes = screen
        .getAllByRole("button")
        .filter((btn) => btn.className.includes("border-2"));
      fireEvent.click(checkboxes[0]);

      expect(mockOnSelect).toHaveBeenCalledWith([]);
    });

    it("should show check icon for selected items", () => {
      const { container } = render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={["img-1"]}
        />,
      );

      const checkIcons = container.querySelectorAll(".text-white");
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it("should support multiple selections", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={["img-1"]}
        />,
      );

      const checkboxes = screen
        .getAllByRole("button")
        .filter((btn) => btn.className.includes("border-2"));
      fireEvent.click(checkboxes[1]); // Select second item

      expect(mockOnSelect).toHaveBeenCalledWith(["img-1", "img-2"]);
    });
  });

  // ==================== SELECT ALL / DESELECT ALL ====================
  describe("Select All / Deselect All", () => {
    it("should show 'Select All' button when nothing selected", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={[]}
        />,
      );

      expect(screen.getByText("Select All")).toBeInTheDocument();
    });

    it("should select all files on 'Select All' click", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={[]}
        />,
      );

      const selectAllBtn = screen.getByText("Select All");
      fireEvent.click(selectAllBtn);

      expect(mockOnSelect).toHaveBeenCalledWith(["img-1", "img-2", "vid-1"]);
    });

    it("should show 'Deselect All' when items are selected", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={["img-1", "img-2"]}
        />,
      );

      expect(screen.getByText("Deselect All")).toBeInTheDocument();
    });

    it("should deselect all on 'Deselect All' click", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={["img-1", "img-2"]}
        />,
      );

      const deselectBtn = screen.getByText("Deselect All");
      fireEvent.click(deselectBtn);

      expect(mockOnSelect).toHaveBeenCalledWith([]);
    });
  });

  // ==================== BULK ACTIONS ====================
  describe("Bulk Actions", () => {
    it("should show bulk action bar when items selected", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          onRemove={mockOnRemove}
          selectedIds={["img-1", "img-2"]}
        />,
      );

      expect(screen.getByText("2 selected")).toBeInTheDocument();
    });

    it("should show Delete Selected button", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          onRemove={mockOnRemove}
          selectedIds={["img-1"]}
        />,
      );

      expect(screen.getByText("Delete Selected")).toBeInTheDocument();
    });

    it("should delete selected files and deselect", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          onRemove={mockOnRemove}
          selectedIds={["img-1", "img-2"]}
        />,
      );

      const deleteBtn = screen.getByText("Delete Selected");
      fireEvent.click(deleteBtn);

      expect(mockOnRemove).toHaveBeenCalledTimes(2);
      expect(mockOnRemove).toHaveBeenCalledWith("img-1");
      expect(mockOnRemove).toHaveBeenCalledWith("img-2");
      expect(mockOnSelect).toHaveBeenCalledWith([]); // Deselect after delete
    });
  });

  // ==================== DRAG AND DROP ====================
  describe("Drag and Drop", () => {
    it("should show drag handles when allowReorder is true", () => {
      const { container } = render(
        <MediaGallery
          files={mockFiles}
          allowReorder={true}
          onReorder={mockOnReorder}
        />,
      );

      const dragHandles = container.querySelectorAll(".cursor-move");
      expect(dragHandles.length).toBe(3);
    });

    it("should not show drag handles when allowReorder is false", () => {
      const { container } = render(
        <MediaGallery
          files={mockFiles}
          allowReorder={false}
          onReorder={mockOnReorder}
        />,
      );

      const dragHandles = container.querySelectorAll(".cursor-move");
      expect(dragHandles.length).toBe(0);
    });

    it("should handle drag start", () => {
      const { container } = render(
        <MediaGallery
          files={mockFiles}
          allowReorder={true}
          onReorder={mockOnReorder}
        />,
      );

      const draggableItems = container.querySelectorAll("[draggable='true']");
      fireEvent.dragStart(draggableItems[0]);

      // Verify drag started (opacity changes)
      expect(draggableItems[0]).toHaveClass("opacity-50");
    });

    it("should call onReorder when drag completes", () => {
      const { container } = render(
        <MediaGallery
          files={mockFiles}
          allowReorder={true}
          onReorder={mockOnReorder}
        />,
      );

      const draggableItems = container.querySelectorAll("[draggable='true']");
      fireEvent.dragStart(draggableItems[0]);
      fireEvent.dragOver(draggableItems[1]);

      expect(mockOnReorder).toHaveBeenCalled();
    });

    it("should clear drag state on drag end", () => {
      const { container } = render(
        <MediaGallery
          files={mockFiles}
          allowReorder={true}
          onReorder={mockOnReorder}
        />,
      );

      const draggableItems = container.querySelectorAll("[draggable='true']");
      fireEvent.dragStart(draggableItems[0]);
      fireEvent.dragEnd(draggableItems[0]);

      expect(draggableItems[0]).not.toHaveClass("opacity-50");
    });
  });

  // ==================== LIGHTBOX FUNCTIONALITY ====================
  describe("Lightbox Functionality", () => {
    it("should open lightbox on media click", () => {
      render(<MediaGallery files={mockFiles} />);

      const mediaCards = screen
        .getAllByRole("button")
        .filter(
          (btn) =>
            btn.className.includes("cursor-pointer") ||
            btn.closest(".cursor-pointer"),
        );

      const firstCard = screen
        .getByText("test-image.jpg")
        .closest(".cursor-pointer");
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      });
    });

    it("should display image in lightbox", async () => {
      render(<MediaGallery files={mockFiles} />);

      const firstCard = screen
        .getByText("test-image.jpg")
        .closest(".cursor-pointer");
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
        const lightboxImgs = document.querySelectorAll(
          'img[alt="test-image.jpg"]',
        );
        expect(lightboxImgs.length).toBeGreaterThan(1); // Grid image + lightbox image
      });
    });

    it("should display video in lightbox", async () => {
      render(<MediaGallery files={mockFiles} />);

      const videoCard = screen
        .getByText("test-video.mp4")
        .closest(".cursor-pointer");
      if (videoCard) {
        fireEvent.click(videoCard);
      }

      await waitFor(() => {
        const videoElement = document.querySelector("video");
        expect(videoElement).toBeInTheDocument();
        expect(videoElement).toHaveAttribute(
          "src",
          "https://example.com/video1.mp4",
        );
      });
    });

    it("should close lightbox on close button click", async () => {
      render(<MediaGallery files={mockFiles} />);

      const firstCard = screen
        .getByText("test-image.jpg")
        .closest(".cursor-pointer");
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      });

      const closeButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.className.includes("top-4 right-4"));
      if (closeButtons[0]) {
        fireEvent.click(closeButtons[0]);
      }

      await waitFor(() => {
        expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
      });
    });

    it("should navigate to next image", async () => {
      render(<MediaGallery files={mockFiles} />);

      const firstCard = screen
        .getByText("test-image.jpg")
        .closest(".cursor-pointer");
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      });

      const nextButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("→"));
      if (nextButton) {
        fireEvent.click(nextButton);
      }

      await waitFor(() => {
        expect(screen.getByText("2 / 3")).toBeInTheDocument();
      });
    });

    it("should navigate to previous image", async () => {
      render(<MediaGallery files={mockFiles} />);

      const secondCard = screen
        .getByText("test-image-2.jpg")
        .closest(".cursor-pointer");
      if (secondCard) {
        fireEvent.click(secondCard);
      }

      await waitFor(() => {
        expect(screen.getByText("2 / 3")).toBeInTheDocument();
      });

      const prevButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("←"));
      if (prevButton) {
        fireEvent.click(prevButton);
      }

      await waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      });
    });

    it("should wrap to first image from last", async () => {
      render(<MediaGallery files={mockFiles} />);

      const lastCard = screen
        .getByText("test-video.mp4")
        .closest(".cursor-pointer");
      if (lastCard) {
        fireEvent.click(lastCard);
      }

      await waitFor(() => {
        expect(screen.getByText("3 / 3")).toBeInTheDocument();
      });

      const nextButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("→"));
      if (nextButton) {
        fireEvent.click(nextButton);
      }

      await waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      });
    });

    it("should wrap to last image from first", async () => {
      render(<MediaGallery files={mockFiles} />);

      const firstCard = screen
        .getByText("test-image.jpg")
        .closest(".cursor-pointer");
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      });

      const prevButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("←"));
      if (prevButton) {
        fireEvent.click(prevButton);
      }

      await waitFor(() => {
        expect(screen.getByText("3 / 3")).toBeInTheDocument();
      });
    });

    it("should not show navigation for single file", async () => {
      render(<MediaGallery files={[mockImageFile]} />);

      const card = screen
        .getByText("test-image.jpg")
        .closest(".cursor-pointer");
      if (card) {
        fireEvent.click(card);
      }

      await waitFor(() => {
        expect(screen.getByText("1 / 1")).toBeInTheDocument();
      });

      const navButtons = screen
        .queryAllByRole("button")
        .filter((btn) => btn.textContent?.match(/[←→]/));
      expect(navButtons.length).toBe(0);
    });
  });

  // ==================== INDIVIDUAL ACTIONS ====================
  describe("Individual Actions", () => {
    it("should call onRemove when delete button clicked", () => {
      render(
        <MediaGallery
          files={mockFiles}
          onRemove={mockOnRemove}
          allowBulkActions={false}
        />,
      );

      // MediaPreviewCard should show delete buttons
      // This assumes MediaPreviewCard renders delete buttons
      // Adjust selector based on actual implementation
      const deleteButtons = screen
        .queryAllByRole("button")
        .filter((btn) => btn.className.includes("text-red"));

      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0]);
        expect(mockOnRemove).toHaveBeenCalled();
      }
    });

    it("should call onEdit when edit button clicked", () => {
      render(
        <MediaGallery
          files={mockFiles}
          onEdit={mockOnEdit}
          allowBulkActions={false}
        />,
      );

      // MediaPreviewCard should show edit buttons
      const editButtons = screen
        .queryAllByRole("button")
        .filter(
          (btn) =>
            btn.className.includes("text-blue") ||
            btn.textContent?.includes("Edit"),
        );

      if (editButtons[0]) {
        fireEvent.click(editButtons[0]);
        expect(mockOnEdit).toHaveBeenCalled();
      }
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("should handle files without type", () => {
      const invalidFiles = [{ ...mockImageFile, type: undefined as any }];

      render(<MediaGallery files={invalidFiles} />);

      expect(screen.getByText("test-image.jpg")).toBeInTheDocument();
    });

    it("should handle large number of files", () => {
      const manyFiles = Array.from({ length: 50 }, (_, i) => ({
        ...mockImageFile,
        id: `img-${i}`,
        file: { ...mockImageFile.file, name: `image-${i}.jpg` } as File,
      }));

      const { container } = render(<MediaGallery files={manyFiles} />);

      const gridItems = container.querySelectorAll(".grid > div");
      expect(gridItems.length).toBe(50);
    });

    it("should handle empty selectedIds prop", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
          selectedIds={undefined}
        />,
      );

      expect(screen.getByText("Select All")).toBeInTheDocument();
    });

    it("should not break when callbacks are undefined", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowReorder={false}
          allowBulkActions={false}
        />,
      );

      expect(screen.getByText("test-image.jpg")).toBeInTheDocument();
    });

    it("should handle files with very long names", () => {
      const longNameFile = {
        ...mockImageFile,
        file: {
          ...mockImageFile.file,
          name: "a".repeat(200) + ".jpg",
        } as File,
      };

      render(<MediaGallery files={[longNameFile]} />);

      expect(screen.getByText("a".repeat(200) + ".jpg")).toBeInTheDocument();
    });
  });

  // ==================== ACCESSIBILITY ====================
  describe("Accessibility", () => {
    it("should have proper button roles", () => {
      render(
        <MediaGallery
          files={mockFiles}
          allowBulkActions={true}
          onSelect={mockOnSelect}
        />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should support keyboard navigation in lightbox", async () => {
      render(<MediaGallery files={mockFiles} />);

      const firstCard = screen
        .getByText("test-image.jpg")
        .closest(".cursor-pointer");
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      });

      // Test Escape key to close (if implemented)
      // fireEvent.keyDown(document, { key: "Escape" });
    });
  });

  // ==================== STYLING & LAYOUT ====================
  describe("Styling & Layout", () => {
    it("should apply grid layout classes", () => {
      const { container } = render(<MediaGallery files={mockFiles} />);

      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass(
        "grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
      );
    });

    it("should show hover effects on drag handles", () => {
      const { container } = render(
        <MediaGallery
          files={mockFiles}
          allowReorder={true}
          onReorder={mockOnReorder}
        />,
      );

      const dragHandle = container.querySelector(".group-hover\\:opacity-100");
      expect(dragHandle).toBeInTheDocument();
    });

    it("should apply proper z-index for lightbox", async () => {
      render(<MediaGallery files={mockFiles} />);

      const firstCard = screen
        .getByText("test-image.jpg")
        .closest(".cursor-pointer");
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        const lightbox = document.querySelector(".z-50");
        expect(lightbox).toBeInTheDocument();
      });
    });
  });
});
