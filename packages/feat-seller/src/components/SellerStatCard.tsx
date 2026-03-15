import React from "react";

interface SellerStatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: { value: number; positive: boolean };
  icon?: React.ReactNode;
  className?: string;
}

export function SellerStatCard({
  label,
  value,
  subLabel,
  trend,
  icon,
  className = "",
}: SellerStatCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1 truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subLabel && (
            <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
          )}
          {trend && (
            <p
              className={`text-xs mt-1 font-medium ${trend.positive ? "text-green-600" : "text-red-500"}`}
            >
              {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="shrink-0 text-gray-400 text-2xl">{icon}</div>}
      </div>
    </div>
  );
}
