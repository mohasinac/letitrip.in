"use client";

import {
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { DemoStep } from "@/services/demo-data.service";
import { StepStatus, DemoStepConfig } from "./types";

interface DemoStepCardProps {
  stepConfig: DemoStepConfig;
  status: StepStatus;
  isActive: boolean;
  canRun: boolean;
  isCleanup?: boolean;
  disabled: boolean;
  onRun: (step: DemoStep) => void;
}

export function DemoStepCard({
  stepConfig,
  status,
  isActive,
  canRun,
  isCleanup = false,
  disabled,
  onRun,
}: DemoStepCardProps) {
  const Icon = stepConfig.icon;
  const activeColor = isCleanup
    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
    : "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
  const buttonBg = isCleanup
    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
    : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800";

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        isActive
          ? activeColor
          : status?.status === "completed"
            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
            : status?.status === "error"
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            status?.status === "completed"
              ? "bg-green-500"
              : status?.status === "error"
                ? "bg-red-500"
                : status?.status === "running"
                  ? isCleanup
                    ? "bg-red-500"
                    : "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          {status?.status === "completed" ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : status?.status === "error" ? (
            <XCircle className="w-5 h-5 text-white" />
          ) : status?.status === "running" ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {stepConfig.label}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {status?.status === "error"
              ? status.error
              : status?.status === "completed" && status.count
                ? `${
                    isCleanup ? "Deleted" : "Created"
                  } ${status.count.toLocaleString()} items`
                : stepConfig.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status?.status !== "completed" && status?.status !== "running" && (
          <button
            onClick={() => onRun(stepConfig.id)}
            disabled={disabled || (!isCleanup && !canRun)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm ${buttonBg} rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {status?.status === "error" ? (
              <RefreshCw className="w-4 h-4" />
            ) : isCleanup ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {status?.status === "error"
              ? "Retry"
              : isCleanup
                ? "Delete"
                : "Run"}
          </button>
        )}
      </div>
    </div>
  );
}
