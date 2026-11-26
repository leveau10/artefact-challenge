import { z } from "zod";

export const TITLE_MAX = 30;
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

export type CreateTaskLogic = z.infer<typeof createTaskSchema>;
export type UpdateTaskLogic = z.infer<typeof updateTaskSchema>;

// task schema for the database
export type Task = {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
};