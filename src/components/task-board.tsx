"use client";

import { useState } from "react";
import type { Task } from "@/schema/task-schema";
import { primaryButton } from "./button-styles";
import { Modal } from "./modal";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";

type ModalState = { mode: "create" } | { mode: "edit"; task: Task } | null;

export function TaskBoard() {
  const [modal, setModal] = useState<ModalState>(null);

  const openCreate = () => setModal({ mode: "create" });
  const openEdit = (task: Task) => setModal({ mode: "edit", task });
  const closeModal = () => setModal(null);

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <button type="button" className={primaryButton} onClick={openCreate}>
          New task
        </button>
      </header>

      <TaskList onCreate={openCreate} onEdit={openEdit} />

      <Modal
        open={modal !== null}
        title={modal?.mode === "edit" ? "Edit task" : "New task"}
        onClose={closeModal}
      >
        <TaskForm task={modal?.mode === "edit" ? modal.task : undefined} onClose={closeModal} />
      </Modal>
    </>
  );
}
