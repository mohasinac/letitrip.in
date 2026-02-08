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
 * Calculates pagination metadata from page parameters
 *
 * @param options - Pagination parameters (page, perPage, total)
 * @returns Complete pagination metadata including navigation info
 *
 * @example
 * ```typescript
 * const result = calculatePagination({ page: 2, perPage: 10, total: 95 });
 * console.log(result.totalPages); // 10
 * console.log(result.hasNextPage); // true
 * console.log(result.startIndex); // 10
 * ```
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
 * Generates an array of page numbers for pagination UI with ellipsis
 *
 * @param currentPage - The current active page
 * @param totalPages - The total number of pages
 * @param maxVisible - Maximum number of page buttons to show (default: 7)
 * @returns Array of page numbers and ellipsis ('...')
 *
 * @example
 * ```typescript
 * const pages = generatePageNumbers(5, 10, 7);
 * console.log(pages); // [1, '...', 4, 5, 6, '...', 10]
 * ```
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
 * Calculates array slice indices for a given page
 *
 * @param page - The page number (1-based)
 * @param perPage - Number of items per page
 * @returns A tuple of [startIndex, endIndex] for array slicing
 *
 * @example
 * ```typescript
 * const [start, end] = getSliceIndices(2, 10);
 * const pageItems = allItems.slice(start, end);
 * console.log(start, end); // 10, 20
 * ```
 */
export function getSliceIndices(
  page: number,
  perPage: number,
): [number, number] {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return [start, end];
}
