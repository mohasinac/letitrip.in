import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { InlineEditor } from "../../src/components/tables/InlineEditor";

/**
 * InlineEditor allows users to edit values directly inline without navigating to a separate form.
 * Click on the value to enter edit mode.
 *
 * ## Features
 * - 🖱️ Click to edit interface
 * - 📝 Multiple input types (text, number, textarea, select)
 * - ✅ Built-in validation
 * - ⌨️ Keyboard shortcuts (Enter/Esc, Ctrl+Enter for textarea)
 * - 🎨 Customizable appearance
 * - ♿ Accessible
 */
const meta: Meta<typeof InlineEditor> = {
  title: "Components/Tables/InlineEditor",
  component: InlineEditor,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A click-to-edit component for inline editing. Displays a value that transforms into an input when clicked.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    onSave: { action: "save" },
    onCancel: { action: "cancel" },
    type: {
      control: "select",
      options: ["text", "number", "textarea", "select"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    maxLength: { control: "number" },
    rows: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof InlineEditor>;

/**
 * Default text input editor.
 * Click on the value to edit it.
 */
export const Default: Story = {
  args: {
    value: "Click to edit this text",
    onSave: fn().mockResolvedValue(undefined),
  },
};

/**
 * Editor with a placeholder for empty values.
 */
export const WithPlaceholder: Story = {
  args: {
    value: "",
    onSave: fn().mockResolvedValue(undefined),
    placeholder: "Enter your name...",
  },
};

/**
 * Number input editor.
 */
export const NumberType: Story = {
  args: {
    value: "42",
    onSave: fn().mockResolvedValue(undefined),
    type: "number",
    placeholder: "Enter a number",
  },
};

/**
 * Textarea editor for multi-line text.
 * Use Ctrl+Enter to save, Escape to cancel.
 */
export const TextareaType: Story = {
  args: {
    value: "This is a longer text.\nIt supports multiple lines.",
    onSave: fn().mockResolvedValue(undefined),
    type: "textarea",
    rows: 4,
  },
};

/**
 * Select dropdown editor.
 */
export const SelectType: Story = {
  args: {
    value: "active",
    onSave: fn().mockResolvedValue(undefined),
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
};

/**
 * Editor with required validation.
 * Try clearing the value and saving.
 */
export const Required: Story = {
  args: {
    value: "Required field",
    onSave: fn().mockResolvedValue(undefined),
    required: true,
  },
};

/**
 * Editor with maximum length constraint.
 */
export const WithMaxLength: Story = {
  args: {
    value: "Short",
    onSave: fn().mockResolvedValue(undefined),
    maxLength: 20,
    placeholder: "Max 20 characters",
  },
};

/**
 * Disabled editor that cannot be edited.
 */
export const Disabled: Story = {
  args: {
    value: "This cannot be edited",
    onSave: fn(),
    disabled: true,
  },
};

/**
 * Editor with custom display renderer.
 * The display format can be different from the edit format.
 */
export const CustomDisplay: Story = {
  args: {
    value: "john.doe@example.com",
    onSave: fn().mockResolvedValue(undefined),
    displayRenderer: (value) => (
      <span className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span className="text-blue-600 underline">{value}</span>
      </span>
    ),
    placeholder: "Enter email...",
  },
};

/**
 * Interactive example showing real-time state updates.
 */
export const Interactive: Story = {
  render: () => {
    const [name, setName] = useState("John Doe");
    const [email, setEmail] = useState("john.doe@example.com");
    const [bio, setBio] = useState(
      "Software developer passionate about creating great user experiences."
    );
    const [status, setStatus] = useState("active");
    const [saveCount, setSaveCount] = useState(0);

    return (
      <div className="w-full max-w-2xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          User Profile
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <label className="w-24 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Name:
            </label>
            <InlineEditor
              value={name}
              onSave={async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                setName(value);
                setSaveCount((c) => c + 1);
              }}
              placeholder="Enter name..."
              required
            />
          </div>

          <div className="flex items-start gap-4">
            <label className="w-24 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email:
            </label>
            <InlineEditor
              value={email}
              onSave={async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                setEmail(value);
                setSaveCount((c) => c + 1);
              }}
              placeholder="Enter email..."
              required
            />
          </div>

          <div className="flex items-start gap-4">
            <label className="w-24 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <InlineEditor
              value={status}
              onSave={async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                setStatus(value);
                setSaveCount((c) => c + 1);
              }}
              type="select"
              options={[
                { label: "Active", value: "active" },
                { label: "Away", value: "away" },
                { label: "Busy", value: "busy" },
                { label: "Offline", value: "offline" },
              ]}
            />
          </div>

          <div className="flex items-start gap-4">
            <label className="w-24 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio:
            </label>
            <InlineEditor
              value={bio}
              onSave={async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                setBio(value);
                setSaveCount((c) => c + 1);
              }}
              type="textarea"
              rows={3}
              maxLength={200}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Total saves:</strong> {saveCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Click any value to edit. Press Enter to save, Escape to cancel. For
            textarea, use Ctrl+Enter to save.
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Example of error handling during save.
 */
export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState("Valid Value");
    const [errorCount, setErrorCount] = useState(0);

    return (
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Error Handling Example
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Try entering "error" to trigger a save failure:
          </p>
          <InlineEditor
            value={value}
            onSave={async (newValue) => {
              await new Promise((resolve) => setTimeout(resolve, 500));
              if (newValue.toLowerCase().includes("error")) {
                setErrorCount((c) => c + 1);
                throw new Error("Cannot save values containing 'error'");
              }
              setValue(newValue);
            }}
            placeholder="Enter value..."
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Current value:</strong> {value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Failed saves:</strong> {errorCount}
        </p>
      </div>
    );
  },
};
