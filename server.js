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

  // Initialize Socket.io (dynamic import to avoid build issues)
  if (process.env.ENABLE_SOCKETIO !== 'false') {
    import('./src/lib/socket-server.js').then(({ initializeSocketServer }) => {
      initializeSocketServer(httpServer);
      console.log('[Server] Socket.io initialized');
    }).catch((err) => {
      console.error('[Server] Failed to initialize Socket.io:', err);
    });
  }

  // Initialize server services (auction scheduler, etc.)
  if (process.env.ENABLE_CRON !== 'false') {
    import('./src/lib/server-init.js').then(({ initializeServer }) => {
      initializeServer();
      console.log('[Server] Server services initialized');
    }).catch((err) => {
      console.error('[Server] Failed to initialize services:', err);
    });
  }

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
