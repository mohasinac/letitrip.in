"use client";

import { useState } from "react";
import { THEME_CONSTANTS } from "@/constants";

interface GridCell {
  row: number;
  col: number;
  content: {
    type: "empty" | "image" | "text" | "cta";
    imageUrl?: string;
    text?: string;
    link?: string;
    buttonText?: string;
  };
}

interface GridEditorProps {
  rows?: number;
  cols?: number;
  initialGrid?: GridCell[];
  onChange: (grid: GridCell[]) => void;
}

export function GridEditor({
  rows = 9,
  cols = 9,
  initialGrid = [],
  onChange,
}: GridEditorProps) {
  const [grid, setGrid] = useState<GridCell[]>(() => {
    if (initialGrid.length > 0) return initialGrid;

    // Initialize empty grid
    const cells: GridCell[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          row,
          col,
          content: { type: "empty" },
        });
      }
    }
    return cells;
  });

  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editMode, setEditMode] = useState(false);

  const getCell = (row: number, col: number) => {
    return grid.find((c) => c.row === row && c.col === col);
  };

  const updateCell = (
    row: number,
    col: number,
    content: GridCell["content"],
  ) => {
    const newGrid = grid.map((cell) => {
      if (cell.row === row && cell.col === col) {
        return { ...cell, content };
      }
      return cell;
    });
    setGrid(newGrid);
    onChange(newGrid);
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setEditMode(true);
  };

  const renderCell = (cell: GridCell) => {
    const isSelected =
      selectedCell?.row === cell.row && selectedCell?.col === cell.col;
    const bgColor = isSelected
      ? "bg-blue-100 dark:bg-blue-900"
      : "bg-white dark:bg-gray-800";

    return (
      <button
        key={`${cell.row}-${cell.col}`}
        type="button"
        onClick={() => handleCellClick(cell.row, cell.col)}
        className={`
          ${bgColor}
          border border-gray-300 dark:border-gray-600
          hover:border-blue-400 dark:hover:border-blue-500
          transition-colors duration-150
          p-1 min-h-[60px]
          flex items-center justify-center
          text-xs
        `}
        title={`Cell (${cell.row}, ${cell.col})`}
      >
        {cell.content.type === "image" && cell.content.imageUrl && (
          <img
            src={cell.content.imageUrl}
            alt={`Cell ${cell.row},${cell.col}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {cell.content.type === "text" && cell.content.text && (
          <span className="truncate text-gray-700 dark:text-gray-300">
            {cell.content.text}
          </span>
        )}
        {cell.content.type === "cta" && cell.content.buttonText && (
          <span className="truncate text-blue-600 dark:text-blue-400 font-medium">
            {cell.content.buttonText}
          </span>
        )}
        {cell.content.type === "empty" && (
          <span className="text-gray-400 dark:text-gray-600">+</span>
        )}
      </button>
    );
  };

  const currentCell = selectedCell
    ? getCell(selectedCell.row, selectedCell.col)
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Grid Canvas */}
      <div className="flex-1">
        <div
          className={`bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border ${THEME_CONSTANTS.themed.borderColor}`}
        >
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {grid.map(renderCell)}
          </div>
        </div>
      </div>

      {/* Cell Editor Panel */}
      {editMode && currentCell && (
        <div
          className={`w-full lg:w-80 bg-white dark:bg-gray-800 p-4 rounded-lg border ${THEME_CONSTANTS.themed.borderColor}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Edit Cell ({currentCell.row}, {currentCell.col})
            </h3>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Content Type Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Type
            </label>
            <select
              value={currentCell.content.type}
              onChange={(e) => {
                const type = e.target.value as GridCell["content"]["type"];
                updateCell(currentCell.row, currentCell.col, { type });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="empty">Empty</option>
              <option value="image">Image</option>
              <option value="text">Text</option>
              <option value="cta">Call to Action</option>
            </select>
          </div>

          {/* Image Content */}
          {currentCell.content.type === "image" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={currentCell.content.imageUrl || ""}
                  onChange={(e) =>
                    updateCell(currentCell.row, currentCell.col, {
                      ...currentCell.content,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link URL (optional)
                </label>
                <input
                  type="url"
                  value={currentCell.content.link || ""}
                  onChange={(e) =>
                    updateCell(currentCell.row, currentCell.col, {
                      ...currentCell.content,
                      link: e.target.value,
                    })
                  }
                  placeholder="https://example.com/destination"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Text Content */}
          {currentCell.content.type === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Content
              </label>
              <textarea
                value={currentCell.content.text || ""}
                onChange={(e) =>
                  updateCell(currentCell.row, currentCell.col, {
                    ...currentCell.content,
                    text: e.target.value,
                  })
                }
                rows={4}
                placeholder="Enter text..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
          )}

          {/* CTA Content */}
          {currentCell.content.type === "cta" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={currentCell.content.buttonText || ""}
                  onChange={(e) =>
                    updateCell(currentCell.row, currentCell.col, {
                      ...currentCell.content,
                      buttonText: e.target.value,
                    })
                  }
                  placeholder="Shop Now"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link URL
                </label>
                <input
                  type="url"
                  value={currentCell.content.link || ""}
                  onChange={(e) =>
                    updateCell(currentCell.row, currentCell.col, {
                      ...currentCell.content,
                      link: e.target.value,
                    })
                  }
                  placeholder="https://example.com/shop"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Clear Cell */}
          <button
            type="button"
            onClick={() => {
              updateCell(currentCell.row, currentCell.col, { type: "empty" });
              setEditMode(false);
            }}
            className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Clear Cell
          </button>
        </div>
      )}
    </div>
  );
}
