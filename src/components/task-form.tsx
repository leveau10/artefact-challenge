"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import { toast } from "sonner";
import { z } from "zod";
import { createTaskSchema, DESCRIPTION_MAX, TITLE_MAX, type Task } from "@/schema/task-schema";
import type { AppRouter } from "@/backend/routers/_app";
import { useTRPC } from "@/trpc/client";
import { primaryButton, secondaryButton } from "./button-styles";

type FieldErrors = { title?: string[]; description?: string[] };

type TaskFormProps = {
  task?: Task;
  onClose: () => void;
};

const fieldBase =
  "w-full rounded-md border bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 " +
  "focus:outline-2 focus:outline-offset-0 focus:outline-blue-600";

export function TaskForm({ task, onClose }: TaskFormProps) {
  const isEditing = task !== undefined;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Runs even if the modal was closed (Esc, ×, backdrop) while saving, so the list still refreshes.
  // Closing the modal is not done here. See handleSubmit.
  async function handleSuccess() {
    await queryClient.invalidateQueries({ queryKey: trpc.task.list.infiniteQueryKey() });
    toast.success(isEditing ? "Task updated" : "Task created");
  }

  function handleError(error: TRPCClientErrorLike<AppRouter>) {
    const serverFieldErrors = error.data?.fieldErrors;
    if (serverFieldErrors) {
      setFieldErrors({ title: serverFieldErrors.title, description: serverFieldErrors.description });
      setFormError("Please fix the highlighted fields.");
    } else {
      setFormError(error.message);
    }
    toast.error(isEditing ? "Could not update the task" : "Could not create the task");
  }

  const createTask = useMutation(
    trpc.task.create.mutationOptions({ onSuccess: handleSuccess, onError: handleError }),
  );
  const updateTask = useMutation(
    trpc.task.update.mutationOptions({ onSuccess: handleSuccess, onError: handleError }),
  );
  const isSaving = createTask.isPending || updateTask.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const result = createTaskSchema.safeParse({ title, description });
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setFieldErrors({});
    // onClose goes on mutate(), not useMutation(). TanStack skips mutate() callbacks once this
    // form has unmounted, so a save that finishes after the modal was closed can't close a
    // modal the user opened in the meantime. It runs after handleSuccess.
    if (task) {
      updateTask.mutate({ id: task.id, ...result.data }, { onSuccess: onClose });
    } else {
      createTask.mutate(result.data, { onSuccess: onClose });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">
          Title <span className="text-red-600">*</span>
        </label>
        <input
          id="title"
          name="title"
          value={title}
          maxLength={TITLE_MAX}
          placeholder="What needs to be done?"
          data-autofocus
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
          onChange={(event) => {
            setTitle(event.target.value);
            if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
          }}
          className={`${fieldBase} ${fieldErrors.title ? "border-red-500" : "border-gray-300"}`}
        />
        <div className="flex justify-between gap-4 text-xs text-gray-500">
          <span id="title-error" className="text-sm text-red-600">
            {fieldErrors.title?.[0]}
          </span>
          <span>
            {title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium">
          Description <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          maxLength={DESCRIPTION_MAX}
          placeholder="Add details about the task"
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={fieldErrors.description ? "description-error" : undefined}
          onChange={(event) => setDescription(event.target.value)}
          className={`${fieldBase} resize-y ${fieldErrors.description ? "border-red-500" : "border-gray-300"}`}
        />
        <div className="flex justify-between gap-4 text-xs text-gray-500">
          <span id="description-error" className="text-sm text-red-600">
            {fieldErrors.description?.[0]}
          </span>
          <span>
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className={secondaryButton} onClick={onClose} disabled={isSaving}>
          Cancel
        </button>
        <button type="submit" className={primaryButton} disabled={isSaving}>
          {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}
