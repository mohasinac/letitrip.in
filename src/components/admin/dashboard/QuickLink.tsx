import {
  QuickLink as LibraryQuickLink,
  type QuickLinkProps as LibraryQuickLinkProps,
} from "@letitrip/react-library";
import Link from "next/link";

interface QuickLinkProps extends Omit<LibraryQuickLinkProps, "LinkComponent"> {}

export function QuickLink(props: QuickLinkProps) {
  return <LibraryQuickLink {...props} LinkComponent={Link as any} />;
}
