"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CursorPagination } from "./CursorPagination";

const meta = {
  title: "Components/Pagination/CursorPagination",
  component: CursorPagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CursorPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simulated API pagination state
function CursorPaginationWithState() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate API states
  const totalPages = 10;
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const itemsLoaded = page * 20;
  const totalItems = 200;

  const handleNext = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPage((p) => Math.min(p + 1, totalPages));
    setIsLoading(false);
  };

  const handlePrevious = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPage((p) => Math.max(p - 1, 1));
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Current Page: {page} | Items Loaded: {itemsLoaded} / {totalItems}
      </div>
      <CursorPagination
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onNextPage={handleNext}
        onPreviousPage={handlePrevious}
        isLoading={isLoading}
        itemsLoaded={itemsLoaded}
        totalItems={totalItems}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <CursorPaginationWithState />,
};

export const Loading: Story = {
  render: () => (
    <CursorPagination
      hasNextPage={true}
      hasPreviousPage={true}
      onNextPage={() => {}}
      onPreviousPage={() => {}}
      isLoading={true}
      itemsLoaded={40}
      totalItems={200}
    />
  ),
};

export const WithItemCount: Story = {
  render: () => (
    <CursorPagination
      hasNextPage={true}
      hasPreviousPage={true}
      onNextPage={() => {}}
      onPreviousPage={() => {}}
      itemsLoaded={75}
      totalItems={200}
    />
  ),
};

export const WithoutItemCount: Story = {
  render: () => (
    <CursorPagination
      hasNextPage={true}
      hasPreviousPage={true}
      onNextPage={() => {}}
      onPreviousPage={() => {}}
    />
  ),
};

export const NoMorePages: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-medium mb-2">First Page (No Previous)</div>
        <CursorPagination
          hasNextPage={true}
          hasPreviousPage={false}
          onNextPage={() => {}}
          onPreviousPage={() => {}}
          itemsLoaded={20}
          totalItems={200}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Last Page (No Next)</div>
        <CursorPagination
          hasNextPage={false}
          hasPreviousPage={true}
          onNextPage={() => {}}
          onPreviousPage={() => {}}
          itemsLoaded={200}
          totalItems={200}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">
          Only Page (No Navigation)
        </div>
        <CursorPagination
          hasNextPage={false}
          hasPreviousPage={false}
          onNextPage={() => {}}
          onPreviousPage={() => {}}
          itemsLoaded={20}
          totalItems={20}
        />
      </div>
    </div>
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <CursorPagination
      hasNextPage={true}
      hasPreviousPage={true}
      onNextPage={() => {}}
      onPreviousPage={() => {}}
      itemsLoaded={50}
      totalItems={200}
      nextLabel="Load More"
      previousLabel="Load Previous"
    />
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-900 p-8 rounded-lg">
      <CursorPaginationWithState />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

export const WithCustomIcons: Story = {
  render: () => {
    // Custom emoji icons
    const EmojiLeft = () => <span>◀️</span>;
    const EmojiRight = () => <span>▶️</span>;

    return (
      <CursorPagination
        hasNextPage={true}
        hasPreviousPage={true}
        onNextPage={() => {}}
        onPreviousPage={() => {}}
        itemsLoaded={100}
        totalItems={200}
        ChevronLeftIcon={EmojiLeft}
        ChevronRightIcon={EmojiRight}
      />
    );
  },
};

export const InfiniteScrollUseCase: Story = {
  render: () => {
    const [items, setItems] = useState<number[]>(
      Array.from({ length: 20 }, (_, i) => i + 1)
    );
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nextItems = Array.from(
        { length: 20 },
        (_, i) => items.length + i + 1
      );

      setItems([...items, ...nextItems]);
      setIsLoading(false);

      // Stop after 100 items
      if (items.length + nextItems.length >= 100) {
        setHasMore(false);
      }
    };

    return (
      <div className="space-y-4 max-w-md">
        <div className="text-sm font-medium">Infinite Scroll Example</div>
        <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
          {items.map((item) => (
            <div
              key={item}
              className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
            >
              Item {item}
            </div>
          ))}
        </div>
        <CursorPagination
          hasNextPage={hasMore}
          hasPreviousPage={false}
          onNextPage={loadMore}
          onPreviousPage={() => {}}
          isLoading={isLoading}
          itemsLoaded={items.length}
          totalItems={100}
          nextLabel="Load More"
        />
      </div>
    );
  },
};

