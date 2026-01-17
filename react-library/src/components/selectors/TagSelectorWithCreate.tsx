"use client";

/**
 * TagSelectorWithCreate Component
 *
 * Framework-agnostic tag selector with create new tag functionality.
 * Supports multi-select tags with drag-to-reorder and color customization.
 *
 * @example
 * ```tsx
 * <TagSelectorWithCreate
 *   value={selectedTagIds}
 *   onChange={(ids) => handleTagChange(ids)}
 *   tags={allTags}
 *   onCreateTag={(name, color) => createNewTag(name, color)}
 *   maxTags={10}
 * />
 * ```
 */

import React, { useEffect, useState } from "react";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  entityType?: "product" | "blog" | "shop";
  usageCount?: number;
}

export interface TagColor {
  name: string;
  value: string;
  bg: string;
  text: string;
  lightBg: string;
}

export interface TagSelectorWithCreateProps {
  /** Selected tag IDs */
  value: string[];
  /** Callback when tags change */
  onChange: (tagIds: string[]) => void;
  /** Available tags */
  tags: Tag[];
  /** Loading state */
  loading?: boolean;
  /** Entity type filter */
  entityType?: "product" | "blog" | "shop";
  /** Required field */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Maximum tags allowed */
  maxTags?: number;
  /** Additional CSS classes */
  className?: string;
  /** Available tag colors */
  tagColors?: TagColor[];
  /** Callback to create new tag */
  onCreateTag?: (name: string, color: string) => Promise<Tag>;
  /** Custom X icon */
  XIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom plus icon */
  PlusIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom tag icon */
  TagIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom loader icon */
  LoaderIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default tag colors
const DEFAULT_TAG_COLORS: TagColor[] = [
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
];

// Default X Icon
const DefaultXIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Default Plus Icon
const DefaultPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// Default Tag Icon
const DefaultTagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

// Default Loader Icon
const DefaultLoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function TagSelectorWithCreate({
  value,
  onChange,
  tags,
  loading = false,
  entityType,
  required = false,
  error,
  label = "Tags",
  maxTags = 10,
  className = "",
  tagColors = DEFAULT_TAG_COLORS,
  onCreateTag,
  XIcon = DefaultXIcon,
  PlusIcon = DefaultPlusIcon,
  TagIcon = DefaultTagIcon,
  LoaderIcon = DefaultLoaderIcon,
}: TagSelectorWithCreateProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(tagColors[0].value);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tags by entity type if specified
  const filteredTags = entityType
    ? tags.filter((t) => t.entityType === entityType)
    : tags;

  // Update selected tags when value changes
  useEffect(() => {
    if (value && tags.length > 0) {
      const selected = tags.filter((tag) => value.includes(tag.id));
      setSelectedTags(selected);
    }
  }, [value, tags]);

  // Filter available tags (not selected)
  const availableTags = filteredTags
    .filter((t) => !value.includes(t.id))
    .filter((t) =>
      searchQuery
        ? t.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const handleAddTag = (tag: Tag) => {
    if (value.length >= maxTags) {
      return;
    }
    if (value.includes(tag.id)) {
      return;
    }
    onChange([...value, tag.id]);
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;

    try {
      setCreating(true);
      const newTag = await onCreateTag(newTagName.trim(), newTagColor);
      handleAddTag(newTag);
      setShowForm(false);
      setNewTagName("");
      setNewTagColor(tagColors[0].value);
    } catch (err) {
      console.error("Failed to create tag:", err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <LoaderIcon className="w-6 h-6 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          <span className="text-xs text-gray-500 ml-2">
            {value.length}/{maxTags}
          </span>
        </label>
      )}

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:opacity-70 transition-opacity"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available Tags + Create Button */}
      {!showForm && value.length < maxTags && (
        <div className="space-y-2">
          {/* Search */}
          {availableTags.length > 5 && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          )}

          {/* Available Tags */}
          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 10).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    border: `1px solid ${tag.color}30`,
                  }}
                >
                  {tag.name}
                  {tag.usageCount !== undefined && tag.usageCount > 0 && (
                    <span className="text-xs opacity-60">
                      ({tag.usageCount})
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              {searchQuery ? "No tags found" : "No tags available"}
            </p>
          )}

          {/* Create New Button */}
          {onCreateTag && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <PlusIcon />
                <span className="font-medium text-sm">Create New Tag</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Create Tag Form */}
      {showForm && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Create New Tag
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewTagName("");
                setNewTagColor(tagColors[0].value);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XIcon />
            </button>
          </div>

          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
            onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
          />

          <div className="flex gap-2">
            {tagColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setNewTagColor(color.value)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  newTagColor === color.value
                    ? "border-gray-900 dark:border-white scale-110"
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleCreateTag}
            disabled={!newTagName.trim() || creating}
            className={cn(
              "w-full px-4 py-2 rounded-lg font-medium transition-colors",
              !newTagName.trim() || creating
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {creating ? "Creating..." : "Create Tag"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default TagSelectorWithCreate;
