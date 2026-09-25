"use client";

import cn from "@/utils/cn";
import { X } from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi>({
  show: () => {},
  success: () => {},
  error: () => {},
});

const TIMEOUT_MS = 5000;

/**
 * Small accessible toast stack. Success/info toasts are announced politely;
 * errors use role="alert" (assertive).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), TIMEOUT_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m) => show(m, "success"),
      error: (m) => show(m, "error"),
    }),
    [show],
  );

  const renderToast = (t: ToastItem) => (
    <div
      key={t.id}
      role={t.kind === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg bg-white",
        t.kind === "error"
          ? "border-rose-200 text-rose-700"
          : t.kind === "success"
            ? "border-emerald-200 text-emerald-700"
            : "border-zinc-200 text-zinc-700",
      )}
    >
      <p className="flex-1">{t.message}</p>
      <button
        type="button"
        onClick={() => dismiss(t.id)}
        aria-label="Dismiss notification"
        className="text-zinc-400 hover:text-black"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-200 flex w-full max-w-sm flex-col gap-2">
        {/* Live regions exist before any toast so screen readers announce them. */}
        <div aria-live="polite" className="flex flex-col gap-2">
          {toasts.filter((t) => t.kind !== "error").map(renderToast)}
        </div>
        <div aria-live="assertive" className="flex flex-col gap-2">
          {toasts.filter((t) => t.kind === "error").map(renderToast)}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export default ToastProvider;
