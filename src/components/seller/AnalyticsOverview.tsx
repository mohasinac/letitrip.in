import type {
  AnalyticsOverviewData,
  AnalyticsOverviewProps,
} from "@letitrip/react-library";
import { AnalyticsOverview as AnalyticsOverviewBase } from "@letitrip/react-library";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";

/**
 * AnalyticsOverview wrapper with lucide-react icons
 *
 * This wrapper provides the default icons using lucide-react.
 * The library component is framework-agnostic and doesn't include icons by default.
 */
export default function AnalyticsOverview({
  data,
  icons,
  ...props
}: Omit<AnalyticsOverviewProps, "icons"> & {
  data: AnalyticsOverviewData;
  icons?: AnalyticsOverviewProps["icons"];
}) {
  const defaultIcons = {
    revenue: <DollarSign className="w-6 h-6" />,
    orders: <ShoppingBag className="w-6 h-6" />,
    products: <Package className="w-6 h-6" />,
    customers: <Users className="w-6 h-6" />,
  };

  return (
    <AnalyticsOverviewBase
      data={data}
      icons={icons || defaultIcons}
      {...props}
    />
  );
}
