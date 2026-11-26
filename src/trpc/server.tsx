import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { appRouter, createCaller } from "@/backend/routers/_app";
import { createContext } from "@/backend/trpc";
import { queryClient } from "./query-client";


export const getQueryClient = cache(queryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export const caller = createCaller(createContext);

export function HydrateClient({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>;
}