import { Card, Spinner } from "@/components/ui";
import { Text } from "@/components/typography";
import { THEME_CONSTANTS } from "@/constants";

const { themed } = THEME_CONSTANTS;

interface SellerStatCardProps {
  label: string;
  value: number | string;
  icon: string;
  colorClass: string;
  loading?: boolean;
}

export function SellerStatCard({
  label,
  value,
  icon,
  colorClass,
  loading,
}: SellerStatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <Text
            size="sm"
            className={`${themed.textSecondary} font-medium uppercase tracking-wide`}
          >
            {label}
          </Text>
          {loading ? (
            <div className="mt-2">
              <Spinner size="sm" variant="primary" />
            </div>
          ) : (
            <p className={`mt-1 text-3xl font-bold ${colorClass}`}>{value}</p>
          )}
        </div>
        <span className="text-3xl" aria-hidden>
          {icon}
        </span>
      </div>
    </Card>
  );
}
