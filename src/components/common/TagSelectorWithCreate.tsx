/**
 * @fileoverview React Component
 * @module src/components/common/TagSelectorWithCreate
 * @description This file contains the TagSelectorWithCreate component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Loader2, Tag, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "@/components/forms/FormInput";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";

// Tag Interface
/**
 * Tag interface
 * 
 * @interface
 * @description Defines the structure and contract for Tag
 */
export interface Tag {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Color */
  color: string;
  /** Entity Type */
  entityType?: "product" | "blog" | "shop";
  /** Usage Count */
  usageCount?: number;
}

// Color Palette
/**
 * Performs t a g_ c o l o r s operation
 *
 * @param {string[]} tagIds - The tagids
 *
 * @returns {any} The tag_colors result
 *
 * @example
 * TAG_COLORS([]);
 */
const TAG_COLORS = [
  {
    /** Name */
    name: "Blue",
    /** Value */
    value: "#3B82F6",
    /** Bg */
    bg: "bg-blue-500",
    /** Text */
    text: "text-blue-700",
    /** Light Bg */
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    /** Name */
    name: "Green",
    /** Value */
    value: "#10B981",
    /** Bg */
    bg: "bg-green-500",
    /** Text */
    text: "text-green-700",
    /** Light Bg */
    lightBg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    /** Name */
    name: "Red",
    /** Value */
    value: "#EF4444",
    /** Bg */
    bg: "bg-red-500",
    /** Text */
    text: "text-red-700",
    /** Light Bg */
    lightBg: "bg-red-50 dark:bg-red-900/20",
  },
  {
    /** Name */
    name: "Yellow",
    /** Value */
    value: "#F59E0B",
    /** Bg */
    bg: "bg-yellow-500",
    /** Text */
    text: "text-yellow-700",
    /** Light Bg */
    lightBg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    /** Name */
    name: "Purple",
    /** Value */
    value: "#8B5CF6",
    /** Bg */
    bg: "bg-purple-500",
    /** Text */
    text: "text-purple-700",
    /** Light Bg */
    lightBg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    /** Name */
    name: "Pink",
    /** Value */
    value: "#EC4899",
    /** Bg */
    bg: "bg-pink-500",
    /** Text */
    text: "text-pink-700",
    /** Light Bg */
    lightBg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    /** Name */
    name: "Indigo",
    /** Value */
    value: "#6366F1",
    /** Bg */
    bg: "bg-indigo-500",
    /** Text */
    text: "text-indigo-700",
    /** Light Bg */
    lightBg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    /** Name */
    name: "Gray",
    /** Value */
    value: "#6B7280",
    /** Bg */
    bg: "bg-gray-500",
    /** Text */
    text: "text-gray-700",
    /** Light Bg */
    lightBg: "bg-gray-50 dark:bg-gray-900/20",
  },
];

/**
 * TagSelectorWithCreateProps interface
 * 
 * @interface
 * @description Defines the structure and contract for TagSelectorWithCreateProps
 */
export interface TagSelectorWithCreateProps {
  /** Value */
  value: string[];
  /** On Change */
  onChange: (tagIds: string[]) => void;
  /** Entity Type */
  entityType?: "product" | "blog" | "shop";
  /** Required */
  required?: boolean;
  /** Error */
  error?: string;
  /** Label */
  label?: string;
  /** Max Tags */
  maxTags?: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Tag Selector With Create
 */
/**
 * Performs tag selector with create operation
 *
 * @returns {any} The tagselectorwithcreate result
 *
 * @example
 * TagSelectorWithCreate();
 */

/**
 * Performs tag selector with create operation
 *
 * @returns {any} The tagselectorwithcreate result
 *
 * @example
 * TagSelectorWithCreate();
 */

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
  const {
    /** Is Loading */
    isLoading: loading,
    /** Data */
    data: allTags,
    /** Set Data */
    setData: setAllTags,
    execute,
  } = useLoadingState<Tag[]>({
    /** Initial Data */
    initialData: [],
    /** On Load Error */
    onLoadError: (error) => {
      logError(error as Error, { component: "TagSelectorWithCreate.loadTags" });
      toast.error("Failed to load tags");
    },
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() =>/**
 * Performs selected operation
 *
 * @param {any} (tag - The (tag
 *
 * @returns {any} The selected result
 *
 */
 {
    loadTags();
  }, [entityType]);

  useEffect(() => {
    // Update selected tags when value changes
    if (value && allTags && allTags.length > 0) {
      const selected = allTags.filter((tag) => value.includes(tag.id));
      setSelectedTags(selected);
    }
  }, [value, allTags]);

  /**
   * Fetches tags from server
   *
   * @returns {Promise<any>} Promise resolving to tags result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Fetches tags from server
   *
   * @returns {Promise<any>} Promise resolving to tags result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadTags = () =>
    execute(async () => {
      // TODO: Implement actual API call
      // const data = await tagsService.list({ entityType });
      // return data;

      // Mock data for now
      const mockTags: Tag[] = [
        {
          /** Id */
          id: "1",
          /** Name */
          name: "New Arrival",
          /** Slug */
          slug: "new-arrival",
          /** Color */
          color: "#3B82F6",
          entityType,
          /** Usage Count */
          usageCount: 45,
        },
        {
          /** Id */
          id: "2",
          /** Name */
          name: "Best Seller",
          /** Slug */
          slug: "best-seller",
          /** Color */
          color: "#10B981",
          entityType,
          /** Usage Count */
          usageCount: 32,
        },
        {
          /** Id */
          id: "3",
          /** Name */
          name: "Limited Edition",
          /** Slug */
          slug: "limited-edition",
          /** Color */
          color: "#EF4444",
          entityType,
          /** Usage Count */
          usageCount: 18,
        },
        {
          /** Id */
          id: "4",
          /** Name */
          name: "Trending",
          /** Slug */
          slug: "trending",
          /** Color */
          color: "#F59E0B",
          entityType,
          /** Usage Count */
          usageCount: 28,
        },
        {
          /** Id */
          id: "5",
          /** Name */
          name: "Premium",
          /** Slug */
          slug: "premium",
          /** Color */
          color: "#8B5CF6",
          entityType,
          /** Usage Count */
          usageCount: 15,
        },
      ];
      return mockTags;
    });

  /**
   * Performs generate slug operation
   *
   * @param {string} name - The name
   *
   * @returns {string} The slug result
   */

  /**
   * Performs generate slug operation
   *
   * @param {string} name - The name
   *
   * @returns {string} The slug result
   */

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  /**
   * Handles add tag event
   *
   * @param {Tag} tag - The tag
   *
   * @returns {any} The handleaddtag result
   */

  /**
   * Handles add tag event
   *
   * @param {Tag} tag - The tag
   *
   * @returns {any} The handleaddtag result
   */

/**
 * Performs new selected operation
 *
 * @param {any} newSelected - The newselected
 *
 * @returns {any} The newselected result
 *
 */
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
    set/**
 * Performs new selected operation
 *
 * @param {any} (t - The (t
 *
 * @returns {any} The newselected result
 *
 */
SelectedTags(newSelected);
    onChange(newSelected.map((t) => t.id));
  };

  /**
   * Handles remove tag event
   *
   * @param {string} tagId - tag identifier
   *
   * @returns {string} The handleremovetag result
   */

  /**
   * Handles remove tag event
   *
   * @param {string} tagId - tag identifier
   *
   * @returns {string} The handleremovetag result
   */

  const handleRemoveTag = (tagId: string) => {
    const newSelected = selectedTags.filter((t) => t.id !== tagId);
    setSelectedTags(newSelected);
    onChange(newSelected.map((t) => t.id));
  };

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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
        /** Id */
        id: `tag_${Date.now()}`,
        /** Name */
        name: newTagName.trim(),
        /** Slug */
        slug: generateSlug(newTagName),
        /** Color */
        color: newTagColor,
        entityType,
        /** Usage Count */
        usageCount: 0,
      };

      setAllTags([...(allTags || []), newTag]);
      handleAddTag(newTag);
      setShowForm(false);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0].value);
      toast.success("Tag created successfully");
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "TagSelectorWithCreate.handleCreateTag",
      });
      toast.error("Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  /**
   * Handles move tag event
   *
   * @param {number} index - The index
   * @param {"up" | "down"} direction - The direction
   *
   * @returns {number} The handlemovetag result
   */

  /**
   * Handles move tag event
   *
   * @param {number} index - The index
   * @param {"up" | "down"} direction - The direction
   *
   * @returns {number} The handlemovetag result
   */

  const handleMoveTag = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedTags.length) return;

    const newSelected = [...selectedT/**
 * Performs color obj operation
 *
 * @param {any} (c - The (c
 *
 * @returns {any} The colorobj result
 *
 */
ags];
    [newSelected[index], newSelected[newIndex]] = [
      newSelected[newIndex],
      newSelected[index],
    ];
    setSelectedTags(newSelected);
    onChange(newSelected.map((t) => t.id));
  };

  /**
   * Retrieves tag color class
   *
   * @param {string} color - The color
   *
   * @returns {string} The tagcolorclass result
   */

  /**
   * Retrieves tag color class
   *
   * @param {string} color - The color
   *
   * @returns {string} The tagcolorclass result
   */

  c/**
 * Performs available tags operation
 *
 * @param {any} (tag - The (tag
 *
 * @returns {any} The availabletags result
 *
 */
onst getTagColorClass = (color: string) => {
    const colorObj = TAG_COLORS.find((c) => c.value === color);
    return colorObj?.lightBg || "bg-gray-50 dark:bg-gray-900/20";
  };

  /**
   * Filters filtered tags
   *
   * @param {any} allTags || []).filter((tag - The all tags || []).filter((tag
   *
   * @returns {any} The filteredtags result
   */

  /**
   * Filters filtered tags
   *
   * @param {any} allTags || []).filter((tag - The all tags || []).filter((tag
   *
   * @returns {any} The filteredtags result
   */

  const filteredTags = (allTags || []).filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const availableTags = filteredTags.filter(
    (tag) => !selectedTags.find((t) => t.id === tag.id),
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
                  /** Hover */
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
                      newTagColor,
                    )}`}
                  >
                    <Tag className="w-3 h-3" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {newTagName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    /** Slug */
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
