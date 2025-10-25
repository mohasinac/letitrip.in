"use client";

import { useState } from "react";

interface CategoryBulkActionsProps {
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
  onClearSelection: () => void;
}

export default function CategoryBulkActions({
  selectedCount,
  onAction,
  onClearSelection,
}: CategoryBulkActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const handleAction = (action: string, data?: any) => {
    onAction(action, data);
    setShowDropdown(false);
    setShowMoveModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Bulk Actions</h3>
        <button
          onClick={onClearSelection}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear Selection
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        {selectedCount} categor{selectedCount === 1 ? "y" : "ies"} selected
      </div>

      <div className="space-y-2">
        {/* Quick Actions */}
        <button
          onClick={() => handleAction("activate")}
          className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded"
        >
          ✓ Activate Selected
        </button>

        <button
          onClick={() => handleAction("deactivate")}
          className="w-full text-left px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 rounded"
        >
          ⏸ Deactivate Selected
        </button>

        <button
          onClick={() => handleAction("setFeatured", { featured: true })}
          className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded"
        >
          ⭐ Set as Featured
        </button>

        <button
          onClick={() => handleAction("setFeatured", { featured: false })}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
        >
          ☆ Remove from Featured
        </button>

        {/* Move to Parent */}
        <button
          onClick={() => setShowMoveModal(true)}
          className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded"
        >
          📁 Move to Parent
        </button>

        {/* Dangerous Actions */}
        <div className="border-t pt-2 mt-2">
          <button
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to delete ${selectedCount} categories? This action cannot be undone.`
                )
              ) {
                handleAction("delete");
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded"
          >
            🗑 Delete Selected
          </button>
        </div>
      </div>

      {/* Move Modal */}
      {showMoveModal && (
        <MoveToParentModal
          onMove={(parentId) => handleAction("moveToParent", { parentId })}
          onCancel={() => setShowMoveModal(false)}
        />
      )}
    </div>
  );
}

interface MoveToParentModalProps {
  onMove: (parentId: string | null) => void;
  onCancel: () => void;
}

function MoveToParentModal({ onMove, onCancel }: MoveToParentModalProps) {
  const [selectedParent, setSelectedParent] = useState<string>("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Move to Parent</h3>
        </div>

        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select New Parent Category
          </label>
          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className="input w-full"
          >
            <option value="">Root Level (No Parent)</option>
            {/* This would need to be populated with available categories */}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Selected categories will be moved under the chosen parent category.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button
            onClick={() => onMove(selectedParent || null)}
            className="btn btn-primary"
          >
            Move Categories
          </button>
        </div>
      </div>
    </div>
  );
}
