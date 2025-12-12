import { logError } from "@/lib/firebase-error-logger";
import { mediaService } from "@/services/media.service";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InlineImageUpload } from "../InlineImageUpload";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Image: jest.fn(() => <div data-testid="image-icon" />),
  Loader2: jest.fn(() => <div data-testid="loader-icon" />),
  Upload: jest.fn(() => <div data-testid="upload-icon" />),
  X: jest.fn(() => <div data-testid="x-icon" />),
}));

// Mock OptimizedImage
jest.mock("@/components/common/OptimizedImage", () => ({
  __esModule: true,
  default: jest.fn(({ src, alt }) => (
    <img src={src} alt={alt} data-testid="optimized-image" />
  )),
}));

// Mock media service
jest.mock("@/services/media.service", () => ({
  mediaService: {
    upload: jest.fn(),
  },
}));

// Mock error logger
jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("InlineImageUpload Component", () => {
  const mockOnChange = jest.fn();
  const mockOnRemove = jest.fn();

  const defaultProps = {
    value: "",
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mediaService.upload as jest.Mock).mockResolvedValue({
      url: "https://example.com/image.jpg",
    });
  });

  describe("Basic Rendering", () => {
    it("should render upload button when no value", () => {
      render(<InlineImageUpload {...defaultProps} />);
      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
    });

    it("should render image preview when value provided", () => {
      render(
        <InlineImageUpload
          {...defaultProps}
          value="https://example.com/test.jpg"
        />
      );
      expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
    });

    it("should render with default size 64", () => {
      const { container } = render(<InlineImageUpload {...defaultProps} />);
      const wrapper = container.querySelector("[style*='width']");
      expect(wrapper).toHaveStyle({ width: "64px", height: "64px" });
    });

    it("should render with custom size", () => {
      const { container } = render(
        <InlineImageUpload {...defaultProps} size={128} />
      );
      const wrapper = container.querySelector("[style*='width']");
      expect(wrapper).toHaveStyle({ width: "128px", height: "128px" });
    });

    it("should apply default accept image/*", () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toHaveAttribute("accept", "image/*");
    });

    it("should apply custom accept attribute", () => {
      render(
        <InlineImageUpload {...defaultProps} accept="image/png,image/jpeg" />
      );
      const input = screen.getByRole("textbox", {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toHaveAttribute("accept", "image/png,image/jpeg");
    });
  });

  describe("File Upload", () => {
    it("should call mediaService.upload when file selected", async () => {
      render(<InlineImageUpload {...defaultProps} context="product" />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mediaService.upload).toHaveBeenCalledWith({
          file,
          context: "product",
        });
      });
    });

    it("should call onChange with uploaded URL", async () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          "https://example.com/image.jpg"
        );
      });
    });

    it("should show loader while uploading", async () => {
      (mediaService.upload as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ url: "test.jpg" }), 100)
          )
      );

      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("should validate file type", async () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["content"], "test.txt", { type: "text/plain" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByTestId("image-icon")).toBeInTheDocument();
        expect(mediaService.upload).not.toHaveBeenCalled();
      });
    });

    it("should validate file size (max 5MB)", async () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const largeFile = new File(["x".repeat(6 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });
      fireEvent.change(input, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(screen.getByTestId("image-icon")).toBeInTheDocument();
        expect(mediaService.upload).not.toHaveBeenCalled();
      });
    });

    it("should handle upload error", async () => {
      const error = new Error("Upload failed");
      (mediaService.upload as jest.Mock).mockRejectedValue(error);

      render(<InlineImageUpload {...defaultProps} context="product" />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(error, {
          component: "InlineImageUpload.handleUpload",
          metadata: { context: "product" },
        });
      });
    });

    it("should not upload when no file selected", () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      fireEvent.change(input, { target: { files: [] } });

      expect(mediaService.upload).not.toHaveBeenCalled();
    });
  });

  describe("Image Preview", () => {
    it("should display OptimizedImage when value exists", () => {
      render(
        <InlineImageUpload
          {...defaultProps}
          value="https://example.com/test.jpg"
        />
      );
      const image = screen.getByTestId("optimized-image");
      expect(image).toHaveAttribute("src", "https://example.com/test.jpg");
    });

    it("should pass size to OptimizedImage", () => {
      const OptimizedImage =
        require("@/components/common/OptimizedImage").default;
      render(
        <InlineImageUpload {...defaultProps} value="test.jpg" size={128} />
      );

      expect(OptimizedImage).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 128,
          height: 128,
        }),
        expect.anything()
      );
    });

    it("should render remove button when image exists", () => {
      render(<InlineImageUpload {...defaultProps} value="test.jpg" />);
      const removeButton = screen.getByTitle("Remove image");
      expect(removeButton).toBeInTheDocument();
    });

    it("should not render remove button when disabled", () => {
      render(
        <InlineImageUpload {...defaultProps} value="test.jpg" disabled={true} />
      );
      const removeButton = screen.queryByTitle("Remove image");
      expect(removeButton).not.toBeInTheDocument();
    });

    it("should call onRemove when remove button clicked", () => {
      render(
        <InlineImageUpload
          {...defaultProps}
          value="test.jpg"
          onRemove={mockOnRemove}
        />
      );
      const removeButton = screen.getByTitle("Remove image");

      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });

    it("should call onChange with empty string when remove clicked without onRemove", () => {
      render(<InlineImageUpload {...defaultProps} value="test.jpg" />);
      const removeButton = screen.getByTitle("Remove image");

      fireEvent.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith("");
    });
  });

  describe("Loading States", () => {
    it("should show loader when loading prop is true", () => {
      render(<InlineImageUpload {...defaultProps} loading={true} />);
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("should show loader while uploading", async () => {
      (mediaService.upload as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ url: "test.jpg" }), 100)
          )
      );

      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      });
    });

    it("should hide image during loading", () => {
      render(
        <InlineImageUpload {...defaultProps} value="test.jpg" loading={true} />
      );
      expect(screen.queryByTestId("optimized-image")).not.toBeInTheDocument();
    });

    it("should hide upload button during loading", () => {
      render(<InlineImageUpload {...defaultProps} loading={true} />);
      expect(screen.queryByTestId("upload-icon")).not.toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should disable file input when disabled", () => {
      render(<InlineImageUpload {...defaultProps} disabled={true} />);
      const input = screen.getByRole("textbox", { hidden: true });
      expect(input).toBeDisabled();
    });

    it("should disable file input while uploading", async () => {
      (mediaService.upload as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ url: "test.jpg" }), 100)
          )
      );

      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });

    it("should apply disabled styling", () => {
      const { container } = render(
        <InlineImageUpload {...defaultProps} disabled={true} />
      );
      const label = container.querySelector(".cursor-not-allowed");
      expect(label).toBeInTheDocument();
    });

    it("should not show remove button when disabled", () => {
      render(
        <InlineImageUpload {...defaultProps} value="test.jpg" disabled={true} />
      );
      expect(screen.queryByTitle("Remove image")).not.toBeInTheDocument();
    });
  });

  describe("Context Variants", () => {
    const contexts = [
      "product",
      "shop",
      "auction",
      "review",
      "return",
      "avatar",
      "category",
    ] as const;

    contexts.forEach((context) => {
      it(`should support ${context} context`, async () => {
        render(<InlineImageUpload {...defaultProps} context={context} />);
        const input = screen.getByRole("textbox", { hidden: true });

        const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
          expect(mediaService.upload).toHaveBeenCalledWith({
            file,
            context,
          });
        });
      });
    });

    it("should default to product context", async () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mediaService.upload).toHaveBeenCalledWith({
          file,
          context: "product",
        });
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error icon when file type invalid", async () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["content"], "test.txt", { type: "text/plain" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByTestId("image-icon")).toBeInTheDocument();
      });
    });

    it("should display error icon when file size exceeds limit", async () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const largeFile = new File(["x".repeat(6 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });
      fireEvent.change(input, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(screen.getByTestId("image-icon")).toBeInTheDocument();
      });
    });

    it("should clear error when valid file uploaded", async () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      // Upload invalid file
      const invalidFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });
      fireEvent.change(input, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByTestId("image-icon")).toBeInTheDocument();
      });

      // Upload valid file
      const validFile = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          "https://example.com/image.jpg"
        );
      });
    });

    it("should log error on upload failure", async () => {
      const error = new Error("Upload failed");
      (mediaService.upload as jest.Mock).mockRejectedValue(error);

      render(<InlineImageUpload {...defaultProps} context="shop" />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(error, {
          component: "InlineImageUpload.handleUpload",
          metadata: { context: "shop" },
        });
      });
    });

    it("should clear error when remove button clicked", () => {
      render(<InlineImageUpload {...defaultProps} value="test.jpg" />);
      const removeButton = screen.getByTitle("Remove image");

      fireEvent.click(removeButton);

      expect(screen.queryByTestId("image-icon")).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply border and rounded styles", () => {
      const { container } = render(<InlineImageUpload {...defaultProps} />);
      const wrapper = container.querySelector(".rounded");
      expect(wrapper).toHaveClass("border", "border-gray-200");
    });

    it("should apply hover effect when not disabled", () => {
      const { container } = render(<InlineImageUpload {...defaultProps} />);
      const label = container.querySelector("label");
      expect(label).toHaveClass("hover:bg-gray-200");
    });

    it("should not apply hover effect when disabled", () => {
      const { container } = render(
        <InlineImageUpload {...defaultProps} disabled={true} />
      );
      const label = container.querySelector("label");
      expect(label).not.toHaveClass("hover:bg-gray-200");
    });

    it("should position remove button absolutely", () => {
      render(<InlineImageUpload {...defaultProps} value="test.jpg" />);
      const removeButton = screen.getByTitle("Remove image");
      expect(removeButton).toHaveClass("absolute", "top-1", "right-1");
    });

    it("should style remove button with red background", () => {
      render(<InlineImageUpload {...defaultProps} value="test.jpg" />);
      const removeButton = screen.getByTitle("Remove image");
      expect(removeButton).toHaveClass("bg-red-600", "hover:bg-red-700");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null value", () => {
      render(<InlineImageUpload {...defaultProps} value={null as any} />);
      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
    });

    it("should handle undefined value", () => {
      render(<InlineImageUpload {...defaultProps} value={undefined as any} />);
      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
    });

    it("should handle empty string value", () => {
      render(<InlineImageUpload {...defaultProps} value="" />);
      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
    });

    it("should handle rapid file selections", async () => {
      render(<InlineImageUpload {...defaultProps} />);
      const input = screen.getByRole("textbox", { hidden: true });

      const file1 = new File(["image1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["image2"], "test2.jpg", { type: "image/jpeg" });

      fireEvent.change(input, { target: { files: [file1] } });
      fireEvent.change(input, { target: { files: [file2] } });

      await waitFor(() => {
        expect(mediaService.upload).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle multiple remove clicks", () => {
      render(
        <InlineImageUpload
          {...defaultProps}
          value="test.jpg"
          onRemove={mockOnRemove}
        />
      );
      const removeButton = screen.getByTitle("Remove image");

      fireEvent.click(removeButton);
      fireEvent.click(removeButton);
      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(3);
    });
  });

  describe("Multiple Instances", () => {
    it("should support multiple upload components independently", () => {
      const mockOnChange1 = jest.fn();
      const mockOnChange2 = jest.fn();

      render(
        <div>
          <InlineImageUpload value="" onChange={mockOnChange1} />
          <InlineImageUpload value="test.jpg" onChange={mockOnChange2} />
        </div>
      );

      expect(screen.getAllByTestId("upload-icon")).toHaveLength(1);
      expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
    });
  });
});
