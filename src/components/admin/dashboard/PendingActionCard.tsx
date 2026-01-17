import {
  PendingActionCard as LibraryPendingActionCard,
  type PendingActionCardProps as LibraryPendingActionCardProps,
} from "@letitrip/react-library";
import Link from "next/link";

interface PendingActionCardProps
  extends Omit<LibraryPendingActionCardProps, "LinkComponent"> {}

export function PendingActionCard(props: PendingActionCardProps) {
  return <LibraryPendingActionCard {...props} LinkComponent={Link as any} />;
}
