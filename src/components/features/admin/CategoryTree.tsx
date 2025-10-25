"use client";

import { useState } from "react";
import { CategoryTreeNode, Category } from "@/types";
import CategoryTreeItem from "./CategoryTreeItem";

interface CategoryTreeProps {
  categories: CategoryTreeNode[];
  searchQuery?: string;
  filters?: {
    includeInactive: boolean;
    showFeaturedOnly: boolean;
    level: number | null;
  };
  selectedCategories: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  view: "tree" | "list";
}

export default function CategoryTree({
  categories,
  searchQuery = "",
  filters = { includeInactive: false, showFeaturedOnly: false, level: null },
  selectedCategories,
  onSelectionChange,
  onEdit,
  onDelete,
  view,
}: CategoryTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Filter categories based on search and filters
  const filterCategory = (category: CategoryTreeNode): boolean => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        category.name.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower);

      if (!matchesSearch) {
        // Check if any children match
        const hasMatchingChild = category.children.some((child) =>
          filterCategory(child)
        );
        if (!hasMatchingChild) return false;
      }
    }

    // Active filter
    if (!filters.includeInactive && !category.isActive) {
      return false;
    }

    // Featured filter
    if (filters.showFeaturedOnly && !category.featured) {
      return false;
    }

    // Level filter
    if (filters.level !== null && category.level !== filters.level) {
      return false;
    }

    return true;
  };

  const filteredCategories = categories.filter(filterCategory);

  const handleToggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleToggleSelect = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onSelectionChange(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = getAllCategoryIds(filteredCategories);
    onSelectionChange(allIds);
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const getAllCategoryIds = (cats: CategoryTreeNode[]): string[] => {
    const ids: string[] = [];
    const traverse = (categories: CategoryTreeNode[]) => {
      categories.forEach((cat) => {
        ids.push(cat.id);
        traverse(cat.children);
      });
    };
    traverse(cats);
    return ids;
  };

  const totalVisible = getAllCategoryIds(filteredCategories).length;
  const selectedVisible = selectedCategories.filter((id) =>
    getAllCategoryIds(filteredCategories).includes(id)
  ).length;

  if (filteredCategories.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No categories found
        </h3>
        <p className="text-gray-500">
          {searchQuery
            ? "No categories match your search criteria."
            : "No categories available with the current filters."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">
              Categories ({totalVisible})
            </h3>
            {selectedVisible > 0 && (
              <span className="text-sm text-gray-500">
                {selectedVisible} selected
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Select All
            </button>
            <button
              onClick={handleSelectNone}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Select None
            </button>
            <button
              onClick={() => {
                const allIds = getAllCategoryIds(filteredCategories);
                setExpandedNodes(new Set(allIds));
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="divide-y divide-gray-200">
        {filteredCategories.map((category) => (
          <CategoryTreeItem
            key={category.id}
            category={category}
            level={0}
            isExpanded={expandedNodes.has(category.id)}
            isSelected={selectedCategories.includes(category.id)}
            searchQuery={searchQuery}
            filters={filters}
            onToggleExpand={handleToggleExpand}
            onToggleSelect={handleToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            view={view}
            expandedNodes={expandedNodes}
            selectedCategories={selectedCategories}
          />
        ))}
      </div>
    </div>
  );
}
