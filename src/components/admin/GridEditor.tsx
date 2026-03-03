"use client";

import { useState } from "react";
import { THEME_CONSTANTS } from "@/constants";
import { Button, Heading, Label, Span } from "@/components";

const { flex } = THEME_CONSTANTS;

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
  rows = 3,
  cols = 3,
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
      : THEME_CONSTANTS.themed.bgSecondary;

    return (
      <Button
        key={`${cell.row}-${cell.col}`}
        type="button"
        onClick={() => handleCellClick(cell.row, cell.col)}
        variant="ghost"
        className={`
          ${bgColor}
          border ${THEME_CONSTANTS.themed.border}
          hover:border-blue-400 dark:hover:border-blue-500
          transition-colors duration-150
          p-1 min-h-[60px]
          ${flex.center}
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
          <Span className={`truncate ${THEME_CONSTANTS.themed.textSecondary}`}>
            {cell.content.text}
          </Span>
        )}
        {cell.content.type === "cta" && cell.content.buttonText && (
          <Span className="truncate text-blue-600 dark:text-blue-400 font-medium">
            {cell.content.buttonText}
          </Span>
        )}
        {cell.content.type === "empty" && (
          <Span className={THEME_CONSTANTS.themed.textMuted}>+</Span>
        )}
      </Button>
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
          className={`${THEME_CONSTANTS.themed.bgSecondary} p-4 rounded-lg border ${THEME_CONSTANTS.themed.borderColor}`}
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
          className={`w-full lg:w-80 ${THEME_CONSTANTS.themed.bgSecondary} p-4 rounded-lg border ${THEME_CONSTANTS.themed.borderColor}`}
        >
          <div className={`${flex.between} mb-4`}>
            <Heading level={3} className="text-lg font-semibold">
              Edit Cell ({currentCell.row}, {currentCell.col})
            </Heading>
            <Button
              type="button"
              onClick={() => setEditMode(false)}
              variant="ghost"
              size="sm"
              className={`${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.themed.hoverText}`}
            >
              ✕
            </Button>
          </div>

          {/* Content Type Selector */}
          <div className="mb-4">
            <Label
              className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} mb-2`}
            >
              Content Type
            </Label>
            <select
              value={currentCell.content.type}
              onChange={(e) => {
                const type = e.target.value as GridCell["content"]["type"];
                updateCell(currentCell.row, currentCell.col, { type });
              }}
              className={THEME_CONSTANTS.patterns.adminSelect}
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
                <Label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} mb-2`}
                >
                  Image URL
                </Label>
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
                  className={THEME_CONSTANTS.patterns.adminInput}
                />
              </div>
              <div>
                <Label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} mb-2`}
                >
                  Link URL (optional)
                </Label>
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
                  className={THEME_CONSTANTS.patterns.adminInput}
                />
              </div>
            </div>
          )}

          {/* Text Content */}
          {currentCell.content.type === "text" && (
            <div>
              <Label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} mb-2`}
              >
                Text Content
              </Label>
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
                className={`${THEME_CONSTANTS.patterns.adminInput} resize-none`}
              />
            </div>
          )}

          {/* CTA Content */}
          {currentCell.content.type === "cta" && (
            <div className="space-y-3">
              <div>
                <Label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} mb-2`}
                >
                  Button Text
                </Label>
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
                  className={THEME_CONSTANTS.patterns.adminInput}
                />
              </div>
              <div>
                <Label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} mb-2`}
                >
                  Link URL
                </Label>
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
                  className={THEME_CONSTANTS.patterns.adminInput}
                />
              </div>
            </div>
          )}

          {/* Clear Cell */}
          <Button
            type="button"
            onClick={() => {
              updateCell(currentCell.row, currentCell.col, { type: "empty" });
              setEditMode(false);
            }}
            variant="danger"
            className="w-full mt-4"
          >
            Clear Cell
          </Button>
        </div>
      )}
    </div>
  );
}
