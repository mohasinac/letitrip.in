"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { PageState } from "../src/components/tables/PageState";
import { useState } from "react";

const meta: Meta<typeof PageState.Loading> = {
  title: "Components/PageState",
  component: PageState.Loading,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A unified component for handling page loading, error, and empty states with support for full page and inline display modes.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

// ============================================================================
// Loading State Stories
// ============================================================================

export const Loading: StoryObj = {
  render: () => <PageState.Loading />,
  parameters: {
    docs: {
      description: {
        story: "Default loading state with full page layout and spinner.",
      },
    },
  },
};

export const LoadingInline: StoryObj = {
  render: () => (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <PageState.Loading fullPage={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Loading state displayed inline within a page section.",
      },
    },
  },
};

export const LoadingCustomMessage: StoryObj = {
  render: () => <PageState.Loading message="Loading products..." />,
  parameters: {
    docs: {
      description: {
        story: "Loading state with a custom loading message.",
      },
    },
  },
};

export const LoadingCustomSpinner: StoryObj = {
  render: () => (
    <PageState.Loading
      spinnerIcon={
        <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
      }
      message="Please wait..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Loading state with a custom spinner icon.",
      },
    },
  },
};

// ============================================================================
// Error State Stories
// ============================================================================

export const Error: StoryObj = {
  render: () => <PageState.Error />,
  parameters: {
    docs: {
      description: {
        story: "Default error state with full page layout.",
      },
    },
  },
};

export const ErrorWithRetry: StoryObj = {
  render: () => (
    <PageState.Error
      message="Failed to load products"
      onRetry={() => alert("Retrying...")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state with a retry button that triggers a callback.",
      },
    },
  },
};

export const ErrorInline: StoryObj = {
  render: () => (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <PageState.Error
        fullPage={false}
        message="Unable to load products"
        onRetry={() => alert("Retrying...")}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state displayed inline within a page section.",
      },
    },
  },
};

export const ErrorCustomIcon: StoryObj = {
  render: () => (
    <PageState.Error
      message="Network connection failed"
      onRetry={() => alert("Retrying...")}
      errorIcon={
        <svg
          className="h-12 w-12 text-orange-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state with a custom error icon.",
      },
    },
  },
};

// ============================================================================
// Empty State Stories
// ============================================================================

export const Empty: StoryObj = {
  render: () => <PageState.Empty />,
  parameters: {
    docs: {
      description: {
        story: "Default empty state with no data message.",
      },
    },
  },
};

export const EmptyWithDescription: StoryObj = {
  render: () => (
    <div className="p-8">
      <PageState.Empty
        title="No products found"
        description="Try adjusting your search or filter to find what you're looking for."
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state with a title and description.",
      },
    },
  },
};

export const EmptyWithAction: StoryObj = {
  render: () => (
    <div className="p-8">
      <PageState.Empty
        title="No products yet"
        description="Start by adding your first product to the catalog."
        action={{
          label: "Add Product",
          onClick: () => alert("Adding product..."),
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state with an action button.",
      },
    },
  },
};

export const EmptyWithIcon: StoryObj = {
  render: () => (
    <div className="p-8">
      <PageState.Empty
        title="No items in cart"
        description="Your shopping cart is empty. Browse our products and add items to get started."
        action={{
          label: "Browse Products",
          onClick: () => alert("Browsing..."),
        }}
        icon={
          <svg
            className="h-16 w-16 text-gray-400 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state with a custom icon, description, and action.",
      },
    },
  },
};

// ============================================================================
// Real-World Use Cases
// ============================================================================

export const ProductsLoading: StoryObj = {
  render: () => (
    <PageState.Loading
      message="Loading products..."
      spinnerClassName="!text-purple-600"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Loading state for a products page with branded color.",
      },
    },
  },
};

export const OrdersError: StoryObj = {
  render: () => (
    <PageState.Error
      message="Failed to load your orders"
      onRetry={() => alert("Retrying...")}
      retryLabel="Try Again"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state for an orders page with custom retry label.",
      },
    },
  },
};

export const NoSearchResults: StoryObj = {
  render: () => (
    <div className="p-8">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full px-4 py-2 border rounded-lg"
          defaultValue="xyz123"
        />
      </div>
      <PageState.Empty
        title="No results found"
        description='We couldn\'t find any products matching "xyz123". Try a different search term.'
        action={{
          label: "Clear Search",
          onClick: () => alert("Clearing search..."),
        }}
        icon={
          <svg
            className="h-16 w-16 text-gray-400 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state for no search results with clear action.",
      },
    },
  },
};

// ============================================================================
// Compound Component Usage
// ============================================================================

export const CustomFullPageWrapper: StoryObj = {
  render: () => (
    <PageState.FullPageWrapper className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're working on something amazing. Check back soon!
        </p>
        <div className="inline-flex items-center gap-2 text-purple-600">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm">Building...</span>
        </div>
      </div>
    </PageState.FullPageWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Custom full page wrapper with gradient background and custom content.",
      },
    },
  },
};

// ============================================================================
// Interactive State Management
// ============================================================================

export const InteractiveStateSwitcher: StoryObj = {
  render: () => {
    const StateManager = () => {
      const [state, setState] = useState<"loading" | "error" | "empty" | "success">(
        "loading"
      );

      const handleRetry = () => {
        setState("loading");
        setTimeout(() => setState("success"), 1500);
      };

      if (state === "loading") {
        return <PageState.Loading message="Loading products..." />;
      }

      if (state === "error") {
        return (
          <PageState.Error
            message="Failed to load products. Please try again."
            onRetry={handleRetry}
          />
        );
      }

      if (state === "empty") {
        return (
          <PageState.Empty
            title="No products available"
            description="There are no products in this category yet."
            action={{
              label: "View All Products",
              onClick: () => setState("success"),
            }}
            icon={
              <svg
                className="h-16 w-16 text-gray-400 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            }
          />
        );
      }

      return (
        <PageState.FullPageWrapper>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Products Loaded Successfully!
            </h2>
            <div className="space-x-2">
              <button
                onClick={() => setState("loading")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Show Loading
              </button>
              <button
                onClick={() => setState("error")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Show Error
              </button>
              <button
                onClick={() => setState("empty")}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Show Empty
              </button>
            </div>
          </div>
        </PageState.FullPageWrapper>
      );
    };

    return <StateManager />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo showing state transitions between loading, error, empty, and success states.",
      },
    },
  },
};

// ============================================================================
// Dark Mode Examples
// ============================================================================

export const DarkModeLoading: StoryObj = {
  render: () => (
    <div className="dark">
      <PageState.Loading message="Loading in dark mode..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Loading state with dark mode enabled.",
      },
    },
  },
};

export const DarkModeError: StoryObj = {
  render: () => (
    <div className="dark">
      <PageState.Error
        message="Failed to load data in dark mode"
        onRetry={() => alert("Retrying...")}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state with dark mode enabled.",
      },
    },
  },
};

export const DarkModeEmpty: StoryObj = {
  render: () => (
    <div className="dark bg-gray-900 p-8">
      <PageState.Empty
        title="No data available"
        description="Try adjusting your filters or come back later."
        action={{
          label: "Reset Filters",
          onClick: () => alert("Resetting..."),
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state with dark mode enabled.",
      },
    },
  },
};

// ============================================================================
// Comparison & Composition
// ============================================================================

export const AllStatesComparison: StoryObj = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Loading State</h3>
        <PageState.Loading fullPage={false} message="Loading data..." />
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Error State</h3>
        <PageState.Error
          fullPage={false}
          message="Failed to load"
          onRetry={() => alert("Retry")}
        />
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Empty State</h3>
        <PageState.Empty
          title="No data"
          description="Nothing to display"
          action={{
            label: "Add Data",
            onClick: () => alert("Add"),
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Side-by-side comparison of all three page state types.",
      },
    },
  },
};

