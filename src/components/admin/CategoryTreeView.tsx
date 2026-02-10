"use client";

import { useState } from "react";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@/helpers";

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  tier: number;
  parentId: string | null;
  children: CategoryNode[];
  metrics?: {
    productCount: number;
    totalProductCount: number;
    auctionCount: number;
    totalAuctionCount: number;
  };
}

interface CategoryTreeViewProps {
  categories: CategoryNode[];
  onSelect?: (category: CategoryNode) => void;
  onEdit?: (category: CategoryNode) => void;
  onDelete?: (category: CategoryNode) => void;
  selectedId?: string;
}

interface TreeNodeProps {
  node: CategoryNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect?: (category: CategoryNode) => void;
  onEdit?: (category: CategoryNode) => void;
  onDelete?: (category: CategoryNode) => void;
}

function TreeNode({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
}: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const indent = level * 24;

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md
          ${isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" : ""}
          transition-colors duration-150
        `}
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        {/* Expand/Collapse Icon */}
        <button
          type="button"
          onClick={onToggle}
          className={`
            flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
            ${!hasChildren ? "invisible" : ""}
          `}
        >
          {hasChildren && (
            <svg
              className={classNames(
                "w-4 h-4 transition-transform duration-200",
                isExpanded ? "rotate-90" : "",
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Category Icon */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400">
          {hasChildren ? (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          ) : (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Category Name */}
        <button
          type="button"
          onClick={() => onSelect?.(node)}
          className={`flex-1 text-left text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} truncate`}
        >
          {node.name}
        </button>

        {/* Metrics */}
        {node.metrics && (
          <div
            className={`flex items-center gap-3 text-xs ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            <span title="Direct Products">{node.metrics.productCount} P</span>
            <span title="Total Products (including subcategories)">
              ({node.metrics.totalProductCount})
            </span>
            {node.metrics.auctionCount > 0 && (
              <>
                <span title="Direct Auctions">
                  {node.metrics.auctionCount} A
                </span>
                <span title="Total Auctions (including subcategories)">
                  ({node.metrics.totalAuctionCount})
                </span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
              }}
              className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Edit category"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Delete category"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNodeContainer
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={isSelected ? node.id : undefined}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeNodeContainerProps {
  node: CategoryNode;
  level: number;
  selectedId?: string;
  onSelect?: (category: CategoryNode) => void;
  onEdit?: (category: CategoryNode) => void;
  onDelete?: (category: CategoryNode) => void;
}

function TreeNodeContainer({
  node,
  level,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: TreeNodeContainerProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const isSelected = selectedId === node.id;

  return (
    <TreeNode
      node={node}
      level={level}
      isExpanded={isExpanded}
      isSelected={isSelected}
      onToggle={() => setIsExpanded(!isExpanded)}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

export function CategoryTreeView({
  categories,
  onSelect,
  onEdit,
  onDelete,
  selectedId,
}: CategoryTreeViewProps) {
  if (categories.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-64 border ${THEME_CONSTANTS.themed.borderColor} rounded-lg`}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <p className={`mt-4 text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
            No categories yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border ${THEME_CONSTANTS.themed.borderColor} rounded-lg ${THEME_CONSTANTS.themed.bgSecondary} p-3`}
    >
      <div className="space-y-1">
        {categories.map((category) => (
          <TreeNodeContainer
            key={category.id}
            node={category}
            level={0}
            selectedId={selectedId}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
