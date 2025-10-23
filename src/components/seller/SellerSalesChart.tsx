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

interface SellerSalesData {
  labels: string[];
  revenue: number[];
  orders: number[];
  visitors: number[];
}

export default function SellerSalesChart() {
  const [salesData, setSalesData] = useState<SellerSalesData>({
    labels: [],
    revenue: [],
    orders: [],
    visitors: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"7d" | "30d" | "90d">("7d");
  const [activeMetric, setActiveMetric] = useState<
    "revenue" | "orders" | "visitors"
  >("revenue");

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch(
          `/api/seller/analytics/sales?period=${activeTab}`
        );
        if (response.ok) {
          const data = await response.json();
          setSalesData(data);
        } else {
          // Mock data for development
          const mockData: SellerSalesData = {
            labels: [
              "Oct 17",
              "Oct 18",
              "Oct 19",
              "Oct 20",
              "Oct 21",
              "Oct 22",
              "Oct 23",
            ],
            revenue: [8000, 12000, 9500, 15000, 11000, 18000, 14500],
            orders: [12, 18, 14, 25, 16, 28, 22],
            visitors: [245, 312, 289, 445, 367, 523, 412],
          };
          setSalesData(mockData);
        }
      } catch (error) {
        console.error("Failed to fetch seller sales data:", error);
        // Mock data fallback
        const mockData: SellerSalesData = {
          labels: [
            "Oct 17",
            "Oct 18",
            "Oct 19",
            "Oct 20",
            "Oct 21",
            "Oct 22",
            "Oct 23",
          ],
          revenue: [8000, 12000, 9500, 15000, 11000, 18000, 14500],
          orders: [12, 18, 14, 25, 16, 28, 22],
          visitors: [245, 312, 289, 445, 367, 523, 412],
        };
        setSalesData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [activeTab]);

  const getChartData = () => {
    if (activeMetric === "revenue") {
      return {
        labels: salesData.labels,
        datasets: [
          {
            label: "Revenue",
            data: salesData.revenue,
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      };
    } else if (activeMetric === "orders") {
      return {
        labels: salesData.labels,
        datasets: [
          {
            label: "Orders",
            data: salesData.orders,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      };
    } else {
      return {
        labels: salesData.labels,
        datasets: [
          {
            label: "Visitors",
            data: salesData.visitors,
            borderColor: "rgb(168, 85, 247)",
            backgroundColor: "rgba(168, 85, 247, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (activeMetric === "revenue") {
              label += "₹" + context.parsed.y.toLocaleString();
            } else {
              label += context.parsed.y.toLocaleString();
            }
            return label;
          },
        },
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
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function (value: any) {
            if (activeMetric === "revenue") {
              return "₹" + value / 1000 + "k";
            }
            return value;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sales Performance
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

  const currentData = salesData[activeMetric];
  const total = currentData.reduce((sum, value) => sum + value, 0);
  const average = Math.round(total / currentData.length);
  const trend =
    currentData[currentData.length - 1] - currentData[currentData.length - 2];
  const trendPercentage = (
    (trend / currentData[currentData.length - 2]) *
    100
  ).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sales Performance
          </h3>
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

        {/* Metric Selector */}
        <div className="flex space-x-1 bg-gray-50 rounded-lg p-1">
          {(["revenue", "orders", "visitors"] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeMetric === metric
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {activeMetric === "revenue"
                ? `₹${total.toLocaleString()}`
                : total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Total{" "}
              {activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {activeMetric === "revenue"
                ? `₹${average.toLocaleString()}`
                : average.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Daily Average</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? "+" : ""}
              {trendPercentage}%
            </div>
            <div className="text-sm text-gray-500">vs Yesterday</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <Line data={getChartData()} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
