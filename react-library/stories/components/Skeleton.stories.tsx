import type { Meta, StoryObj } from "@storybook/react";
import {
  LoadingSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonText,
} from "../src/components/tables/Skeleton";

const meta = {
  title: "Components/Tables/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A comprehensive set of skeleton components for displaying loading states. Includes base skeleton, text, avatar, button, image, and complex layout skeletons.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BaseSkeleton: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Base skeleton component with custom dimensions using className.",
      },
    },
  },
};

export const WithoutAnimation: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" animate={false} />
      <Skeleton className="h-4 w-3/4" animate={false} />
      <Skeleton className="h-4 w-1/2" animate={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Skeletons without pulse animation.",
      },
    },
  },
};

export const TextSkeleton: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          3 Lines (Default)
        </h3>
        <SkeletonText />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          5 Lines
        </h3>
        <SkeletonText lines={5} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Single Line
        </h3>
        <SkeletonText lines={1} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Text skeleton with configurable line count. Last line is automatically shorter for a realistic appearance.",
      },
    },
  },
};

export const AvatarSkeleton: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
          Small
        </p>
        <SkeletonAvatar size="sm" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
          Medium
        </p>
        <SkeletonAvatar size="md" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
          Large
        </p>
        <SkeletonAvatar size="lg" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
          XL
        </p>
        <SkeletonAvatar size="xl" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Avatar/profile picture skeletons in different sizes.",
      },
    },
  },
};

export const ButtonSkeleton: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Small</p>
        <SkeletonButton variant="sm" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Default</p>
        <SkeletonButton variant="default" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Large</p>
        <SkeletonButton variant="lg" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Full Width
        </p>
        <SkeletonButton className="w-full max-w-xs" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Button skeletons in different sizes.",
      },
    },
  },
};

export const ImageSkeleton: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Square</p>
        <SkeletonImage aspectRatio="square" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Video (16:9)
        </p>
        <SkeletonImage aspectRatio="video" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Portrait (3:4)
        </p>
        <SkeletonImage aspectRatio="portrait" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Image skeletons with different aspect ratios.",
      },
    },
  },
};

export const CardLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LoadingSkeleton type="card" count={3} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Card loading skeleton - perfect for product cards, blog posts, etc.",
      },
    },
  },
};

export const ListLayout: Story = {
  render: () => (
    <div className="space-y-4 max-w-4xl">
      <LoadingSkeleton type="list" count={3} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "List loading skeleton - ideal for search results, activity feeds, etc.",
      },
    },
  },
};

export const DetailLayout: Story = {
  render: () => (
    <div className="max-w-6xl">
      <LoadingSkeleton type="detail" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Detail page loading skeleton - designed for product details, article pages, etc.",
      },
    },
  },
};

export const GridLayout: Story = {
  render: () => <LoadingSkeleton type="grid" count={8} />,
  parameters: {
    docs: {
      description: {
        story:
          "Grid loading skeleton - responsive grid layout for product galleries, image grids, etc.",
      },
    },
  },
};

export const TableLayout: Story = {
  render: () => (
    <div className="max-w-6xl">
      <LoadingSkeleton type="table" count={5} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Table loading skeleton - simulates table structure with header and rows.",
      },
    },
  },
};

export const ComposedExample: Story = {
  render: () => (
    <div className="max-w-4xl space-y-8">
      {/* User Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <SkeletonAvatar size="lg" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <SkeletonButton />
        </div>
        <SkeletonText lines={3} />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4">
        <LoadingSkeleton type="card" count={2} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Complex loading state composed of multiple skeleton components - demonstrates how to build custom loading layouts.",
      },
    },
  },
};

export const InDataTable: Story = {
  render: () => (
    <div className="max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <SkeletonButton variant="sm" />
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          <LoadingSkeleton type="table" count={8} />
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <SkeletonButton variant="sm" />
            <SkeletonButton variant="sm" />
            <SkeletonButton variant="sm" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Table skeleton with header, pagination, and action buttons - shows real-world usage in a data table component.",
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="bg-gray-900 p-8 rounded-lg space-y-6">
      <div>
        <h3 className="text-white mb-4">Text Skeleton</h3>
        <SkeletonText lines={3} />
      </div>
      <div>
        <h3 className="text-white mb-4">Avatar & Button</h3>
        <div className="flex items-center gap-4">
          <SkeletonAvatar />
          <SkeletonButton />
        </div>
      </div>
      <div>
        <h3 className="text-white mb-4">Card Layout</h3>
        <div className="grid grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={3} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "All skeleton components support dark mode with automatic color adjustments.",
      },
    },
  },
};

export const AllComponents: Story = {
  render: () => (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Base Skeleton
        </h3>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Skeleton Text
        </h3>
        <SkeletonText lines={3} />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Skeleton Avatar
        </h3>
        <div className="flex gap-4">
          <SkeletonAvatar size="sm" />
          <SkeletonAvatar size="md" />
          <SkeletonAvatar size="lg" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Skeleton Button
        </h3>
        <div className="flex gap-4">
          <SkeletonButton variant="sm" />
          <SkeletonButton variant="default" />
          <SkeletonButton variant="lg" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Skeleton Image
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <SkeletonImage aspectRatio="square" />
          <SkeletonImage aspectRatio="video" />
          <SkeletonImage aspectRatio="portrait" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Loading Skeleton - Card
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={3} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Loading Skeleton - List
        </h3>
        <LoadingSkeleton type="list" count={2} />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Loading Skeleton - Table
        </h3>
        <LoadingSkeleton type="table" count={4} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive showcase of all skeleton components and their variations.",
      },
    },
  },
};
