---
applyTo: '**'
---

# ProductivityHub Codebase Instructions

Project-specific standards for the **ProductivityHub** monorepo. These instructions are complementary to `vuejs3.instructions.md`, which covers generic Vue 3 / Composition API rules. This file covers architecture, conventions, and patterns specific to this codebase only — do not duplicate generic Vue 3 rules here.

## Project Overview

ProductivityHub is a personal productivity full-stack application with the following features:

- **Todo management** — tasks with completion state and user scoping
- **Notes** — Markdown editor with attachments, auto-save, and pin/sort
- **Calendar** — drag-and-drop event management (Schedule-X)
- **Tags** — colour-coded, reusable across notes and events
- **User auth** — register / login / profile via PocketBase

### High-Level Architecture

```
Browser (Vue 3 SPA)
      ↓  /api/* (proxied by Vite in dev)
Fastify backend  ←→  PocketBase (DB + auth server)
```

The **Fastify backend** is an authenticated proxy: it forwards requests to PocketBase, injecting the user's auth token per request. It does **not** own the database — PocketBase does.

The **Vue frontend** can also talk directly to PocketBase (e.g., file/attachment URLs), but all CRUD operations go through the Fastify API.

## Monorepo Structure

```
pnpm-workspace.yaml        # registers apps/* and packages/*
apps/backend/              # @todo-app/backend  — Fastify API
apps/frontend/             # @todo-app/frontend — Vue 3 SPA
packages/shared/           # @todo-app/shared   — shared TS types
pocketbase/                # PocketBase binary + migrations
```

- Package manager: **pnpm** with workspaces
- Root `package.json` runs everything with `concurrently`
- `packages/shared` has **no build step** — it exports raw `.ts` source files

Always import shared types as `@todo-app/shared`, never by relative path across package boundaries.

## Tech Stack Reference

### Backend (`apps/backend`)

| Package             | Version | Purpose              |
| ------------------- | ------- | -------------------- |
| fastify             | ^4.28.1 | HTTP framework       |
| @fastify/cors       | ^9.0.1  | CORS middleware      |
| fastify-plugin      | ^4.5.1  | Plugin scope sharing |
| pocketbase (JS SDK) | ^0.22.0 | PocketBase client    |
| dotenv              | ^16.4.5 | Environment vars     |
| tsx                 | ^4.19.2 | Dev runner (ESM)     |
| TypeScript          | ^5.4.5  |                      |

Backend uses **ESM** (`"type": "module"` in package.json) with top-level `await`.

### Frontend (`apps/frontend`)

| Package                   | Version | Purpose                              |
| ------------------------- | ------- | ------------------------------------ |
| vue                       | ^3.4.29 | UI framework                         |
| vue-router                | ^4.3.3  | Client-side routing                  |
| pinia                     | ^2.1.7  | State management                     |
| pocketbase (JS SDK)       | ^0.26.8 | Direct PocketBase access (file URLs) |
| @schedule-x/calendar      | ^2.3.0  | Calendar UI (headless)               |
| @schedule-x/drag-and-drop | ^2.3.0  | Calendar DnD plugin                  |
| @schedule-x/event-modal   | ^2.3.0  | Calendar event modal                 |
| @schedule-x/theme-default | ^2.3.0  | Calendar theme                       |
| easymde / vue-easymde     | ^2      | Markdown editor                      |
| marked                    | ^12.0.0 | Markdown → HTML                      |
| dompurify                 | ^3.0.9  | HTML sanitisation                    |
| tailwindcss               | ^3.4.6  | Utility CSS                          |
| daisyui                   | ^4.12.2 | Component classes                    |
| vite                      | ^5.3.3  | Build tool                           |

> **Important**: `axios` is listed as a dependency but is **not used anywhere**. Always use `apiFetch` for API calls — never import or use axios.

## Backend Patterns

### PocketBase Plugin

File: `apps/backend/src/plugins/pocketbase.plugin.ts`

Two PocketBase instances are injected via Fastify's decoration system:

- `fastify.pb` — shared singleton; **never used in routes**
- `req.pb` — fresh instance per request with the user's auth token injected from `Authorization: Bearer <token>`

Always use `req.pb` inside route handlers, never `fastify.pb`.

The plugin is registered with `fp(plugin)` (fastify-plugin) so decorations are visible in the parent scope.

```ts
// Accessing the per-request authenticated PocketBase instance
fastify.get('/', async (req, reply) => {
  const items = await req.pb.collection('todos').getFullList();
  return items;
});
```

### Route Pattern

All routes follow this structure:

```ts
import type { FastifyPluginAsync } from 'fastify';

const myRoute: FastifyPluginAsync = async (fastify) => {
  // GET list
  fastify.get('/', async (req, reply) => {
    return req.pb.collection('collection_name').getFullList();
  });

  // POST create
  fastify.post<{ Body: Record<string, unknown> }>('/', async (req, reply) => {
    const userId = req.pb.authStore.record?.id;
    const data = { ...req.body, userId };
    return req.pb.collection('collection_name').create(data);
  });

  // PATCH update
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/:id',
    async (req, reply) => {
      return req.pb
        .collection('collection_name')
        .update(req.params.id, req.body);
    },
  );

  // DELETE
  fastify.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    await req.pb.collection('collection_name').delete(req.params.id);
    reply.code(204).send();
  });
};

export default myRoute;
```

Rules:

- Always scope user-created records with `userId = req.pb.authStore.record?.id`
- Use `req.pb` (never `fastify.pb`) in all route handlers
- Auth routes create a local `anonPb = new PocketBase(url)` instance (no token) for login/register
- Export the plugin as a default export

### Error Handling

`ClientResponseError` from the PocketBase SDK is caught globally and forwarded with PocketBase's original HTTP status code. Do not wrap individual routes in try/catch solely for PocketBase errors — the global handler covers it.

### Fastify JSON Schema

`apps/backend/src/schemas/todo.schema.ts` exists but is **not wired to any route**. Do not reference or rely on Fastify JSON schema validation — PocketBase performs its own validation.

### Server Configuration

- All API routes are registered under the `/api/` prefix
- CORS allows two origins: `http://localhost:5173` and `http://127.0.0.1:5173` — update `origin` if adding new origins
- Health check endpoint: `GET /health`

## Frontend Patterns

### API Communication (`apiFetch`)

File: `apps/frontend/src/lib/api.ts`

```ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T>;
```

Key behaviours:

- Uses **native `fetch`** — never use axios
- Reads the auth token fresh from `localStorage` on every call
- Automatically sets `Content-Type: application/json` unless the body is `FormData`
- Automatically sets `Authorization: Bearer <token>` when a token exists
- Returns `undefined as T` for `204 No Content` responses
- Throws `new Error(data?.error || data?.message || 'HTTP ${status}')` on non-OK responses

In development, Vite proxies `/api → http://localhost:3000`, so always use relative `/api/...` paths in `apiFetch` calls.

```ts
// Correct — relative path, works in dev and prod
const todos = await apiFetch<Todo[]>('/api/todos');

// Wrong — hardcoded base URL
const todos = await apiFetch<Todo[]>('http://localhost:3000/api/todos');
```

### Layout System

`App.vue` selects a layout component based on `route.meta.layout`:

```ts
const currentLayout = computed(() =>
  route.meta.layout === 'auth' ? AuthLayout : DefaultLayout,
);
```

Route meta fields:

- `requiresAuth: true` — redirect to login if not authenticated
- `requiresGuest: true` — redirect to home if already authenticated
- `layout: 'default' | 'auth'` — selects the layout wrapper

All routes use **lazy loading** with dynamic `import()`. Always add `requiresAuth`, `requiresGuest`, and `layout` meta to new routes.

### Routing Conventions

- Auth views (`login-view.vue`, `register-view.vue`): `layout: 'auth'`, `requiresGuest: true`
- All other views: `layout: 'default'`, `requiresAuth: true`
- New routes go in `apps/frontend/src/router/index.ts`

## State Management (Pinia)

Use the **Setup Store** pattern for all stores. Never use the Options Store pattern.

```ts
export const useXxxStore = defineStore('xxx', () => {
  // State
  const items = ref<Item[]>([]);
  const selectedId = ref<string | null>(null);

  // Getters (computed)
  const selectedItem = computed(
    () => items.value.find((i) => i.id === selectedId.value) ?? null,
  );

  // Actions
  function upsert(item: Item) {
    const idx = items.value.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items.value[idx] = item;
    } else {
      items.value.unshift(item);
    }
  }

  function remove(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
  }

  return { items, selectedId, selectedItem, upsert, remove };
});
```

### Auth Store Specifics

File: `apps/frontend/src/stores/auth.store.ts`

- Reads/writes `localStorage` key `pocketbase_auth` as `{ token, model }`
- Validates JWT expiry client-side by decoding the base64 payload — no server roundtrip
- Provides `isAuthenticated` (computed), `user` (ref)
- `initAuth()` — restores session from `localStorage` on app startup
- `login(credentials)` / `register(credentials)` — handle auth flows and persist session
- `logout()` — clears in-memory state and `localStorage`
- `refreshAuth()` — validates/refreshes the JWT without a full login
- `updateProfile(data)` — updates the current user's profile data

### Todo Store Specifics

File: `apps/frontend/src/stores/todo.store.ts`

- `todos: ref<Todo[]>` — the full list of todos
- `filter: ref<TodoFilter>('all')` — current filter state; values: `'all'`, `'active'`, `'completed'`
- `isLoading: ref(false)` — loading state
- `error: ref<string | null>(null)` — error message
- `filteredTodos` (computed) — returns todos filtered by the `filter` ref
- `upsert(todo)` — updates in-place or unshifts to the front of the list
- `setFilter(filter: TodoFilter)` — update the active filter
- `setLoading(isLoading: boolean)` — update loading state
- `setError(error: string | null)` — set/clear error
- All async operations (fetch, create, update, delete) live in composables, not the store

## Composable Patterns

### Standard Structure

All composables follow this pattern:

```ts
export function useXxx() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function doSomething(payload: PayloadType) {
    loading.value = true;
    error.value = null;
    try {
      const result = await apiFetch<ResponseType>('/api/xxx', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      // Update store or local state
      return result;
    } catch (err: unknown) {
      error.value = (err as Error)?.message || 'Operation failed';
      console.error('useXxx.doSomething:', err);
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, doSomething };
}
```

Rules:

- Always expose `loading` and `error` refs
- Clear `error` at the start of each async operation
- Always use `finally` to reset `loading`
- Cast caught errors as `(err as Error)?.message`
- Log errors with a descriptive context prefix

### `usePageRefetch`

File: `apps/frontend/src/composables/use-page-refetch.ts`

Calls `fetchFn` on `onMounted` and again whenever `document.visibilityState` becomes `visible`. Cleans up in `onUnmounted`. Use this in every view that needs fresh data when the user returns to the tab.

```ts
usePageRefetch(fetchTodos);
```

### Operation Result Pattern

For composables dealing with Notes, Tags, and Events, return a typed result object rather than throwing:

```ts
interface XxxOperationResult<T = Xxx> {
  success: boolean;
  error?: string;
  data?: T;
}
```

Use this pattern when the caller needs to distinguish success from failure without a try/catch at the call site.

### Domain-Specific Notes

- **Notes**: auto-save uses `setTimeout` (stored as `number | null`); sorted pinned-first then by `updated` descending
- **Tags**: sorted alphabetically by `name`
- **Events**: `toPocketBaseDate(dateStr)` converts Schedule-X's 16-character `"YYYY-MM-DD HH:mm"` format to `"YYYY-MM-DD HH:mm:ss"` for PocketBase; use this helper whenever saving event dates

## TypeScript Conventions

### Type File Organisation

One type file per domain in `apps/frontend/src/types/`:

| File                | Domain                              |
| ------------------- | ----------------------------------- |
| `auth.types.ts`     | User, auth session                  |
| `note.types.ts`     | Note, NoteOperationResult           |
| `tag.types.ts`      | Tag, TagOperationResult             |
| `calendar.types.ts` | CalendarEvent, EventOperationResult |
| `todo.types.ts`     | Todo                                |

Add new types to the appropriate domain file. Create a new `*.types.ts` file only for a genuinely new domain.

### Backend Route Generics

Always type `Body` and `Params` on Fastify route handlers:

```ts
fastify.post<{ Body: { title: string; completed: boolean } }>('/', async (req) => {
  const { title, completed } = req.body // fully typed
})

fastify.patch<{
  Params: { id: string }
  Body: { title?: string; completed?: boolean }
}>('/:id', async (req) => { ... })
```

### Shared Types

Import from `@todo-app/shared` for any type defined in `packages/shared/src/`:

```ts
import type { Todo } from '@todo-app/shared';
```

Never use a relative cross-package import like `../../packages/shared/src/types/todo`.

## File and Naming Conventions

| Artefact                        | Convention    | Example                                                 |
| ------------------------------- | ------------- | ------------------------------------------------------- |
| All files                       | `kebab-case`  | `todo-form.vue`                                         |
| Vue views                       | `*-view.vue`  | `notes-view.vue`                                        |
| Pinia stores                    | `*.store.ts`  | `auth.store.ts`                                         |
| Composables                     | `use-*.ts`    | `use-todos.ts`                                          |
| Type files                      | `*.types.ts`  | `note.types.ts`                                         |
| Backend routes                  | `*.route.ts`  | `todos.route.ts`                                        |
| Backend plugins                 | `*.plugin.ts` | `pocketbase.plugin.ts`                                  |
| Backend schemas                 | `*.schema.ts` | `todo.schema.ts`                                        |
| Component directories           | feature-based | `auth/`, `calendar/`, `notes/`, `tags/`, `todo/`, `ui/` |
| Component names (code)          | PascalCase    | `TodoItem`, `NoteEditor`                                |
| Composable/store/function names | camelCase     | `useTodos`, `todoStore`                                 |

## Component Structure

These rules complement the generic component rules in `vuejs3.instructions.md`:

### Presentational vs Container

- **Presentational components** (`components/`): receive data via props, emit events, never access stores or composables directly
- **Container/view components** (`views/`): access stores with `storeToRefs(store)`, call composables, pass data down to presentational components

### Props and Emits

```ts
// Props — always typed with defineProps generic
const props = defineProps<{
  todo: Todo;
  isSelected?: boolean;
}>();

// Emits — always typed with defineEmits generic
const emit = defineEmits<{
  toggle: [id: string];
  delete: [id: string];
}>();
```

Do not use `withDefaults` unless a prop genuinely needs a non-undefined default value.

### Accessing Store State in Components

Always destructure with `storeToRefs` to preserve reactivity:

```ts
const todoStore = useTodoStore();
const { todos, filter } = storeToRefs(todoStore);
// Actions (non-reactive) can be destructured directly
const { upsert, remove } = todoStore;
```

## DaisyUI and Theming

Use DaisyUI utility classes for all interactive UI elements. Common classes in use:

`btn`, `btn-primary`, `btn-ghost`, `btn-sm`, `card`, `card-body`, `card-title`, `checkbox`, `navbar`, `dropdown`, `dropdown-content`, `modal`, `modal-box`, `input`, `input-bordered`, `select`, `badge`, `loading`, `loading-spinner`, `alert`, `footer`, `drawer`, `menu`, `avatar`

Theme switching:

```ts
// Apply theme
document.documentElement.setAttribute('data-theme', theme);
// Persist
localStorage.setItem('theme', theme);
```

Read the persisted theme on app init in `main.ts` or `App.vue`'s `onMounted`.

## PocketBase Data Model

All collections enforce `userId = @request.auth.id` for every CRUD rule — data isolation is at the DB level.

### Collections

**todos**

- `title` — string, required
- `completed` — bool
- `userId` — relation → `users`, cascade delete

**tags**

- `name` — string, required, min 1 / max 50
- `color` — string, hex required
- `userId` — relation → `users`; name is unique per user

**notes**

- `title` — string, required
- `content` — string, optional, max 100 000 chars
- `isPinned` — bool
- `userId` — relation → `users`
- `tags` — relation → `tags`, multi-value
- `attachments` — file, max 5 files, max 10 MB each

**events**

- `title` — string, required
- `description` — rich text (editor), optional
- `start` — date, required
- `end` — date, required
- `isAllDay` — bool
- `color` — string, hex, optional
- `userId` — relation → `users`
- `tags` — relation → `tags`, multi-value

**users** (PocketBase auth collection)

- `name` — string, required
- `avatar` — file, image; thumbs: 100×100, 200×200, 500×500
- Standard PocketBase auth fields (email, password, etc.)

### Migrations

Migration files in `pocketbase/pb_migrations/` are numbered `17000000XX_<description>.js`. Add new migrations with the next sequential number. Do not edit existing migration files.

## Security Patterns

### Markdown Rendering

Always render Markdown through both `marked` (parsing) and `DOMPurify` (sanitisation) with an explicit allowlist. Never bypass sanitisation:

```ts
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const html = DOMPurify.sanitize(marked.parse(raw), {
  ALLOWED_TAGS: [...],   // explicit allowlist
  ALLOWED_ATTR: [...],
})
```

Never use `v-html` with unsanitised content. The `use-markdown-renderer.ts` composable handles this — use it rather than calling `marked`/`DOMPurify` inline.

### Auth Token Storage

Auth tokens are stored in `localStorage` (key: `pocketbase_auth`). This is an intentional tradeoff documented in `AUTH_SYSTEM.md`. Do not move tokens to memory or cookies without reviewing that document first.

### CORS

The backend allows two origins: `http://localhost:5173` and `http://127.0.0.1:5173`. Any change to allowed origins must be an explicit, deliberate update to `server.ts` — do not widen the allowlist without justification.

### Data Isolation

Collection-level rules in PocketBase (`userId = @request.auth.id`) are the primary data isolation mechanism. Never query a collection without trusting that `req.pb` carries the correct user token.

## Common Pitfalls

These are known gaps or gotchas in the current codebase. Be aware of them when making changes.

1. **`axios` is a dead dependency.** It is listed in `package.json` but never imported. Always use `apiFetch` from `apps/frontend/src/lib/api.ts`.

2. **`fastify.pb` is never used in routes.** The shared singleton on `fastify.pb` exists but all route handlers must use `req.pb` for user-scoped, token-injected requests.

3. **`todo.schema.ts` is not wired up.** The schema file exists in `apps/backend/src/schemas/` but is not attached to any Fastify route. Do not rely on Fastify-level body validation for todos — PocketBase validates at the DB layer.

4. **PocketBase SDK versions diverge.** Backend uses `^0.22.0`, frontend uses `^0.26.8`. Do not assume the same API surface — check the SDK version for the package you are working in.

5. **`.env.example` contains the wrong variable name.** `apps/frontend/.env.example` exists but declares `VITE_POCKETBASE_URL`, which is **unused**. The correct variable is `VITE_API_URL` (read in `apps/frontend/src/lib/api.ts`). No backend `.env.example` exists — the required backend env var is `PB_URL` (defaults to `http://127.0.0.1:8090`). Document any new env vars in the README.

6. **No tests exist.** There are no test files anywhere in the monorepo. When adding new logic, consider this the baseline — do not assume existing coverage.

7. **Schedule-X has no official Vue wrapper in use.** The `@schedule-x/vue` package is not installed. The calendar is initialised manually using the headless `@schedule-x/calendar` API inside `use-calendar.ts` — follow the existing initialisation pattern when modifying calendar features.

8. **`packages/shared` has no build step.** TypeScript source is imported directly. Do not add a build step or `dist/` output without updating all referencing packages.
