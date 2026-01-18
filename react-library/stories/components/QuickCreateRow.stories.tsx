"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import type { InlineField } from "../../src/components/tables/InlineEditRow";
import { QuickCreateRow } from "../../src/components/tables/QuickCreateRow";

/**
 * QuickCreateRow is a collapsible table row component for quickly creating new items.
 * It starts collapsed and expands when clicked to show form fields.
 *
 * ## Features
 * - 🎯 Collapsible interface - starts minimized
 * - 📝 Multiple field types supported
 * - ✅ Built-in validation
 * - ⌨️ Keyboard shortcuts (Enter/Escape)
 * - 🔄 Auto-reset after save
 * - 🎨 Customizable appearance
 * - ♿ Accessible
 */
const meta: Meta<typeof QuickCreateRow> = {
  title: "Components/Tables/QuickCreateRow",
  component: QuickCreateRow,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A table row component for quick inline creation. Expands to show form fields and collapses after successful save.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    fields: { control: false },
    onSave: { action: "save" },
    loading: { control: "boolean" },
    resourceName: { control: "text" },
    defaultValues: { control: "object" },
    onError: { action: "error" },
  },
  decorators: [
    (Story) => (
      <div className="w-full overflow-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Price</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <Story />
          </tbody>
        </table>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuickCreateRow>;

const defaultFields: InlineField[] = [
  { key: "name", type: "text", label: "Name", required: true },
  { key: "price", type: "number", label: "Price", min: 0 },
];

/**
 * Default collapsed state with "Add item" button.
 * Click to expand and show form fields.
 */
export const Default: Story = {
  args: {
    fields: defaultFields,
    onSave: fn().mockResolvedValue(undefined),
  },
};

/**
 * With a custom resource name displayed in the UI.
 */
export const CustomResourceName: Story = {
  args: {
    fields: defaultFields,
    onSave: fn().mockResolvedValue(undefined),
    resourceName: "product",
  },
};

/**
 * All supported field types in one form.
 */
export const AllFieldTypes: Story = {
  args: {
    fields: [
      { key: "name", type: "text", label: "Name", required: true },
      {
        key: "email",
        type: "email",
        label: "Email",
        placeholder: "user@example.com",
      },
      { key: "website", type: "url", label: "Website" },
      { key: "quantity", type: "number", label: "Quantity", min: 0, max: 100 },
      {
        key: "description",
        type: "textarea",
        label: "Description",
        rows: 2,
      },
      {
        key: "category",
        type: "select",
        label: "Category",
        options: [
          { label: "Electronics", value: "electronics" },
          { label: "Clothing", value: "clothing" },
          { label: "Food", value: "food" },
        ],
      },
      { key: "active", type: "checkbox", label: "Active" },
      { key: "startDate", type: "date", label: "Start Date" },
    ] as InlineField[],
    onSave: fn().mockResolvedValue(undefined),
    resourceName: "item",
  },
  decorators: [
    (Story) => (
      <div className="w-full overflow-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Website</th>
              <th className="border border-gray-300 px-4 py-2">Quantity</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Active</th>
              <th className="border border-gray-300 px-4 py-2">Start Date</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <Story />
          </tbody>
        </table>
      </div>
    ),
  ],
};

/**
 * With field validation rules.
 * Try to save without required fields or with invalid values.
 */
export const WithValidation: Story = {
  args: {
    fields: [
      { key: "name", type: "text", label: "Name", required: true },
      {
        key: "email",
        type: "email",
        label: "Email",
        required: true,
        validate: (value) =>
          value && !value.includes("@") ? "Invalid email format" : null,
      },
      {
        key: "price",
        type: "number",
        label: "Price",
        required: true,
        min: 1,
        max: 1000,
      },
    ] as InlineField[],
    onSave: fn().mockResolvedValue(undefined),
    resourceName: "product",
  },
  decorators: [
    (Story) => (
      <div className="w-full overflow-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Price</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <Story />
          </tbody>
        </table>
      </div>
    ),
  ],
};

/**
 * Loading state - button disabled while saving.
 */
export const Loading: Story = {
  args: {
    fields: defaultFields,
    onSave: fn().mockResolvedValue(undefined),
    loading: true,
  },
};

/**
 * With default values pre-filled.
 */
export const WithDefaultValues: Story = {
  args: {
    fields: defaultFields,
    onSave: fn().mockResolvedValue(undefined),
    defaultValues: { name: "New Product", price: 29.99 },
  },
};

/**
 * Interactive example showing the full workflow in a table context.
 */
export const InteractiveExample: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: 1, name: "Laptop", price: 999 },
      { id: 2, name: "Mouse", price: 29 },
    ]);
    const [loading, setLoading] = useState(false);

    const handleSave = async (values: Record<string, any>) => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setItems([...items, { id: items.length + 1, ...values }]);
      setLoading(false);
    };

    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Products</h3>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Price
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {item.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  ${item.price}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button className="text-blue-600 hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            <QuickCreateRow
              fields={[
                { key: "name", type: "text", label: "Name", required: true },
                { key: "price", type: "number", label: "Price", min: 0 },
              ]}
              onSave={handleSave}
              loading={loading}
              resourceName="product"
            />
          </tbody>
        </table>
        <p className="mt-4 text-sm text-gray-600">
          Click "Add product" to create a new item. The form will reset and
          collapse after successful creation.
        </p>
      </div>
    );
  },
};

