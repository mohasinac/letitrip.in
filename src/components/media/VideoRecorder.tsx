"use client";

import { MediaFile } from "@/types/media";
import { formatDuration, logError } from "@letitrip/react-library";
import { Camera, Monitor, Pause, Play, Square, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoRecorderProps {
  onRecorded: (mediaFile: MediaFile) => void;
  onClose: () => void;
  source?: "camera" | "screen";
  maxDuration?: number; // in seconds
}

export default function VideoRecorder({
  onRecorded,
  onClose,
  source: initialSource = "camera",
  maxDuration = 300, // 5 minutes default
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [source, setSource] = useState<"camera" | "screen">(initialSource);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  useEffect(() => {
    startPreview();

    return () => {
      cleanup();
    };
  }, [source]);

  const startPreview = async () => {
    try {
      setError(null);
      setIsReady(false);

      let stream: MediaStream;

      if (source === "camera") {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsReady(true);
      }
    } catch (err) {
      logError(err as Error, {
        component: "VideoRecorder.startRecording",
        metadata: { source },
      });
      setError(`Unable to access ${source}. Please check permissions.`);
    }
  };

  const cleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedVideo(url);
      stopTimer();
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    startTimer();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      pauseTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      resumeTimer();
    }
  };

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      setDuration((prev) => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const resumeTimer = () => {
    startTimer();
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const toggleSource = () => {
    setSource((prev) => (prev === "camera" ? "screen" : "camera"));
    setDuration(0);
    setIsRecording(false);
    setIsPaused(false);
  };

  const retake = () => {
    setRecordedVideo(null);
    setDuration(0);
    startPreview();
  };

  const confirmVideo = async () => {
    if (!recordedVideo) return;

    const response = await fetch(recordedVideo);
    const blob = await response.blob();

    const file = new File([blob], `video-${Date.now()}.webm`, {
      type: "video/webm",
    });

    const mediaFile: MediaFile = {
      id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      type: "video",
      source,
      preview: recordedVideo,
      uploadStatus: "pending",
      uploadProgress: 0,
      metadata: {
        slug: "",
        description: "",
        size: file.size,
        mimeType: "video/webm",
        duration,
      },
    };

    onRecorded(mediaFile);
    cleanup();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-lg font-semibold text-white">
          Record Video {source === "camera" ? "(Camera)" : "(Screen)"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Video View */}
      <div className="flex-1 relative flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!recordedVideo}
          controls={!!recordedVideo}
          src={recordedVideo || undefined}
          className="max-w-full max-h-full object-contain"
        />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white px-4">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Media Error</p>
              <p className="text-sm opacity-75">{error}</p>
            </div>
          </div>
        )}

        {!isReady && !error && !recordedVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <Video className="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <p>
                Initializing {source === "camera" ? "camera" : "screen capture"}
                ...
              </p>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && !recordedVideo && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full bg-white ${
                isPaused ? "" : "animate-pulse"
              }`}
            />
            <span className="font-mono">{formatDuration(duration)}</span>
            {isPaused && <span className="text-xs opacity-75">PAUSED</span>}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50 flex items-center justify-center gap-6">
        {!recordedVideo ? (
          <>
            {/* Toggle Source */}
            {!isRecording && (
              <button
                onClick={toggleSource}
                disabled={!isReady}
                className="p-4 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                title={
                  source === "camera" ? "Switch to Screen" : "Switch to Camera"
                }
              >
                {source === "camera" ? (
                  <Monitor className="w-6 h-6 text-white" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
            )}

            {/* Record/Stop Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={!isReady}
                className="w-20 h-20 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-lg transition-all flex items-center justify-center"
                title="Start Recording"
              >
                <div className="w-6 h-6 rounded-full bg-white" />
              </button>
            ) : (
              <>
                {/* Pause/Resume */}
                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? (
                    <Play className="w-6 h-6 text-white" />
                  ) : (
                    <Pause className="w-6 h-6 text-white" />
                  )}
                </button>

                {/* Stop */}
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-all flex items-center justify-center"
                  title="Stop Recording"
                >
                  <Square className="w-8 h-8 text-white fill-white" />
                </button>

                {/* Spacer */}
                <div className="w-16" />
              </>
            )}
          </>
        ) : (
          <>
            {/* Retake */}
            <button
              onClick={retake}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-medium"
            >
              Retake
            </button>

            {/* Confirm */}
            <button
              onClick={confirmVideo}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
            >
              Use Video
            </button>
          </>
        )}
      </div>
    </div>
  );
}
