import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AdvancedPagination } from "./AdvancedPagination";

const meta = {
  title: "Components/Pagination/AdvancedPagination",
  component: AdvancedPagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AdvancedPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component with state management
function AdvancedPaginationWithState(props: {
  totalItems: number;
  initialPageSize?: number;
  showPageSizeSelector?: boolean;
  showFirstLast?: boolean;
  showPageInput?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(props.initialPageSize || 10);

  const totalPages = Math.ceil(props.totalItems / pageSize);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Current Page: {currentPage} | Page Size: {pageSize}
      </div>
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={props.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        showPageSizeSelector={props.showPageSizeSelector}
        showFirstLast={props.showFirstLast}
        showPageInput={props.showPageInput}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <AdvancedPaginationWithState totalItems={100} initialPageSize={10} />
  ),
};

export const WithLargeDataset: Story = {
  render: () => (
    <AdvancedPaginationWithState totalItems={10000} initialPageSize={20} />
  ),
};

export const WithPageSizeSelector: Story = {
  render: () => (
    <AdvancedPaginationWithState
      totalItems={500}
      initialPageSize={25}
      showPageSizeSelector={true}
    />
  ),
};

export const WithPageInput: Story = {
  render: () => (
    <AdvancedPaginationWithState
      totalItems={200}
      initialPageSize={10}
      showPageInput={true}
    />
  ),
};

export const WithFirstLast: Story = {
  render: () => (
    <AdvancedPaginationWithState
      totalItems={500}
      initialPageSize={10}
      showFirstLast={true}
    />
  ),
};

export const AllFeaturesEnabled: Story = {
  render: () => (
    <AdvancedPaginationWithState
      totalItems={1000}
      initialPageSize={20}
      showPageSizeSelector={true}
      showFirstLast={true}
      showPageInput={true}
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
          Only 3 pages - shows simplified navigation
        </div>
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={30}
          pageSize={10}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-900 p-8 rounded-lg">
      <AdvancedPaginationWithState
        totalItems={500}
        initialPageSize={25}
        showPageSizeSelector={true}
        showFirstLast={true}
        showPageInput={true}
      />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

export const CustomPageSizeOptions: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const totalItems = 1000;
    const totalPages = Math.ceil(totalItems / pageSize);

    return (
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        showPageSizeSelector={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
      />
    );
  },
};

export const WithCustomIcons: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 20;

    // Custom emoji icons
    const EmojiLeft = () => <span>◀️</span>;
    const EmojiRight = () => <span>▶️</span>;
    const EmojiFirst = () => <span>⏮️</span>;
    const EmojiLast = () => <span>⏭️</span>;

    return (
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={200}
        pageSize={10}
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
