"use client";

import Modal from "@/components/Modal";
import { Button, ErrorMsg } from "@/components/Form";
import { ReactNode } from "react";

/**
 * Accessible confirmation dialog built on Modal. The confirm action is
 * disabled while `loading`; `error` is shown inline (e.g. 409 messages).
 */
const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Modal title={title} onClose={onCancel} size="sm">
    <div className="space-y-4">
      <div className="text-sm text-zinc-600">{message}</div>
      <ErrorMsg message={error} />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          data-autofocus
          className="flex-1 py-3 mt-4 rounded-xl font-bold border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <Button
          type="button"
          loading={loading}
          onClick={onConfirm}
          className={`flex-1 ${destructive ? "bg-rose-600 hover:bg-rose-700" : ""}`}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
