"use client";

import { generateBreadcrumbSchema, generateJSONLD } from "@/lib/seo/schema";
import {
  Breadcrumb as LibBreadcrumb,
  type BreadcrumbProps as LibBreadcrumbProps,
} from "@letitrip/react-library";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type BreadcrumbProps = Omit<
  LibBreadcrumbProps,
  "currentPath" | "LinkComponent" | "generateSchema" | "generateJSONLD"
>;

export function Breadcrumb(props: BreadcrumbProps) {
  const pathname = usePathname();

  return (
    <LibBreadcrumb
      {...props}
      currentPath={pathname}
      LinkComponent={Link}
      generateSchema={generateBreadcrumbSchema}
      generateJSONLD={generateJSONLD}
    />
  );
}

export default Breadcrumb;
