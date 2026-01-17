"use client";

import { ViewToggle as LibraryViewToggle } from "@letitrip/react-library";
import { Grid3x3, Table2 } from "lucide-react";

interface ViewToggleProps {
  view: "grid" | "table";
  onViewChange: (view: "grid" | "table") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <LibraryViewToggle
      view={view}
      onViewChange={onViewChange}
      options={[
        { value: "grid", label: "Grid", icon: Grid3x3 },
        { value: "table", label: "Table", icon: Table2 },
      ]}
    />
  );
}
