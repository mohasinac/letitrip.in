"use client";

import {
  AdminPageHeader as LibraryAdminPageHeader,
  type AdminPageHeaderProps as LibraryAdminPageHeaderProps,
} from "@letitrip/react-library";
import Link from "next/link";

type AdminPageHeaderProps = Omit<LibraryAdminPageHeaderProps, "LinkComponent">;

/**
 * Next.js wrapper for AdminPageHeader component
 */
export function AdminPageHeader(props: AdminPageHeaderProps) {
  return <LibraryAdminPageHeader {...props} LinkComponent={Link} />;
}

export default AdminPageHeader;
