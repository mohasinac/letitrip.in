"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/contexts";

/**
 * BackgroundRenderer Component
 *
 * Renders dynamic site background based on admin settings.
 * Supports color, gradient, image, and video backgrounds for both light and dark modes.
 * Includes optional overlay for better content readability.
 *
 * @component
 * @example
 * ```tsx
 * <BackgroundRenderer
 *   lightMode={{ type: "gradient", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
 *   darkMode={{ type: "color", value: "#030712" }}
 * />
 * ```
 */

interface BackgroundConfig {
  type: "color" | "gradient" | "image" | "video";
  value: string;
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}

interface BackgroundRendererProps {
  lightMode: BackgroundConfig;
  darkMode: BackgroundConfig;
}

export default function BackgroundRenderer({
  lightMode,
  darkMode,
}: BackgroundRendererProps) {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const config = theme === "dark" ? darkMode : lightMode;

  useEffect(() => {
    // Reset video loaded state when config changes
    if (config.type === "video") {
      setIsVideoLoaded(false);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  }, [config.type, config.value]);

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (config.type) {
      case "color":
        return { backgroundColor: config.value };
      case "gradient":
        return { background: config.value };
      case "image":
        return {
          backgroundImage: `url('${config.value}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        };
      case "video":
        return {};
      default:
        return {};
    }
  };

  const overlayStyle: React.CSSProperties = config.overlay?.enabled
    ? {
        backgroundColor: config.overlay.color,
        opacity: config.overlay.opacity,
      }
    : { display: "none" };

  return (
    <>
      {/* Background Layer */}
      <div
        className="fixed inset-0 -z-10 transition-all duration-500"
        style={getBackgroundStyle()}
      >
        {config.type === "video" && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src={config.value} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Overlay Layer */}
      <div
        className="fixed inset-0 -z-5 transition-all duration-500 pointer-events-none"
        style={overlayStyle}
      />
    </>
  );
}
