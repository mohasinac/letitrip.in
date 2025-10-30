// Date utility functions
export const formatDate = (
  date: Date | string | number,
  format: "short" | "medium" | "long" | "full" = "medium",
): string => {
  const dateObj = new Date(date);

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: "short", day: "numeric", year: "numeric" },
    medium: { month: "long", day: "numeric", year: "numeric" },
    long: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    full: {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  };

  const options = optionsMap[format];

  return dateObj.toLocaleDateString("en-IN", options);
};

export const formatTime = (
  date: Date | string | number,
  format: "12" | "24" = "12",
): string => {
  const dateObj = new Date(date);

  return dateObj.toLocaleTimeString("en-IN", {
    hour12: format === "12",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
};

export const formatDateTime = (
  date: Date | string | number,
  dateFormat: "short" | "medium" | "long" = "medium",
  timeFormat: "12" | "24" = "12",
): string => {
  return `${formatDate(date, dateFormat)} at ${formatTime(date, timeFormat)}`;
};

export const getRelativeTime = (date: Date | string | number): string => {
  const now = new Date();
  // Convert to IST for consistent comparison
  const istNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor(
    (istNow.getTime() - targetDate.getTime()) / 1000,
  );

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

export const isToday = (date: Date | string | number): boolean => {
  const today = new Date();
  const targetDate = new Date(date);
  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  );
};

export const isSameDay = (
  date1: Date | string | number,
  date2: Date | string | number,
): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};
