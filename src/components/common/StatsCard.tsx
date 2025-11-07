"use client";

import { ReactNode } from "react";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  description,
  className = "",
  onClick,
}: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">
          {title}
        </h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-2xl font-bold text-gray-900">
          {value}
        </p>

        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}
