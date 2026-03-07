"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@/helpers";
import {
  Button,
  Input,
  Label,
  Li,
  Span,
  Spinner,
  Text,
  Ul,
} from "@/components";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DynamicSelectOption<V = string> {
  value: V;
  label: string;
  /** Optional icon/avatar rendered before the label */
  icon?: React.ReactNode;
  /** Disable this specific option */
  disabled?: boolean;
}

export interface AsyncPage<V = string> {
  options: DynamicSelectOption<V>[];
  /** Pass back to load the next page; `undefined` means no more pages */
  nextCursor?: string | number | null;
}

export interface DynamicSelectProps<V = string, Multi extends boolean = false> {
  // ── Value ────────────────────────────────────────────────────────────────
  /** Controlled single value (when `multi` is false) */
  value?: Multi extends true ? V[] : V | null;
  onChange?: Multi extends true
    ? (values: V[]) => void
    : (value: V | null) => void;

  // ── Options ──────────────────────────────────────────────────────────────
  /** Static options list — used when `loadOptions` is not provided */
  options?: DynamicSelectOption<V>[];
  /**
   * Async loader for options.  Receives `(search, cursor)` where `cursor`
   * is `undefined` on the first load / after every search change.
   * Return `{ options, nextCursor }` — set `nextCursor` to `null`/`undefined`
   * to indicate the last page.
   */
  loadOptions?: (
    search: string,
    cursor?: string | number,
  ) => Promise<AsyncPage<V>>;

  // ── Behaviour ────────────────────────────────────────────────────────────
  /** Allow selecting multiple values */
  multi?: Multi;
  /** Show a search input inside the dropdown */
  searchable?: boolean;
  /** Placeholder shown on the trigger when nothing is selected */
  placeholder?: string;
  /** Debounce in ms before calling `loadOptions` after the user types */
  debounceMs?: number;

  // ── Presentation ─────────────────────────────────────────────────────────
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  /** A11y label for the combobox */
  ariaLabel?: string;
  /** Force the panel to open upward — by default it auto-detects */
  placement?: "auto" | "top" | "bottom";

  // ── i18n ─────────────────────────────────────────────────────────────────
  searchPlaceholder?: string;
  noResultsText?: string;
  loadingText?: string;
  clearAriaLabel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function valueIncludes<V>(arr: V[], v: V) {
  return arr.some((a) => a === v);
}

// ─── Portal dropdown ──────────────────────────────────────────────────────────

interface PanelRect {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
}

function calcPanelRect(
  anchor: DOMRect,
  placement: "auto" | "top" | "bottom",
): PanelRect {
  const MARGIN = 6;
  const MIN_PANEL_HEIGHT = 160;
  const viewportH = window.innerHeight;
  const spaceBelow = viewportH - anchor.bottom - MARGIN;
  const spaceAbove = anchor.top - MARGIN;

  let openUp = false;
  if (placement === "top") {
    openUp = true;
  } else if (placement === "auto") {
    openUp = spaceBelow < MIN_PANEL_HEIGHT && spaceAbove > spaceBelow;
  }

  const maxHeight = openUp
    ? Math.max(spaceAbove, MIN_PANEL_HEIGHT)
    : Math.max(spaceBelow, MIN_PANEL_HEIGHT);

  return {
    top: openUp
      ? anchor.top + window.scrollY - maxHeight - MARGIN
      : anchor.bottom + window.scrollY + MARGIN,
    left: anchor.left + window.scrollX,
    width: anchor.width,
    maxHeight,
    openUp,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DynamicSelect<V = string, Multi extends boolean = false>({
  value,
  onChange,
  options: staticOptions,
  loadOptions,
  multi,
  searchable = true,
  placeholder = "Select…",
  debounceMs = 300,
  label,
  error,
  helperText,
  className,
  disabled,
  ariaLabel,
  placement = "auto",
  searchPlaceholder = "Search…",
  noResultsText = "No results",
  loadingText = "Loading…",
  clearAriaLabel = "Clear",
}: DynamicSelectProps<V, Multi>) {
  const { themed, input } = THEME_CONSTANTS;
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerId = useId();
  const listboxId = useId();
  const labelId = useId();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [panelRect, setPanelRect] = useState<PanelRect | null>(null);

  // Async state
  const [asyncOptions, setAsyncOptions] = useState<DynamicSelectOption<V>[]>(
    [],
  );
  const [nextCursor, setNextCursor] = useState<
    string | number | null | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const isAsync = !!loadOptions;

  // ── Derived options ───────────────────────────────────────────────────────

  const allDisplayed: DynamicSelectOption<V>[] = isAsync
    ? asyncOptions
    : (staticOptions ?? []).filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      );

  // ── Normalised value arrays ───────────────────────────────────────────────

  const selectedValues: V[] = multi
    ? ((value ?? []) as V[])
    : value != null
      ? [value as V]
      : [];

  function toggleValue(v: V) {
    if (multi) {
      const current = (value ?? []) as V[];
      const next = valueIncludes(current, v)
        ? current.filter((c) => c !== v)
        : [...current, v];
      (onChange as (vals: V[]) => void)(next);
    } else {
      (onChange as (val: V | null) => void)(v as V);
      closePanel();
    }
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    if (multi) {
      (onChange as (vals: V[]) => void)([]);
    } else {
      (onChange as (val: V | null) => void)(null);
    }
  }

  // ── Panel open / close ────────────────────────────────────────────────────

  function openPanel() {
    if (disabled) return;
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPanelRect(calcPanelRect(rect, placement));
    setOpen(true);
    setActiveIndex(-1);
  }

  function closePanel() {
    setOpen(false);
    setSearch("");
    setActiveIndex(-1);
    if (!isAsync) return;
    // reset async state for next open
    setAsyncOptions([]);
    setNextCursor(undefined);
    setHasMore(false);
  }

  function togglePanel() {
    if (open) closePanel();
    else openPanel();
  }

  // ── Reposition panel on scroll / resize ───────────────────────────────────

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    function reposition() {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPanelRect(calcPanelRect(rect, placement));
    }
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, placement]);

  // ── Click outside ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        !anchorRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        closePanel();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Escape ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Auto-focus search on open ─────────────────────────────────────────────

  useEffect(() => {
    if (open && searchable) {
      // wait a tick so the portal is mounted
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open, searchable]);

  // ── Async: initial load + search ─────────────────────────────────────────

  const fetchAsync = useCallback(
    async (q: string, cursor?: string | number) => {
      if (!loadOptions) return;
      setLoading(true);
      try {
        const result = await loadOptions(q, cursor);
        setAsyncOptions((prev) =>
          cursor != null ? [...prev, ...result.options] : result.options,
        );
        setNextCursor(result.nextCursor ?? null);
        setHasMore(result.nextCursor != null);
      } finally {
        setLoading(false);
      }
    },
    [loadOptions],
  );

  // Trigger initial fetch when panel opens (async mode)
  useEffect(() => {
    if (open && isAsync) {
      fetchAsync("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAsync]);

  // Debounced search for async
  useEffect(() => {
    if (!open || !isAsync) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAsyncOptions([]);
      setNextCursor(undefined);
      fetchAsync(search);
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, open, isAsync]);

  // ── Infinite scroll sentinel ──────────────────────────────────────────────

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || !sentinelRef.current || !isAsync) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          fetchAsync(search, nextCursor ?? undefined);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, nextCursor, search, isAsync]);

  // ── Keyboard navigation in list ───────────────────────────────────────────

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allDisplayed.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = allDisplayed[activeIndex];
      if (opt && !opt.disabled) toggleValue(opt.value);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item =
      listRef.current.querySelectorAll<HTMLElement>("[role='option']")[
        activeIndex
      ];
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ── Trigger label ─────────────────────────────────────────────────────────

  function renderTriggerContent() {
    if (selectedValues.length === 0) {
      return (
        <Span className={`text-sm ${themed.textMuted} truncate`}>
          {placeholder}
        </Span>
      );
    }

    if (multi) {
      const allOpts = isAsync ? asyncOptions : (staticOptions ?? []);
      const chips = (value as V[]).map((v) => {
        const opt = allOpts.find((o) => o.value === v);
        return (
          <Span
            key={String(v)}
            className={classNames(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
              themed.bgTertiary,
              themed.textSecondary,
            )}
          >
            {opt?.icon && <span className="flex-shrink-0">{opt.icon}</span>}
            {opt?.label ?? String(v)}
          </Span>
        );
      });
      return (
        <span className="flex flex-wrap gap-1 min-w-0 flex-1">{chips}</span>
      );
    }

    const allOpts = isAsync ? asyncOptions : (staticOptions ?? []);
    const selected = allOpts.find((o) => o.value === (value as V));
    return (
      <span className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
        {selected?.icon && (
          <span className="flex-shrink-0">{selected.icon}</span>
        )}
        <Span className={`text-sm truncate ${themed.textPrimary}`}>
          {selected?.label ?? String(value)}
        </Span>
      </span>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const hasValue = selectedValues.length > 0;

  return (
    <div className={classNames("w-full", className ?? "")}>
      {/* Label */}
      {label && (
        <Label id={labelId} htmlFor={triggerId}>
          {label}
        </Label>
      )}

      {/* Trigger */}
      <div ref={anchorRef} className="relative w-full">
        <div
          id={triggerId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-label={!label ? ariaLabel : undefined}
          aria-invalid={error ? "true" : undefined}
          tabIndex={disabled ? -1 : 0}
          onClick={togglePanel}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              togglePanel();
            } else if (e.key === "ArrowDown" && !open) {
              e.preventDefault();
              openPanel();
            }
          }}
          className={classNames(
            "flex items-center gap-2 w-full cursor-pointer select-none",
            input.base,
            "pr-8 min-h-[2.5rem]",
            error ? input.error : "",
            disabled ? input.disabled : "",
            open
              ? "ring-2 ring-primary-500/20 dark:ring-secondary-400/20 border-primary-500 dark:border-secondary-400"
              : "",
          )}
        >
          {renderTriggerContent()}
        </div>

        {/* Trailing icons */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          {hasValue && onChange && !disabled && (
            <Button
              variant="ghost"
              aria-label={clearAriaLabel}
              tabIndex={-1}
              onClick={clearValue}
              className={classNames(
                "pointer-events-auto p-0.5 rounded transition-colors",
                themed.textMuted,
                themed.hover,
              )}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          )}
          <svg
            className={classNames(
              "w-4 h-4 transition-transform duration-150",
              open ? "rotate-180" : "",
              error ? themed.textError : themed.textMuted,
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Error / helper */}
      {error && (
        <Text
          className={`mt-1.5 text-sm ${themed.textError} flex items-center gap-1`}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text className={`mt-1.5 text-sm ${themed.textMuted}`}>
          {helperText}
        </Text>
      )}

      {/* Portal panel */}
      {open &&
        panelRect &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            style={{
              position: "absolute",
              top: panelRect.top,
              left: panelRect.left,
              width: panelRect.width,
              zIndex: 9999,
            }}
            className={classNames(
              "rounded-xl border shadow-xl overflow-hidden",
              themed.border,
              themed.bgElevated,
              panelRect.openUp ? "flex flex-col-reverse" : "flex flex-col",
            )}
          >
            {/* Search bar */}
            {searchable && (
              <div
                className={classNames(
                  "p-2 border-b flex-shrink-0",
                  themed.border,
                )}
              >
                <Input
                  ref={searchRef}
                  type="search"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  aria-label={searchPlaceholder}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  className="py-1.5 text-sm"
                />
              </div>
            )}

            {/* Options list */}
            <div
              ref={listRef}
              style={{ maxHeight: panelRect.maxHeight - (searchable ? 52 : 0) }}
              className="overflow-y-auto overflow-x-hidden overscroll-contain"
            >
              <Ul
                id={listboxId}
                role="listbox"
                aria-multiselectable={multi}
                aria-label={ariaLabel ?? label}
                className="py-1"
              >
                {loading && asyncOptions.length === 0 ? (
                  <Li
                    className={classNames(
                      THEME_CONSTANTS.flex.center,
                      "gap-2 px-3 py-3",
                    )}
                  >
                    <Spinner size="sm" />
                    <Span className={`text-sm ${themed.textMuted}`}>
                      {loadingText}
                    </Span>
                  </Li>
                ) : allDisplayed.length === 0 ? (
                  <Li className="px-3 py-2.5">
                    <Span className={`text-sm ${themed.textMuted}`}>
                      {noResultsText}
                    </Span>
                  </Li>
                ) : (
                  allDisplayed.map((opt, idx) => {
                    const isSelected = valueIncludes(selectedValues, opt.value);
                    const isActive = idx === activeIndex;
                    return (
                      <Li
                        key={String(opt.value)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled}
                      >
                        <Button
                          variant="ghost"
                          disabled={opt.disabled}
                          onClick={() => toggleValue(opt.value)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={classNames(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-none text-sm text-left",
                            isSelected
                              ? "bg-primary-600 text-white font-medium"
                              : isActive
                                ? themed.hover
                                : themed.textSecondary,
                          )}
                        >
                          {/* Checkbox indicator for multi */}
                          {multi && (
                            <div
                              className={classNames(
                                THEME_CONSTANTS.flex.center,
                                "flex-shrink-0 w-4 h-4 rounded border-2",
                                isSelected
                                  ? "bg-white border-white"
                                  : "border-current opacity-50",
                              )}
                              aria-hidden="true"
                            >
                              {isSelected && (
                                <svg
                                  className="w-2.5 h-2.5 text-primary-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                          {opt.icon && (
                            <span className="flex-shrink-0">{opt.icon}</span>
                          )}
                          <span className="truncate">{opt.label}</span>
                          {/* Single check mark */}
                          {!multi && isSelected && (
                            <svg
                              className="w-4 h-4 flex-shrink-0 ml-auto"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </Button>
                      </Li>
                    );
                  })
                )}

                {/* Infinite scroll sentinel */}
                {isAsync && hasMore && (
                  <Li>
                    <div
                      ref={sentinelRef}
                      className={classNames(
                        THEME_CONSTANTS.flex.center,
                        "py-2 gap-2",
                      )}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" />
                          <Span className={`text-xs ${themed.textMuted}`}>
                            {loadingText}
                          </Span>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          className={`text-xs w-full py-1.5 ${themed.textMuted}`}
                          onClick={() =>
                            fetchAsync(search, nextCursor ?? undefined)
                          }
                        >
                          Load more
                        </Button>
                      )}
                    </div>
                  </Li>
                )}
              </Ul>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export type { DynamicSelectProps as DynamicSelectComponentProps };
