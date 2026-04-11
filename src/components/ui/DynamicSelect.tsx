"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Li, Text, Ul, Span, Button } from "@mohasinac/appkit/ui";
import { Input } from "@/components";

export interface DynamicSelectOption<V = string> {
  value: V;
  label: string;
  meta?: Record<string, unknown>;
}

export interface AsyncPage<T> {
  items: T[];
  hasMore: boolean;
  nextPage?: number;
}

export interface DynamicSelectProps<V = string> {
  value?: V | null;
  onChange?: (value: V | null, option: DynamicSelectOption<V> | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  placement?: "auto" | "top" | "bottom";
}

export interface DynamicSelectComponentProps<
  V = string,
> extends DynamicSelectProps<V> {
  /** Sync options — pass either this or loadOptions */
  options?: DynamicSelectOption<V>[];
  /** Async loader — used when options aren't provided */
  loadOptions?: (
    query: string,
    page: number,
  ) => Promise<AsyncPage<DynamicSelectOption<V>>>;
  debounceMs?: number;
}

export function DynamicSelect<V = string>({
  options: staticOptions,
  loadOptions,
  value,
  onChange,
  placeholder = "Select...",
  disabled,
  className = "",
  ariaLabel,
  searchPlaceholder = "Search...",
  noResultsText = "No results",
}: DynamicSelectComponentProps<V>) {
  const [query, setQuery] = useState("");
  const [asyncOptions, setAsyncOptions] = useState<DynamicSelectOption<V>[]>(
    [],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = staticOptions ?? asyncOptions;

  const load = useCallback(
    async (q: string, p: number, reset = false) => {
      if (!loadOptions) return;
      setIsLoading(true);
      try {
        const res = await loadOptions(q, p);
        setAsyncOptions((prev) =>
          reset ? res.items : [...prev, ...res.items],
        );
        setHasMore(res.hasMore);
        setPage(p);
      } finally {
        setIsLoading(false);
      }
    },
    [loadOptions],
  );

  useEffect(() => {
    if (isOpen && loadOptions) load(query, 1, true);
  }, [query, isOpen, load, loadOptions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredOptions = staticOptions
    ? staticOptions.filter((o) =>
        query
          ? String(o.label).toLowerCase().includes(query.toLowerCase())
          : true,
      )
    : asyncOptions;

  const selectedLabel =
    options.find((o) => o.value === value)?.label ??
    (value != null ? String(value) : "");

  return (
    <div ref={ref} className={`relative ${className}`} aria-label={ariaLabel}>
      <Button
        type="button"
        variant="outline"
        size="md"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm disabled:opacity-50"
      >
        <Span className={value != null ? "" : "text-gray-400"}>
          {selectedLabel || placeholder}
        </Span>
        <Span>▾</Span>
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full px-3 py-2 text-sm border-b border-gray-200 dark:border-gray-700 outline-none bg-transparent"
          />
          <Ul className="max-h-48 overflow-y-auto py-1">
            {filteredOptions.map((opt, i) => (
              <Li key={i}>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    onChange?.(opt.value, opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${opt.value === value ? "font-medium" : ""}`}
                >
                  {opt.label}
                </Button>
              </Li>
            ))}
            {filteredOptions.length === 0 && !isLoading && (
              <Li className="px-3 py-2 text-xs text-gray-400">
                {noResultsText}
              </Li>
            )}
            {isLoading && (
              <Li className="px-3 py-2 text-xs text-gray-400">Loading…</Li>
            )}
            {hasMore && !isLoading && (
              <Li>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => load(query, page + 1)}
                  className="w-full px-3 py-2 text-xs text-primary hover:underline"
                >
                  Load more
                </Button>
              </Li>
            )}
          </Ul>
        </div>
      )}
    </div>
  );
}
