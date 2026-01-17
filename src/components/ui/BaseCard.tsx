"use client";

import {
  BaseCard as LibraryBaseCard,
  type BaseCardProps as LibraryBaseCardProps,
} from "@letitrip/react-library";
import Link from "next/link";
import React from "react";

// Re-export types
export type { ActionButton, Badge } from "@letitrip/react-library";

// Next.js specific props (remove LinkComponent)
export interface BaseCardProps
  extends Omit<LibraryBaseCardProps, "LinkComponent"> {}

/**
 * BaseCard - Next.js wrapper for library BaseCard
 */
export const BaseCard: React.FC<BaseCardProps> = (props) => {
  return <LibraryBaseCard {...props} LinkComponent={Link as any} />;
};
