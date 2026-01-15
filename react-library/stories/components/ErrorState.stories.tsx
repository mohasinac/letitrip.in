import type { Meta, StoryObj } from "@storybook/react";
import { ErrorState } from "../src/components/tables/ErrorState";

const meta = {
  title: "Components/Tables/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A comprehensive error state component for handling various error scenarios. Provides default messages and icons for common error types, with full customization support and optional retry functionality.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["error", "not-found", "network", "unauthorized", "server"],
      description: "Type of error for default messages and styling",
    },
    message: {
      control: "text",
      description: "Custom error message (overrides type-based message)",
    },
    title: {
      control: "text",
      description: "Custom title (overrides type-based title)",
    },
    retryLabel: {
      control: "text",
      description: "Custom retry button label",
    },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithRetry: Story = {
  args: {
    onRetry: () => alert("Retrying..."),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Error state with retry button. Click to trigger retry callback.",
      },
    },
  },
};

export const GenericError: Story = {
  render: () => (
    <ErrorState type="error" onRetry={() => alert("Retrying operation...")} />
  ),
  parameters: {
    docs: {
      description: {
        story: "Generic error state with retry functionality.",
      },
    },
  },
};

export const NotFound: Story = {
  render: () => (
    <ErrorState
      type="not-found"
      onRetry={() => alert("Navigating back...")}
      retryLabel="Go Back"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "404 Not Found error state.",
      },
    },
  },
};

export const NetworkError: Story = {
  render: () => (
    <ErrorState
      type="network"
      onRetry={() => alert("Checking connection and retrying...")}
      retryLabel="Retry Connection"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Network/connection error state.",
      },
    },
  },
};

export const Unauthorized: Story = {
  render: () => (
    <ErrorState
      type="unauthorized"
      onRetry={() => alert("Redirecting to login...")}
      retryLabel="Login"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Unauthorized access error state.",
      },
    },
  },
};

export const ServerError: Story = {
  render: () => (
    <ErrorState type="server" onRetry={() => alert("Retrying request...")} />
  ),
  parameters: {
    docs: {
      description: {
        story: "Server error (500) state.",
      },
    },
  },
};

export const CustomMessage: Story = {
  render: () => (
    <ErrorState
      message="Failed to load products. The server might be undergoing maintenance."
      onRetry={() => alert("Reload products...")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state with custom message that overrides default.",
      },
    },
  },
};

export const CustomTitleAndMessage: Story = {
  render: () => (
    <ErrorState
      title="Payment Failed"
      message="Your payment could not be processed. Please check your payment details and try again."
      onRetry={() => alert("Retry payment...")}
      retryLabel="Try Again"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Fully customized error state with custom title and message.",
      },
    },
  },
};

export const WithoutRetry: Story = {
  render: () => (
    <ErrorState
      type="not-found"
      message="This page has been removed or doesn't exist."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state without retry button (informational only).",
      },
    },
  },
};

export const CustomIcon: Story = {
  render: () => {
    const CustomErrorIcon = () => (
      <span className="text-5xl" role="img" aria-label="error">
        ⚠️
      </span>
    );

    return (
      <ErrorState
        icon={<CustomErrorIcon />}
        title="Oops!"
        message="Something unexpected happened. Don't worry, we're on it!"
        onRetry={() => alert("Retry...")}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Error state with custom icon (emoji in this case).",
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <ErrorState
      type="error"
      className="bg-orange-50 dark:bg-orange-950 rounded-lg border-2 border-orange-200 dark:border-orange-800 py-20"
      iconClassName="mb-6 p-6 bg-orange-100 dark:bg-orange-900 rounded-2xl"
      titleClassName="text-3xl font-bold text-orange-900 dark:text-orange-100"
      messageClassName="text-orange-700 dark:text-orange-300 text-lg font-medium"
      onRetry={() => alert("Retry...")}
      retryButtonClassName="px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-bold shadow-lg text-lg"
      retryLabel="Retry Now"
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

export const InDataTable: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Products
          </h2>
        </div>

        {/* Error State */}
        <ErrorState
          message="Failed to load products. Please check your connection."
          onRetry={() => alert("Reload products...")}
          retryLabel="Reload"
          className="py-24"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state displayed within a table or data container.",
      },
    },
  },
};

export const AllErrorTypes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Generic Error
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <ErrorState type="error" onRetry={() => {}} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Not Found (404)
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <ErrorState
            type="not-found"
            onRetry={() => {}}
            retryLabel="Go Back"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Network Error
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <ErrorState type="network" onRetry={() => {}} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Unauthorized (401)
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <ErrorState
            type="unauthorized"
            onRetry={() => {}}
            retryLabel="Login"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Server Error (500)
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <ErrorState type="server" onRetry={() => {}} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Showcase of all available error types with their default messages.",
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="bg-gray-900 p-8 rounded-lg">
      <ErrorState
        type="network"
        onRetry={() => alert("Retry...")}
        retryLabel="Try Again"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Error state in dark mode showing automatic color adaptation.",
      },
    },
  },
};

export const LoadingDataFailed: Story = {
  render: () => (
    <ErrorState
      title="Failed to Load Data"
      message="We couldn't load the requested data. This might be due to a temporary server issue."
      onRetry={() => alert("Fetching data again...")}
      retryLabel="Refresh Data"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Common scenario: data loading failure with refresh option.",
      },
    },
  },
};

export const FormSubmissionError: Story = {
  render: () => (
    <ErrorState
      title="Submission Failed"
      message="Your form submission failed. Please review your information and try again."
      onRetry={() => alert("Resubmitting form...")}
      retryLabel="Submit Again"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Form submission error with retry option.",
      },
    },
  },
};

export const ImageUploadError: Story = {
  render: () => (
    <ErrorState
      title="Upload Failed"
      message="Failed to upload your image. File might be too large or in an unsupported format."
      onRetry={() => alert("Retrying upload...")}
      retryLabel="Try Upload Again"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "File upload error scenario.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    let retryCount = 0;

    const handleRetry = () => {
      retryCount++;
      alert(`Retry attempt #${retryCount}`);
    };

    return (
      <ErrorState
        type="network"
        onRetry={handleRetry}
        retryLabel="Retry Connection"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive example - counts retry attempts.",
      },
    },
  },
};

export const ComparisonWithEmptyState: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Error State (Something went wrong)
        </h3>
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg">
          <ErrorState
            message="Failed to load items"
            onRetry={() => alert("Retry...")}
          />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Empty State (No data yet)
        </h3>
        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mb-6 p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No items yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
              Start adding items to see them here
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side comparison: ErrorState (for failures) vs EmptyState (for no data).",
      },
    },
  },
};
