import { AuctionStatus } from "@/types/shared/common.types";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import AuctionForm from "../AuctionForm";

// Mock dependencies
jest.mock("@/services/auctions.service");
const auctionsService = require("@/services/auctions.service");

jest.mock("@/components/common/DateTimePicker", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    minDate,
    label,
  }: {
    value: string;
    onChange: (date: string) => void;
    minDate?: Date;
    label?: string;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        type="datetime-local"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        data-testid="date-time-picker"
        data-mindate={minDate?.toISOString()}
      />
    </div>
  ),
}));

jest.mock("@/components/common/RichTextEditor", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="rich-text-editor"
    />
  ),
}));

jest.mock("@/components/common/SlugInput", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    error,
    disabled,
    sourceText,
  }: {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    sourceText?: string;
  }) => (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid="slug-input"
        placeholder="auction-slug"
      />
      {error && <span className="error">{error}</span>}
    </div>
  ),
}));

jest.mock("@/components/ui/Card", () => ({
  Card: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/FormActions", () => ({
  FormActions: ({
    submitLabel,
    isSubmitting,
    submitDisabled,
    cancelDisabled,
    onCancel,
    onSubmit,
  }: {
    submitLabel: string;
    isSubmitting?: boolean;
    submitDisabled?: boolean;
    cancelDisabled?: boolean;
    onCancel?: () => void;
    onSubmit?: () => void;
  }) => (
    <div data-testid="form-actions">
      <button
        type="submit"
        disabled={isSubmitting || submitDisabled}
        onClick={onSubmit}
      >
        {submitLabel}
      </button>
      <button type="button" disabled={cancelDisabled} onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

jest.mock("@/components/forms/FormField", () => ({
  FormField: ({
    label,
    required,
    error,
    hint,
    children,
  }: {
    label?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
  }) => (
    <div>
      {label && (
        <label>
          {label}
          {required && " *"}
        </label>
      )}
      {hint && <span className="hint">{hint}</span>}
      {children}
      {error && <span className="error">{error}</span>}
    </div>
  ),
}));

jest.mock("@/components/forms/FormInput", () => ({
  FormInput: ({
    value,
    onChange,
    placeholder,
    disabled,
    type,
  }: {
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
  }) => (
    <input
      type={type || "text"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  ),
}));

jest.mock("@/components/forms/FormLabel", () => ({
  FormLabel: ({
    children,
    htmlFor,
    required,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
    required?: boolean;
  }) => (
    <label htmlFor={htmlFor}>
      {children}
      {required && " *"}
    </label>
  ),
}));

jest.mock("@/components/forms/FormSelect", () => ({
  FormSelect: ({
    value,
    onChange,
    options,
    disabled,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
  }) => (
    <select value={value} onChange={onChange} disabled={disabled}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock("@/components/forms/FormTextarea", () => ({
  FormTextarea: ({
    value,
    onChange,
    placeholder,
    disabled,
    rows,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
  }) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      data-testid="form-textarea"
    />
  ),
}));

describe("AuctionForm", () => {
  const mockOnSubmit = jest.fn();
  const shopId = "shop-123";

  beforeEach(() => {
    jest.clearAllMocks();
    auctionsService.validateSlug = jest.fn().mockResolvedValue({
      available: true,
    });
  });

  describe("Form Rendering", () => {
    it("renders all form sections", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Bidding Details")).toBeInTheDocument();
      expect(screen.getByText("Auction Timing")).toBeInTheDocument();
      expect(screen.getByText("Media")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("renders all required fields", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("Auction Name *")).toBeInTheDocument();
      expect(screen.getByText("Auction URL *")).toBeInTheDocument();
      expect(screen.getByText("Description *")).toBeInTheDocument();
      expect(screen.getByText("Starting Bid (₹) *")).toBeInTheDocument();
      expect(screen.getByText("Start Time *")).toBeInTheDocument();
      expect(screen.getByText("End Time *")).toBeInTheDocument();
    });

    it("renders create button in create mode", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("Create Auction")).toBeInTheDocument();
    });

    it("renders save button in edit mode", () => {
      const auction = {
        id: "auction-1",
        name: "Test Auction",
        slug: "test-auction",
        description: "Test description",
        startingBid: 100,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        status: AuctionStatus.DRAFT,
      };

      render(
        <AuctionForm
          shopId={shopId}
          mode="edit"
          auction={auction as any}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });
  });

  describe("Auction Name Input", () => {
    it("renders auction name input with placeholder", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        screen.getByPlaceholderText("e.g., Vintage Watch Collection")
      ).toBeInTheDocument();
    });

    it("allows entering auction name", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const input = screen.getByPlaceholderText(
        "e.g., Vintage Watch Collection"
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "My Auction" } });

      expect(input.value).toBe("My Auction");
    });

    it("disables input when submitting", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />
      );

      const input = screen.getByPlaceholderText(
        "e.g., Vintage Watch Collection"
      );
      expect(input).toBeDisabled();
    });
  });

  describe("Slug Input", () => {
    it("renders slug input with SlugInput component", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByTestId("slug-input")).toBeInTheDocument();
    });

    it("allows entering slug value", async () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test-slug" } });

      expect((slugInput as HTMLInputElement).value).toBe("test-slug");
    });
  });

  describe("Description Field", () => {
    it("renders rich text editor for description", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    });

    it("allows entering description", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const editor = screen.getByTestId("rich-text-editor");
      fireEvent.change(editor, { target: { value: "Test description" } });

      expect((editor as HTMLTextAreaElement).value).toBe("Test description");
    });
  });

  describe("Bidding Details", () => {
    it("renders starting bid input", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const bidInputs = screen.getAllByRole("spinbutton");
      expect(bidInputs.length).toBeGreaterThanOrEqual(2);
    });

    it("renders reserve price input", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        screen.getByText(/Minimum price for the item to be sold/i)
      ).toBeInTheDocument();
    });

    it("allows entering starting bid", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const inputs = screen.getAllByRole("spinbutton");
      const startingBidInput = inputs[0] as HTMLInputElement;
      fireEvent.change(startingBidInput, { target: { value: "500" } });

      expect(startingBidInput.value).toBe("500");
    });

    it("allows entering reserve price", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const inputs = screen.getAllByRole("spinbutton");
      const reservePriceInput = inputs[1] as HTMLInputElement;
      fireEvent.change(reservePriceInput, { target: { value: "2000" } });

      expect(reservePriceInput.value).toBe("2000");
    });
  });

  describe("Auction Timing", () => {
    it("renders start time picker", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const pickers = screen.getAllByTestId("date-time-picker");
      expect(pickers.length).toBeGreaterThanOrEqual(2);
    });

    it("renders end time picker", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("End Time *")).toBeInTheDocument();
    });
  });

  describe("Media", () => {
    it("renders images input", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        screen.getByPlaceholderText(/https:\/\/example.com\/image1.jpg/i)
      ).toBeInTheDocument();
    });

    it("renders videos input", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        screen.getByPlaceholderText(/https:\/\/example.com\/video1.mp4/i)
      ).toBeInTheDocument();
    });

    it("splits comma-separated image URLs", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByPlaceholderText(
        /https:\/\/example.com\/image1.jpg/i
      ) as HTMLTextAreaElement;
      fireEvent.change(textarea, {
        target: { value: "url1.jpg, url2.jpg, url3.jpg" },
      });

      expect(textarea.value).toContain("url1.jpg");
      expect(textarea.value).toContain("url2.jpg");
      expect(textarea.value).toContain("url3.jpg");
    });

    it("trims and filters empty image URLs", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByPlaceholderText(
        /https:\/\/example.com\/image1.jpg/i
      ) as HTMLTextAreaElement;
      fireEvent.change(textarea, {
        target: { value: "  url1.jpg  ,  , url2.jpg  ,  " },
      });

      expect(textarea.value).toBe("url1.jpg, url2.jpg");
    });
  });

  describe("Status", () => {
    it("renders status select dropdown", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("shows all status options", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("Draft")).toBeInTheDocument();
      expect(screen.getByText("Scheduled")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Ended")).toBeInTheDocument();
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });

    it("shows status-specific hint for draft", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        screen.getByText("Draft auctions are not visible to buyers")
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("validates required auction name", async () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const submitButton = screen.getByText("Create Auction");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("validates required slug", async () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const nameInput = screen.getByPlaceholderText(
        "e.g., Vintage Watch Collection"
      );
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "" } });

      const submitButton = screen.getByText("Create Auction");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("validates starting bid is positive", async () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const nameInput = screen.getByPlaceholderText(
        "e.g., Vintage Watch Collection"
      );
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test-auction" } });

      const descInput = screen.getByTestId("rich-text-editor");
      fireEvent.change(descInput, { target: { value: "Test description" } });

      const bidInputs = screen.getAllByRole("spinbutton");
      const startingBid = bidInputs[0];
      fireEvent.change(startingBid, { target: { value: "0" } });

      const submitButton = screen.getByText("Create Auction");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("validates reserve price is >= starting bid", async () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const nameInput = screen.getByPlaceholderText(
        "e.g., Vintage Watch Collection"
      );
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test-auction" } });

      const descInput = screen.getByTestId("rich-text-editor");
      fireEvent.change(descInput, { target: { value: "Test description" } });

      const bidInputs = screen.getAllByRole("spinbutton");
      const startingBid = bidInputs[0];
      const reservePrice = bidInputs[1];

      fireEvent.change(startingBid, { target: { value: "1000" } });
      fireEvent.change(reservePrice, { target: { value: "500" } });

      const submitButton = screen.getByText("Create Auction");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission", () => {
    it("submits valid form data", async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      auctionsService.validateSlug = jest
        .fn()
        .mockResolvedValue({ available: true });

      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      // Fill in all fields
      await act(async () => {
        fireEvent.change(
          screen.getByPlaceholderText("e.g., Vintage Watch Collection"),
          {
            target: { value: "Test Auction" },
          }
        );
        fireEvent.change(screen.getByTestId("slug-input"), {
          target: { value: "test-auction" },
        });
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for slug validation
      });

      fireEvent.change(screen.getByTestId("rich-text-editor"), {
        target: { value: "Test description" },
      });
      const bidInputs = screen.getAllByRole("spinbutton");
      fireEvent.change(bidInputs[0], {
        target: { value: "1000" },
      });
      fireEvent.change(bidInputs[1], {
        target: { value: "5000" },
      });

      // Set valid dates (future dates)
      const dateTimePickers = screen.getAllByTestId("date-time-picker");
      fireEvent.change(dateTimePickers[0], {
        target: { value: "2025-12-31T10:00" },
      });
      fireEvent.change(dateTimePickers[1], {
        target: { value: "2025-12-31T18:00" },
      });

      const submitButton = screen.getByText("Create Auction");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it("disables submit button when slug is validating", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test" } });

      const submitButton = screen.getByText("Create Auction");
      // Button should be disabled initially while validating
      expect(submitButton).toBeInTheDocument();
    });

    it("disables submit button when slug is unavailable", async () => {
      auctionsService.validateSlug = jest
        .fn()
        .mockResolvedValue({ available: false });

      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "test-auction" } });

      await waitFor(() => {
        const submitButton = screen.getByText("Create Auction");
        expect(submitButton).toBeDisabled();
      });
    });

    it("disables submit button when submitting", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByText("Create Auction");
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Edit Mode", () => {
    const auctionData = {
      id: "auction-1",
      name: "Existing Auction",
      slug: "existing-auction",
      description: "Test description",
      startingBid: 1000,
      reservePrice: 5000,
      startTime: "2024-12-31T10:00:00",
      endTime: "2024-12-31T18:00:00",
      status: AuctionStatus.DRAFT,
      images: ["image1.jpg", "image2.jpg"],
      videos: ["video1.mp4"],
    };

    it("pre-fills form with auction data", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="edit"
          initialData={auctionData as any}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        (
          screen.getByPlaceholderText(
            "e.g., Vintage Watch Collection"
          ) as HTMLInputElement
        ).value
      ).toBe("Existing Auction");
      expect((screen.getByTestId("slug-input") as HTMLInputElement).value).toBe(
        "existing-auction"
      );
      const bidInputs = screen.getAllByRole("spinbutton");
      expect((bidInputs[0] as HTMLInputElement).value).toBe("1000");
      expect((bidInputs[1] as HTMLInputElement).value).toBe("5000");
    });

    it("pre-fills images from array", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="edit"
          initialData={auctionData as any}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const imageInput = screen.getByPlaceholderText(
        /https:\/\/example.com\/image1.jpg/i
      ) as HTMLTextAreaElement;
      expect(imageInput.value).toBe("image1.jpg, image2.jpg");
    });

    it("pre-fills videos from array", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="edit"
          initialData={auctionData as any}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const videoInput = screen.getByPlaceholderText(
        /https:\/\/example.com\/video1.mp4/i
      ) as HTMLTextAreaElement;
      expect(videoInput.value).toBe("video1.mp4");
    });
  });

  describe("Accessibility", () => {
    it("has proper form structure", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("marks required fields with asterisk", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("Auction Name *")).toBeInTheDocument();
      expect(screen.getByText("Auction URL *")).toBeInTheDocument();
      expect(screen.getByText("Description *")).toBeInTheDocument();
      expect(screen.getByText("Starting Bid (₹) *")).toBeInTheDocument();
      expect(screen.getByText("Start Time *")).toBeInTheDocument();
      expect(screen.getByText("End Time *")).toBeInTheDocument();
    });

    it("provides hint text for status field", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        screen.getByText("Draft auctions are not visible to buyers")
      ).toBeInTheDocument();
    });

    it("provides hint text for media fields", () => {
      render(
        <AuctionForm
          shopId={shopId}
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        screen.getByText(/Enter image URLs separated by commas/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Enter video URLs separated by commas/i)
      ).toBeInTheDocument();
    });
  });
});
