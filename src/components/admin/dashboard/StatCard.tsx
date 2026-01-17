import {
  DashboardStatCard as LibraryDashboardStatCard,
  type DashboardStatCardProps as LibraryDashboardStatCardProps,
} from "@letitrip/react-library";
import Link from "next/link";

interface StatCardProps
  extends Omit<LibraryDashboardStatCardProps, "LinkComponent"> {}

export function StatCard(props: StatCardProps) {
  return <LibraryDashboardStatCard {...props} LinkComponent={Link as any} />;
}
