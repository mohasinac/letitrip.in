"use client";

import { useState } from "react";
import { CategoryTreeNode, Category } from "@/types";

interface CategoryTreeItemProps {
  category: CategoryTreeNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  searchQuery: string;
  filters: {
    includeInactive: boolean;
    showFeaturedOnly: boolean;
    level: number | null;
  };
  onToggleExpand: (categoryId: string) => void;
  onToggleSelect: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  view: "tree" | "list";
  expandedNodes: Set<string>;
  selectedCategories: string[];
}

export default function CategoryTreeItem({
  category,
  level,
  isExpanded,
  isSelected,
  searchQuery,
  filters,
  onToggleExpand,
  onToggleSelect,
  onEdit,
  onDelete,
  view,
  expandedNodes,
  selectedCategories,
}: CategoryTreeItemProps) {
  const [showActions, setShowActions] = useState(false);

  const hasVisibleChildren = category.children.some((child) => {
    // Apply same filtering logic as parent
    if (!filters.includeInactive && !child.isActive) return false;
    if (filters.showFeaturedOnly && !child.featured) return false;
    if (filters.level !== null && child.level !== filters.level) return false;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        child.name.toLowerCase().includes(searchLower) ||
        child.description?.toLowerCase().includes(searchLower) ||
        child.slug.toLowerCase().includes(searchLower);

      if (!matchesSearch && !hasVisibleDescendants(child)) return false;
    }

    return true;
  });

  const hasVisibleDescendants = (cat: CategoryTreeNode): boolean => {
    return cat.children.some((child) => {
      if (!filters.includeInactive && !child.isActive) return false;
      if (filters.showFeaturedOnly && !child.featured) return false;
      if (filters.level !== null && child.level !== filters.level) return false;

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          child.name.toLowerCase().includes(searchLower) ||
          child.description?.toLowerCase().includes(searchLower) ||
          child.slug.toLowerCase().includes(searchLower);

        return matchesSearch || hasVisibleDescendants(child);
      }

      return true;
    });
  };

  const filteredChildren = category.children.filter((child) => {
    if (!filters.includeInactive && !child.isActive) return false;
    if (filters.showFeaturedOnly && !child.featured) return false;
    if (filters.level !== null && child.level !== filters.level) return false;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        child.name.toLowerCase().includes(searchLower) ||
        child.description?.toLowerCase().includes(searchLower) ||
        child.slug.toLowerCase().includes(searchLower);

      if (!matchesSearch && !hasVisibleDescendants(child)) return false;
    }

    return true;
  });

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div>
      {/* Main Category Row */}
      <div
        className={`flex items-center px-6 py-4 hover:bg-gray-50 transition-colors ${
          isSelected ? "bg-blue-50" : ""
        }`}
        style={{ paddingLeft: `${24 + level * 24}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand/Collapse Button */}
        <div className="flex-shrink-0 mr-3">
          {hasVisibleChildren ? (
            <button
              onClick={() => onToggleExpand(category.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <div className="w-6 h-6"></div>
          )}
        </div>

        {/* Checkbox */}
        <div className="flex-shrink-0 mr-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(category.id)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
        </div>

        {/* Category Icon/Image */}
        <div className="flex-shrink-0 mr-3">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-8 h-8 rounded object-cover"
            />
          ) : category.icon ? (
            <div
              className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-lg"
              dangerouslySetInnerHTML={{ __html: category.icon }}
            />
          ) : (
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center">
            <h3
              className={`text-sm font-medium truncate ${
                category.isLeaf
                  ? "text-blue-900 bg-blue-50 px-2 py-1 rounded-md border border-blue-200"
                  : "text-gray-900"
              }`}
              dangerouslySetInnerHTML={{
                __html: highlightText(category.name, searchQuery),
              }}
            />

            {/* Badges */}
            <div className="flex items-center ml-2 space-x-1">
              {category.isLeaf && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  📦 Leaf Category
                </span>
              )}
              {!category.isLeaf &&
                category.productCount &&
                category.productCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    📊 Aggregated
                  </span>
                )}
              {category.featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
              {!category.isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Inactive
                </span>
              )}
              {category.level === 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Root
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
            <span>/{category.slug}</span>
            <span>Level {category.level}</span>
            {category.productCount !== undefined && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {category.productCount} products
                </span>
                {(category.inStockCount !== undefined ||
                  category.outOfStockCount !== undefined ||
                  category.lowStockCount !== undefined) && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center space-x-2">
                      {category.inStockCount !== undefined && (
                        <span className="text-green-600 font-medium flex items-center">
                          ✓ {category.inStockCount}
                        </span>
                      )}
                      {category.outOfStockCount !== undefined &&
                        category.outOfStockCount > 0 && (
                          <span className="text-red-600 font-medium flex items-center">
                            ✗ {category.outOfStockCount}
                          </span>
                        )}
                      {category.lowStockCount !== undefined &&
                        category.lowStockCount > 0 && (
                          <span className="text-yellow-600 font-medium flex items-center">
                            ⚠ {category.lowStockCount}
                          </span>
                        )}
                    </div>
                  </>
                )}
              </div>
            )}
            <span>Sort: {category.sortOrder}</span>
          </div>

          {category.description && (
            <p
              className="mt-1 text-xs text-gray-600 truncate"
              dangerouslySetInnerHTML={{
                __html: highlightText(category.description, searchQuery),
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div
          className={`flex-shrink-0 ml-4 transition-opacity ${
            showActions ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(category)}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="Edit category"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            {category.children.length === 0 &&
              (category.productCount === 0 ||
                category.productCount === undefined) && (
                <button
                  onClick={() => onDelete(category.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Delete category"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}

            <button
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="More actions"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded &&
        filteredChildren.map((child) => (
          <CategoryTreeItem
            key={child.id}
            category={child}
            level={level + 1}
            isExpanded={expandedNodes.has(child.id)}
            isSelected={selectedCategories.includes(child.id)}
            searchQuery={searchQuery}
            filters={filters}
            onToggleExpand={onToggleExpand}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            view={view}
            expandedNodes={expandedNodes}
            selectedCategories={selectedCategories}
          />
        ))}
    </div>
  );
}
