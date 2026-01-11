"use client";

import { FormRichText } from "@/components/forms/FormRichText";
import { useState } from "react";

/**
 * Demo page for FormRichText component
 * Shows rich text editor with formatting toolbar
 */
export default function FormRichTextDemo() {
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [error, setError] = useState("");
  const [content3, setContent3] = useState(
    "<h2>Welcome to the Rich Text Editor</h2><p>This is a <strong>pre-filled</strong> example with some <em>formatted</em> text.</p><ul><li>List item 1</li><li>List item 2</li><li>List item 3</li></ul><p>You can <a href='https://example.com'>add links</a> and more!</p>"
  );
  const [content4, setContent4] = useState("");
  const [content5, setContent5] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strip HTML tags to check if there's actual content
    const textContent = content2.replace(/<[^>]*>/g, "").trim();

    if (!textContent) {
      setError("Description is required");
      return;
    }

    if (textContent.length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }

    setError("");
    alert("Form submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FormRichText Demo
          </h1>
          <p className="text-gray-600">
            Rich text editor with formatting toolbar using React Quill
          </p>
        </div>

        {/* Example 1: Basic Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Usage</h2>

          <FormRichText
            label="Blog Post Content"
            value={content1}
            onChange={setContent1}
            placeholder="Start writing your blog post..."
            helperText="Use the toolbar above to format your text"
          />

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">HTML Output:</p>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all overflow-x-auto max-h-32">
              {content1 || "(empty)"}
            </pre>
          </div>
        </div>

        {/* Example 2: With Validation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">With Validation</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormRichText
              label="Product Description"
              value={content2}
              onChange={(value) => {
                setContent2(value);
                // Clear error on change
                if (error) {
                  setError("");
                }
              }}
              placeholder="Enter product description..."
              error={error}
              required
              helperText="Required field. Minimum 10 characters."
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Form
            </button>
          </form>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Validation Rules:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Description is required</li>
              <li>• Minimum 10 characters (excluding HTML tags)</li>
            </ul>
          </div>
        </div>

        {/* Example 3: Pre-filled Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Pre-filled Content</h2>

          <FormRichText
            label="Edit Existing Content"
            value={content3}
            onChange={setContent3}
            helperText="This editor has pre-filled HTML content"
          />

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-2">
              Rendered Output:
            </p>
            <div
              className="text-sm text-green-900 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content3 }}
            />
          </div>
        </div>

        {/* Example 4: Toolbar Presets */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Toolbar Presets</h2>

          <div className="space-y-4">
            <FormRichText
              label="Minimal Toolbar"
              value={content4}
              onChange={setContent4}
              modules="minimal"
              placeholder="Only basic formatting (bold, italic, underline, link)"
              helperText="Minimal toolbar for simple formatting"
            />

            <FormRichText
              label="Standard Toolbar (Default)"
              value={content5}
              onChange={setContent5}
              modules="standard"
              placeholder="Standard formatting options"
              helperText="Balanced set of formatting options"
            />

            <FormRichText
              label="Full Toolbar"
              value=""
              modules="full"
              placeholder="All formatting options available"
              helperText="Complete set of formatting tools"
            />
          </div>
        </div>

        {/* Example 5: Component States */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Component States</h2>

          <div className="space-y-4">
            <FormRichText
              label="Compact Size"
              value="<p>Compact editor with smaller padding</p>"
              compact
              minHeight="100px"
              helperText="Compact variant"
            />

            <FormRichText
              label="Custom Height"
              value="<p>Editor with custom min and max height</p>"
              minHeight="200px"
              maxHeight="300px"
              helperText="Min: 200px, Max: 300px"
            />

            <FormRichText
              label="Read Only"
              value="<p><strong>This content is read-only</strong> and cannot be edited.</p>"
              readOnly
              helperText="Read-only mode"
            />

            <FormRichText
              label="Disabled"
              value="<p>This editor is disabled</p>"
              disabled
              helperText="Disabled state"
            />

            <FormRichText
              label="No Toolbar"
              value="<p>Editor without toolbar (bubble theme)</p>"
              showToolbar={false}
              helperText="Hidden toolbar - select text to see bubble menu"
            />
          </div>
        </div>

        {/* Example 6: Real-world Use Cases */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Real-world Use Cases</h2>

          <div className="space-y-4">
            <FormRichText
              label="Blog Post"
              value=""
              modules="full"
              minHeight="300px"
              placeholder="Write your blog post with full formatting options..."
              helperText="Perfect for blog posts with images, videos, and rich formatting"
            />

            <FormRichText
              label="Email Template"
              value=""
              modules="standard"
              minHeight="200px"
              placeholder="Compose your email..."
              helperText="Standard formatting for professional emails"
            />

            <FormRichText
              label="Comment"
              value=""
              modules="minimal"
              minHeight="100px"
              placeholder="Add your comment..."
              helperText="Simple formatting for user comments"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              ✓ <strong>React Quill Integration:</strong> Built on industry-standard
              Quill.js editor
            </li>
            <li>
              ✓ <strong>Toolbar Presets:</strong> Minimal, Standard, and Full
              configurations
            </li>
            <li>
              ✓ <strong>Rich Formatting:</strong> Headers, bold, italic, underline,
              strike, colors
            </li>
            <li>
              ✓ <strong>Lists & Indentation:</strong> Ordered and unordered lists
              with nesting
            </li>
            <li>
              ✓ <strong>Links & Media:</strong> Insert links, images, and videos
            </li>
            <li>
              ✓ <strong>Code Blocks:</strong> Syntax-highlighted code blocks
            </li>
            <li>
              ✓ <strong>Blockquotes:</strong> Beautiful blockquote styling
            </li>
            <li>
              ✓ <strong>Custom Heights:</strong> Configurable min and max height
            </li>
            <li>
              ✓ <strong>Character Count:</strong> Shows character count (excluding
              HTML)
            </li>
            <li>
              ✓ <strong>Read-only Mode:</strong> Display formatted content without
              editing
            </li>
            <li>
              ✓ <strong>SSR Compatible:</strong> Dynamic import to avoid server-side
              rendering issues
            </li>
            <li>
              ✓ <strong>Accessible:</strong> Keyboard navigation and focus
              management
            </li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Usage Example:</h3>
          <pre className="text-xs text-gray-800 overflow-x-auto">
            {`import { FormRichText } from "@/components/forms/FormRichText";

function BlogEditor() {
  const [content, setContent] = useState("");

  return (
    <FormRichText
      label="Blog Post Content"
      value={content}
      onChange={setContent}
      modules="full"
      minHeight="300px"
      placeholder="Start writing..."
      required
      helperText="Write your blog post with rich formatting"
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
