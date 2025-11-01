/**
 * CommandPalette Component
 *
 * A CMD+K / CTRL+K activated command palette for power users with fuzzy search,
 * quick actions, recent commands, and smart suggestions.
 *
 * @example
 * ```tsx
 * <CommandPalette
 *   commands={[
 *     {
 *       id: 'new-product',
 *       label: 'Create New Product',
 *       icon: <Plus />,
 *       shortcut: ['⌘', 'N'],
 *       action: () => router.push('/products/new')
 *     },
 *     {
 *       id: 'search',
 *       label: 'Search Products',
 *       icon: <Search />,
 *       category: 'Navigation',
 *       action: () => openSearch()
 *     }
 *   ]}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, Command } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommandItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Keyboard shortcut */
  shortcut?: string[];
  /** Category for grouping */
  category?: string;
  /** Search keywords */
  keywords?: string[];
  /** Action callback */
  action: () => void;
}

export interface CommandPaletteProps {
  /** Available commands */
  commands: CommandItem[];
  /** Whether palette is open */
  open?: boolean;
  /** Callback when closed */
  onClose?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum recent commands to store */
  maxRecent?: number;
  /** LocalStorage key for recent commands */
  storageKey?: string;
  /** Additional class name */
  className?: string;
}

export const CommandPalette = React.forwardRef<
  HTMLDivElement,
  CommandPaletteProps
>(
  (
    {
      commands,
      open = false,
      onClose,
      placeholder = "Type a command or search...",
      maxRecent = 5,
      storageKey = "command-palette-recent",
      className,
    },
    ref
  ) => {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentCommands, setRecentCommands] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent commands
    useEffect(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            setRecentCommands(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to load recent commands:", e);
          }
        }
      }
    }, [storageKey]);

    // Focus input when opened
    useEffect(() => {
      if (open) {
        setTimeout(() => inputRef.current?.focus(), 10);
        setQuery("");
        setSelectedIndex(0);
      }
    }, [open]);

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // CMD+K or CTRL+K to toggle
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          if (open) {
            onClose?.();
          } else {
            // This should be handled by parent component
          }
        }

        // Escape to close
        if (e.key === "Escape" && open) {
          e.preventDefault();
          onClose?.();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    // Fuzzy search implementation
    const filteredCommands = useMemo(() => {
      if (!query.trim()) {
        // Show recent commands when no query
        const recent = recentCommands
          .map((id) => commands.find((cmd) => cmd.id === id))
          .filter(Boolean) as CommandItem[];
        return recent;
      }

      const searchTerm = query.toLowerCase();
      return commands.filter((cmd) => {
        const label = cmd.label.toLowerCase();
        const keywords = cmd.keywords?.join(" ").toLowerCase() || "";
        const category = cmd.category?.toLowerCase() || "";

        return (
          label.includes(searchTerm) ||
          keywords.includes(searchTerm) ||
          category.includes(searchTerm)
        );
      });
    }, [query, commands, recentCommands]);

    // Group commands by category
    const groupedCommands = useMemo(() => {
      const groups: Record<string, CommandItem[]> = {};

      filteredCommands.forEach((cmd) => {
        const category = cmd.category || "Commands";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(cmd);
      });

      return groups;
    }, [filteredCommands]);

    // Handle command selection
    const handleSelect = (command: CommandItem) => {
      // Add to recent commands
      const newRecent = [
        command.id,
        ...recentCommands.filter((id) => id !== command.id),
      ].slice(0, maxRecent);

      setRecentCommands(newRecent);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(newRecent));
      }

      // Execute action
      command.action();
      onClose?.();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredCommands.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          handleSelect(command);
        }
      }
    };

    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Palette */}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-2xl mx-4",
            "bg-black/95 backdrop-blur-xl",
            "border border-white/10 rounded-lg shadow-2xl",
            "animate-in zoom-in-95 duration-200",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="w-5 h-5 text-white/50 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-mono text-white/40 bg-white/5 rounded">
              <span>ESC</span>
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-white/40">
                <p>No commands found</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="mb-4 last:mb-0">
                  {/* Category header */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    {query.trim() ? (
                      category
                    ) : (
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Recent
                      </span>
                    )}
                  </div>

                  {/* Commands */}
                  <div className="space-y-1">
                    {items.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={command.id}
                          onClick={() => handleSelect(command)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                            "transition-colors text-left",
                            isSelected
                              ? "bg-primary text-white"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {command.icon && (
                            <span className="flex-shrink-0 w-5 h-5">
                              {command.icon}
                            </span>
                          )}
                          <span className="flex-1 truncate">
                            {command.label}
                          </span>
                          {command.shortcut && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {command.shortcut.map((key, i) => (
                                <kbd
                                  key={i}
                                  className={cn(
                                    "px-1.5 py-0.5 text-xs font-mono rounded",
                                    isSelected ? "bg-white/20" : "bg-white/5"
                                  )}
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-white/40">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/5 rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/5 rounded">↵</kbd>
                Select
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="w-3.5 h-3.5" />
              <span>Command Palette</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CommandPalette.displayName = "CommandPalette";

/**
 * Hook for managing CommandPalette state
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}
