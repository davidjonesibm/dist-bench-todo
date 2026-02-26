# Todo App

A full-stack todo application using Vue 3, Fastify, DaisyUI, and PocketBase.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite + Pinia + Vue Router + DaisyUI (Tailwind CSS)
- **Backend**: Fastify + TypeScript + PocketBase JS SDK
- **Database**: PocketBase (standalone server)
- **Monorepo**: pnpm workspaces

## Setup

### Prerequisites

- Node.js 20+
- pnpm 9+

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up PocketBase

Download the PocketBase binary for your OS from https://pocketbase.io/docs/ and place it at `pocketbase/pocketbase`.

Make it executable:

```bash
chmod +x pocketbase/pocketbase
```

Start PocketBase:

```bash
pnpm dev:pb
```

Open http://127.0.0.1:8090/_/ and create an admin account. Then create a collection called `todos` with these fields:

- `title` (text, required)
- `completed` (bool, default: false)

Update `.env` with your admin credentials.

### 3. Start development servers

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PocketBase Admin: http://127.0.0.1:8090/_/

## File Structure

```
dist-bench/
├── apps/
│   ├── frontend/     # Vue 3 + DaisyUI
│   └── backend/      # Fastify API
├── packages/
│   └── shared/       # Shared TypeScript types
└── pocketbase/       # PocketBase binary + data
```
