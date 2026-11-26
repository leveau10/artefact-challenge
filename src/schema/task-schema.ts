import { z } from "zod";

export const TITLE_MAX = 50;
export const DESCRIPTION_MAX = 200;

// rules to create a task
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(TITLE_MAX, `The title must be at most ${TITLE_MAX} characters`),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `The description must be at most ${DESCRIPTION_MAX} characters`)
    .optional(),
});

//rules to update a task
export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().min(1),
});

export const taskIdSchema = z.object({
  id: z.string().min(1),
});

export const PAGE_SIZE = 10;

// rules to list a page of tasks. The cursor points at the last task of the previous page
export const listTasksSchema = z.object({
  limit: z.number().int().min(1).max(50).default(PAGE_SIZE),
  cursor: z.object({ createdAt: z.date(), id: z.string() }).nullish(),
});

export type TaskCursor = NonNullable<z.infer<typeof listTasksSchema>["cursor"]>;
export type CreateTaskLogic = z.infer<typeof createTaskSchema>;
export type UpdateTaskLogic = z.infer<typeof updateTaskSchema>;

// task schema for the database
export type Task = {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
};