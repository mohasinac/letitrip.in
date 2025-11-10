import Link from "next/link";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string;
  href: string;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  href,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <Link
      href={href}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-yellow-200 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        {change !== undefined && change > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <TrendIcon
              className={`h-4 w-4 ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            />
            <span
              className={`font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}%
            </span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </Link>
  );
}
