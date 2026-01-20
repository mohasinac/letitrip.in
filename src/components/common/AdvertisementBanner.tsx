"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

interface AdvertisementBannerProps {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  link?: string;
  linkText?: string;
  type?: "hero" | "promotion" | "offer" | "announcement";
  position?: "top" | "middle" | "bottom" | "sidebar";
  dismissible?: boolean;
  LinkComponent?: React.ComponentType<any>;
  ImageComponent?: React.ComponentType<any> | string;
  className?: string;
  onDismiss?: () => void;
}

export function AdvertisementBanner({
  id,
  title,
  description,
  image,
  link,
  linkText = "Learn More",
  type = "promotion",
  position = "top",
  dismissible = false,
  LinkComponent = Link,
  ImageComponent = "img",
  className = "",
  onDismiss,
}: AdvertisementBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  // Get styling based on type
  const getTypeStyles = () => {
    switch (type) {
      case "hero":
        return "bg-gradient-to-r from-blue-600 to-purple-600 text-white";
      case "promotion":
        return "bg-gradient-to-r from-green-500 to-blue-500 text-white";
      case "offer":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      case "announcement":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-black";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-800 text-white";
    }
  };

  // Get positioning styles
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return "mb-6";
      case "middle":
        return "my-8";
      case "bottom":
        return "mt-8";
      case "sidebar":
        return "mb-4";
      default:
        return "";
    }
  };

  const bannerContent = (
    <div
      className={`relative rounded-lg overflow-hidden ${getTypeStyles()} ${getPositionStyles()} ${className}`}
    >
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0">
          {React.createElement(ImageComponent as any, {
            src: image,
            alt: title,
            className: "w-full h-full object-cover opacity-30",
          })}
        </div>
      )}

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-colors"
          aria-label="Dismiss banner"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>
          {description && (
            <p className="text-sm md:text-base opacity-90 mb-4 md:mb-0">
              {description}
            </p>
          )}
        </div>

        {link && (
          <div className="flex-shrink-0">
            <LinkComponent
              href={link}
              className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium transition-all hover:scale-105"
            >
              {linkText}
            </LinkComponent>
          </div>
        )}
      </div>
    </div>
  );

  return bannerContent;
}

export default AdvertisementBanner;
