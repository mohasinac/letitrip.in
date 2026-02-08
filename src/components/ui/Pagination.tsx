import React from "react";
import { THEME_CONSTANTS } from "@/constants";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 7,
  showFirstLast = true,
  showPrevNext = true,
  disabled = false,
  size = "md",
  className = "",
}: PaginationProps) {
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    if (currentPage <= halfVisible) {
      endPage = maxVisible;
    }

    if (currentPage >= totalPages - halfVisible) {
      startPage = totalPages - maxVisible + 1;
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1 min-w-[28px]",
    md: "text-base px-3 py-2 min-w-[36px]",
    lg: "text-lg px-4 py-2 min-w-[44px]",
  };

  const { themed } = THEME_CONSTANTS;

  const buttonClass = (isActive: boolean, isDisabled: boolean) => {
    const base = `${sizeClasses[size]} rounded border transition-colors font-medium`;

    if (isDisabled) {
      return `${base} ${themed.bgTertiary} opacity-50 ${themed.textMuted} ${themed.border} cursor-not-allowed`;
    }

    if (isActive) {
      return `${base} bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 cursor-default`;
    }

    return `${base} ${themed.bgSecondary} ${themed.textPrimary} ${themed.border} ${themed.hover} ${themed.hoverBorder} cursor-pointer`;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className={`flex items-center gap-1 ${className}`}
      aria-label="Pagination"
      role="navigation"
    >
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={disabled || currentPage === 1}
          className={buttonClass(false, disabled || currentPage === 1)}
          aria-label="Go to first page"
        >
          «
        </button>
      )}

      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={buttonClass(false, disabled || currentPage === 1)}
          aria-label="Go to previous page"
        >
          ‹
        </button>
      )}

      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className={`${sizeClasses[size]} flex items-center justify-center ${themed.textMuted}`}
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        return (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            disabled={disabled}
            className={buttonClass(
              pageNum === currentPage,
              disabled && pageNum !== currentPage,
            )}
            aria-label={`Go to page ${pageNum}`}
            aria-current={pageNum === currentPage ? "page" : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={buttonClass(false, disabled || currentPage === totalPages)}
          aria-label="Go to next page"
        >
          ›
        </button>
      )}

      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          className={buttonClass(false, disabled || currentPage === totalPages)}
          aria-label="Go to last page"
        >
          »
        </button>
      )}
    </nav>
  );
}
