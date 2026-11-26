import type { CreateTaskLogic, Task, UpdateTaskLogic } from "@/schema/task-schema";

type TaskMap = Map<string, Task>;

// keep the store on globalThis to survive nextjs hot reloads. dev only
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
  // list tasks sorted by creation date
  list(): Task[] {
    return [...tasks.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  get(id: string): Task | undefined {
    const task = tasks.get(id);
    if (!task) return undefined;
    return task;
  },

  create(input: CreateTaskLogic): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      createdAt: new Date(),
    };
    tasks.set(task.id, task);
    return task;
  },

  update(id: string, changes: Omit<UpdateTaskLogic, "id">): Task | undefined {
    const existing = tasks.get(id);
    if (!existing) return undefined;
    const updated: Task = { ...existing, ...changes };
    tasks.set(id, updated);
    return updated;
  },

  remove(id: string): boolean {
    return tasks.delete(id);
  },
};