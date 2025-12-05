/**
 * @fileoverview React Component
 * @module src/components/common/RichTextEditor
 * @description This file contains the RichTextEditor component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { logError } from "@/lib/firebase-error-logger";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Subscript,
  Superscript,
  Table as TableIcon,
  Underline,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";

/**
 * Rich Text Editor Component
 * For product descriptions, blog posts, and other rich content
 * Includes formatting, lists, links, images, tables, and HTML output
 */

type EditorTool =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "h1"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "link"
  | "blockquote"
  | "code"
  | "undo"
  | "redo"
  | "clear"
  // New tools
  | "image"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "alignJustify"
  | "textColor"
  | "highlight"
  | "table"
  | "horizontalRule"
  | "codeBlock"
  | "subscript"
  | "superscript";

/**
 * EditorButton interface
 * 
 * @interface
 * @description Defines the structure and contract for EditorButton
 */
interface EditorButton {
  /** Tool */
  tool: EditorTool;
  /** Icon */
  icon: React.ReactNode;
  /** Label */
  label: string;
  /** Command */
  command?: string;
  /** Value */
  value?: string;
  /** Has Dropdown */
  hasDropdown?: boolean;
  /** Group */
  group?: string;
}

/**
 * RichTextEditorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for RichTextEditorProps
 */
interface RichTextEditorProps {
  /** Id */
  id?: string;
  /** Value */
  value: string;
  /** On Change */
  onChange: (value: string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Min Height */
  minHeight?: number;
  /** Max Height */
  maxHeight?: number;
  /** Disabled */
  disabled?: boolean;
  /** Error */
  error?: string;
  /** Show Char Count */
  showCharCount?: boolean;
  /** Max Chars */
  maxChars?: number;
  /** Tools */
  tools?: EditorTool[];
  /** Class Name */
  className?: string;
  /** Context for image uploads (product, shop, auction, etc.) */
  imageUploadContext?: "product" | "shop" | "auction" | "category" | "blog";
  /** Context ID for image uploads */
  imageUploadContextId?: string;
  /** Callback when image is uploaded */
  onImageUpload?: (url: string) => void;
}

/**
 * DEFAULT_TOOLS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for default tools
 */
const DEFAULT_TOOLS: EditorTool[] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "link",
  "image",
  "blockquote",
  "alignLeft",
  "alignCenter",
  "alignRight",
  "textColor",
  "highlight",
  "table",
  "horizontalRule",
  "codeBlock",
  "undo",
  "redo",
  "clear",
];

const BASIC/**
 * TEXT_COLORS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for text colors
 */
_TOOLS: EditorTool[] = [
  "bold",
  "italic",
  "underline",
  "ul",
  "ol",
  "link",
  "undo",
  "redo",
];

const TEXT_COLORS = [
  { name: "Default", value: "" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", value: "" },
  { n/**
 * EDITOR_BUTTONS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for editor buttons
 */
ame: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Purple", value: "#e9d5ff" },
];

const EDITOR_BUTTONS: EditorButton[] = [
  {
    /** Tool */
    tool: "bold",
    /** Icon */
    icon: <Bold className="w-4 h-4" />,
    /** Label */
    label: "Bold (Ctrl+B)",
    /** Command */
    command: "bold",
    /** Group */
    group: "format",
  },
  {
    /** Tool */
    tool: "italic",
    /** Icon */
    icon: <Italic className="w-4 h-4" />,
    /** Label */
    label: "Italic (Ctrl+I)",
    /** Command */
    command: "italic",
    /** Group */
    group: "format",
  },
  {
    /** Tool */
    tool: "underline",
    /** Icon */
    icon: <Underline className="w-4 h-4" />,
    /** Label */
    label: "Underline (Ctrl+U)",
    /** Command */
    command: "underline",
    /** Group */
    group: "format",
  },
  {
    /** Tool */
    tool: "strikethrough",
    /** Icon */
    icon: <Strikethrough className="w-4 h-4" />,
    /** Label */
    label: "Strikethrough",
    /** Command */
    command: "strikeThrough",
    /** Group */
    group: "format",
  },
  {
    /** Tool */
    tool: "subscript",
    /** Icon */
    icon: <Subscript className="w-4 h-4" />,
    /** Label */
    label: "Subscript",
    /** Command */
    command: "subscript",
    /** Group */
    group: "format",
  },
  {
    /** Tool */
    tool: "superscript",
    /** Icon */
    icon: <Superscript className="w-4 h-4" />,
    /** Label */
    label: "Superscript",
    /** Command */
    command: "superscript",
    /** Group */
    group: "format",
  },
  {
    /** Tool */
    tool: "h1",
    /** Icon */
    icon: <Heading1 className="w-4 h-4" />,
    /** Label */
    label: "Heading 1",
    /** Command */
    command: "formatBlock",
    /** Value */
    value: "h1",
    /** Group */
    group: "heading",
  },
  {
    /** Tool */
    tool: "h2",
    /** Icon */
    icon: <Heading2 className="w-4 h-4" />,
    /** Label */
    label: "Heading 2",
    /** Command */
    command: "formatBlock",
    /** Value */
    value: "h2",
    /** Group */
    group: "heading",
  },
  {
    /** Tool */
    tool: "h3",
    /** Icon */
    icon: <Heading3 className="w-4 h-4" />,
    /** Label */
    label: "Heading 3",
    /** Command */
    command: "formatBlock",
    /** Value */
    value: "h3",
    /** Group */
    group: "heading",
  },
  {
    /** Tool */
    tool: "ul",
    /** Icon */
    icon: <List className="w-4 h-4" />,
    /** Label */
    label: "Bullet List",
    /** Command */
    command: "insertUnorderedList",
    /** Group */
    group: "list",
  },
  {
    /** Tool */
    tool: "ol",
    /** Icon */
    icon: <ListOrdered className="w-4 h-4" />,
    /** Label */
    label: "Numbered List",
    /** Command */
    command: "insertOrderedList",
    /** Group */
    group: "list",
  },
  {
    /** Tool */
    tool: "alignLeft",
    /** Icon */
    icon: <AlignLeft className="w-4 h-4" />,
    /** Label */
    label: "Align Left",
    /** Command */
    command: "justifyLeft",
    /** Group */
    group: "align",
  },
  {
    /** Tool */
    tool: "alignCenter",
    /** Icon */
    icon: <AlignCenter className="w-4 h-4" />,
    /** Label */
    label: "Align Center",
    /** Command */
    command: "justifyCenter",
    /** Group */
    group: "align",
  },
  {
    /** Tool */
    tool: "alignRight",
    /** Icon */
    icon: <AlignRight className="w-4 h-4" />,
    /** Label */
    label: "Align Right",
    /** Command */
    command: "justifyRight",
    /** Group */
    group: "align",
  },
  {
    /** Tool */
    tool: "alignJustify",
    /** Icon */
    icon: <AlignJustify className="w-4 h-4" />,
    /** Label */
    label: "Justify",
    /** Command */
    command: "justifyFull",
    /** Group */
    group: "align",
  },
  {
    /** Tool */
    tool: "textColor",
    /** Icon */
    icon: <Palette className="w-4 h-4" />,
    /** Label */
    label: "Text Color",
    /** Has Dropdown */
    hasDropdown: true,
    /** Group */
    group: "color",
  },
  {
    /** Tool */
    tool: "highlight",
    /** Icon */
    icon: <Highlighter className="w-4 h-4" />,
    /** Label */
    label: "Highlight",
    /** Has Dropdown */
    hasDropdown: true,
    /** Group */
    group: "color",
  },
  {
    /** Tool */
    tool: "link",
    /** Icon */
    icon: <LinkIcon className="w-4 h-4" />,
    /** Label */
    label: "Insert Link",
    /** Command */
    command: "createLink",
    /** Group */
    group: "insert",
  },
  {
    /** Tool */
    tool: "image",
    /** Icon */
    icon: <ImageIcon className="w-4 h-4" />,
    /** Label */
    label: "Insert Image",
    /** Has Dropdown */
    hasDropdown: true,
    /** Group */
    group: "insert",
  },
  {
    /** Tool */
    tool: "table",
    /** Icon */
    icon: <TableIcon className="w-4 h-4" />,
    /** Label */
    label: "Insert Table",
    /** Has Dropdown */
    hasDropdown: true,
    /** Group */
    group: "insert",
  },
  {
    /** Tool */
    tool: "horizontalRule",
    /** Icon */
    icon: <Minus className="w-4 h-4" />,
    /** Label */
    label: "Horizontal Rule",
    /** Command */
    command: "insertHorizontalRule",
    /** Group */
    group: "insert",
  },
  {
    /** Tool */
    tool: "blockquote",
    /** Icon */
    icon: <Quote className="w-4 h-4" />,
    /** Label */
    label: "Quote",
    /** Command */
    command: "formatBlock",
    /** Value */
    value: "blockquote",
    /** Group */
    group: "block",
  },
  {
    /** Tool */
    tool: "code",
    /** Icon */
    icon: <Code2 className="w-4 h-4" />,
    /** Label */
    label: "Inline Code",
    /** Group */
    group: "block",
  },
  {
    /** Tool */
    tool: "codeBlock",
    /** Icon */
    icon: <Code2 className="w-4 h-4" />,
    /** Label */
    label: "Code Block",
    /** Group */
    group: "block",
  },
  {
    /** Tool */
    tool: "undo",
    /** Icon */
    icon: <Undo2 className="w-4 h-4" />,
    /** Label */
    label: "Undo (Ctrl+Z)",
    /** Command */
    command: "undo",
    /** Group */
    group: "history",
  },
  {
    /** Tool */
    tool: "redo",
    /** Icon */
    icon: <Redo2 className="w-4 h-4" />,
    /** Label */
    label: "Redo (Ctrl+Y)",
    /** Command */
    command: "redo",
    /** Group */
    group: "history",
  },
  {
    /** Tool */
    tool: "clear",
    /** Icon */
    icon: <RemoveFormatting className="w-4 h-4" />,
    /** Label */
    label: "Clear Formatting",
    /** Command */
    command: "removeFormat",
    /** Group */
    group: "history",
  },
];

export default /**
 * Performs rich text editor operation
 *
 * @param {RichTextEditorProps} [{
  value,
  onChange,
  placeholder = "Enter text...",
  minHeight = 200,
  maxHeight = 600,
  disabled = false,
  error,
  showCharCount = false,
  maxChars,
  tools = DEFAULT_TOOLS,
  className = "",
  imageUploadContext = "blog",
  imageUploadContextId,
  onImageUpload,
}] - The {
  value,
  onchange,
  placeholder = "enter text...",
  minheight = 200,
  maxheight = 600,
  disabled = false,
  error,
  showcharcount = false,
  maxchars,
  tools = default_tools,
  classname = "",
  imageuploadcontext = "blog",
  imageuploadcontextid,
  onimageupload,
}
 *
 * @returns {any} The richtexteditor result
 *
 */
function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  minHeight = 200,
  maxHeight = 600,
  disabled = false,
  error,
  showCharCount = false,
  maxChars,
  tools = DEFAULT_TOOLS,
  className = "",
  imageUploadContext = "blog",
  imageUploadContextId,
  onImageUpload,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState<
    "textColor" | "highlight" | null
  >(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [tableSize, setTableSize] = useState({ rows: 3, cols: 3 });
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const savedSelection = useRef<Range | null>(null);

  // Filter buttons based on enabled tools
  /**
 * Performs visible buttons operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The visiblebuttons result
 *
 */
const visibleButtons = useMemo(
    () => EDITOR_BUTTONS.filter((btn) => tools.include/**
 * Performs groups operation
 *
 * @param {any} (btn - The (btn
 *
 * @returns {any} The groups result
 *
 */
s(btn.tool)),
    [tools],
  );

  // Group buttons for visual separation
  const groupedButtons = useMemo(() => {
    const groups: { [key: string]: EditorButton[] } = {};
    visibleButtons.forEach((btn) => {
      const group = btn.group || "other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(btn);
    });
    return Object.entries(groups);
  }, [visibleButtons]);

  // Initialize editor content only once/**
 * Performs save selection operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The saveselection result
 *
 */

  React.useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value;
      isI/**
 * Performs restore selection operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The restoreselection result
 *
 */
nitialized.current = true;
    }
  }, []);

  // Save current selection for later restoration
  const saveSelection = useCallback(() => {
    const selection = window.ge/**
 * Performs execute command operation
 *
 * @param {string} (command - The (command
 * @param {string} [value] - The value
 *
 * @returns {any} The executecommand result
 *
 */
tSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore saved selection
  const restoreSelection = useCallback(() => {
    if (savedSelection.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection.current);
      }
    }
  }, []);

  // Execute editor command
  const executeCommand = u/**
 * Handles insert link
 *
 * @param {any} ( - The (
 *
 * @returns {any} The handleinsertlink result
 *
 */
seCallback(
    (command: string, value?: string) => {
      if (disabled) return;

      if (command === "createLink") {
        saveSelection();
        const selection = window.getSelection();
        setLinkText(selection?.toString() || "");
        setLinkUrl("");
        setShowLinkModal(true);
        return;
      }

      document.execCommand(command, false, value);

      // Update value after command
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }

      // Refocus editor
      editorRef.current?.focus();
    },
    [disabled, onChange, saveSelection],
  );

  // Handle inserting a link
  const handleInsertLink = useCallback(() => {
    if (!linkUrl) return;

    restoreSelection();

    if (linkText) {
      // Insert link with custom text
      const anchor = document.createElement("a");
      anchor.href = linkUrl;
      anchor.textContent = linkText;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      const /**
 * Handles text color
 *
 * @param {string} (color - The (color
 *
 * @returns {any} The handletextcolor result
 *
 */
selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(anchor);
        range.setStartAfter(anchor);
        range.collapse(true);
        selection.removeAllRanges();
  /**
 * Handles highlight
 *
 * @param {string} (color - The (color
 *
 * @returns {any} The handlehighlight result
 *
 */
      selection.addRange(range);
      }
    } else {
      // Use selected text as link
      document.execCommand("createLink", false, linkUrl);
    }

    // Update value after command
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }

    setShowLinkModal(false);
    setLinkUrl("")/**
 * Handles image upload
 *
 * @param {File} async(file - The async(file
 *
 * @returns {Promise<any>} The handleimageupload result
 *
 */
;
    setLinkText("");
    editorRef.current?.focus();
  }, [linkUrl, linkText, onChange, restoreSelection]);

  // Handle text color
  const handleTextColor = useCallback(
    (color: string) => {
      if (color) {
        document.execCommand("foreColor", false, color);
      } else {
        document.execCommand("removeFormat", false);
      }
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      setShowColorPicker(null);
      editorRef.current?.focus();
    },
    [onChange],
  );

  // Handle highlight
  const handleHighlight = useCallback(
    (color: string) => {
      if (color) {
        document.execCommand("hiliteColor", false, color);
      } else {
        document.execCommand("removeFormat", false);
      }
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      setShowColorPicker(null);
      editorRef.current?.focus();
    },
    [onChange],
  );

  // Handle image upload from file
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("context", imageUploadContext);
        if (imageUploadContextId) {
          formData.append("contextId", imageUploadContextId);
      /**
 * Performs insert image operation
 *
 * @param {string} (url - The (url
 *
 * @returns {any} The insertimage result
 *
 */
  }

        const response = await fetch("/api/media/upload", {
          /** Method */
          method: "POST",
          /** Body */
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const result = await response.json();
        if (result.success && result.url) {
          insertImage(result.url);
          onImageUpload?.(result.url);
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (error) {
        logError(error as Error, {
          /** Component */
          component: "RichTextEditor.handleImageUpload",
          /** Metadata */
          metadata: {
            /** Contex/**
 * Performs insert table operation
 *
 * @param {number} (rows - The (rows
 * @param {number} cols - The cols
 *
 * @returns {any} The inserttable result
 *
 */
t */
            context: imageUploadContext,
            /** Context Id */
            contextId: imageUploadContextId,
          },
        });
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
        setShowImagePicker(false);
      }
    },
    [imageUploadContext, imageUploadContextId, onImageUpload],
  );

  // Insert image from URL
  const insertImage = useCallback(
    (url: string) => {
      if (!url) return;

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Uploaded image";
      img.className = "max-w-full h-auto rounded-lg my-2";
      /**
 * Performs insert code block operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The insertcodeblock result
 *
 */
img.style.maxWidth = "100%";

      editorRef.current?.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        /**
 * Performs insert inline code operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The insertinlinecode result
 *
 */
range.setStartAfter(img);
        range.collapse(true);
      } else {
        editorRef.current?.appendChild(img);
      }

      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }

      setShowImagePicker(false);
      setImageUrl("");
    },
    [onChange],
  );

  // Insert table
  const insertTable = useCallback(
    (rows: number, cols: number) => {
      let tableHtml =
        '<table class="border-collapse border border-gray-300 dark:border-gray-600 my-2 w-full">';
      for (let i = 0; i < rows; i++) {
        tableH/**
 * Handles button click
 *
 * @param {EditorButton} (btn - The (btn
 *
 * @returns {any} The handlebuttonclick result
 *
 */
tml += "<tr>";
        for (let j = 0; j < cols; j++) {
          const cellTag = i === 0 ? "th" : "td";
          tableHtml += `<${cellTag} class="border border-gray-300 dark:border-gray-600 p-2">&nbsp;</${cellTag}>`;
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</table>";

      document.execCommand("insertHTML", false, tableHtml);

      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }

      setShowTablePicker(false);
      editorRef.current?.focus();
    },
    [onChange],
  );

  // Insert code block
  const insertCodeBlock = useCallback(() => {
    const codeHtml =
      '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-2"><code>// Your code here</code></pre>';
    document.execCommand("insertHTML", false, codeHtml);

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }

    editorRef.current?.focus();
  }, [onChange]);

  // Insert inline code
  const insertInlineCode = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const codeHtml = `<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">${selection.toString/**
 * Handles input
 *
 * @param {any} ( - The (
 *
 * @returns {any} The handleinput result
 *
 */
()}</code>`;
      document.execCommand("insertHTML", false, codeHtml);
    } else {
      document.execCommand(
        "insertHTML",
        false,
        '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">code</code>',
      );
    }

    if (editorRef.current) {
      onChange(editorRef.current.innerHTM/**
 * Handles paste
 *
 * @param {React.ClipboardEvent} (e - The (e
 *
 * @returns {any} The handlepaste result
 *
 */
L);
    }

    editorRef.current?.focus();
  }, [onChange]);

  // Handle button click
  const handleButtonClick = useCallback(
    (btn: EditorButton) => {
      if (btn.hasDropdown) {
        if (btn.tool === "textColor") {
          setShowColorPicker(
            showColorPicker === "textColor" ? null : "textColor",
          );
          setShowImagePicker(false);
          setShowTablePicker(false);
        } else if (btn.tool === "highlight") {
          setShowColorPicker(
            showColorPicker === "highlight" ? null /**
 * Handles key down
 *
 * @param {React.KeyboardEvent} (e - The (e
 *
 * @returns {any} The handlekeydown result
 *
 */
: "highlight",
          );
          setShowImagePicker(false);
          setShowTablePicker(false);
        } else if (btn.tool === "image") {
          saveSelection();
          setShowImagePicker(!showImagePicker);
          setShowColorPicker(null);
          setShowTablePicker(false);
        } else if (btn.tool === "table") {
          setShowTablePicker(!showTablePicker);
          setShowColorPicker(null);
          setShowImagePicker(false);
        }
      } else if (btn.tool === "code") {
        insertInlineCode();
      } else if (btn.tool === "codeBlock") {
        insertCodeBlock();
      } else if (btn.command) {
        executeCommand(btn.command, btn.value);
      }
    },
    [
      showColorPicker,
      showIma/**
 * Performs char count operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The charcount result
 *
 */
gePicker,
      showTablePicker,
      executeCommand,
      insertInlineCode,
      insertCodeBlock,
      saveSelection/**
 * Checks if over limit
 *
 * @param {any} ( - The (
 *
 * @returns {any} The isoverlimit result
 *
 */
,
    ],
  );

  // Handle content change
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;

      // Check character limit
      if (maxChars) {
        const text = editorRef.current.innerText;
        if (text.length > maxChars) {
          return; // Don't update if over limit
        }
      }

      onC/**
 * Performs target operation
 *
 * @param {any} !target.closest(".rich-text-toolbar-dropdown" - The !target.closest(".rich-text-toolbar-dropdown"
 *
 * @returns {any} The target result
 *
 */
hange(html);
    }
  }, [maxChars, onChange]);

  // Handle paste - allow rich content but sanitize
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;

      // Check if pasting an image
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleImageUpload(file);
          }
          return;
        }
      }

      // For text, allow HTML but could sanitize if needed
      // Currently allowing rich paste for better UX
    },
    [disabled, handleImageUpload],
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            executeCommand("bold");
            break;
          case "i":
            e.preventDefault();
            executeCommand("italic");
            break;
          case "u":
            e.preventDefault();
            executeCommand("underline");
            break;
          case "z":
            if (e.shiftKey) {
              e.preventDefault();
              executeCommand("redo");
            }
            break;
          case "k":
            e.preventDefault();
            saveSelection();
            setShowLinkModal(true);
            break;
        }
      }
    },
    [executeCommand, saveSelection],
  );

  // Get character count
  const charCount = useMemo(() => {
    if (!showCharCount) return 0;
    const div = document.createElement("div");
    div.innerHTML = value;
    return div.innerText.length;
  }, [value, showCharCount]);

  // Check if over limit
  const isOverLimit = maxChars ? charCount > maxChars : false;

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    /**
     * Handles click outside event
     *
     * @param {MouseEvent} e - The e
     *
     * @returns {any} The handleclickoutside result
     */

    /**
     * Handles click outside event
     *
     * @param {MouseEvent} e - The e
     *
     * @returns {any} The handleclickoutside result
     */

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".rich-text-toolbar-dropdown")) {
        setShowColorPicker(null);
        setShowImagePicker(false);
        setShowTablePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Insert Link
              </h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Text (optional)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!linkUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div
        className={`
        flex flex-wrap gap-0.5 p-2 border border-b-0 border-gray-200 dark:border-gray-700 
        bg-gray-50 dark:bg-gray-800/50 rounded-t-lg
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      >
        {groupedButtons.map(([group, buttons], groupIdx) => (
          <React.Fragment key={group}>
            {/* Add separator between groups */}
            {groupIdx > 0 && (
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
            )}

            {buttons.map((btn) => (
              <div
                key={btn.tool}
                className="relative rich-text-toolbar-dropdown"
              >
                <button
                  type="button"
                  onClick={() => handleButtonClick(btn)}
                  disabled={disabled}
                  className={`
                    p-1.5 rounded text-gray-700 dark:text-gray-300
                    /** Hover */
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    /** Active */
                    active:bg-gray-300 dark:active:bg-gray-600
                    /** Disabled */
                    disabled:cursor-not-allowed disabled:opacity-50
                    transition-colors
                    ${
                      btn.hasDropdown &&
                      ((btn.tool === "textColor" &&
                        showColorPicker === "textColor") ||
                        (btn.tool === "highlight" &&
                          showColorPicker === "highlight") ||
                        (btn.tool === "image" && showImagePicker) ||
                        (btn.tool === "table" && showTablePicker))
                        ? "bg-gray-200 dark:bg-gray-700"
                        : ""
                    }
                  `}
                  title={btn.label}
                  aria-label={btn.label}
                >
                  {btn.icon}
                </button>

                {/* Color Picker Dropdown */}
                {btn.tool === "textColor" &&
                  showColorPicker === "textColor" && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
                      <div className="grid grid-cols-3 gap-1">
                        {TEXT_COLORS.map((color) => (
                          <button
                            key={color.value || "default"}
                            onClick={() => handleTextColor(color.value)}
                            className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{
                              /** Background Color */
                              backgroundColor: color.value || "transparent",
                            }}
                            title={color.name}
                          >
                            {!color.value && (
                              <span className="text-xs text-gray-500">A</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Highlight Color Picker */}
                {btn.tool === "highlight" &&
                  showColorPicker === "highlight" && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
                      <div className="grid grid-cols-3 gap-1">
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color.value || "none"}
                            onClick={() => handleHighlight(color.value)}
                            className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{
                              /** Background Color */
                              backgroundColor: color.value || "transparent",
                            }}
                            title={color.name}
                          >
                            {!color.value && (
                              <X className="w-4 h-4 mx-auto text-gray-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Image Picker Dropdown */}
                {btn.tool === "image" && showImagePicker && (
                  <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-64">
                    <div className="space-y-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {isUploading ? "Uploading..." : "Upload from device"}
                        </span>
                      </button>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Or paste image URL"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      {imageUrl && (
                        <button
                          onClick={() => insertImage(imageUrl)}
                          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Insert Image
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Table Picker Dropdown */}
                {btn.tool === "table" && showTablePicker && (
                  <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {tableSize.rows} × {tableSize.cols}
                    </div>
                    <div className="grid grid-cols-6 gap-1 mb-3">
                      {Array.from({ length: 6 }).map((_, row) =>
                        Array.from({ length: 6 }).map((_, col) => (
                          <button
                            key={`${row}-${col}`}
                            onMouseEnter={() =>
                              setTableSize({ rows: row + 1, cols: col + 1 })
                            }
                            onClick={() => insertTable(row + 1, col + 1)}
                            className={`w-5 h-5 border rounded transition-colors ${
                              row < tableSize.rows && col < tableSize.cols
                                ? "bg-blue-500 border-blue-600"
                                : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            }`}
                          />
                        )),
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={tableSize.rows}
                        onChange={(e) =>
                          setTableSize({
                            ...tableSize,
                            /** Rows */
                            rows: Math.max(
                              1,
                              Math.min(10, parseInt(e.target.value) || 1),
                            ),
                          })
                        }
                        className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <span className="text-gray-500 self-center">×</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={tableSize.cols}
                        onChange={(e) =>
                          setTableSize({
                            ...tableSize,
                            /** Cols */
                            cols: Math.max(
                              1,
                              Math.min(10, parseInt(e.target.value) || 1),
                            ),
                          })
                        }
                        className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() =>
                          insertTable(tableSize.rows, tableSize.cols)
                        }
                        className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        dir="ltr"
        suppressContentEditableWarning
        className={`
          px-4 py-3 outline-none overflow-y-auto
          prose prose-sm max-w-none dark:prose-invert
          text-gray-900 dark:text-white text-left
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              : "bg-white dark:bg-gray-800"
          }
          ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
          border-x border-b rounded-b-lg
          /** Focus */
          focus:ring-2 focus:ring-blue-500
          
          [&_table]:border-collapse [&_table]:w-full [&_table]:my-2
          [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:dark:bg-gray-700
          [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:p-2
          [&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-800 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
          [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
          [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:dark:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic
          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2
          [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline
        `}
        style={{
          /** Min Height */
          minHeight: `${minHeight}px`,
          /** Max Height */
          maxHeight: `${maxHeight}px`,
          /** Text Align */
          textAlign: "left",
          /** Unicode Bidi */
          unicodeBidi: "plaintext",
        }}
        data-placeholder={!value ? placeholder : ""}
      />

      {/* Footer */}
      <div className="flex justify-between items-center mt-2 text-sm">
        {/* Error message */}
        {error && (
          <span className="text-red-600 dark:text-red-400">{error}</span>
        )}

        {/* Character count */}
        {showCharCount && (
          <span
            className={`
            ml-auto
            ${
              isOverLimit
                ? "text-red-600 dark:text-red-400 font-semibold"
                : "text-gray-600 dark:text-gray-400"
            }
          `}
          >
            {charCount}
            {maxChars ? ` / ${maxChars}` : ""} characters
          </span>
        )}
      </div>

      {/* CSS for placeholder */}
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          /** Content */
          content: attr(data-placeholder);
          /** Color */
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable]:focus {
          /** Outline */
          outline: none;
        }
      `}</style>
    </div>
  );
}

// Export tool presets for convenience
export { BASIC_TOOLS, DEFAULT_TOOLS };
export type { EditorTool, RichTextEditorProps };
