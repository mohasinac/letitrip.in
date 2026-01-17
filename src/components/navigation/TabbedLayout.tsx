"use client";

import {
  TabbedLayout as LibraryTabbedLayout,
  type TabbedLayoutProps as LibraryTabbedLayoutProps,
} from "@letitrip/react-library";
import { TabNav } from "./TabNav";

interface TabbedLayoutProps
  extends Omit<LibraryTabbedLayoutProps, "TabNavComponent"> {}

export function TabbedLayout(props: TabbedLayoutProps) {
  return <LibraryTabbedLayout {...props} TabNavComponent={TabNav} />;
}
