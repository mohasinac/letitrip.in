import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "../src/components/tables/EmptyState";

const meta = {
  title: "Components/Tables/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A flexible empty state component for displaying when lists, tables, or content areas have no data. Supports custom icons, descriptions, and action buttons.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: false,
      description: "Custom icon element to display",
    },
    title: {
      control: "text",
      description: "Main title text",
    },
    description: {
      control: "text",
      description: "Optional description text",
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple icons for examples (using emoji/text since we're framework-agnostic)
const SearchIcon = () => <span className="text-4xl">🔍</span>;
const ShoppingBagIcon = () => <span className="text-4xl">🛍️</span>;
const HeartIcon = () => <span className="text-4xl">❤️</span>;
const PackageIcon = () => <span className="text-4xl">📦</span>;
const UsersIcon = () => <span className="text-4xl">👥</span>;
const FileIcon = () => <span className="text-4xl">📄</span>;
const GavelIcon = () => <span className="text-4xl">🔨</span>;
const ImageIcon = () => <span className="text-4xl">🖼️</span>;

export const Default: Story = {
  args: {
    title: "No data available",
    description: "There is nothing to display at this time.",
  },
};

export const WithIcon: Story = {
  args: {
    icon: <SearchIcon />,
    title: "No search results",
    description: "We couldn't find anything matching your search terms.",
  },
};

export const WithAction: Story = {
  args: {
    icon: <ShoppingBagIcon />,
    title: "Your cart is empty",
    description: "Start adding products to your cart to see them here.",
    action: {
      label: "Browse Products",
      onClick: () => alert("Navigate to products"),
    },
  },
};

export const WithTwoActions: Story = {
  args: {
    icon: <PackageIcon />,
    title: "No orders yet",
    description:
      "You haven't placed any orders. Start shopping to see your order history here.",
    action: {
      label: "Start Shopping",
      onClick: () => alert("Navigate to shop"),
    },
    secondaryAction: {
      label: "Learn More",
      onClick: () => alert("Show help"),
    },
  },
};

export const NoProducts: Story = {
  render: () => (
    <EmptyState
      icon={<ShoppingBagIcon />}
      title="No products found"
      description="We couldn't find any products matching your criteria. Try adjusting your filters or search terms."
      action={{
        label: "Clear Filters",
        onClick: () => alert("Filters cleared"),
      }}
      secondaryAction={{
        label: "Browse All",
        onClick: () => alert("Browse all products"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state for product listings with filter-related actions.",
      },
    },
  },
};

export const EmptyCart: Story = {
  render: () => (
    <EmptyState
      icon={<ShoppingBagIcon />}
      title="Your cart is empty"
      description="Start adding products to your cart to see them here. Browse our collection to find what you need."
      action={{
        label: "Continue Shopping",
        onClick: () => alert("Navigate to products"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty cart state encouraging users to browse products.",
      },
    },
  },
};

export const NoFavorites: Story = {
  render: () => (
    <EmptyState
      icon={<HeartIcon />}
      title="No favorites yet"
      description="You haven't added any products to your favorites. Click the heart icon on products you love to save them here."
      action={{
        label: "Discover Products",
        onClick: () => alert("Navigate to products"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty favorites list with guidance on how to add items.",
      },
    },
  },
};

export const NoAuctions: Story = {
  render: () => (
    <EmptyState
      icon={<GavelIcon />}
      title="No active auctions"
      description="There are no active auctions at the moment. Check back soon or create your first auction."
      action={{
        label: "Create Auction",
        onClick: () => alert("Create new auction"),
      }}
      secondaryAction={{
        label: "View Past Auctions",
        onClick: () => alert("View history"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty auctions list with creation and history options.",
      },
    },
  },
};

export const NoSearchResults: Story = {
  render: () => (
    <EmptyState
      icon={<SearchIcon />}
      title="No results found"
      description="We couldn't find anything matching your search. Try using different keywords or check your spelling."
      action={{
        label: "Clear Search",
        onClick: () => alert("Search cleared"),
      }}
      secondaryAction={{
        label: "Browse All",
        onClick: () => alert("Show all items"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Search results empty state with helpful suggestions.",
      },
    },
  },
};

export const NoUsers: Story = {
  render: () => (
    <EmptyState
      icon={<UsersIcon />}
      title="No users found"
      description="There are no users matching your criteria. Try adjusting your filters."
      action={{
        label: "Reset Filters",
        onClick: () => alert("Filters reset"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty user list state for admin or team management.",
      },
    },
  },
};

export const NoData: Story = {
  render: () => (
    <EmptyState
      icon={<FileIcon />}
      title="No data available"
      description="There is no data to display at this time. Check back later or try refreshing."
      action={{
        label: "Refresh",
        onClick: () => alert("Page refreshed"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Generic empty data state with refresh option.",
      },
    },
  },
};

export const NoImages: Story = {
  render: () => (
    <EmptyState
      icon={<ImageIcon />}
      title="No images uploaded"
      description="Upload your first image to get started. Supported formats: JPG, PNG, GIF."
      action={{
        label: "Upload Image",
        onClick: () => alert("Open upload dialog"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty image gallery with upload prompt.",
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <EmptyState
      icon={<SearchIcon />}
      title="Custom Styled Empty State"
      description="This example shows custom styling capabilities"
      className="bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800"
      iconClassName="mb-4 p-6 bg-blue-100 dark:bg-blue-900 rounded-2xl"
      titleClassName="text-2xl font-bold text-blue-900 dark:text-blue-100"
      descriptionClassName="text-blue-700 dark:text-blue-300 font-medium"
      action={{
        label: "Primary Action",
        onClick: () => alert("Primary"),
      }}
      actionClassName="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg"
      secondaryAction={{
        label: "Secondary",
        onClick: () => alert("Secondary"),
      }}
      secondaryActionClassName="px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates full customization with custom classes for all elements.",
      },
    },
  },
};

export const MinimalNoIcon: Story = {
  render: () => (
    <EmptyState
      title="Nothing here yet"
      description="This section is currently empty."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Minimal empty state without icon or actions.",
      },
    },
  },
};

export const TitleOnly: Story = {
  render: () => <EmptyState title="No items" />,
  parameters: {
    docs: {
      description: {
        story: "Most minimal empty state with only a title.",
      },
    },
  },
};

export const InTableContext: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Products
          </h2>
        </div>

        {/* Empty State */}
        <EmptyState
          icon={<ShoppingBagIcon />}
          title="No products yet"
          description="Start by adding your first product to the inventory."
          action={{
            label: "Add Product",
            onClick: () => alert("Open product form"),
          }}
          className="py-24"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state displayed within a table or card container.",
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="bg-gray-900 p-8 rounded-lg">
      <EmptyState
        icon={<HeartIcon />}
        title="No favorites in dark mode"
        description="This empty state automatically adapts to dark mode with proper contrast."
        action={{
          label: "Add Favorites",
          onClick: () => alert("Add favorites"),
        }}
        secondaryAction={{
          label: "Learn More",
          onClick: () => alert("Learn more"),
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state in dark mode showing automatic color adaptation.",
      },
    },
  },
};

export const AllVariations: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          With Icon and Actions
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <EmptyState
            icon={<ShoppingBagIcon />}
            title="Complete Example"
            description="Shows all available features"
            action={{ label: "Primary", onClick: () => {} }}
            secondaryAction={{ label: "Secondary", onClick: () => {} }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          With Icon, No Actions
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <EmptyState
            icon={<SearchIcon />}
            title="Informational Only"
            description="No actions available for this state"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          No Icon, With Action
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <EmptyState
            title="Minimal with Action"
            description="Simple state with one action"
            action={{ label: "Do Something", onClick: () => {} }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Title and Description Only
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <EmptyState
            title="Most Minimal"
            description="Just information, no actions needed"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comprehensive showcase of all possible empty state variations.",
      },
    },
  },
};
