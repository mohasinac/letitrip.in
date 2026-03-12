"use client";

import { useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useClickOutside, useKeyPress } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants";

export interface RowAction {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  icon?: React.ReactNode;
  separator?: boolean;
}

interface RowActionMenuProps {
  actions: RowAction[];
  align?: "left" | "right";
}

/**
 * RowActionMenu
 *
 * A `…` trigger button that opens a dropdown with a list of row-level actions.
 * Stops click propagation so it works inside DataTable rows with onRowClick.
 * Used in DataTable column definitions across admin and seller views.
 */
export function RowActionMenu({
  actions,
  align = "right",
}: RowActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { themed } = THEME_CONSTANTS;

  useClickOutside(ref, () => setOpen(false), { enabled: open });
  useKeyPress("Escape", () => setOpen(false), { enabled: open });

  const alignClass = align === "right" ? "right-0" : "left-0";

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Row actions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-1 min-w-[160px] py-1.5 rounded-xl shadow-xl border animate-in fade-in slide-in-from-top-2 duration-150 ${themed.bgPrimary} ${themed.border} ${alignClass}`}
        >
          {actions.map((action, idx) => (
            <div key={action.label}>
              {action.separator && idx > 0 && (
                <div className={`my-1 h-px ${themed.border}`} />
              )}
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors duration-100 ${
                  action.destructive
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                    : `${themed.textPrimary} hover:${themed.bgSecondary}`
                }`}
              >
                {action.icon && (
                  <span className="flex-shrink-0 w-4 h-4">{action.icon}</span>
                )}
                {action.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
