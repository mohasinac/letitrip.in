/**
 * BlogForm Tests
 *
 * Verifies form rendering, RichTextEditor for content, ImageUpload for cover,
 * Checkbox for isFeatured, and field change propagation.
 * TASK-23: useTranslations mocked � labels render as translation keys.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components", () => ({
  FormField: ({
    name,
    label,
    value,
    onChange,
    disabled,
    type,
  }: {
    name: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    type?: string;
    rows?: number;
    options?: unknown[];
    required?: boolean;
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      {type === "select" ? (
        <select
          id={name}
          data-testid={`field-${name}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <input
          id={name}
          data-testid={`field-${name}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  ),
  Checkbox: ({
    label,
    checked,
    onChange,
    disabled,
  }: {
    label?: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
  }) => (
    <label>
      <input
        type="checkbox"
        data-testid="checkbox-featured"
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
      />
      {label}
    </label>
  ),
  RichTextEditor: ({
    content,
    onChange,
    placeholder,
  }: {
    content: string;
    onChange: (v: string) => void;
    placeholder?: string;
    minHeight?: string;
  }) => (
    <textarea
      data-testid="rich-text-editor"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
  ImageUpload: ({
    currentImage,
    onUpload,
    label,
  }: {
    currentImage?: string;
    onUpload: (url: string) => void;
    folder?: string;
    label?: string;
    helperText?: string;
  }) => (
    <div data-testid="image-upload">
      {label && <span>{label}</span>}
      <input
        data-testid="image-upload-input"
        defaultValue={currentImage}
        onChange={(e) => onUpload(e.target.value)}
      />
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4" },
    typography: { label: "text-sm font-medium" },
    themed: { textSecondary: "text-gray-600" },
  },
}));

import { BlogForm } from "../BlogForm";

const basPost = {
  title: "My Post",
  slug: "my-post",
  excerpt: "Short description",
  content: "Full content here",
  coverImage: "",
  category: "news" as const,
  status: "draft" as const,
  tags: [],
  isFeatured: false,
  readTimeMinutes: 5,
};

describe("BlogForm", () => {
  it("renders all form fields including RichTextEditor", () => {
    render(<BlogForm post={basPost} onChange={jest.fn()} />);
    expect(screen.getByText("formTitle")).toBeInTheDocument();
    expect(screen.getByText("formContent")).toBeInTheDocument();
    expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
    expect(screen.getByText("formFeatured")).toBeInTheDocument();
  });

  it("renders RichTextEditor (not raw textarea) for content", () => {
    render(<BlogForm post={basPost} onChange={jest.fn()} />);
    expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
  });

  it("RichTextEditor onChange propagates content to parent", () => {
    const onChange = jest.fn();
    render(<BlogForm post={basPost} onChange={onChange} />);
    const editor = screen.getByTestId("rich-text-editor");
    fireEvent.change(editor, { target: { value: "Updated content" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Updated content" }),
    );
  });

  it("renders ImageUpload (not text input) for coverImage when not readonly", () => {
    render(<BlogForm post={basPost} onChange={jest.fn()} />);
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
  });

  it("hides ImageUpload when isReadonly=true", () => {
    render(<BlogForm post={basPost} onChange={jest.fn()} isReadonly={true} />);
    expect(screen.queryByTestId("image-upload")).not.toBeInTheDocument();
  });

  it("renders Checkbox (not raw input checkbox) for isFeatured", () => {
    render(<BlogForm post={basPost} onChange={jest.fn()} />);
    expect(screen.getByTestId("checkbox-featured")).toBeInTheDocument();
  });

  it("Checkbox onChange propagates isFeatured to parent", () => {
    const onChange = jest.fn();
    render(<BlogForm post={basPost} onChange={onChange} />);
    const checkbox = screen.getByTestId("checkbox-featured");
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ isFeatured: true }),
    );
  });

  it("title change auto-generates slug", () => {
    const onChange = jest.fn();
    render(<BlogForm post={basPost} onChange={onChange} />);
    const titleInput = screen.getByTestId("field-title");
    fireEvent.change(titleInput, { target: { value: "Hello World" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Hello World", slug: "hello-world" }),
    );
  });

  it("disabled when isReadonly=true � hides editor and disables checkbox", () => {
    render(<BlogForm post={basPost} onChange={jest.fn()} isReadonly={true} />);
    expect(screen.queryByTestId("rich-text-editor")).not.toBeInTheDocument();
    expect(screen.getByTestId("checkbox-featured")).toBeDisabled();
  });
});
