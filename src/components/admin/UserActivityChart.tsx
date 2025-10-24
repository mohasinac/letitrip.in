"use client";

import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useRealTimeData } from "@/hooks/useRealTimeData";

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserActivityData {
  newUsers: number;
  returningUsers: number;
  activeUsers: number;
  bounceRate: number;
}

export default function UserActivityChart() {
  const fetchUserActivity = async () => {
    const response = await fetch("/api/admin/analytics/user-activity");
    if (!response.ok) {
      throw new Error("Failed to fetch user activity");
    }
    const data = await response.json();
    return data;
  };

  const { data: activityData, loading: isLoading, error } = useRealTimeData(
    fetchUserActivity,
    {
      enabled: true,
      interval: 60000, // Refresh every minute
    }
  );

  // Default data structure for loading state
  const defaultData: UserActivityData = {
    newUsers: 0,
    returningUsers: 0,
    activeUsers: 0,
    bounceRate: 0,
  };

  const currentData = activityData || defaultData;

  const chartData = {
    labels: ["New Users", "Returning Users"],
    datasets: [
      {
        data: [currentData.newUsers, currentData.returningUsers],
        backgroundColor: [
          "#3B82F6", // Blue
          "#10B981", // Green
        ],
        borderColor: ["#2563EB", "#059669"],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    cutout: "60%",
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
      </div>
      <div className="p-6">
        <div className="relative">
          <div className="h-48 mb-6">
            <Doughnut data={chartData} options={chartOptions} />
          </div>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentData.activeUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {currentData.newUsers}
            </div>
            <div className="text-sm text-gray-500">New Users</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {currentData.returningUsers}
            </div>
            <div className="text-sm text-gray-500">Returning Users</div>
          </div>
        </div>

        {/* Bounce Rate */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Bounce Rate</span>
            <span className="text-sm font-semibold text-gray-900">
              {currentData.bounceRate}%
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentData.bounceRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
