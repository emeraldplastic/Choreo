# Choreo 🎭

> **Low-Latency Collaborative Code Execution Engine**  
> Real-time collaborative code editor and isolated multi-tenant execution engine powered by **CRDTs**, **Docker sandboxing**, and **PTY multiplexing**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ Core Architecture

Choreo synchronizes code state across distributed peers with zero conflicts, routes execution jobs into strict, resource-capped containerized sandboxes, and multiplexes terminal I/O back to all connected collaborators in real-time.

```
┌─────────────────────────────────┐
│     Client (Browser / IDE)      │
│  - CodeMirror 6 / Monaco Editor │
│  - Yjs CRDT + Awareness         │
│  - xterm.js Terminal Output     │
└──────────────┬──────────────────┘
               │ WebSocket / WebRTC
┌──────────────▼──────────────────┐
│         Choreo Gateway          │
│  - y-websocket Sync Server      │
│  - Room & Session Orchestrator  │
│  - Execution Job Queue          │
└──────────────┬──────────────────┘
               │ gRPC / Docker API
┌──────────────▼──────────────────┐
│      Execution Engine Pool      │
│  - Pre-warmed Worker Pool       │
│  - Capped Resources & seccomp   │
│  - Node-PTY Stream Multiplexing │
└─────────────────────────────────┘
```

---

## 🔑 Key Pillars

1. **CRDT (Conflict-free Replicated Data Types)**: Deterministic, distributed state synchronization using Yjs. Collaborative multi-cursor awareness, undo/redo history preservation, and offline resilience.
2. **Containerized Sandboxing**: Ephemeral execution environments utilizing lightweight Docker/container runtimes with strict CPU/memory quotas, network disabling (`--network none`), and drop-privileges policies.
3. **PTY Stream Multiplexing**: Real-time broadcast of pseudo-terminal streams (stdout, stderr, ANSI escape sequences) to all peers in an execution room via WebSocket multiplexers.

---

## 🗺️ 2-Month Milestone Roadmap

See [ROADMAP.md](ROADMAP.md) for the complete day-to-day and sprint-by-sprint contribution breakdown.

---

## 📜 License

[MIT](LICENSE) © 2026 Choreo Team
