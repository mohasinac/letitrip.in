import "dotenv/config";
import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { monitor } from "@colyseus/monitor";
import { TryoutRoom } from "./rooms/TryoutRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files from the game-server directory
app.use(express.static(path.join(__dirname, "..")));

// Create HTTP server
const server = createServer(app);

// Create Colyseus server
const gameServer = new Server({
  server: server,
});

// Register room handlers
gameServer.define("tryout_room", TryoutRoom);

// (Optional) Attach monitoring panel
app.use("/colyseus", monitor());

// Serve test client at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "test-client.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Start server
gameServer.listen(port);
console.log(`🎮 Beyblade Game Server listening on port ${port}`);
console.log(`📊 Monitor panel: http://localhost:${port}/colyseus`);
console.log(`🏥 Health check: http://localhost:${port}/health`);
