"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronRight, ChevronDown, X, Check } from "lucide-react";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedInput } from "@/components/ui/unified/Input";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { UnifiedCard } from "@/components/ui/unified/Card";
import type { Category, CategorySEO } from "@/types/shared";
import { api } from "@/lib/api";

export interface SelectedCategory {
  id: string;
  name: string;
  slug: string;
  parentIds?: string[];
  parentNames?: string[];
  path?: string;
  seoData?: CategorySEO;
  isLeaf?: boolean;
}

export interface SmartCategorySelectorProps {
  mode?: "single" | "multi";
  onSelect: (categories: SelectedCategory[]) => void;
  initialSelected?: SelectedCategory[];

  // Feature toggles
  showOnlyLeafNodes?: boolean;
  showAllCategories?: boolean;
  autoIncludeSeo?: boolean;
  autoSelectParents?: boolean;

  requireLeafNode?: boolean;
  placeholder?: string;
  className?: string;
}

interface TreeNode extends Category {
  children: TreeNode[];
  level: number;
  expanded?: boolean;
}

export function SmartCategorySelector({
  mode = "single",
  onSelect,
  initialSelected = [],
  showOnlyLeafNodes = false,
  showAllCategories = true,
  autoIncludeSeo = true,
  autoSelectParents = true,
  requireLeafNode = false,
  placeholder = "Search categories...",
  className = "",
}: SmartCategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<SelectedCategory[]>(initialSelected);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [filterLeafOnly, setFilterLeafOnly] = useState(showOnlyLeafNodes);
  const [showAll, setShowAll] = useState(showAllCategories);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Use API service to fetch categories
        const fetchedCategories = await api.categories.getCategories({
          active: true,
        });
        setCategories(fetchedCategories as any);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Build tree structure
  const categoryTree = useMemo(() => {
    const buildTree = (
      parentIds: string[] | null | undefined = null,
      level = 0
    ): TreeNode[] => {
      return categories
        .filter((cat) => {
          if (!parentIds || parentIds.length === 0) {
            return !cat.parentIds || cat.parentIds.length === 0;
          }
          return cat.parentIds?.some((pid) => parentIds.includes(pid));
        })
        .map((cat) => ({
          ...cat,
          children: buildTree([cat.id], level + 1),
          level,
          expanded: expandedNodes.has(cat.id),
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
    };
    return buildTree();
  }, [categories, expandedNodes]);

  // Filter tree based on settings
  const filteredTree = useMemo(() => {
    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter((node) => {
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matches =
              node.name.toLowerCase().includes(query) ||
              node.slug.toLowerCase().includes(query) ||
              node.description?.toLowerCase().includes(query);
            if (!matches) return false;
          }

          // Leaf node filter
          if (filterLeafOnly && !node.isLeaf) {
            return false;
          }

          // Active filter
          if (!showAll && !node.isActive) {
            return false;
          }

          return true;
        })
        .map((node) => ({
          ...node,
          children: filterTree(node.children),
        }));
    };
    return filterTree(categoryTree);
  }, [categoryTree, searchQuery, filterLeafOnly, showAll]);

  // Get parent chain
  const getParentChain = (categoryId: string): SelectedCategory[] => {
    const chain: SelectedCategory[] = [];
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return chain;

    const findParents = (cat: Category) => {
      if (cat.parentIds && cat.parentIds.length > 0) {
        cat.parentIds.forEach((parentId) => {
          const parent = categories.find((c) => c.id === parentId);
          if (parent && !chain.find((c) => c.id === parent.id)) {
            chain.unshift({
              id: parent.id,
              name: parent.name,
              slug: parent.slug,
              parentIds: parent.parentIds,
              seoData: autoIncludeSeo ? parent.seo : undefined,
              isLeaf: parent.isLeaf,
            });
            findParents(parent);
          }
        });
      }
    };

    findParents(category);
    return chain;
  };

  // Get full path string
  const getPath = (categoryId: string): string => {
    const chain = getParentChain(categoryId);
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return "";
    const fullChain = [...chain, { name: category.name }];
    return fullChain.map((c) => c.name).join(" > ");
  };

  // Handle selection
  const handleSelect = (category: Category) => {
    // Validate leaf node requirement
    if (requireLeafNode && !category.isLeaf) {
      alert("Please select a final category (leaf node)");
      return;
    }

    const selectedCategory: SelectedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentIds: category.parentIds,
      path: getPath(category.id),
      seoData: autoIncludeSeo ? category.seo : undefined,
      isLeaf: category.isLeaf,
    };

    let newSelected: SelectedCategory[] = [];

    if (mode === "single") {
      newSelected = [selectedCategory];

      // Auto-select parents if enabled
      if (autoSelectParents) {
        const parents = getParentChain(category.id);
        newSelected = [...parents, selectedCategory];
      }
    } else {
      // Multi-select mode
      const isAlreadySelected = selected.some((s) => s.id === category.id);
      if (isAlreadySelected) {
        newSelected = selected.filter((s) => s.id !== category.id);
      } else {
        newSelected = [...selected, selectedCategory];

        // Auto-select parents if enabled
        if (autoSelectParents) {
          const parents = getParentChain(category.id);
          parents.forEach((parent) => {
            if (!newSelected.find((s) => s.id === parent.id)) {
              newSelected.push(parent);
            }
          });
        }
      }
    }

    setSelected(newSelected);
    onSelect(newSelected);
  };

  // Handle node expand/collapse
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Remove selected
  const removeSelected = (id: string) => {
    const newSelected = selected.filter((s) => s.id !== id);
    setSelected(newSelected);
    onSelect(newSelected);
  };

  // Render tree node
  const renderNode = (node: TreeNode): React.ReactNode => {
    const isSelected = selected.some((s) => s.id === node.id);
    const hasChildren = node.children.length > 0;
    const isExpanded = node.expanded;

    return (
      <div key={node.id} className="animate-fadeIn">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-surfaceVariant cursor-pointer ${
            isSelected ? "bg-primary/10 border border-primary/30" : ""
          }`}
          style={{ marginLeft: `${node.level * 24}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 hover:bg-surface/50 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-textSecondary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-textSecondary" />
              )}
            </button>
          )}

          {/* Category info */}
          <div
            onClick={() => handleSelect(node)}
            className="flex-1 flex items-center gap-3"
          >
            {/* Icon */}
            {node.icon && (
              <img src={node.icon} alt="" className="w-6 h-6 object-contain" />
            )}

            {/* Name and badges */}
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              <span className="text-text font-medium">{node.name}</span>
              {node.isLeaf && (
                <UnifiedBadge size="sm" variant="success">
                  Leaf
                </UnifiedBadge>
              )}
              {!node.isActive && (
                <UnifiedBadge size="sm" variant="error">
                  Inactive
                </UnifiedBadge>
              )}
              {node.featured && (
                <UnifiedBadge size="sm" variant="warning">
                  Featured
                </UnifiedBadge>
              )}
            </div>

            {/* Selected indicator */}
            {isSelected && <Check className="w-5 h-5 text-primary" />}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <UnifiedCard className={`${className}`}>
      <div className="space-y-4">
        {/* Header with toggles */}
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text flex-1">
            Select {mode === "multi" ? "Categories" : "Category"}
          </h3>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterLeafOnly(!filterLeafOnly)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterLeafOnly
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-textSecondary hover:bg-surfaceVariant"
              }`}
            >
              {filterLeafOnly ? "✓" : ""} Leaf Nodes Only
            </button>

            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showAll
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-textSecondary hover:bg-surfaceVariant"
              }`}
            >
              {showAll ? "✓" : ""} Show All
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Selected categories */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-surfaceVariant/50 rounded-lg">
            {selected.map((cat) => (
              <UnifiedBadge
                key={cat.id}
                variant="primary"
                className="flex items-center gap-1.5"
              >
                {cat.name}
                <button
                  onClick={() => removeSelected(cat.id)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </UnifiedBadge>
            ))}
          </div>
        )}

        {/* Category tree */}
        <div className="max-h-96 overflow-y-auto space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="text-center py-12 text-textSecondary">
              <p>No categories found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary hover:underline mt-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredTree.map((node) => renderNode(node))
          )}
        </div>

        {/* Info footer */}
        {autoSelectParents && (
          <div className="text-xs text-textSecondary pt-3 border-t border-border">
            ℹ️ Parent categories will be auto-selected
          </div>
        )}
      </div>
    </UnifiedCard>
  );
}
