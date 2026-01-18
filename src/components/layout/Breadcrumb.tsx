"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb as LibBreadcrumb,
  type BreadcrumbProps as LibBreadcrumbProps,
} from "@letitrip/react-library";
import { generateBreadcrumbSchema, generateJSONLD } from "@/lib/seo/schema";

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
