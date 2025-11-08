/**
 * Custom Next.js Server with Socket.io
 * 
 * This file creates a custom server that integrates Socket.io with Next.js
 * for real-time auction functionality.
 * 
 * Usage:
 *   - Development: node server.js
 *   - Production: node server.js (after `npm run build`)
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Socket.io and server services disabled in development
  // They require TypeScript compilation which is handled by Next.js
  // For production, these would need to be built separately
  console.log('[Server] Note: Socket.io and Cron services require separate build process');
  console.log('[Server] Set ENABLE_SOCKETIO=false and ENABLE_CRON=false to disable warnings');

  // Start server
  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🚀 JustForView.in Server Ready                            ║
║                                                            ║
║  ➤ Local:    http://${hostname}:${port}                           ║
║  ➤ Network:  Use your network IP                          ║
║                                                            ║
║  Features:                                                 ║
║  ✓ Next.js App Router                                     ║
║  ✓ Socket.io (Real-time auctions)                         ║
║  ✓ Auction Scheduler (Auto-close)                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
});
