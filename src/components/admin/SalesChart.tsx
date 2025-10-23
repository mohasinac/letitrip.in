"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesData {
  labels: string[];
  revenue: number[];
  orders: number[];
}

export default function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData>({
    labels: [],
    revenue: [],
    orders: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch(
          `/api/admin/analytics/sales?period=${activeTab}`
        );
        if (response.ok) {
          const data = await response.json();
          setSalesData(data);
        } else {
          // Mock data for development
          const mockData: SalesData = {
            labels: [
              "Oct 17",
              "Oct 18",
              "Oct 19",
              "Oct 20",
              "Oct 21",
              "Oct 22",
              "Oct 23",
            ],
            revenue: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
            orders: [45, 67, 52, 89, 76, 105, 98],
          };
          setSalesData(mockData);
        }
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
        // Mock data fallback
        const mockData: SalesData = {
          labels: [
            "Oct 17",
            "Oct 18",
            "Oct 19",
            "Oct 20",
            "Oct 21",
            "Oct 22",
            "Oct 23",
          ],
          revenue: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
          orders: [45, 67, 52, 89, 76, 105, 98],
        };
        setSalesData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [activeTab]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return "₹" + value / 1000 + "k";
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const chartData = {
    labels: salesData.labels,
    datasets: [
      {
        label: "Revenue",
        data: salesData.revenue,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Orders",
        data: salesData.orders,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: false,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sales Overview
          </h3>
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
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setActiveTab(period)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === period
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {period === "7d"
                ? "7 Days"
                : period === "30d"
                ? "30 Days"
                : "90 Days"}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <div className="h-64">
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>
    </div>
  );
}
