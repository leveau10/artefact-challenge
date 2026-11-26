"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PAGE_SIZE, type Task } from "@/schema/task-schema";
import { useTRPC } from "@/trpc/client";
import { dangerButton, secondaryButton } from "./button-styles";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

type TaskListProps = {
  onCreate: () => void;
  onEdit: (task: Task) => void;
};

export function TaskList({ onCreate, onEdit }: TaskListProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.task.list.infiniteQueryOptions(
        { limit: PAGE_SIZE },
        { getNextPageParam: (lastPage) => lastPage.nextCursor },
      ),
    );
  const tasks = data.pages.flatMap((page) => page.items);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const canLoadMore = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;

  useEffect(() => {
    if (!canLoadMore) return;

    let lastScrollY = window.scrollY;
    const isNearBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
    const loadMore = () => void fetchNextPage({ cancelRefetch: false });

    function onScroll() {
      const movedDown = window.scrollY > lastScrollY;
      lastScrollY = window.scrollY;
      if (movedDown && isNearBottom()) loadMore();
    }

    function onWheel(event: WheelEvent) {
      if (event.deltaY > 0 && isNearBottom()) loadMore();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
    };
  }, [canLoadMore, fetchNextPage]);

  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Task deleted");
      },
      onError: (error) => {
        toast.error(`Could not delete the task. ${error.message}`);
      },
      onSettled: async () => {
        setConfirmingId(null);
        await queryClient.invalidateQueries({ queryKey: trpc.task.list.infiniteQueryKey() });
      },
    }),
  );

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
        <p>No tasks yet.</p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-1 font-medium text-blue-600 hover:underline"
        >
          Create your first task
        </button>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {tasks.map((task) => {
          const isConfirming = confirmingId === task.id;
          const isDeleting = deleteTask.isPending && deleteTask.variables?.id === task.id;

          return (
            <li
              key={task.id}
              className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${isDeleting ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium break-words text-gray-900">{task.title}</h2>
                  {task.description && (
                    <p className="mt-1 text-sm whitespace-pre-line break-words text-gray-600">
                      {task.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Created{" "}
                    <time dateTime={task.createdAt.toISOString()}>
                      {dateFormatter.format(task.createdAt)} UTC
                    </time>
                  </p>
                </div>

                <div className="grid shrink-0 justify-items-end">
                  <div className={`col-start-1 row-start-1 flex gap-2 ${isConfirming ? "invisible" : ""}`}>
                    <button type="button" className={secondaryButton} onClick={() => onEdit(task)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={secondaryButton}
                      disabled={deleteTask.isPending}
                      onClick={() => setConfirmingId(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className={`col-start-1 row-start-1 flex gap-2 ${isConfirming ? "" : "invisible"}`}>
                    <button
                      type="button"
                      className={dangerButton}
                      disabled={isDeleting}
                      onClick={() => deleteTask.mutate({ id: task.id })}
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      className={secondaryButton}
                      disabled={isDeleting}
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="py-6 text-center text-sm text-gray-500">
        {isFetchingNextPage ? (
          <p role="status">Loading more tasks…</p>
        ) : isFetchNextPageError ? (
          <p role="alert" className="text-red-600">
            Could not load more tasks.{" "}
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              className="font-medium text-blue-600 hover:underline"
            >
              Try again
            </button>
          </p>
        ) : hasNextPage ? (
          <button type="button" onClick={() => void fetchNextPage()} className="hover:underline">
            Load more
          </button>
        ) : (
          <p>You&apos;ve reached the end of the list.</p>
        )}
      </div>
    </>
  );
}
