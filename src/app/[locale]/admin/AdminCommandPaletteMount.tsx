"use client";

import { useState } from "react";
import { CommandPalette, useCommandPaletteHotkey, type CommandPaletteGroup } from "@mohasinac/appkit";

/**
 * Quick-jump (⌘K / Ctrl+K) over the admin nav — 65 items across 10 groups
 * previously had no search, only menu drilling. `groups` is the same
 * permission/feature-flag-filtered list `AdminLayout` already computes for
 * the sidebar, so the palette never offers a link the user can't reach.
 */
export function AdminCommandPaletteMount({ groups }: { groups: CommandPaletteGroup[] }) {
  const [open, setOpen] = useState(false);
  useCommandPaletteHotkey(() => setOpen(true));
  return <CommandPalette isOpen={open} onClose={() => setOpen(false)} groups={groups} placeholder="Jump to an admin page… (⌘K)" />;
}
