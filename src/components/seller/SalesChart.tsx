import type { SalesChartProps, SalesDataPoint } from "@letitrip/react-library";
import { SalesChart as SalesChartBase } from "@letitrip/react-library";
import { format } from "date-fns";

/**
 * SalesChart wrapper with date-fns formatting
 *
 * This wrapper provides the default date formatting using date-fns.
 * The library component is framework-agnostic and doesn't include date-fns by default.
 */
export default function SalesChart({
  data,
  formatDate,
  ...props
}: Omit<SalesChartProps, "formatDate"> & {
  data: SalesDataPoint[];
  formatDate?: (dateString: string) => string;
}) {
  const defaultFormatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd");
    } catch {
      return dateString;
    }
  };

  return (
    <SalesChartBase
      data={data}
      formatDate={formatDate || defaultFormatDate}
      {...props}
    />
  );
}
