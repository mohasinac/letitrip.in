import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SimplePagination } from "./SimplePagination";

const meta = {
  title: "Components/Pagination/SimplePagination",
  component: SimplePagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SimplePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component with state management
function SimplePaginationWithState(props: {
  totalItems?: number;
  initialPageSize?: number;
  showPageSizeSelector?: boolean;
  showFirstLast?: boolean;
  showItemCount?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(props.initialPageSize || 10);

  const totalPages = props.totalItems
    ? Math.ceil(props.totalItems / pageSize)
    : 10;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Current Page: {currentPage} | Page Size: {pageSize}
      </div>
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={props.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        showPageSizeSelector={props.showPageSizeSelector}
        showFirstLast={props.showFirstLast}
        showItemCount={props.showItemCount}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <SimplePaginationWithState totalItems={100} />,
};

export const WithItemCount: Story = {
  render: () => (
    <SimplePaginationWithState totalItems={250} showItemCount={true} />
  ),
};

export const WithPageSize: Story = {
  render: () => (
    <SimplePaginationWithState
      totalItems={500}
      showPageSizeSelector={true}
      showItemCount={true}
    />
  ),
};

export const WithFirstLast: Story = {
  render: () => (
    <SimplePaginationWithState
      totalItems={500}
      showFirstLast={true}
      showItemCount={true}
    />
  ),
};

export const MinimalDesign: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    return (
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    );
  },
};

export const AllFeaturesEnabled: Story = {
  render: () => (
    <SimplePaginationWithState
      totalItems={1000}
      initialPageSize={20}
      showPageSizeSelector={true}
      showFirstLast={true}
      showItemCount={true}
    />
  ),
};

export const SmallDataset: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 3;

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Only 3 pages - perfect for simple navigation
        </div>
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={30}
          onPageChange={setCurrentPage}
          showItemCount={true}
        />
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-900 p-8 rounded-lg">
      <SimplePaginationWithState
        totalItems={500}
        initialPageSize={25}
        showPageSizeSelector={true}
        showFirstLast={true}
        showItemCount={true}
      />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

export const CustomLabels: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    return (
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={100}
        onPageChange={setCurrentPage}
        previousLabel="Prev"
        nextLabel="Next"
        firstLabel="Start"
        lastLabel="End"
        showFirstLast={true}
        showItemCount={true}
      />
    );
  },
};

export const WithCustomIcons: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    // Custom emoji icons
    const EmojiLeft = () => <span>◀️</span>;
    const EmojiRight = () => <span>▶️</span>;
    const EmojiFirst = () => <span>⏮️</span>;
    const EmojiLast = () => <span>⏭️</span>;

    return (
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={100}
        onPageChange={setCurrentPage}
        showFirstLast={true}
        ChevronLeftIcon={EmojiLeft}
        ChevronRightIcon={EmojiRight}
        ChevronsLeftIcon={EmojiFirst}
        ChevronsRightIcon={EmojiLast}
      />
    );
  },
};

export const DisabledStates: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        <div>
          <div className="text-sm font-medium mb-2">
            First Page (Previous Disabled)
          </div>
          <SimplePagination
            currentPage={1}
            totalPages={10}
            onPageChange={() => {}}
            showFirstLast={true}
          />
        </div>
        <div>
          <div className="text-sm font-medium mb-2">
            Last Page (Next Disabled)
          </div>
          <SimplePagination
            currentPage={10}
            totalPages={10}
            onPageChange={() => {}}
            showFirstLast={true}
          />
        </div>
      </div>
    );
  },
};
