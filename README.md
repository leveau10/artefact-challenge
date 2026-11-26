# Task Manager

A small task manager built with Next.js 15 and tRPC.

## Running it

Requires Node.js 18.18 or newer (developed on Node 22).

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

`npm run lint` runs ESLint.

## Stack

- **Next.js 15** (App Router), React 19, Tailwind CSS 4
- **tRPC 11** with the TanStack React Query integration
- **zod 4** for validation, **superjson** so dates stay `Date` objects
- **sonner** for toasts

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # server component: prefetches the first page of tasks
│   ├── layout.tsx                # tRPC/React Query provider and the toaster
│   ├── loading.tsx, error.tsx, not-found.tsx
│   └── api/trpc/[trpc]/route.ts  # HTTP endpoint for the tRPC router
├── backend/
│   ├── trpc.ts                   # tRPC init, superjson, error formatter
│   ├── task-store.ts             # in-memory store (a Map)
│   └── routers/                  # task router: list, create, update, delete
├── schema/task-schema.ts         # zod schemas, shared by the form and the API
├── trpc/                         # client provider, server-side proxy, QueryClient
└── components/                   # task board, list, form, modal
```
## API

| Procedure     | Input                                  | Returns                              |
| ------------- | -------------------------------------- | ------------------------------------ |
| `task.list`   | `{ limit?, cursor? }`                  | `{ items: Task[], nextCursor }`      |
| `task.create` | `{ title, description? }`              | the new `Task`                       |
| `task.update` | `{ id, title?, description? }`         | the updated `Task`                   |
| `task.delete` | `{ id }`                               | `{ id }`                             |

A task is `{ id, title, description?, createdAt }`. The title is required (1–50 characters after trimming), and the description is optional (up to 200).

Errors:

- `BAD_REQUEST` for invalid input, with a readable `message` (e.g. `title: Title is required`) and per-field messages in `data.fieldErrors`.
- `NOT_FOUND` when updating or deleting an id that doesn't exist.

## Decisions and limits

- **Shared validation.** The form validates with the same zod schema the API uses, so a blank title is rejected before it leaves the browser.
- **Store on `globalThis`.** Next bundles the page and the API route separately. Without `globalThis` they would each get their own copy of the store. It also survives hot reloads in dev.
- **Dates in UTC.** Dates are shown in UTC with a fixed locale, so the server and the browser render the same text.
- **Field names.** Fields are named in English: `title`, `description` and `createdAt` (the brief's `titulo`, `descricao` and `dataCriacao`).
- **Limits.** Data is per server process: it is lost on restart and not shared between instances. There is no authentication.
