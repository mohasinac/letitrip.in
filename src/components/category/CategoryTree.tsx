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

import { FormInput } from "@/components/forms";
import { Button } from "@/components/ui/Button";
import type { CategoryCardFE } from "@/types/frontend/category.types";
import { Download, Maximize2, Search, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import Tree from "react-d3-tree";

interface TreeNode {
  name: string;
  attributes?: Record<string, string | number>;
  children?: TreeNode[];
  __rd3t?: {
    id: string;
    collapsed?: boolean;
  };
}

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
  const treeData = useMemo<TreeNode>(() => {
    const buildTree = (cats: CategoryCardFE[]): TreeNode[] => {
      return cats.map((cat) => ({
        name: cat.name,
        attributes: {
          slug: cat.slug,
          productCount: cat.productCount || 0,
          isLeaf: cat.isLeaf ? "Yes" : "No",
        },
        children: cat.children?.length ? buildTree(cat.children) : undefined,
        __rd3t: {
          id: cat.id,
          collapsed: false,
        },
      }));
    };

    return {
      name: "Categories",
      children: buildTree(categories),
    };
  }, [categories]);

  // Center tree on mount
  const centerTree = useCallback(() => {
    if (containerRef.current) {
      const dimensions = containerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
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
        const findCategory = (
          cats: CategoryCardFE[],
          id: string,
        ): CategoryCardFE | null => {
          for (const cat of cats) {
            if (cat.id === id) return cat;
            if (cat.children) {
              const found = findCategory(cat.children, id);
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
    [categories, onNodeClick],
  );

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.2));
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
            icon={<Search className="h-4 w-4" />}
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
          styles={{
            links: {
              stroke: "#94a3b8",
              strokeWidth: 2,
            },
          }}
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
