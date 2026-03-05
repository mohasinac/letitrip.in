/**
 * MediaUploadField Tests
 *
 * Covers: render with/without current value, file selection triggers onUpload,
 * loading state, error state, remove button, disabled state.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// --- Mocks ---

jest.mock("@/components", () => ({
  Alert: ({
    children,
    variant,
    description,
  }: {
    children?: React.ReactNode;
    variant?: string;
    description?: string;
  }) => (
    <div data-testid="alert" data-variant={variant}>
      {description ?? children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: string;
  }) => (
    <button type={(type as "button" | "submit" | "reset") ?? "button"} onClick={onClick}>
      {children}
    </button>
  ),
  Label: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  Span: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Spinner: ({ size }: { size?: string }) => (
    <div data-testid="spinner" data-size={size} />
  ),
  Text: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <p>{children}</p>,
  TextLink: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-3" },
    themed: {
      textSecondary: "text-gray-600",
      border: "border-gray-200",
      bgSecondary: "bg-gray-50",
    },
  },
}));

import { MediaUploadField } from "../MediaUploadField";

describe("MediaUploadField", () => {
  const mockOnUpload = jest.fn();
  const baseProps = {
    label: "Video",
    value: "",
    onChange: jest.fn(),
    onUpload: mockOnUpload,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders label and upload button when no value", () => {
    render(<MediaUploadField {...baseProps} />);
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Choose file to upload")).toBeInTheDocument();
  });

  it("shows 'Replace file' text when value is set (non-video/image)", () => {
    render(<MediaUploadField {...baseProps} value="https://ex.com/file.pdf" />);
    expect(screen.getByText("Replace file")).toBeInTheDocument();
  });

  it("renders a link for non-image non-video file URLs", () => {
    render(<MediaUploadField {...baseProps} value="https://ex.com/file.pdf" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://ex.com/file.pdf");
  });

  it("calls onUpload with File and calls onChange with the returned URL", async () => {
    mockOnUpload.mockResolvedValue("https://cdn.example.com/out.mp4");
    const onChange = jest.fn();
    render(<MediaUploadField {...baseProps} onChange={onChange} />);

    const input = document.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    const file = new File(["video"], "demo.mp4", { type: "video/mp4" });
    Object.defineProperty(input, "files", { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file);
      expect(onChange).toHaveBeenCalledWith("https://cdn.example.com/out.mp4");
    });
  });

  it("shows spinner while onUpload promise is pending", async () => {
    let resolveUpload!: (url: string) => void;
    mockOnUpload.mockReturnValue(
      new Promise<string>((res) => {
        resolveUpload = res;
      }),
    );
    render(<MediaUploadField {...baseProps} />);

    const input = document.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    const file = new File(["v"], "demo.mp4", { type: "video/mp4" });
    Object.defineProperty(input, "files", { value: [file] });
    fireEvent.change(input);

    await waitFor(() =>
      expect(screen.getByTestId("spinner")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Choose file to upload")).not.toBeInTheDocument();

    // resolve to clean up pending promise
    resolveUpload("https://cdn.example.com/out.mp4");
  });

  it("shows error alert when onUpload rejects", async () => {
    mockOnUpload.mockRejectedValue(new Error("Upload failed"));
    render(<MediaUploadField {...baseProps} />);

    const input = document.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    const file = new File(["v"], "demo.mp4", { type: "video/mp4" });
    Object.defineProperty(input, "files", { value: [file] });
    fireEvent.change(input);

    await waitFor(() =>
      expect(screen.getByTestId("alert")).toBeInTheDocument(),
    );
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });

  it("hides upload button and remove button when disabled", () => {
    render(
      <MediaUploadField
        {...baseProps}
        value="https://ex.com/file.pdf"
        disabled
      />,
    );
    expect(screen.queryByText("Replace file")).not.toBeInTheDocument();
    expect(screen.queryByText("Remove")).not.toBeInTheDocument();
  });

  it("calls onChange with empty string when Remove is clicked", () => {
    const onChange = jest.fn();
    render(
      <MediaUploadField
        {...baseProps}
        value="https://ex.com/doc.pdf"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("Remove"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("renders helperText when provided and no error", () => {
    render(<MediaUploadField {...baseProps} helperText="Max 50MB" />);
    expect(screen.getByText("Max 50MB")).toBeInTheDocument();
  });
});
