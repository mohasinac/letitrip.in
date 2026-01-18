"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import type { ActionMenuItem } from "../../src/components/tables/ActionMenu";
import { ActionMenu } from "../../src/components/tables/ActionMenu";

/**
 * ActionMenu provides a dropdown menu of actions, commonly used in tables and lists
 * for row-level operations.
 *
 * ## Features
 * - 🖱️ Click to open/close
 * - ⌨️ Keyboard support (Escape to close)
 * - 🔘 Click outside to close
 * - 🎨 Variant styles (default, danger, success)
 * - ❌ Disabled states
 * - 🔄 Custom icons
 * - ♿ Accessible with ARIA attributes
 */
const meta: Meta<typeof ActionMenu> = {
  title: "Components/Tables/ActionMenu",
  component: ActionMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A dropdown menu component for displaying a list of actions. Opens on click and closes when an action is selected, Escape is pressed, or user clicks outside.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    items: { control: false },
    label: { control: "text" },
    align: { control: "select", options: ["left", "right"] },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

const basicItems: ActionMenuItem[] = [
  {
    label: "Edit",
    onClick: fn(),
    icon: (
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
    ),
  },
  {
    label: "Duplicate",
    onClick: fn(),
    icon: (
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
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Archive",
    onClick: fn(),
    icon: (
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
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
  },
  {
    label: "Delete",
    onClick: fn(),
    variant: "danger",
    icon: (
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
    ),
  },
];

/**
 * Default action menu with basic items.
 */
export const Default: Story = {
  args: {
    items: basicItems,
    label: "Actions",
  },
};

/**
 * Menu aligned to the left side.
 */
export const LeftAligned: Story = {
  args: {
    items: basicItems,
    label: "Actions",
    align: "left",
  },
};

/**
 * Menu with different action variants.
 */
export const WithVariants: Story = {
  args: {
    items: [
      { label: "View", onClick: fn(), variant: "default" },
      { label: "Approve", onClick: fn(), variant: "success" },
      { label: "Reject", onClick: fn(), variant: "danger" },
    ],
    label: "Actions",
  },
};

/**
 * Menu with disabled items.
 */
export const WithDisabledItems: Story = {
  args: {
    items: [
      { label: "Edit", onClick: fn() },
      { label: "Delete", onClick: fn(), disabled: true },
      { label: "Archive", onClick: fn() },
    ],
    label: "Actions",
  },
};

/**
 * Compact menu with only icons, no text.
 */
export const IconOnly: Story = {
  args: {
    items: basicItems,
    label: "",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
        />
      </svg>
    ),
  },
};

/**
 * Menu without icons on items.
 */
export const NoIcons: Story = {
  args: {
    items: [
      { label: "Edit", onClick: fn() },
      { label: "Duplicate", onClick: fn() },
      { label: "Archive", onClick: fn() },
      { label: "Delete", onClick: fn(), variant: "danger" },
    ],
    label: "Actions",
  },
};

/**
 * Interactive example showing action handling in a table context.
 */
export const InTableContext: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: 1, name: "Product A", status: "active" },
      { id: 2, name: "Product B", status: "active" },
      { id: 3, name: "Product C", status: "archived" },
    ]);
    const [actionLog, setActionLog] = useState<string[]>([]);

    const logAction = (action: string, itemId: number) => {
      setActionLog((prev) => [...prev, `${action} - Item ${itemId}`]);
    };

    const handleEdit = (id: number) => {
      logAction("Edit", id);
    };

    const handleArchive = (id: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "archived" } : item
        )
      );
      logAction("Archive", id);
    };

    const handleDelete = (id: number) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      logAction("Delete", id);
    };

    return (
      <div className="w-full max-w-4xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Products
        </h2>

        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                ID
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                Name
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                Status
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  {item.id}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  {item.name}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      item.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                  <ActionMenu
                    items={[
                      {
                        label: "Edit",
                        onClick: () => handleEdit(item.id),
                      },
                      {
                        label: "Archive",
                        onClick: () => handleArchive(item.id),
                        disabled: item.status === "archived",
                      },
                      {
                        label: "Delete",
                        onClick: () => handleDelete(item.id),
                        variant: "danger",
                      },
                    ]}
                    label=""
                    icon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Action Log:
          </h3>
          <div className="max-h-32 overflow-y-auto">
            {actionLog.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No actions yet. Try clicking an action menu!
              </p>
            ) : (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {actionLog.map((log, index) => (
                  <li key={index}>• {log}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  },
};

