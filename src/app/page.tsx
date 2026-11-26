import { TaskBoard } from "@/components/task-board";
import { PAGE_SIZE } from "@/schema/task-schema";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

// Render on every request: the data lives in memory and changes at runtime.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // SSR: render the first page on the server. Later pages load on scroll in the browser.
  await getQueryClient().prefetchInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: PAGE_SIZE },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <TaskBoard />
    </HydrateClient>
  );
}
