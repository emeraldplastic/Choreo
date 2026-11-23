# 📅 Choreo: 2-Month Contribution Roadmap (1–2 PRs / Week)

This roadmap is designed for steady, high-impact contributions (approx. 1 to 2 targeted pull requests / commits per week over an 8-week period), progressing from foundation to a battle-tested, portfolio-grade system.

---

## 🗓️ Month 1: Collaborative Foundation & Sandboxed Execution (Weeks 1–4)

### 📌 Week 1: Project Scaffolding & Collaborative Workspace
* [x] **Contribution 1 (`feat: monorepo setup & client shell`)**:
  - Initialize monorepo structure (`client/`, `server/`, `runner/`).
  - Set up Vite + React/TypeScript client with CodeMirror 6 / Monaco Editor component.
* [x] **Contribution 2 (`feat: real-time CRDT sync with Yjs`)**:
  - Integrate `yjs` and `y-websocket` provider into the editor.
  - Implement real-time document synchronization across multiple browser tabs with room IDs.

---

### 📌 Week 2: User Awareness & Remote Output Panel
* [x] **Contribution 3 (`feat: multi-cursor awareness & presence`)**:
  - Wire up Yjs awareness protocol to display peer cursors with random user colors and usernames.
  - Add peer connection status list in the top bar.
* [ ] **Contribution 4 (`feat: terminal panel with xterm.js`)**:
  - Integrate `xterm.js` and `xterm-addon-fit` into a bottom drawer / side panel for execution output.
  - Implement client-side ANSI escape sequence rendering and clear/reset actions.

---

### 📌 Week 3: Isolated Docker Execution Engine
* [ ] **Contribution 5 (`feat: docker sandbox runner daemon`)**:
  - Build initial runner service (Node.js/Go) that mounts code snippets into an ephemeral container.
  - Enforce resource constraints: `--memory=128m`, `--cpus=0.5`, `--network none`, `--pids-limit=64`.
* [ ] **Contribution 6 (`feat: execution timeout & exit-code handling`)**:
  - Add wall-clock execution watchdog (kill containers after 10 seconds to thwart infinite loops).
  - Return exit codes, runtime duration, and memory peak metrics with stdout/stderr.

---

### 📌 Week 4: End-to-End Run Pipeline & Output Broadcast
* [ ] **Contribution 7 (`feat: execution request gateway & websocket streaming`)**:
  - Create `/api/run` endpoint on gateway server that queues execution tasks to the runner.
  - Stream stdout and stderr chunks through WebSocket back to the requester.
* [ ] **Contribution 8 (`feat: room-wide execution broadcast`)**:
  - Broadcast execution trigger events and live stdout stream to all peers currently active in the same room.
  - Display "Ran by User X" notification banner in the output panel.

---

## 🗓️ Month 2: Performance, Multi-Language & Advanced Features (Weeks 5–8)

### 📌 Week 5: Pre-Warmed Container Pool (Latency Optimization)
* [ ] **Contribution 9 (`perf: pre-warmed container worker pool`)**:
  - Replace on-demand `docker run` cold starts with a pre-warmed warm pool of idle containers.
  - Drop cold-start latency from ~1.5s to <150ms per run.
* [ ] **Contribution 10 (`test: unit & integration test suite for runner pool`)**:
  - Add test harness verifying container recycling, memory leakage prevention, and pool recovery under load.

---

### 📌 Week 6: Multi-Language & Multi-File Support
* [ ] **Contribution 11 (`feat: multi-language runtime support (Python, JS, Rust/C++)`)**:
  - Extend runner images with polyglot runtimes (`python:3.11-alpine`, `node:20-alpine`, `gcc/rust`).
  - Add language selector in editor syncing via Yjs state.
* [ ] **Contribution 12 (`feat: multi-file tab navigation & virtual file tree`)**:
  - Store project file structure in a `Y.Map` of `Y.Text` files.
  - Allow users to create, delete, and switch between multiple files collaboratively.

---

### 📌 Week 7: Interactive PTY Multiplexing
* [ ] **Contribution 13 (`feat: bidirectional PTY stream with node-pty`)**:
  - Upgrade output from static stdout stream to interactive pseudo-terminal (`node-pty`).
  - Allow users to supply stdin (e.g., interactive prompts, `input()` in Python) directly from `xterm.js`.
* [ ] **Contribution 14 (`feat: terminal input lock & arbitration`)**:
  - Implement floor control / lock arbitration so multiple peers do not collide when typing interactive stdin concurrently.

---

### 📌 Week 8: Hardening, CI/CD & Production Polish
* [ ] **Contribution 15 (`security: seccomp profile & non-root sandbox hardening`)**:
  - Add strict custom seccomp profile blocking dangerous syscalls (`ptrace`, `chroot`, `mount`, etc.).
  - Run execution processes strictly as unprivileged user `nobody:nogroup`.
* [ ] **Contribution 16 (`ci: GitHub Actions automated workflow & demo deployment`)**:
  - Add `.github/workflows/ci.yml` running linting, unit tests, and Docker runner integration tests.
  - Create `docker-compose.yml` for 1-command deployment of the full gateway + runner stack.
