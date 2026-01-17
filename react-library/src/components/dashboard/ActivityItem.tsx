import { Clock, LucideIcon } from "lucide-react";

export interface ActivityItemProps {
  id: string;
  type: string;
  message: string;
  time: string;
  status: "success" | "warning" | "info" | "error";
  icon: LucideIcon;
  color: string;
  onAction?: () => void;
}

export function ActivityItem({
  message,
  time,
  status,
  icon: Icon,
  color,
  onAction,
}: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}
        >
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <p className="text-xs text-gray-500">{time}</p>
          </div>
        </div>
      </div>
      {status === "warning" && (
        <button
          onClick={onAction}
          className="text-xs text-yellow-600 hover:text-yellow-700 font-medium px-3 py-1 border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
        >
          Review
        </button>
      )}
      {status === "error" && (
        <button
          onClick={onAction}
          className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          View
        </button>
      )}
    </div>
  );
}
