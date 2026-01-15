import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  InlineEditRow,
  type InlineField,
} from "../../src/components/tables/InlineEditRow";

/**
 * InlineEditRow provides an editable table row for inline editing with validation.
 *
 * ## Features
 * - Multiple field types (text, number, select, checkbox, date, textarea)
 * - Real-time validation with error messages
 * - Keyboard shortcuts (Enter to save, Escape to cancel)
 * - Custom render functions for complex fields
 * - Loading states
 * - Framework-agnostic with dependency injection
 */
const meta: Meta<typeof InlineEditRow> = {
  title: "Components/Tables/InlineEditRow",
  component: InlineEditRow,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InlineEditRow>;

const basicFields: InlineField[] = [
  { key: "name", type: "text", label: "Name", required: true },
  { key: "price", type: "number", label: "Price", min: 0 },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

export const Default: Story = {
  render: () => (
    <div className="bg-white dark:bg-gray-900 p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Price</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <InlineEditRow
            fields={basicFields}
            initialValues={{
              name: "Product 1",
              price: 99.99,
              status: "active",
            }}
            onSave={async (values) => {
              console.log("Saved:", values);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }}
            onCancel={() => console.log("Cancelled")}
          />
        </tbody>
      </table>
    </div>
  ),
};

export const AllFieldTypes: Story = {
  render: () => {
    const fields: InlineField[] = [
      { key: "name", type: "text", label: "Name", required: true },
      { key: "email", type: "email", label: "Email" },
      { key: "age", type: "number", label: "Age", min: 18, max: 100 },
      { key: "bio", type: "textarea", label: "Bio", rows: 2 },
      { key: "active", type: "checkbox", label: "Active" },
      { key: "startDate", type: "date", label: "Start Date" },
    ];

    return (
      <div className="bg-white dark:bg-gray-900 p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Bio</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <InlineEditRow
              fields={fields}
              initialValues={{
                name: "John Doe",
                email: "john@example.com",
                age: 30,
                bio: "Software developer",
                active: true,
                startDate: "2026-01-15",
              }}
              onSave={async (values) => console.log("Saved:", values)}
              onCancel={() => console.log("Cancelled")}
            />
          </tbody>
        </table>
      </div>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const fields: InlineField[] = [
      {
        key: "username",
        type: "text",
        label: "Username",
        required: true,
        validate: (value) => {
          if (value && value.length < 3) {
            return "Username must be at least 3 characters";
          }
          return null;
        },
      },
      {
        key: "email",
        type: "email",
        label: "Email",
        required: true,
        validate: (value) => {
          if (value && !value.includes("@")) {
            return "Invalid email format";
          }
          return null;
        },
      },
      {
        key: "age",
        type: "number",
        label: "Age",
        min: 18,
        max: 120,
        required: true,
      },
    ];

    return (
      <div className="bg-white dark:bg-gray-900 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Try clearing fields or entering invalid values to see validation
          errors
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <InlineEditRow
              fields={fields}
              initialValues={{
                username: "user123",
                email: "user@example.com",
                age: 25,
              }}
              onSave={async (values) => console.log("Saved:", values)}
              onCancel={() => console.log("Cancelled")}
            />
          </tbody>
        </table>
      </div>
    );
  },
};

export const LoadingState: Story = {
  render: () => (
    <div className="bg-white dark:bg-gray-900 p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <InlineEditRow
            fields={basicFields}
            initialValues={{
              name: "Product 1",
              price: 99.99,
              status: "active",
            }}
            onSave={async (values) => console.log("Saved:", values)}
            onCancel={() => console.log("Cancelled")}
            loading={true}
          />
        </tbody>
      </table>
    </div>
  ),
};

export const WithCustomRender: Story = {
  render: () => {
    const fields: InlineField[] = [
      { key: "name", type: "text", label: "Name" },
      {
        key: "color",
        type: "custom",
        label: "Color",
        render: ({ value, onChange, disabled }) => (
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-16 h-8 border rounded"
          />
        ),
      },
      {
        key: "tags",
        type: "custom",
        label: "Tags",
        render: ({ value, onChange, disabled }) => (
          <input
            type="text"
            value={(value || []).join(", ")}
            onChange={(e) => onChange(e.target.value.split(", "))}
            disabled={disabled}
            placeholder="tag1, tag2, tag3"
            className="px-2 py-1.5 text-sm border rounded"
          />
        ),
      },
    ];

    return (
      <div className="bg-white dark:bg-gray-900 p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Color</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <InlineEditRow
              fields={fields}
              initialValues={{
                name: "My Item",
                color: "#3b82f6",
                tags: ["react", "typescript"],
              }}
              onSave={async (values) => console.log("Saved:", values)}
              onCancel={() => console.log("Cancelled")}
            />
          </tbody>
        </table>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [isEditing, setIsEditing] = useState(false);
    const [product, setProduct] = useState({
      name: "Wireless Mouse",
      price: 29.99,
      status: "active",
      stock: 150,
    });

    const fields: InlineField[] = [
      { key: "name", type: "text", label: "Name", required: true },
      { key: "price", type: "number", label: "Price", min: 0, step: 0.01 },
      {
        key: "status",
        type: "select",
        label: "Status",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
      { key: "stock", type: "number", label: "Stock", min: 0 },
    ];

    return (
      <div className="bg-white dark:bg-gray-900 p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Product Table with Inline Editing
        </h3>
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-700">
                Name
              </th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-700">
                Price
              </th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-700">
                Status
              </th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-700">
                Stock
              </th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isEditing ? (
              <InlineEditRow
                fields={fields}
                initialValues={product}
                onSave={async (values) => {
                  console.log("Saving:", values);
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  setProduct(values as typeof product);
                  setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                  {product.name}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-700">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      product.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                  {product.stock}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-700">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  },
};
