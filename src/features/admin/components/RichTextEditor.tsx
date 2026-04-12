"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useState, useRef, useEffect } from "react";
import { Label, Button, Row } from "@mohasinac/appkit/ui";
import { Input } from "@/components";
import { useMediaUpload } from "@/hooks";
import type { MediaFilenameContext } from "@/utils";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";

export interface RichTextImageUploadConfig {
  folder?: string;
  isPublic?: boolean;
  context?: Omit<MediaFilenameContext, "index" | "ext">;
}

type ImageAlignment = "left" | "center" | "right";

type UrlPopoverSubmitPayload = {
  url: string;
  alt: string;
  align: ImageAlignment;
};

const IMAGE_ALIGNMENT_CLASSNAMES: Record<ImageAlignment, string> = {
  left: "max-w-full h-auto rounded mr-auto",
  center: "max-w-full h-auto rounded mx-auto",
  right: "max-w-full h-auto rounded ml-auto",
};

function isImageAlignment(value: unknown): value is ImageAlignment {
  return value === "left" || value === "center" || value === "right";
}

const AlignedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) => {
          const dataAlign = element.getAttribute("data-align");
          if (
            dataAlign === "left" ||
            dataAlign === "center" ||
            dataAlign === "right"
          ) {
            return dataAlign;
          }

          const className = element.getAttribute("class") ?? "";
          if (className.includes("ml-auto") && !className.includes("mr-auto")) {
            return "right";
          }
          if (className.includes("mx-auto")) {
            return "center";
          }
          if (className.includes("mr-auto")) {
            return "left";
          }
          return "center";
        },
        renderHTML: (attributes) => {
          const align = isImageAlignment(attributes.align)
            ? attributes.align
            : "center";

          return {
            "data-align": align,
            class: IMAGE_ALIGNMENT_CLASSNAMES[align],
          };
        },
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  imageUploadConfig?: RichTextImageUploadConfig;
}

/**
 * Inline URL input popover — replaces window.prompt()
 */
function UrlInputPopover({
  isOpen,
  onSubmit,
  onClose,
  label,
  onUploadFile,
  isUploading = false,
  uploadError,
  showImageControls = false,
}: {
  isOpen: boolean;
  onSubmit: (payload: UrlPopoverSubmitPayload) => void;
  onClose: () => void;
  label: string;
  onUploadFile?: (
    file: File,
    options: { alt: string; align: ImageAlignment },
  ) => Promise<void>;
  isUploading?: boolean;
  uploadError?: string | null;
  showImageControls?: boolean;
}) {
  const t = useTranslations("actions");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [altText, setAltText] = useState("");
  const [alignment, setAlignment] = useState<ImageAlignment>("center");

  useEffect(() => {
    if (isOpen) {
      setValue("");
      setAltText("");
      setAlignment("center");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-full left-0 z-50 mt-1 p-2 rounded-lg shadow-lg border ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.border}`}
    >
      <Label
        className={`block text-xs font-medium mb-1 ${THEME_CONSTANTS.themed.textSecondary}`}
      >
        {label}
      </Label>
      <div className="flex gap-1">
        <Input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value)
              onSubmit({ url: value, alt: altText.trim(), align: alignment });
            if (e.key === "Escape") onClose();
          }}
          className={`${THEME_CONSTANTS.input.base} text-sm w-56`}
          placeholder="https://..."
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (value) {
              onSubmit({ url: value, alt: altText.trim(), align: alignment });
            }
          }}
          disabled={isUploading}
          className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90"
        >
          {t("confirm")}
        </Button>
        {onUploadFile ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await onUploadFile(file, {
                  alt: altText.trim(),
                  align: alignment,
                });
                e.currentTarget.value = "";
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-2 py-1 text-xs bg-zinc-200 dark:bg-slate-700 rounded hover:bg-zinc-300"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isUploading}
          className="px-2 py-1 text-xs bg-zinc-200 dark:bg-slate-700 rounded hover:bg-zinc-300"
        >
          {t("cancel")}
        </Button>
      </div>
      {showImageControls ? (
        <div className="mt-2 space-y-2">
          <div>
            <Label
              className={`block text-xs font-medium mb-1 ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              Alt text
            </Label>
            <Input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className={`${THEME_CONSTANTS.input.base} text-sm w-full`}
              placeholder="Describe the image"
            />
          </div>
          <div>
            <Label
              className={`block text-xs font-medium mb-1 ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              Alignment
            </Label>
            <Row
              gap="px"
              className="rounded-md border border-zinc-300 dark:border-slate-600 p-1"
            >
              {(["left", "center", "right"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAlignment(option)}
                  className={`px-2 py-1 text-xs rounded ${alignment === option ? "bg-zinc-200 dark:bg-slate-700" : ""}`}
                >
                  {option}
                </Button>
              ))}
            </Row>
          </div>
        </div>
      ) : null}
      {onUploadFile ? (
        <p className={`mt-2 text-xs ${THEME_CONSTANTS.themed.textSecondary}`}>
          Paste an image URL or upload one through the shared media flow.
        </p>
      ) : null}
      {uploadError ? (
        <p className="mt-2 text-xs text-red-500 dark:text-red-400">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}

interface MenuBarProps {
  editor: Editor | null;
  imageUploadConfig?: RichTextImageUploadConfig;
  initialImageCount: number;
}

function MenuBar({
  editor,
  imageUploadConfig,
  initialImageCount,
}: MenuBarProps) {
  const [urlPopover, setUrlPopover] = useState<{
    type: "link" | "image" | null;
  }>({ type: null });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageIndexRef = useRef(initialImageCount);
  const { upload } = useMediaUpload();

  useEffect(() => {
    imageIndexRef.current = Math.max(imageIndexRef.current, initialImageCount);
  }, [initialImageCount]);

  // All hooks must be declared before any early return (Rules of Hooks).
  // `useEditor` initialises asynchronously so `editor` is null on the first
  // render; calling hooks after the null guard would change the hook count
  // between renders and trigger "Rendered more hooks than during the previous
  // render".
  const addLink = useCallback(() => {
    setUrlPopover({ type: "link" });
  }, []);

  const addImage = useCallback(() => {
    setUrlPopover({ type: "image" });
  }, []);

  const handleUrlSubmit = useCallback(
    ({ url, alt, align }: UrlPopoverSubmitPayload) => {
      if (!editor) return;
      if (urlPopover.type === "link") {
        editor.chain().focus().setLink({ href: url }).run();
      } else if (urlPopover.type === "image") {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: { src: url, alt, align },
          })
          .run();
      }
      setUploadError(null);
      setUrlPopover({ type: null });
    },
    [editor, urlPopover.type],
  );

  const handleUrlClose = useCallback(() => {
    setUploadError(null);
    setUrlPopover({ type: null });
  }, []);

  const handleImageUpload = useCallback(
    async (file: File, options: { alt: string; align: ImageAlignment }) => {
      if (!editor) return;

      setUploadError(null);
      setIsUploadingImage(true);
      imageIndexRef.current += 1;

      try {
        const baseContext = imageUploadConfig?.context ?? {
          type: "rich-text-image",
          entity: "content",
          name: "content",
        };
        const uploadedUrl = await upload(
          file,
          imageUploadConfig?.folder ?? "content",
          imageUploadConfig?.isPublic ?? true,
          {
            ...baseContext,
            index: imageIndexRef.current,
          } as MediaFilenameContext,
        );

        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: {
              src: uploadedUrl,
              alt: options.alt || file.name,
              align: options.align,
            },
          })
          .run();
        setUrlPopover({ type: null });
      } catch (error) {
        imageIndexRef.current = Math.max(
          initialImageCount,
          imageIndexRef.current - 1,
        );
        setUploadError(
          error instanceof Error ? error.message : "Unable to upload image.",
        );
      } finally {
        setIsUploadingImage(false);
      }
    },
    [editor, imageUploadConfig, initialImageCount, upload],
  );

  if (!editor) return null;

  return (
    <Row
      wrap
      gap="px"
      className={`relative border-b ${THEME_CONSTANTS.themed.borderColor} ${THEME_CONSTANTS.themed.bgTertiary} p-2`}
    >
      <UrlInputPopover
        isOpen={urlPopover.type !== null}
        onSubmit={handleUrlSubmit}
        onClose={handleUrlClose}
        label={
          urlPopover.type === "image" ? "Add image URL or upload" : "Enter URL"
        }
        onUploadFile={
          urlPopover.type === "image" ? handleImageUpload : undefined
        }
        isUploading={isUploadingImage}
        uploadError={uploadError}
        showImageControls={urlPopover.type === "image"}
      />
      {/* Text Formatting */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("bold") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("italic") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("strike") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Strikethrough"
      >
        <s>S</s>
      </Button>

      <div className="w-px h-6 bg-zinc-300 dark:bg-slate-600 mx-1" />

      {/* Headings */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("heading", { level: 1 })
            ? "bg-zinc-300 dark:bg-slate-600"
            : ""
        }`}
        title="Heading 1"
      >
        H1
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("heading", { level: 2 })
            ? "bg-zinc-300 dark:bg-slate-600"
            : ""
        }`}
        title="Heading 2"
      >
        H2
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("heading", { level: 3 })
            ? "bg-zinc-300 dark:bg-slate-600"
            : ""
        }`}
        title="Heading 3"
      >
        H3
      </Button>

      <div className="w-px h-6 bg-zinc-300 dark:bg-slate-600 mx-1" />

      {/* Lists */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("bulletList") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Bullet List"
      >
        • List
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("orderedList") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Numbered List"
      >
        1. List
      </Button>

      <div className="w-px h-6 bg-zinc-300 dark:bg-slate-600 mx-1" />

      {/* Blockquote & Code */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("blockquote") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Blockquote"
      >
        &quot;
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("code") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Inline Code"
      >
        <code className="text-xs">`code`</code>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("codeBlock") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Code Block (copyable)"
      >
        {"</>"}
      </Button>

      <div className="w-px h-6 bg-zinc-300 dark:bg-slate-600 mx-1" />

      {/* Link & Image */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addLink}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 ${
          editor.isActive("link") ? "bg-zinc-300 dark:bg-slate-600" : ""
        }`}
        title="Add Link"
      >
        Link
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addImage}
        className="px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700"
        title="Add Image"
      >
        Img
      </Button>

      <div className="w-px h-6 bg-zinc-300 dark:bg-slate-600 mx-1" />

      {/* Undo/Redo */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 disabled:opacity-50"
        title="Undo (Ctrl+Z)"
      >
        ↶
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="px-3 py-1.5 text-sm font-medium rounded hover:bg-zinc-200 dark:hover:bg-slate-700 disabled:opacity-50"
        title="Redo (Ctrl+Shift+Z)"
      >
        ↷
      </Button>
    </Row>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  editable = true,
  minHeight = "200px",
  imageUploadConfig,
}: RichTextEditorProps) {
  const initialImageCount = (content.match(/<img\b/gi) ?? []).length;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
        },
      }),
      AlignedImage,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none p-4 focus:outline-none`,
        style: `min-height: ${minHeight}`,
      },
    },
  });

  return (
    <div
      className={`border ${THEME_CONSTANTS.themed.borderColor} rounded-lg overflow-hidden ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      {editable && (
        <MenuBar
          editor={editor}
          imageUploadConfig={imageUploadConfig}
          initialImageCount={initialImageCount}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
