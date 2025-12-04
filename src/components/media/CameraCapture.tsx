"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, X, RotateCw, Check } from "lucide-react";
import { logError } from "@/lib/error-logger";
import OptimizedImage from "@/components/common/OptimizedImage";
import { MediaFile } from "@/types/media";

interface CameraCaptureProps {
  onCapture: (mediaFile: MediaFile) => void;
  onClose: () => void;
  facingMode?: "user" | "environment";
}

export default function CameraCapture({
  onCapture,
  onClose,
  facingMode: initialFacingMode = "environment",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    initialFacingMode,
  );
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsReady(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsReady(true);
      }
    } catch (err) {
      logError(err as Error, { component: "CameraCapture.startCamera" });
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(imageDataUrl);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;

    // Convert data URL to Blob
    const response = await fetch(capturedImage);
    const blob = await response.blob();

    // Create File from Blob
    const file = new File([blob], `camera-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    const mediaFile: MediaFile = {
      id: `camera-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      type: "image",
      source: "camera",
      preview: capturedImage,
      uploadStatus: "pending",
      uploadProgress: 0,
      metadata: {
        slug: "",
        description: "",
        size: file.size,
        mimeType: "image/jpeg",
      },
    };

    onCapture(mediaFile);
    stopCamera();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-lg font-semibold text-white">Take Photo</h2>
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center text-white px-4">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Camera Error</p>
                  <p className="text-sm opacity-75">{error}</p>
                </div>
              </div>
            )}

            {!isReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <OptimizedImage
            src={capturedImage}
            alt="Captured"
            width={600}
            height={600}
            objectFit="contain"
            className="max-w-full max-h-full"
          />
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50 flex items-center justify-center gap-6">
        {!capturedImage ? (
          <>
            {/* Switch Camera */}
            <button
              onClick={toggleCamera}
              disabled={!isReady}
              className="p-4 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
              title="Switch Camera"
            >
              <RotateCw className="w-6 h-6 text-white" />
            </button>

            {/* Capture Button */}
            <button
              onClick={capturePhoto}
              disabled={!isReady}
              className="w-20 h-20 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-lg transition-all"
              title="Take Photo"
            >
              <Camera className="w-8 h-8 mx-auto text-gray-800" />
            </button>

            {/* Spacer for symmetry */}
            <div className="w-16" />
          </>
        ) : (
          <>
            {/* Retake */}
            <button
              onClick={retakePhoto}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-medium"
            >
              Retake
            </button>

            {/* Confirm */}
            <button
              onClick={confirmPhoto}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Use Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
