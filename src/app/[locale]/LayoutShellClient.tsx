"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function LayoutShellClient({ children }: Props) {
  return children;
}