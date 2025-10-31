"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { initSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

interface MultiplayerLobbyProps {
  onGameStart: (roomData: any) => void;
  onCancel: () => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onGameStart,
  onCancel,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<
    "name-entry" | "connecting" | "waiting" | "ready"
  >("name-entry");
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [waitTimeout, setWaitTimeout] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const socketInstance = initSocket();
    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.off("room-joined");
        socketInstance.off("opponent-joined");
        socketInstance.off("waiting-timeout");
        socketInstance.off("wait-extended");
        socketInstance.off("final-timeout");
        socketInstance.off("opponent-disconnected");
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("room-joined", (data) => {
      console.log("Room joined:", data);
      setRoomData(data);
      if (data.waitingForOpponent) {
        setStatus("waiting");
        startCountdown();
      } else {
        setStatus("ready");
      }
    });

    socket.on("opponent-joined", (data) => {
      console.log("Opponent joined:", data);
      setStatus("ready");
      setRoomData(data);
      onGameStart(data);
    });

    socket.on("waiting-timeout", () => {
      setWaitTimeout(true);
    });

    socket.on("wait-extended", () => {
      setWaitTimeout(false);
      setCountdown(30);
      startCountdown();
    });

    socket.on("final-timeout", () => {
      setError("No opponent found. Disconnecting in 10 seconds...");
      setTimeout(() => {
        handleCancel();
      }, 10000);
    });

    socket.on("opponent-disconnected", () => {
      setError("Opponent disconnected!");
      setTimeout(() => {
        handleCancel();
      }, 3000);
    });

    socket.on("server-full", (data) => {
      setError(
        `Server is full! ${data.currentPlayers}/${data.maxPlayers} players online. Please try again in a few minutes.`
      );
      setStatus("name-entry");
    });

    return () => {
      socket.off("room-joined");
      socket.off("opponent-joined");
      socket.off("waiting-timeout");
      socket.off("wait-extended");
      socket.off("final-timeout");
      socket.off("opponent-disconnected");
      socket.off("server-full");
    };
  }, [socket, onGameStart]);

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!socket) {
      setError("Connection error. Please refresh the page.");
      return;
    }

    setStatus("connecting");
    setError(null);

    socket.connect();
    socket.emit("join-room", { playerName: playerName.trim() });
  };

  const handleExtendWait = () => {
    if (socket) {
      socket.emit("extend-wait");
      setWaitTimeout(false);
    }
  };

  const handleCancel = () => {
    if (socket) {
      socket.disconnect();
    }
    onCancel();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      {status === "name-entry" && (
        <>
          <h4 className="text-3xl font-bold mb-4">Enter Your Name</h4>
          <div className="w-full max-w-sm">
            <input
              type="text"
              placeholder="Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleJoinRoom();
              }}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                error
                  ? "border-red-500 focus:border-red-600"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleJoinRoom}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors"
            >
              Join Room
            </button>
            <button
              onClick={handleCancel}
              className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium text-lg transition-colors"
            >
              Back
            </button>
          </div>
        </>
      )}

      {status === "connecting" && (
        <>
          <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
          <h5 className="text-2xl">Connecting...</h5>
        </>
      )}

      {status === "waiting" && (
        <>
          <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
          <h5 className="text-2xl mb-4">Waiting for opponent...</h5>
          <p className="text-gray-600 dark:text-gray-400">
            Time remaining: {countdown}s
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Room ID: {roomData?.roomId}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You are Player {roomData?.playerNumber}
          </p>
          <button
            onClick={handleCancel}
            className="mt-4 px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 w-full max-w-md">
          {error}
        </div>
      )}

      {/* Wait timeout dialog */}
      {waitTimeout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">No Opponent Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No opponent has joined yet. Would you like to wait for another 30
              seconds?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                No, Exit
              </button>
              <button
                onClick={handleExtendWait}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Yes, Wait 30s More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerLobby;
