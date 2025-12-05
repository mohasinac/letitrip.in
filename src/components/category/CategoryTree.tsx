/**
 * @fileoverview React Component
 * @module src/components/category/CategoryTree
 * @description This file contains the CategoryTree component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

/**
 * Category Tree Visualization Component
 *
 * Visual tree representation of category hierarchy using react-d3-tree
 * Features:
 * - Interactive tree visualization
 * - Collapsible nodes
 * - Search and highlight
 * - Node click actions
 * - Export as image
 * - Dark mode support
 */

import { FormInput } from "@/components/forms/FormInput";
import { Button } from "@/components/ui/Button";
import type { CategoryCardFE } from "@/types/frontend/category.types";
import { Download, Maximize2, Search, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import Tree from "react-d3-tree";

/**
 * TreeNode interface
 * 
 * @interface
 * @description Defines the structure and contract for TreeNode
 */
interface TreeNode {
  /** Name */
  name: string;
  /** Attributes */
  attributes?: Record<string, string | number>;
  /** Children */
  children?: TreeNode[];
  /** __rd3t */
  __rd3t?: {
    /** Id */
    id: string;
    /** Collapsed */
    collapsed?: boolean;
  };
}

/**
 * CategoryTreeProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryTreeProps
 */
interface CategoryTreeProps {
  /** Root categories with nested children */
  categories: CategoryCardFE[];
  /** Callback when category is clicked */
  onNodeClick?: (category: CategoryCardFE) => void;
  /** Initial zoom level */
  initialZoom?: number;
  /** Container height */
  height?: number | string;
}

/**
 * Function: Category Tree
 */
/**
 * Performs category tree operation
 *
 * @returns {any} The categorytree result
 *
 * @example
 * CategoryTree();
 */

/**
 * Performs category tree operation
 *
 * @returns {any} The categorytree result
 *
 * @example
 * CategoryTree();
 */

export function CategoryTree({
  categories,
  onNodeClick,
  initialZoom = 0.8,
  height = "600px",
}: CategoryTreeProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [searchQuery, setSearchQuery] = useState("");
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert categories to tree structure
  /**
 * Performs tree data operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The treedata result
 *
 */
const treeData = useMemo<TreeNode>(() => {
    /**
     * Performs build tree operation
     *
     * @param {CategoryCardFE[]} cats - The cats
     *
     * @returns {any} The buildtree result
     */

    /**
     * Performs build tree operation
     *
     * @param {CategoryCardFE[]} cats - The cats
     *
     * @returns {any} The buildtree result
     */

    const buildTree = (cats: CategoryCardFE[]): TreeNode[] => {
      return cats.map((cat) => ({
        /** Name */
        name: cat.name,
        /** Attributes */
        attributes: {
          /** Slug */
          slug: cat.slug,
          /** Product Count */
          productCount: cat.productCount || 0,
          /** Is Leaf */
          isLeaf: (cat as any).isLeaf ? "Yes" : "No",
        },
        /** Children */
        children: (cat as any).children?.length
          ? buildTree((cat as any).children)
          : undefined,
        __rd3t: {
          /** Id */
          id: cat.id,
          /** Collapsed */
          collapsed: false,
        },
      }));
    };

    return {
      /** Name */
      name: "Categories",
      /**/**
 * Performs center tree operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The centertree result
 *
 */
 Children */
      children: buildTree(categories),
    };
  }, [categories]);

  // Center tree on mount
  const centerTree = useCallback(() => {
    if (containerRef.current) {
     /**
 * Handles node click
 *
 * @param {any} (nodeData - The (nodedata
 *
 * @returns {any} The handlenodeclick result
 *
 */
 const dimensions = containerRef.current.getBoundingClientRect();
      setTranslate({
        /** X */
        x: dimensions.width / 2,
        /** Y */
        y: 50,
      });
    }
  }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeData: any) => {
      const categoryId = nodeData.__rd3t?.id;
      if (categoryId && onNodeClick) {
        // Find the category by ID (recursive search)
        /**
         * Performs find category operation
         *
         * @param {CategoryCardFE[]} cats - The cats
         * @param {string} id - Unique identifier
         *
         * @returns {string} The findcategory result
         */

        /**
         * Performs find category operation
         *
         * @returns {string} The findcategory result
         */

        const findCategory = (
          /** Cats */
          cats: CategoryCardFE[],
          /** Id */
          id: string
        ): CategoryCardFE | null => {
          for (const cat of cats) {
            if (cat.id === id) return cat;
            if ((cat as any).children) {
              const found = findCategory((cat as any).children, id);
              if (found) return found;
            }
          }
          return null;
        };

        const category = findCategory(categories, categoryId);
        if (category) {
          onNodeClick(category);
        }
      }
    },
    [categories, onNodeClick]
  );

  // Zoom controls
  /**
   * Handles zoom in event
   *
   * @returns {any} The handlezoomin result
   */

  /**
   * Handles zoom in event
   *
   * @returns {any} The handlezoomin result
   */

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  /**
   * Handles zoom out event
   *
   * @returns {any} The handlezoomout result
   */

  /**
   * Handles zoom out event
   *
   * @returns {any} The handlezoomout result
   */

  const handleZoomOut = () /**
 * Handles export
 *
 * @param {any} ( - The (
 *
 * @returns {any} The handleexport result
 *
 */
=> setZoom((prev) => Math.max(prev - 0.2, 0.2));
  /**
   * Handles reset zoom event
   *
   * @returns {any} The handleresetzoom result
   */

  /**
   * Handles reset zoom event
   *
   * @returns {any} The handleresetzoom result
   */

  const handleResetZoom = () => {
    setZoom(initialZoom);
    centerTree();
  };

  // Export tree as SVG
  const handleExport = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "category-tree.svg";
    link.click();

    URL.revokeObjectURL(url);
  }, []);

  // Custom node rendering
  /**
   * Renders custom node
   *
   * @param {any} { nodeDatum } - The { node datum }
   *
   * @returns {any} The rendercustomnode result
   */

  /**
   * Renders custom node
   *
   * @param {any} { nodeDatum } - The { node datum }
   *
   * @returns {any} The rendercustomnode result
   */

  const renderCustomNode = ({ nodeDatum }: any) => {
    const isSearchMatch =
      searchQuery &&
      nodeDatum.name.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <g>
        {/* Node circle */}
        <circle
          r={20}
          fill={isSearchMatch ? "#f59e0b" : "#3b82f6"}
          className="transition-colors hover:brightness-110 dark:fill-blue-600"
          style={{ cursor: "pointer" }}
        />

        {/* Node label */}
        <text
          fill="white"
          strokeWidth="0"
          x={25}
          y={5}
          className="text-sm font-medium"
        >
          {nodeDatum.name}
        </text>

        {/* Attributes */}
        {nodeDatum.attributes && (
          <text
            fill="currentColor"
            strokeWidth="0"
            x={25}
            y={20}
            className="text-xs text-gray-600 dark:text-gray-400"
          >
            {Object.entries(nodeDatum.attributes)
              .map(([key, value]) => `${key}: ${value}`)
              .join(" | ")}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <FormInput
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            title="Reset View"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            title="Export as SVG"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tree visualization */}
      <div
        ref={containerRef}
        className="rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
        style={{ height }}
      >
        <Tree
          data={treeData}
          orientation="vertical"
          translate={translate}
          zoom={zoom}
          onNodeClick={handleNodeClick}
          renderCustomNodeElement={renderCustomNode}
          pathFunc="step"
          separation={{ siblings: 2, nonSiblings: 2 }}
          nodeSize={{ x: 200, y: 100 }}
          collapsible
          enableLegacyTransitions
          transitionDuration={300}
          depthFactor={150}
          pathClassFunc={() => "stroke-gray-400 dark:stroke-gray-600"}
        />
      </div>

      {/* Legend */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          Legend
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
            <span>Category</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-amber-500" />
            <span>Search Match</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Click nodes to view details</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">
              Click node to expand/collapse children
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryTree;
