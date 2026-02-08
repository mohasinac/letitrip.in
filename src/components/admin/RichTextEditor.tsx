"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
}

interface MenuBarProps {
  editor: Editor | null;
}

function MenuBar({ editor }: MenuBarProps) {
  if (!editor) return null;

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("bold") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("italic") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("strike") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("heading", { level: 1 })
            ? "bg-gray-300 dark:bg-gray-600"
            : ""
        }`}
        title="Heading 1"
      >
        H1
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("heading", { level: 2 })
            ? "bg-gray-300 dark:bg-gray-600"
            : ""
        }`}
        title="Heading 2"
      >
        H2
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("heading", { level: 3 })
            ? "bg-gray-300 dark:bg-gray-600"
            : ""
        }`}
        title="Heading 3"
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("bulletList") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Bullet List"
      >
        • List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("orderedList") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Numbered List"
      >
        1. List
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Blockquote & Code */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("blockquote") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Blockquote"
      >
        &quot;
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("codeBlock") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Code Block"
      >
        {"</>"}
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Link & Image */}
      <button
        type="button"
        onClick={addLink}
        className={`px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("link") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Add Link"
      >
        🔗
      </button>

      <button
        type="button"
        onClick={addImage}
        className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Add Image"
      >
        🖼️
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        title="Redo (Ctrl+Shift+Z)"
      >
        ↷
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Clear Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Clear Formatting"
      >
        Clear
      </button>
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  editable = true,
  minHeight = "200px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
