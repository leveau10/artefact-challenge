import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

export async function createContext() {
  return {};
}

export type Context = Awaited<ReturnType<typeof createContext>>;

function formatIssue(issue: z.core.$ZodIssue) {
  return issue.path.length > 0 ? `${issue.path.map(String).join(".")}: ${issue.message}` : issue.message;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? error.cause : null;
    return {
      ...shape,
      message: zodError ? zodError.issues.map(formatIssue).join("; ") : shape.message,
      data: {
        ...shape.data,
        fieldErrors: zodError
          ? (z.flattenError(zodError).fieldErrors as Record<string, string[] | undefined>)
          : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;