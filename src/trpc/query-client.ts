import { QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

export function queryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // prevents refetching every time the window is refocused
        staleTime: 5 * 1000,
      },
      //used to serialize and deserialize data when using react-query with tRPC
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });
}