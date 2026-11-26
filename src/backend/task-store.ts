import type { CreateTaskLogic, Task, TaskCursor, UpdateTaskLogic } from "@/schema/task-schema";

type TaskMap = Map<string, Task>;

// Keep the store on globalThis, in dev and in production. Next bundles the page and the
// /api/trpc route separately, each with its own copy of this module. Without globalThis the
// SSR prefetch and the API would read different Maps. It also survives hot reloads in dev.
const globalForTasks = globalThis as typeof globalThis & { __tasks?: TaskMap };

// function to create a seed of tasks.
function createSeed(): TaskMap {
  const examples: Task[] = [
    {
      id: crypto.randomUUID(),
      title: "Complete the Artefact challenge",
      description: "Check if all requirements are met before submitting.",
      createdAt: new Date(Date.now() - 5 * 60_000),
    },
    {
      id: crypto.randomUUID(),
      title: "Check your email.",
      description: "Look for any important messages or updates.",
      createdAt: new Date(Date.now() - 2* 60_000),
    },
  ];
  return new Map(examples.map((task) => [task.id, task]));
}

const tasks: TaskMap = (globalForTasks.__tasks ??= createSeed());

export const taskStore = {
  // list one page of tasks, newest first.
  // The cursor is the (createdAt, id) of the last task already shown, not an offset,
  // so creating or deleting tasks between pages never skips or repeats one.
  list({ limit, cursor }: { limit: number; cursor?: TaskCursor | null }) {
    const sorted = [...tasks.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || (a.id < b.id ? 1 : -1),
    );
    const rest = cursor
      ? sorted.filter(
          (task) =>
            task.createdAt < cursor.createdAt ||
            (task.createdAt.getTime() === cursor.createdAt.getTime() && task.id < cursor.id),
        )
      : sorted;

    const items = rest.slice(0, limit);
    const last = items.at(-1);
    const nextCursor: TaskCursor | null =
      rest.length > limit && last ? { createdAt: last.createdAt, id: last.id } : null;
    return { items, nextCursor };
  },

  create(input: CreateTaskLogic): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description || undefined,
      createdAt: new Date(),
    };
    tasks.set(task.id, task);
    return task;
  },

  update(id: string, changes: Omit<UpdateTaskLogic, "id">): Task | undefined {
    const existing = tasks.get(id);
    if (!existing) return undefined;
    const merged = { ...existing, ...changes };
    // An empty description is stored as missing, the same as a task created without one.
    // This happens here and not in the zod schema: in a partial update, a missing field means
    // "keep the old value", so the schema must let "" through for the user to clear it.
    const updated: Task = { ...merged, description: merged.description || undefined };
    tasks.set(id, updated);
    return updated;
  },

  remove(id: string): boolean {
    return tasks.delete(id);
  },
};