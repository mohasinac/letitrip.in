"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  BulkActionBar,
  type BulkAction,
} from "../../src/components/tables/BulkActionBar";

/**
 * BulkActionBar provides a sticky action bar for bulk operations on selected items.
 * It offers both desktop (top) and mobile (bottom) layouts with confirmation dialogs.
 *
 * ## Features
 * - Desktop and mobile responsive layouts
 * - Confirmation dialogs for destructive actions
 * - Action variants (default, danger, warning, success)
 * - Loading states during action execution
 * - Custom icons and error handling
 * - Framework-agnostic with dependency injection
 */
const meta: Meta<typeof BulkActionBar> = {
  title: "Components/Tables/BulkActionBar",
  component: BulkActionBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BulkActionBar>;

// Mock icons for stories
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path
      d="M4 4l8 8m0-8l-8 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LoaderIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="animate-spin"
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.25"
    />
    <path
      d="M8 2a6 6 0 0 1 6 6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path
      d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v4M10 7v4"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path
      d="M3 8l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArchiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect
      x="2"
      y="3"
      width="12"
      height="10"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M6 7h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Simple mock ConfirmDialog
const MockConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
}: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

const basicActions: BulkAction[] = [
  { id: "delete", label: "Delete", variant: "danger", icon: TrashIcon },
  { id: "publish", label: "Publish", variant: "success", icon: CheckIcon },
  { id: "archive", label: "Archive", variant: "default", icon: ArchiveIcon },
];

export const Default: Story = {
  args: {
    selectedCount: 5,
    actions: basicActions,
    onAction: async (actionId) => {
      console.log("Action triggered:", actionId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onClearSelection: () => console.log("Clear selection"),
    XIcon,
    LoaderIcon,
  },
};

export const WithTotalCount: Story = {
  args: {
    selectedCount: 15,
    totalCount: 247,
    actions: basicActions,
    onAction: async (actionId) => {
      console.log("Action triggered:", actionId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onClearSelection: () => console.log("Clear selection"),
    XIcon,
    LoaderIcon,
  },
};

export const CustomResourceName: Story = {
  args: {
    selectedCount: 3,
    resourceName: "product",
    actions: basicActions,
    onAction: async (actionId) => {
      console.log("Action triggered:", actionId);
    },
    onClearSelection: () => console.log("Clear selection"),
    XIcon,
    LoaderIcon,
  },
};

export const WithConfirmation: Story = {
  args: {
    selectedCount: 8,
    actions: [
      {
        id: "delete",
        label: "Delete",
        variant: "danger",
        icon: TrashIcon,
        confirm: true,
        confirmTitle: "Delete Items",
        confirmMessage:
          "Are you sure you want to delete 8 items? This action cannot be undone.",
        confirmText: "Delete",
      },
      {
        id: "archive",
        label: "Archive",
        variant: "default",
        icon: ArchiveIcon,
      },
    ],
    onAction: async (actionId) => {
      console.log("Action confirmed:", actionId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onClearSelection: () => console.log("Clear selection"),
    ConfirmDialog: MockConfirmDialog,
    XIcon,
    LoaderIcon,
  },
};

export const WithDisabledActions: Story = {
  args: {
    selectedCount: 2,
    actions: [
      {
        id: "delete",
        label: "Delete",
        variant: "danger",
        icon: TrashIcon,
        disabled: true,
      },
      { id: "publish", label: "Publish", variant: "success", icon: CheckIcon },
      {
        id: "archive",
        label: "Archive",
        variant: "default",
        icon: ArchiveIcon,
        disabled: true,
      },
    ],
    onAction: async (actionId) => {
      console.log("Action triggered:", actionId);
    },
    onClearSelection: () => console.log("Clear selection"),
    XIcon,
    LoaderIcon,
  },
};

export const LoadingState: Story = {
  args: {
    selectedCount: 10,
    actions: basicActions,
    onAction: async (actionId) => {
      console.log("Action triggered:", actionId);
    },
    onClearSelection: () => console.log("Clear selection"),
    loading: true,
    XIcon,
    LoaderIcon,
  },
};

export const SingleItem: Story = {
  args: {
    selectedCount: 1,
    resourceName: "order",
    actions: basicActions,
    onAction: async (actionId) => {
      console.log("Action triggered:", actionId);
    },
    onClearSelection: () => console.log("Clear selection"),
    XIcon,
    LoaderIcon,
  },
};

export const ManyActions: Story = {
  args: {
    selectedCount: 7,
    actions: [
      { id: "delete", label: "Delete", variant: "danger", icon: TrashIcon },
      { id: "publish", label: "Publish", variant: "success", icon: CheckIcon },
      { id: "unpublish", label: "Unpublish", variant: "warning" },
      {
        id: "archive",
        label: "Archive",
        variant: "default",
        icon: ArchiveIcon,
      },
      { id: "duplicate", label: "Duplicate", variant: "default" },
      { id: "export", label: "Export", variant: "default" },
    ],
    onAction: async (actionId) => {
      console.log("Action triggered:", actionId);
    },
    onClearSelection: () => console.log("Clear selection"),
    XIcon,
    LoaderIcon,
  },
};

export const WithErrorHandling: Story = {
  args: {
    selectedCount: 4,
    actions: [
      {
        id: "delete",
        label: "Delete (will fail)",
        variant: "danger",
        icon: TrashIcon,
      },
      {
        id: "archive",
        label: "Archive",
        variant: "default",
        icon: ArchiveIcon,
      },
    ],
    onAction: async (actionId) => {
      console.log("Action triggered:", actionId);
      if (actionId === "delete") {
        throw new Error("Failed to delete items");
      }
    },
    onClearSelection: () => console.log("Clear selection"),
    onError: (error, actionId) => {
      console.error("Error in action", actionId, error);
      alert(`Error: ${error.message}`);
    },
    XIcon,
    LoaderIcon,
  },
};

// Interactive example with state management
export const Interactive: Story = {
  render: () => {
    const [selectedCount, setSelectedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (actionId: string) => {
      setIsLoading(true);
      console.log("Action:", actionId, "on", selectedCount, "items");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoading(false);
      setSelectedCount(0); // Clear selection after action
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Interactive Example
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 shadow">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Select items below to see the BulkActionBar in action:
            </p>

            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <label
                  key={num}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedCount >= num}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCount(num);
                      } else {
                        setSelectedCount(num - 1);
                      }
                    }}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-900 dark:text-white">
                    Item {num}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <BulkActionBar
            selectedCount={selectedCount}
            totalCount={10}
            resourceName="item"
            actions={[
              {
                id: "delete",
                label: "Delete",
                variant: "danger",
                icon: TrashIcon,
                confirm: true,
                confirmTitle: "Delete Items",
                confirmMessage: `Delete ${selectedCount} item${
                  selectedCount !== 1 ? "s" : ""
                }?`,
                confirmText: "Delete",
              },
              {
                id: "publish",
                label: "Publish",
                variant: "success",
                icon: CheckIcon,
              },
              {
                id: "archive",
                label: "Archive",
                variant: "default",
                icon: ArchiveIcon,
              },
            ]}
            onAction={handleAction}
            onClearSelection={() => setSelectedCount(0)}
            loading={isLoading}
            ConfirmDialog={MockConfirmDialog}
            XIcon={XIcon}
            LoaderIcon={LoaderIcon}
          />
        </div>
      </div>
    );
  },
};

