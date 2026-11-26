import { router } from "@/backend/trpc";
import { taskRouter } from "./task";

export const appRouter = router({
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
