"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Loader2, Tag, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "@/components/forms";

// Tag Interface
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  entityType?: "product" | "blog" | "shop";
  usageCount?: number;
}

// Color Palette
const TAG_COLORS = [
  {
    name: "Blue",
    value: "#3B82F6",
    bg: "bg-blue-500",
    text: "text-blue-700",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    name: "Green",
    value: "#10B981",
    bg: "bg-green-500",
    text: "text-green-700",
    lightBg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    name: "Red",
    value: "#EF4444",
    bg: "bg-red-500",
    text: "text-red-700",
    lightBg: "bg-red-50 dark:bg-red-900/20",
  },
  {
    name: "Yellow",
    value: "#F59E0B",
    bg: "bg-yellow-500",
    text: "text-yellow-700",
    lightBg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    name: "Purple",
    value: "#8B5CF6",
    bg: "bg-purple-500",
    text: "text-purple-700",
    lightBg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    name: "Pink",
    value: "#EC4899",
    bg: "bg-pink-500",
    text: "text-pink-700",
    lightBg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    name: "Indigo",
    value: "#6366F1",
    bg: "bg-indigo-500",
    text: "text-indigo-700",
    lightBg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    name: "Gray",
    value: "#6B7280",
    bg: "bg-gray-500",
    text: "text-gray-700",
    lightBg: "bg-gray-50 dark:bg-gray-900/20",
  },
];

export interface TagSelectorWithCreateProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  entityType?: "product" | "blog" | "shop";
  required?: boolean;
  error?: string;
  label?: string;
  maxTags?: number;
  className?: string;
}

export function TagSelectorWithCreate({
  value,
  onChange,
  entityType = "product",
  required = false,
  error,
  label = "Tags",
  maxTags = 10,
  className = "",
}: TagSelectorWithCreateProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTags();
  }, [entityType]);

  useEffect(() => {
    // Update selected tags when value changes
    if (value && allTags.length > 0) {
      const selected = allTags.filter((tag) => value.includes(tag.id));
      setSelectedTags(selected);
    }
  }, [value, allTags]);

  const loadTags = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // const data = await tagsService.list({ entityType });
      // setAllTags(data);

      // Mock data for now
      const mockTags: Tag[] = [
        {
          id: "1",
          name: "New Arrival",
          slug: "new-arrival",
          color: "#3B82F6",
          entityType,
          usageCount: 45,
        },
        {
          id: "2",
          name: "Best Seller",
          slug: "best-seller",
          color: "#10B981",
          entityType,
          usageCount: 32,
        },
        {
          id: "3",
          name: "Limited Edition",
          slug: "limited-edition",
          color: "#EF4444",
          entityType,
          usageCount: 18,
        },
        {
          id: "4",
          name: "Trending",
          slug: "trending",
          color: "#F59E0B",
          entityType,
          usageCount: 28,
        },
        {
          id: "5",
          name: "Premium",
          slug: "premium",
          color: "#8B5CF6",
          entityType,
          usageCount: 15,
        },
      ];
      setAllTags(mockTags);
    } catch (error) {
      console.error("Failed to load tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleAddTag = (tag: Tag) => {
    if (selectedTags.length >= maxTags) {
      toast.error(`Maximum ${maxTags} tags allowed`);
      return;
    }

    if (selectedTags.find((t) => t.id === tag.id)) {
      toast.error("Tag already selected");
      return;
    }

    const newSelected = [...selectedTags, tag];
    setSelectedTags(newSelected);
    onChange(newSelected.map((t) => t.id));
  };

  const handleRemoveTag = (tagId: string) => {
    const newSelected = selectedTags.filter((t) => t.id !== tagId);
    setSelectedTags(newSelected);
    onChange(newSelected.map((t) => t.id));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    try {
      setCreating(true);

      // TODO: Implement actual API call
      // const newTag = await tagsService.create({
      //   name: newTagName.trim(),
      //   slug: generateSlug(newTagName),
      //   color: newTagColor,
      //   entityType,
      // });

      // Mock data for now
      const newTag: Tag = {
        id: `tag_${Date.now()}`,
        name: newTagName.trim(),
        slug: generateSlug(newTagName),
        color: newTagColor,
        entityType,
        usageCount: 0,
      };

      setAllTags((prev) => [...prev, newTag]);
      handleAddTag(newTag);
      setShowForm(false);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0].value);
      toast.success("Tag created successfully");
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast.error("Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  const handleMoveTag = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedTags.length) return;

    const newSelected = [...selectedTags];
    [newSelected[index], newSelected[newIndex]] = [
      newSelected[newIndex],
      newSelected[index],
    ];
    setSelectedTags(newSelected);
    onChange(newSelected.map((t) => t.id));
  };

  const getTagColorClass = (color: string) => {
    const colorObj = TAG_COLORS.find((c) => c.value === color);
    return colorObj?.lightBg || "bg-gray-50 dark:bg-gray-900/20";
  };

  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableTags = filteredTags.filter(
    (tag) => !selectedTags.find((t) => t.id === tag.id)
  );

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading tags...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          <span className="ml-2 text-xs text-gray-500">
            ({selectedTags.length}/{maxTags})
          </span>
        </label>
      )}

      {/* Selected Tags with Drag to Reorder */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          {selectedTags.map((tag, index) => (
            <div
              key={tag.id}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                ${getTagColorClass(tag.color)}
              `}
            >
              {/* Drag Handle */}
              <button
                type="button"
                className="cursor-move touch-none"
                onMouseDown={(e) => e.preventDefault()}
              >
                <GripVertical className="w-3 h-3 text-gray-400" />
              </button>

              {/* Tag Name */}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {tag.name}
              </span>

              {/* Order Buttons (Mobile Fallback) */}
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveTag(index, "up")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ↑
                  </button>
                )}
                {index < selectedTags.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMoveTag(index, "down")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ↓
                  </button>
                )}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search & Create */}
      <div className="flex gap-2">
        <FormInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-secondary inline-flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Available Tags */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Click to add:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleAddTag(tag)}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                  ${getTagColorClass(tag.color)}
                  hover:ring-2 hover:ring-primary transition-all
                `}
              >
                <Tag className="w-3 h-3" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tag.name}
                </span>
                {tag.usageCount && tag.usageCount > 0 && (
                  <span className="text-xs text-gray-500">
                    ({tag.usageCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Create Tag Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Create New Tag
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Tag Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag Name
                </label>
                <FormInput
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., Best Seller"
                  maxLength={50}
                />
              </div>

              {/* Tag Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewTagColor(color.value)}
                      className={`
                        ${color.bg} h-10 rounded
                        ${
                          newTagColor === color.value
                            ? "ring-2 ring-offset-2 ring-primary"
                            : ""
                        }
                      `}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              {newTagName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getTagColorClass(
                      newTagColor
                    )}`}
                  >
                    <Tag className="w-3 h-3" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {newTagName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: {generateSlug(newTagName)}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="btn-primary flex-1"
                  disabled={creating || !newTagName.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Tag"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TagSelectorWithCreate;
