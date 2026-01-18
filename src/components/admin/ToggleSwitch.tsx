"use client";

import { ToggleSwitch } from "@letitrip-library/components";

interface ToggleSwitchWrapperProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: string;
  id?: string;
}

/**
 * Next.js wrapper for ToggleSwitch component
 */
export function ToggleSwitchWrapper({
  onToggle,
  ...props
}: ToggleSwitchWrapperProps) {
  return (
    <ToggleSwitch
      {...props}
      onToggle={(enabled) => onToggle()}
    />
  );
}

export { ToggleSwitchWrapper as ToggleSwitch };
export default ToggleSwitchWrapper;