import { useState } from "react";
import { FormLabel } from "@letitrip/react-library";
import { X } from "lucide-react";
import type { BlogFormData, OnBlogChange } from "./types";

interface CategoryTagsStepProps {
  formData: BlogFormData;
  onChange: OnBlogChange;
  error?: string;
}

const CATEGORIES = [
  "News",
  "Guides",
  "Updates",
  "Tips",
  "Events",
  "Announcements",
  "Tutorials",
  "Reviews",
];

export function CategoryTagsStep({
  formData,
  onChange,
  error,
}: CategoryTagsStepProps) {
  const [tagInput, setTagInput] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange("category", e.target.value);
    setCustomCategory("");
  };

  const handleCustomCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCustomCategory(e.target.value);
    onChange("category", e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      onChange("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(
      "tags",
      formData.tags.filter((t) => t !== tag),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Category & Tags
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Organize your blog post with categories and tags
        </p>
      </div>

      <div>
        <FormLabel required>Category</FormLabel>
        <div className="flex gap-2">
          <select
            name="category"
            value={customCategory ? "" : formData.category}
            onChange={handleCategoryChange}
            className={`flex-1 rounded-lg border ${
              error ? "border-red-500" : "border-gray-300"
            } px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>
          <span className="text-gray-500 self-center">or</span>
          <input
            type="text"
            placeholder="Custom category"
            value={customCategory}
            onChange={handleCustomCategoryChange}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <FormLabel>Tags</FormLabel>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTag())
            }
            placeholder="Add tag and press Enter"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  type="button"
                  className="hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => onChange("featured", e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">
            Feature this post (show in featured sections and homepage)
          </span>
        </label>
      </div>
    </div>
  );
}
