// Choreo Gateway Server
// This will host:
//   1. y-websocket sync provider (PR #2)
//   2. /api/run execution endpoint (PR #7)

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/status', (_req, res) => {
  res.json({
    service: 'choreo-gateway',
    status: 'ok',
    version: '0.1.0',
    uptime: process.uptime(),
  });
});

app.listen(PORT, () => {
  console.log(`[choreo] gateway listening on http://localhost:${PORT}`);
});
