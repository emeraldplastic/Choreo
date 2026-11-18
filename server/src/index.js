// Choreo Gateway Server
// Hosts:
//   1. y-websocket sync provider for real-time CRDT collaboration
//   2. /api/run execution endpoint (PR #7)

import http from 'node:http';
import express from 'express';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils';

const app = express();
const PORT = process.env.PORT || 3001;

// ── REST endpoints ──────────────────────────────────────────
app.get('/api/status', (_req, res) => {
  res.json({
    service: 'choreo-gateway',
    status: 'ok',
    version: '0.2.0',
    uptime: process.uptime(),
  });
});

// ── HTTP + WebSocket server ─────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // y-websocket utility handles Yjs protocol, awareness, and
  // room-based document routing based on the URL path.
  setupWSConnection(ws, req);
});

server.listen(PORT, () => {
  console.log(`[choreo] gateway + y-websocket on http://localhost:${PORT}`);
  console.log(`[choreo] WebSocket sync ready on ws://localhost:${PORT}`);
});
