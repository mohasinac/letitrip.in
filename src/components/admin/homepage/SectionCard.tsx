"use client";

import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import { SectionCard as LibrarySectionCard } from "@letitrip/react-library";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  children?: ReactNode;
  orderIndex?: number;
  totalSections?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function SectionCard(props: SectionCardProps) {
  return (
    <LibrarySectionCard
      {...props}
      ToggleSwitchComponent={ToggleSwitch}
      icons={{
        arrowUp: ArrowUp,
        arrowDown: ArrowDown,
        chevronUp: ChevronUp,
        chevronDown: ChevronDown,
      }}
    />
  );
}
