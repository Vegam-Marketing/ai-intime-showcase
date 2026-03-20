# AI Intime — Interactive Platform Showcase

An interactive architecture diagram showcasing the **AI Intime Secure Reasoning Engine** platform by Vegam Solutions.

## Features

- **Drag & drop** — reposition teams, the engine block, and use cases freely
- **Double-click to rename** — all team names, tool names, and use case names are editable
- **Toggle tools on/off** — each tool has a switch that activates/deactivates its data flow
- **Per-tool colored particles** — each active tool sends a uniquely colored particle stream into the engine
- **Per-use-case colored output** — each use case receives its own colored intelligence stream
- **Distinct palettes** — tools use cool/vivid colors; use cases use warm/earthy tones (no overlap)
- **Add/remove** — dynamically add or remove teams, tools, and use cases
- **Animated engine** — rotating ring and glow effects on the central reasoning engine

## Architecture Flow

```
Teams & Tools (bottom)  →  AI Intime Engine (center)  →  Use Cases (right)
      ▲ Data Ingestion              Intelligence ▶
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploy

Push to GitHub and connect to [Vercel](https://vercel.com) for instant deployment.

## Tech Stack

- React 19 + Vite
- Canvas API for particle animations
- SVG for connection curves
- Zero external UI dependencies

## Built for

[AI Intime](https://aiintime.com) — Sovereign Enterprise AI by Vegam Solutions
