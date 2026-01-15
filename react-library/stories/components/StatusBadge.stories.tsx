import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "../src/components/tables/StatusBadge";

const meta = {
  title: "Components/Tables/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible status indicator component with predefined color schemes and customizable styles. Perfect for displaying statuses in tables, cards, and lists.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: [
        "active",
        "inactive",
        "pending",
        "approved",
        "rejected",
        "banned",
        "verified",
        "unverified",
        "featured",
        "draft",
        "published",
        "archived",
        "success",
        "error",
        "warning",
        "info",
      ],
      description: "Status type to display",
    },
    variant: {
      control: "select",
      options: ["default", "outline", "solid"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the badge",
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "active",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="active" />
      <StatusBadge status="inactive" />
      <StatusBadge status="pending" />
      <StatusBadge status="approved" />
      <StatusBadge status="rejected" />
      <StatusBadge status="banned" />
      <StatusBadge status="verified" />
      <StatusBadge status="unverified" />
      <StatusBadge status="featured" />
      <StatusBadge status="draft" />
      <StatusBadge status="published" />
      <StatusBadge status="archived" />
      <StatusBadge status="success" />
      <StatusBadge status="error" />
      <StatusBadge status="warning" />
      <StatusBadge status="info" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available predefined status types.",
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <span className="text-sm w-20">Default:</span>
        <StatusBadge status="active" variant="default" />
        <StatusBadge status="pending" variant="default" />
        <StatusBadge status="error" variant="default" />
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-sm w-20">Outline:</span>
        <StatusBadge status="active" variant="outline" />
        <StatusBadge status="pending" variant="outline" />
        <StatusBadge status="error" variant="outline" />
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-sm w-20">Solid:</span>
        <StatusBadge status="active" variant="solid" />
        <StatusBadge status="pending" variant="solid" />
        <StatusBadge status="error" variant="solid" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different visual variants: default, outline, and solid.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusBadge status="active" size="sm" />
      <StatusBadge status="active" size="md" />
      <StatusBadge status="active" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Available sizes: small, medium (default), and large.",
      },
    },
  },
};

export const CustomStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge
        status="custom"
        statusStyles={{
          custom: {
            bg: "bg-pink-100 dark:bg-pink-900/30",
            text: "text-pink-800 dark:text-pink-400",
            border: "border-pink-300 dark:border-pink-700",
          },
        }}
      />
      <StatusBadge
        status="vip"
        statusStyles={{
          vip: {
            bg: "bg-amber-100 dark:bg-amber-900/30",
            text: "text-amber-800 dark:text-amber-400",
            border: "border-amber-300 dark:border-amber-700",
          },
        }}
        variant="outline"
      />
      <StatusBadge
        status="premium"
        statusStyles={{
          premium: {
            bg: "bg-indigo-100 dark:bg-indigo-900/30",
            text: "text-indigo-800 dark:text-indigo-400",
            border: "border-indigo-300 dark:border-indigo-700",
          },
        }}
        size="lg"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Custom status types with custom color schemes using the statusStyles prop.",
      },
    },
  },
};

export const InTableContext: Story = {
  render: () => {
    interface User {
      id: number;
      name: string;
      email: string;
      status: string;
      role: string;
    }

    const users: User[] = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        status: "active",
        role: "Admin",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        status: "pending",
        role: "User",
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        status: "inactive",
        role: "User",
      },
      {
        id: 4,
        name: "Alice Brown",
        email: "alice@example.com",
        status: "verified",
        role: "Moderator",
      },
      {
        id: 5,
        name: "Charlie Wilson",
        email: "charlie@example.com",
        status: "banned",
        role: "User",
      },
    ];

    return (
      <div className="w-full max-w-4xl">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={user.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "StatusBadge used in a table to display user statuses.",
      },
    },
  },
};

export const ColorSchemes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Green (Success, Active, Positive)
        </h3>
        <div className="flex gap-2">
          <StatusBadge status="active" />
          <StatusBadge status="approved" />
          <StatusBadge status="published" />
          <StatusBadge status="success" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Red (Error, Danger, Negative)
        </h3>
        <div className="flex gap-2">
          <StatusBadge status="rejected" />
          <StatusBadge status="banned" />
          <StatusBadge status="error" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Yellow (Warning, Pending)
        </h3>
        <div className="flex gap-2">
          <StatusBadge status="pending" />
          <StatusBadge status="warning" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Blue (Info, Verified)
        </h3>
        <div className="flex gap-2">
          <StatusBadge status="verified" />
          <StatusBadge status="info" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Purple (Featured, Special)
        </h3>
        <div className="flex gap-2">
          <StatusBadge status="featured" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Gray (Neutral, Inactive)
        </h3>
        <div className="flex gap-2">
          <StatusBadge status="inactive" />
          <StatusBadge status="unverified" />
          <StatusBadge status="draft" />
          <StatusBadge status="archived" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Color schemes organized by semantic meaning. Each color represents a specific category of status.",
      },
    },
  },
};

export const MixedSizesAndVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <StatusBadge status="active" variant="default" size="sm" />
        <StatusBadge status="pending" variant="outline" size="md" />
        <StatusBadge status="error" variant="solid" size="lg" />
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status="verified" variant="outline" size="sm" />
        <StatusBadge status="featured" variant="default" size="md" />
        <StatusBadge status="published" variant="solid" size="lg" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Combinations of different sizes and variants.",
      },
    },
  },
};
