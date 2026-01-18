"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserSidebar as LibraryUserSidebar,
  defaultUserNavigation,
  type UserSidebarProps as LibraryUserSidebarProps,
} from "@letitrip/react-library";

type UserSidebarProps = Omit<LibraryUserSidebarProps, "LinkComponent" | "currentPath">;

export function UserSidebar(props: UserSidebarProps) {
  const pathname = usePathname();
  
  return (
    <LibraryUserSidebar
      {...props}
      navigation={props.navigation || defaultUserNavigation}
      currentPath={pathname}
      LinkComponent={Link as any}
    />
  );
}

export default UserSidebar;
