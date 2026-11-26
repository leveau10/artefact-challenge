import { TRPCError } from "@trpc/server";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "@/schema/task-schema";
import { taskStore } from "@/backend/task-store";
import { publicProcedure, router } from "@/backend/trpc";

//error message for when a task is not found
function taskNotFound() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Task not found.",
  });
}

export const taskRouter = router({
  list: publicProcedure.query(() => taskStore.list()),

  getById: publicProcedure.input(taskIdSchema).query(({ input }) => {
    const task = taskStore.get(input.id);
    if (!task) throw taskNotFound();
    return task;
  }),

  create: publicProcedure
    .input(createTaskSchema)
    .mutation(({ input }) => taskStore.create(input)),

  update: publicProcedure.input(updateTaskSchema).mutation(({ input }) => {
    const { id, ...changes } = input;
    const task = taskStore.update(id, changes);
    if (!task) throw taskNotFound();
    return task;
  }),

  delete: publicProcedure.input(taskIdSchema).mutation(({ input }) => {
    const deleted = taskStore.remove(input.id);
    if (!deleted) throw taskNotFound();
    return { id: input.id };
  }),
});