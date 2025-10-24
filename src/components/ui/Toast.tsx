"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  persistent?: boolean;
}

interface ToastProps {
  notification: ToastNotification;
  onClose: (id: string) => void;
}

export function Toast({ notification, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!notification.persistent && notification.duration !== 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.persistent]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm
        transition-all duration-300 transform
        ${getColors()}
        ${
          isVisible && !isRemoving
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
        ${isRemoving ? "scale-95" : ""}
      `}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{notification.title}</h4>
        {notification.message && (
          <p className="text-sm mt-1 opacity-90">{notification.message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <XCircleIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  notifications: ToastNotification[];
  onClose: (id: string) => void;
}

export function ToastContainer({
  notifications,
  onClose,
}: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addToast = (
    title: string,
    options?: {
      message?: string;
      type?: ToastNotification["type"];
      duration?: number;
      persistent?: boolean;
    }
  ) => {
    const id = Date.now().toString();
    const newNotification: ToastNotification = {
      id,
      title,
      type: "info",
      duration: 5000,
      ...options,
    };

    setNotifications((prev) => [...prev, newNotification]);
    return id;
  };

  const removeToast = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearAllToasts = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addToast,
    removeToast,
    clearAllToasts,
  };
}
