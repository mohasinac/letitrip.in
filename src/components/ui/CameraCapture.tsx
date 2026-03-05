"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCamera } from "@/hooks";
import { Alert, Button, Span, Spinner } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export interface CameraCaptureProps {
  /** What the user can capture — photo, video, or both. */
  mode: "photo" | "video" | "both";
  /** Which camera to prefer. Defaults to 'environment' (rear). */
  facingMode?: "user" | "environment";
  /** Called when a capture is complete. */
  onCapture: (blob: Blob, type: "photo" | "video") => void;
  /** Called when the camera encounters an error. */
  onError?: (error: string) => void;
  className?: string;
}

/**
 * CameraCapture
 *
 * Tier 1 UI primitive — renders an in-page live camera viewfinder with controls:
 * - Photo mode: shutter button.
 * - Video mode: start/stop recording toggle.
 * - Both mode: shutter + record/stop buttons.
 * - Camera-flip button when multiple video inputs are available.
 *
 * Zero domain imports. Uses `useCamera` internally.
 */
export default function CameraCapture({
  mode,
  facingMode = "environment",
  onCapture,
  onError,
  className,
}: CameraCaptureProps) {
  const t = useTranslations("camera");
  const camera = useCamera();
  const { flex, position } = THEME_CONSTANTS;

  const [isStarting, setIsStarting] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Start camera on mount; detect number of video inputs for flip button
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsStarting(true);
      // Check how many video inputs exist
      if (
        typeof navigator !== "undefined" &&
        navigator.mediaDevices?.enumerateDevices
      ) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          setHasMultipleCameras(
            devices.filter((d) => d.kind === "videoinput").length > 1,
          );
        }
      }
      await camera.startCamera({
        facingMode,
        audio: mode === "video" || mode === "both",
      });
      if (!cancelled) {
        setIsStarting(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Forward camera errors to onError prop
  useEffect(() => {
    if (camera.error && onError) {
      onError(camera.error);
    }
  }, [camera.error, onError]);

  const handleTakePhoto = () => {
    const blob = camera.takePhoto();
    if (blob) {
      onCapture(blob, "photo");
    }
  };

  const handleStartRecording = () => {
    camera.startRecording();
  };

  const handleStopRecording = async () => {
    const blob = await camera.stopRecording();
    onCapture(blob, "video");
  };

  const showPhotoButton = mode === "photo" || mode === "both";
  const showVideoButton = mode === "video" || mode === "both";

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black ${className ?? ""}`}>
      {/* Live viewfinder */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={camera.videoRef}
        autoPlay
        muted
        playsInline
        className="w-full aspect-video object-cover"
      />

      {/* Starting overlay */}
      {isStarting && (
        <div
          className={`${position.fill} ${flex.center} bg-black/60`}
          aria-live="polite"
        >
          <div className={`${flex.colCenter} gap-2`}>
            <Spinner />
            <Span className="text-white text-sm">{t("starting")}</Span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {camera.error && (
        <div className="absolute top-2 left-2 right-2">
          <Alert variant="error">{camera.error}</Alert>
        </div>
      )}

      {/* Controls bar */}
      {!isStarting && !camera.error && camera.isActive && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-black/40 ${flex.center} gap-3`}
        >
          {/* Shutter button */}
          {showPhotoButton && (
            <Button
              variant="secondary"
              onClick={handleTakePhoto}
              aria-label={t("takePhoto")}
              disabled={camera.isCapturing}
            >
              {t("takePhoto")}
            </Button>
          )}

          {/* Record / stop button */}
          {showVideoButton && (
            <Button
              variant={camera.isCapturing ? "danger" : "secondary"}
              onClick={
                camera.isCapturing ? handleStopRecording : handleStartRecording
              }
              aria-label={
                camera.isCapturing ? t("stopRecording") : t("startRecording")
              }
            >
              {camera.isCapturing ? t("stopRecording") : t("startRecording")}
            </Button>
          )}

          {/* Flip camera */}
          {hasMultipleCameras && (
            <Button
              variant="outline"
              onClick={() => void camera.switchCamera()}
              aria-label={t("flipCamera")}
              disabled={camera.isCapturing}
            >
              {t("flipCamera")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
