"use client";

import { FormFileUpload } from "@/components/forms/FormFileUpload";
import { useState } from "react";

/**
 * Demo page for FormFileUpload component
 * Shows file upload with drag-and-drop and preview
 */
export default function FormFileUploadDemo() {
  const [url1, setUrl1] = useState<string | null>(null);
  const [url2, setUrl2] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [url3, setUrl3] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url4, setUrl4] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url2) {
      setError("File is required");
      return;
    }

    setError("");
    alert(`File uploaded successfully: ${url2}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FormFileUpload Demo
          </h1>
          <p className="text-gray-600">
            File upload with drag-and-drop, preview, and validation
          </p>
        </div>

        {/* Example 1: Basic Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Usage</h2>

          <FormFileUpload
            label="Upload Image"
            value={url1}
            onChange={setUrl1}
            accept="image/*"
            helperText="Click or drag an image file to upload"
          />

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Uploaded URL:</p>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">
              {url1 || "(none)"}
            </pre>
          </div>
        </div>

        {/* Example 2: With Validation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">With Validation</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormFileUpload
              label="Product Image"
              value={url2}
              onChange={(url) => {
                setUrl2(url);
                // Clear error on change
                if (error) {
                  setError("");
                }
              }}
              accept="image/*"
              maxSize={2 * 1024 * 1024} // 2MB
              error={error}
              required
              helperText="Required field. Max size: 2MB"
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
              <li>• File is required</li>
              <li>• Only image files allowed</li>
              <li>• Maximum file size: 2MB</li>
            </ul>
          </div>
        </div>

        {/* Example 3: Manual Upload */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Manual Upload Mode</h2>

          <FormFileUpload
            label="Document Upload"
            value={url3}
            onChange={setUrl3}
            onFileSelect={setSelectedFile}
            accept="image/*,.pdf"
            autoUpload={false}
            helperText="Select a file, then click Upload File button"
          />

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Selected file:</p>
            <pre className="text-xs text-gray-800">
              {selectedFile
                ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(
                    1
                  )} KB)`
                : "(none)"}
            </pre>
          </div>
        </div>

        {/* Example 4: Different File Types */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Different File Types</h2>

          <div className="space-y-4">
            <FormFileUpload
              label="Images Only"
              value={null}
              accept="image/*"
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
              ]}
              helperText="JPEG, PNG, GIF, or WebP"
            />

            <FormFileUpload
              label="Videos Only"
              value={null}
              accept="video/*"
              allowedTypes={["video/mp4", "video/webm"]}
              helperText="MP4 or WebM"
            />

            <FormFileUpload
              label="PDF Documents"
              value={null}
              accept=".pdf,application/pdf"
              allowedTypes={["application/pdf"]}
              showPreview={false}
              helperText="PDF files only (no preview)"
            />
          </div>
        </div>

        {/* Example 5: States */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Component States</h2>

          <div className="space-y-4">
            <FormFileUpload
              label="Compact Size"
              value={null}
              accept="image/*"
              compact
              helperText="Compact variant with smaller padding"
            />

            <FormFileUpload
              label="Disabled"
              value={null}
              accept="image/*"
              disabled
              helperText="Disabled state"
            />

            <FormFileUpload
              label="Custom Preview Height"
              value={url4}
              onChange={setUrl4}
              accept="image/*"
              previewHeight="300px"
              helperText="Taller preview area (300px)"
            />

            <FormFileUpload
              label="Large File Size Limit"
              value={null}
              accept="image/*"
              maxSize={10 * 1024 * 1024}
              helperText="Accepts files up to 10MB"
            />
          </div>
        </div>

        {/* Example 6: Drag and Drop Demo */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Drag and Drop</h2>

          <FormFileUpload
            label="Try Dragging a File Here"
            value={null}
            accept="image/*"
            helperText="Drag and drop an image file into the area above"
          />

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-2">
              Drag & Drop Features:
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Visual feedback when dragging over the drop zone</li>
              <li>• Border changes to blue when drag is active</li>
              <li>• Background color changes to indicate drop target</li>
              <li>• Files are validated before upload</li>
              <li>• Drag and drop works on both desktop and tablet</li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              ✓ <strong>Drag and Drop:</strong> Full drag-and-drop support with
              visual feedback
            </li>
            <li>
              ✓ <strong>Image Preview:</strong> Automatic preview for image
              files
            </li>
            <li>
              ✓ <strong>Progress Tracking:</strong> Real-time upload progress
              display
            </li>
            <li>
              ✓ <strong>File Validation:</strong> Size and type validation
              before upload
            </li>
            <li>
              ✓ <strong>Auto Upload:</strong> Automatic upload on file selection
              (optional)
            </li>
            <li>
              ✓ <strong>Manual Upload:</strong> Option to review file before
              uploading
            </li>
            <li>
              ✓ <strong>Clear Function:</strong> Easy file removal with clear
              button
            </li>
            <li>
              ✓ <strong>Error Handling:</strong> Comprehensive error messages
              for validation
            </li>
            <li>
              ✓ <strong>Reuses useMediaUpload:</strong> Built on existing upload
              infrastructure
            </li>
            <li>
              ✓ <strong>Accessible:</strong> Keyboard navigation and screen
              reader support
            </li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Usage Example:</h3>
          <pre className="text-xs text-gray-800 overflow-x-auto">
            {`import { FormFileUpload } from "@/components/forms/FormFileUpload";

function ProductForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <FormFileUpload
      label="Product Image"
      value={imageUrl}
      onChange={setImageUrl}
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
      required
      helperText="Upload product image (max 5MB)"
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
