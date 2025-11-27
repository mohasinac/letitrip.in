import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryForm from "./CategoryForm";
import { categoriesService } from "@/services/categories.service";
import "@testing-library/jest-dom";

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: mockRefresh,
  }),
}));

// Mock services
jest.mock("@/services/categories.service", () => ({
  categoriesService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock hooks
const mockUploadMedia = jest.fn();
const mockCleanupUploadedMedia = jest.fn();
const mockClearTracking = jest.fn();
const mockConfirmNavigation = jest.fn();

jest.mock("@/hooks/useMediaUploadWithCleanup", () => ({
  useMediaUploadWithCleanup: jest.fn(() => ({
    uploadMedia: mockUploadMedia,
    cleanupUploadedMedia: mockCleanupUploadedMedia,
    clearTracking: mockClearTracking,
    confirmNavigation: mockConfirmNavigation,
    isUploading: false,
    isCleaning: false,
    hasUploadedMedia: false,
  })),
}));

// Mock components
jest.mock("@/components/common/SlugInput", () => {
  return function MockSlugInput({ value, onChange, error, disabled }: any) {
    return (
      <div data-testid="slug-input">
        <input
          data-testid="slug-input-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        {error && <span data-testid="slug-error">{error}</span>}
      </div>
    );
  };
});

jest.mock("@/components/common/RichTextEditor", () => {
  return function MockRichTextEditor({ value, onChange }: any) {
    return (
      <textarea
        data-testid="rich-text-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

jest.mock("@/components/common/CategorySelector", () => {
  return function MockCategorySelector({ value, onChange, categories }: any) {
    return (
      <select
        data-testid="category-selector"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">None</option>
        {categories?.map((cat: any) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    );
  };
});

jest.mock("@/components/media/MediaUploader", () => {
  return function MockMediaUploader({
    onFilesAdded,
    onFileRemoved,
    files,
    disabled,
  }: any) {
    return (
      <div data-testid="media-uploader">
        <button
          data-testid="add-file-btn"
          onClick={() => {
            const mockFile = {
              file: new File(["test"], "test.jpg", { type: "image/jpeg" }),
              preview: "blob:test",
              type: "image" as const,
            };
            onFilesAdded([mockFile]);
          }}
          disabled={disabled}
        >
          Add File
        </button>
        {files?.length > 0 && (
          <button data-testid="remove-file-btn" onClick={() => onFileRemoved()}>
            Remove File
          </button>
        )}
      </div>
    );
  };
});

jest.mock("@/components/ui", () => ({
  Card: ({ title, children }: any) => (
    <div data-testid="card" data-title={title}>
      <h3>{title}</h3>
      {children}
    </div>
  ),
  Input: ({ label, value, onChange, error, disabled, type, ...props }: any) => (
    <div data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-")}`}>
      <label>{label}</label>
      <input
        type={type || "text"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  Textarea: ({ label, value, onChange, disabled, ...props }: any) => (
    <div data-testid={`textarea-${label?.toLowerCase().replace(/\s+/g, "-")}`}>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    </div>
  ),
  Checkbox: ({ label, checked, onChange, disabled, description }: any) => (
    <div data-testid={`checkbox-${label?.toLowerCase().replace(/\s+/g, "-")}`}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        {label}
      </label>
      {description && <p>{description}</p>}
    </div>
  ),
  FormActions: ({ onCancel, submitLabel, isSubmitting }: any) => (
    <div data-testid="form-actions">
      <button type="button" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </button>
      <button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </button>
    </div>
  ),
}));

describe("CategoryForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (categoriesService.list as jest.Mock).mockResolvedValue({
      data: [
        { id: "1", name: "Electronics", slug: "electronics", is_active: true },
        { id: "2", name: "Fashion", slug: "fashion", is_active: true },
      ],
    });
  });

  // RENDERING TESTS
  describe("Rendering", () => {
    it("should render in create mode", () => {
      render(<CategoryForm mode="create" />);
      expect(screen.getByText("Create Category")).toBeInTheDocument();
    });

    it("should render in edit mode", () => {
      render(
        <CategoryForm
          mode="edit"
          initialData={{ name: "Test", slug: "test" }}
        />
      );
      expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });

    it("should render all form sections", () => {
      render(<CategoryForm mode="create" />);
      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Category Image")).toBeInTheDocument();
      expect(screen.getByText("Display Options")).toBeInTheDocument();
      expect(screen.getByText("SEO Metadata")).toBeInTheDocument();
    });

    it("should render all required fields", () => {
      render(<CategoryForm mode="create" />);
      expect(
        screen.getByPlaceholderText("Electronics, Fashion, etc.")
      ).toBeInTheDocument();
      expect(screen.getByTestId("slug-input")).toBeInTheDocument();
    });

    it("should populate form with initial data in edit mode", () => {
      const initialData = {
        name: "Test Category",
        slug: "test-category",
        description: "Test description",
      };
      render(<CategoryForm mode="edit" initialData={initialData} />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      ) as HTMLInputElement;
      expect(nameInput.value).toBe("Test Category");
    });
  });

  // FORM INPUT TESTS
  describe("Form Inputs", () => {
    it("should update name field", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      await user.clear(nameInput);
      await user.type(nameInput, "New Category");

      expect(nameInput).toHaveValue("New Category");
    });

    it("should update slug field", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const slugInput = screen.getByTestId("slug-input-field");
      await user.clear(slugInput);
      await user.type(slugInput, "new-slug");

      expect(slugInput).toHaveValue("new-slug");
    });

    it("should update description", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const descEditor = screen.getByTestId("rich-text-editor");
      await user.clear(descEditor);
      await user.type(descEditor, "Test description");

      expect(descEditor).toHaveValue("Test description");
    });

    it("should update sort order", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const sortInput = screen.getByPlaceholderText("0");
      await user.clear(sortInput);
      await user.type(sortInput, "5");

      expect(sortInput).toHaveValue(5);
    });

    it("should update meta title", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const metaInput = screen.getByPlaceholderText(
        "SEO title (defaults to category name)"
      );
      await user.clear(metaInput);
      await user.type(metaInput, "SEO Title");

      expect(metaInput).toHaveValue("SEO Title");
    });

    it("should update meta description", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const metaDesc = screen.getByPlaceholderText("SEO description");
      await user.clear(metaDesc);
      await user.type(metaDesc, "SEO description");

      expect(metaDesc).toHaveValue("SEO description");
    });
  });

  // CHECKBOX TESTS
  describe("Checkboxes", () => {
    it("should toggle is_active checkbox", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const activeCheckbox = screen
        .getByTestId("checkbox-active")
        .querySelector("input") as HTMLInputElement;
      expect(activeCheckbox.checked).toBe(true); // default

      await user.click(activeCheckbox);
      expect(activeCheckbox.checked).toBe(false);
    });

    it("should toggle is_featured checkbox", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const featuredCheckbox = screen
        .getByTestId("checkbox-featured")
        .querySelector("input") as HTMLInputElement;
      expect(featuredCheckbox.checked).toBe(false); // default

      await user.click(featuredCheckbox);
      expect(featuredCheckbox.checked).toBe(true);
    });

    it("should toggle show_on_homepage checkbox", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const homepageCheckbox = screen
        .getByTestId("checkbox-show-on-homepage")
        .querySelector("input") as HTMLInputElement;
      expect(homepageCheckbox.checked).toBe(false); // default

      await user.click(homepageCheckbox);
      expect(homepageCheckbox.checked).toBe(true);
    });
  });

  // CATEGORY SELECTOR TESTS
  describe("Category Selector", () => {
    it("should load categories on mount", async () => {
      render(<CategoryForm mode="create" />);

      await waitFor(() => {
        expect(categoriesService.list).toHaveBeenCalled();
      });
    });

    it("should display parent category selector", async () => {
      render(<CategoryForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByTestId("category-selector")).toBeInTheDocument();
      });
    });

    it("should allow selecting parent category", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByTestId("category-selector")).toBeInTheDocument();
      });

      const selector = screen.getByTestId("category-selector");
      await user.selectOptions(selector, "1");

      expect(selector).toHaveValue("1");
    });
  });

  // MEDIA UPLOAD TESTS
  describe("Media Upload", () => {
    it("should render media uploader", () => {
      render(<CategoryForm mode="create" />);
      expect(screen.getByTestId("media-uploader")).toBeInTheDocument();
    });

    it("should handle file upload", async () => {
      const user = userEvent.setup();
      mockUploadMedia.mockResolvedValue("https://test.com/image.jpg");

      render(<CategoryForm mode="create" />);

      const addFileBtn = screen.getByTestId("add-file-btn");
      await user.click(addFileBtn);

      await waitFor(() => {
        expect(mockUploadMedia).toHaveBeenCalled();
      });
    });

    it("should display current image in edit mode", () => {
      const initialData = {
        name: "Test",
        slug: "test",
        image: "https://test.com/image.jpg",
      };
      render(<CategoryForm mode="edit" initialData={initialData} />);

      const img = screen.getByAltText("Current category");
      expect(img).toHaveAttribute("src", "https://test.com/image.jpg");
    });

    it("should show uploading state", () => {
      const useMediaUploadWithCleanup =
        require("@/hooks/useMediaUploadWithCleanup")
          .useMediaUploadWithCleanup as jest.Mock;
      useMediaUploadWithCleanup.mockReturnValue({
        uploadMedia: mockUploadMedia,
        cleanupUploadedMedia: mockCleanupUploadedMedia,
        clearTracking: mockClearTracking,
        confirmNavigation: mockConfirmNavigation,
        isUploading: true,
        isCleaning: false,
        hasUploadedMedia: false,
      });

      render(<CategoryForm mode="create" />);
      expect(screen.getByText(/📤 Uploading image/i)).toBeInTheDocument();
    });

    it("should show uploaded media warning", () => {
      const useMediaUploadWithCleanup =
        require("@/hooks/useMediaUploadWithCleanup")
          .useMediaUploadWithCleanup as jest.Mock;
      useMediaUploadWithCleanup.mockReturnValue({
        uploadMedia: mockUploadMedia,
        cleanupUploadedMedia: mockCleanupUploadedMedia,
        clearTracking: mockClearTracking,
        confirmNavigation: mockConfirmNavigation,
        isUploading: false,
        isCleaning: false,
        hasUploadedMedia: true,
      });

      render(<CategoryForm mode="create" />);
      expect(screen.getByText(/⚠️ New image uploaded/i)).toBeInTheDocument();
    });
  });

  // VALIDATION TESTS
  describe("Validation", () => {
    it("should show error when name is empty", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByText("Create Category")).toBeInTheDocument();
      });

      const submitBtn = screen.getByText("Create Category");
      await user.click(submitBtn);

      // Validation should prevent submission when name is empty
      await waitFor(() => {
        expect(categoriesService.create).not.toHaveBeenCalled();
      });

      // Verify the form is still visible (not navigated away)
      expect(screen.getByText("Create Category")).toBeInTheDocument();
    });

    it("should show error when slug is empty", async () => {
      const user = userEvent.setup();
      render(<CategoryForm mode="create" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      await user.type(nameInput, "Test");

      // Clear slug manually
      const slugInput = screen.getByTestId("slug-input-field");
      await user.clear(slugInput);

      const submitBtn = screen.getByText("Create Category");
      await user.click(submitBtn);

      await waitFor(() => {
        const errorElement = screen.getByTestId("slug-error");
        expect(errorElement).toHaveTextContent("Slug is required");
      });
    });

    it("should clear error when field is corrected", async () => {
      const user = userEvent.setup();
      (categoriesService.create as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<CategoryForm mode="create" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      const submitBtn = screen.getByText("Create Category");

      // First submission should fail (empty name)
      await user.click(submitBtn);
      expect(categoriesService.create).not.toHaveBeenCalled();

      // After filling in name and slug, submission should succeed
      await user.type(nameInput, "Test Category");
      const slugInput = screen.getByTestId("slug-input-field");
      await user.type(slugInput, "test-category");

      await user.click(submitBtn);

      await waitFor(() => {
        expect(categoriesService.create).toHaveBeenCalled();
      });
    });
  });

  // SUBMIT TESTS
  describe("Form Submission", () => {
    it("should create category successfully", async () => {
      const user = userEvent.setup();
      (categoriesService.create as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<CategoryForm mode="create" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      await user.type(nameInput, "New Category");

      const slugInput = screen.getByTestId("slug-input-field");
      await user.type(slugInput, "new-category");

      const submitBtn = screen.getByText("Create Category");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(categoriesService.create).toHaveBeenCalled();
        expect(mockClearTracking).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/admin/categories");
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("should update category successfully", async () => {
      const user = userEvent.setup();
      (categoriesService.update as jest.Mock).mockResolvedValue({
        success: true,
      });

      const initialData = { name: "Old Name", slug: "old-slug" };
      render(<CategoryForm mode="edit" initialData={initialData} />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");

      const submitBtn = screen.getByText("Save Changes");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(categoriesService.update).toHaveBeenCalledWith(
          "old-slug",
          expect.any(Object)
        );
        expect(mockPush).toHaveBeenCalledWith("/admin/categories");
      });
    });

    it("should show error on create failure", async () => {
      const user = userEvent.setup();
      (categoriesService.create as jest.Mock).mockRejectedValue(
        new Error("Failed to create")
      );

      render(<CategoryForm mode="create" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      await user.type(nameInput, "Test");

      const slugInput = screen.getByTestId("slug-input-field");
      await user.type(slugInput, "test");

      const submitBtn = screen.getByText("Create Category");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Failed to create")).toBeInTheDocument();
      });
    });

    it("should cleanup uploaded media on save failure", async () => {
      const user = userEvent.setup();
      (categoriesService.create as jest.Mock).mockRejectedValue(
        new Error("Failed")
      );

      const useMediaUploadWithCleanup =
        require("@/hooks/useMediaUploadWithCleanup")
          .useMediaUploadWithCleanup as jest.Mock;
      useMediaUploadWithCleanup.mockReturnValue({
        uploadMedia: mockUploadMedia,
        cleanupUploadedMedia: mockCleanupUploadedMedia,
        clearTracking: mockClearTracking,
        confirmNavigation: mockConfirmNavigation,
        isUploading: false,
        isCleaning: false,
        hasUploadedMedia: true,
      });

      render(<CategoryForm mode="create" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      await user.type(nameInput, "Test");

      const slugInput = screen.getByTestId("slug-input-field");
      await user.type(slugInput, "test");

      const submitBtn = screen.getByText("Create Category");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockCleanupUploadedMedia).toHaveBeenCalled();
      });
    });

    it("should disable submit button during submission", async () => {
      const user = userEvent.setup();
      (categoriesService.create as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<CategoryForm mode="create" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      await user.type(nameInput, "Test");

      const slugInput = screen.getByTestId("slug-input-field");
      await user.type(slugInput, "test");

      const submitBtn = screen.getByText("Create Category");
      await user.click(submitBtn);

      expect(submitBtn).toBeDisabled();
    });
  });

  // CANCEL/NAVIGATION TESTS
  describe("Cancel and Navigation", () => {
    it("should go back on cancel without uploaded media", async () => {
      const user = userEvent.setup();

      // Ensure mock returns hasUploadedMedia: false
      const useMediaUploadWithCleanup =
        require("@/hooks/useMediaUploadWithCleanup")
          .useMediaUploadWithCleanup as jest.Mock;
      useMediaUploadWithCleanup.mockReturnValue({
        uploadMedia: mockUploadMedia,
        cleanupUploadedMedia: mockCleanupUploadedMedia,
        clearTracking: mockClearTracking,
        confirmNavigation: mockConfirmNavigation,
        isUploading: false,
        isCleaning: false,
        hasUploadedMedia: false,
      });

      render(<CategoryForm mode="create" />);

      const cancelBtn = screen.getByText("Cancel");
      await user.click(cancelBtn);

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it("should confirm navigation with uploaded media", async () => {
      const user = userEvent.setup();
      const useMediaUploadWithCleanup =
        require("@/hooks/useMediaUploadWithCleanup")
          .useMediaUploadWithCleanup as jest.Mock;
      useMediaUploadWithCleanup.mockReturnValue({
        uploadMedia: mockUploadMedia,
        cleanupUploadedMedia: mockCleanupUploadedMedia,
        clearTracking: mockClearTracking,
        confirmNavigation: mockConfirmNavigation,
        isUploading: false,
        isCleaning: false,
        hasUploadedMedia: true,
      });

      mockConfirmNavigation.mockImplementation((callback) => callback());

      render(<CategoryForm mode="create" />);

      const cancelBtn = screen.getByText("Cancel");
      await user.click(cancelBtn);

      await waitFor(() => {
        expect(mockConfirmNavigation).toHaveBeenCalled();
      });
    });
  });

  // EDGE CASES
  describe("Edge Cases", () => {
    it("should handle category list load failure gracefully", async () => {
      (categoriesService.list as jest.Mock).mockRejectedValue(
        new Error("Failed to load")
      );

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<CategoryForm mode="create" />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to load categories:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle empty initial data", () => {
      render(<CategoryForm mode="edit" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      ) as HTMLInputElement;
      expect(nameInput.value).toBe("");
    });

    it("should parse sort order to integer", async () => {
      const user = userEvent.setup();
      (categoriesService.create as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<CategoryForm mode="create" />);

      const nameInput = screen.getByPlaceholderText(
        "Electronics, Fashion, etc."
      );
      await user.type(nameInput, "Test");

      const slugInput = screen.getByTestId("slug-input-field");
      await user.type(slugInput, "test");

      const sortInput = screen.getByPlaceholderText("0");
      await user.clear(sortInput);
      await user.type(sortInput, "10");

      const submitBtn = screen.getByText("Create Category");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(categoriesService.create).toHaveBeenCalledWith(
          expect.objectContaining({ sort_order: 10 })
        );
      });
    });

    it("should handle file upload error", async () => {
      const user = userEvent.setup();
      mockUploadMedia.mockRejectedValue(new Error("Upload failed"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<CategoryForm mode="create" />);

      const addFileBtn = screen.getByTestId("add-file-btn");
      await user.click(addFileBtn);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to upload image:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  // ACCESSIBILITY
  describe("Accessibility", () => {
    it("should have proper form structure", () => {
      render(<CategoryForm mode="create" />);
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should have labels for all inputs", () => {
      render(<CategoryForm mode="create" />);
      expect(
        screen.getByPlaceholderText("Electronics, Fashion, etc.")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("SEO title (defaults to category name)")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("SEO description")
      ).toBeInTheDocument();
    });

    it("should have proper button roles", () => {
      render(<CategoryForm mode="create" />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
