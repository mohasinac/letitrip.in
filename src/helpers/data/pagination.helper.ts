/**
 * Pagination Helper
 *
 * Business logic helpers for pagination operations
 */

export interface PaginationOptions {
  page: number;
  perPage: number;
  total: number;
}

export interface PaginationResult {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  startIndex: number;
  endIndex: number;
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  options: PaginationOptions,
): PaginationResult {
  const { page, perPage, total } = options;
  const totalPages = Math.ceil(total / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, total);

  return {
    currentPage,
    perPage,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    startIndex,
    endIndex,
  };
}

/**
 * Generate page numbers for pagination UI
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7,
): (number | "...")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  pages.push(1);

  // Calculate range
  let start = Math.max(2, currentPage - halfVisible);
  let end = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust if at the beginning or end
  if (currentPage <= halfVisible) {
    end = maxVisible - 1;
  } else if (currentPage >= totalPages - halfVisible) {
    start = totalPages - maxVisible + 2;
  }

  // Add ellipsis after first page if needed
  if (start > 2) {
    pages.push("...");
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (end < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Get slice indices for paginated array
 */
export function getSliceIndices(
  page: number,
  perPage: number,
): [number, number] {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return [start, end];
}
