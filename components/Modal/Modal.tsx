"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import { ReactNode, useEffect, useId, useRef } from "react";

const FOCUSABLE =
  'a[href], button:enabled, textarea:enabled, input:enabled:not([type="hidden"]), select:enabled, [tabindex]:not([tabindex="-1"])';

const Modal = ({
  title,
  onClose,
  children,
  size = "lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "lg";
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Initial focus, focus restore, Escape and Tab trapping.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;

    const focusables = () =>
      dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null || el === document.activeElement,
          )
        : [];

    // Prefer the first form field; fall back to the dialog itself.
    const first =
      dialog?.querySelector<HTMLElement>("[data-autofocus]") ??
      dialog?.querySelector<HTMLElement>(
        "input:enabled, select:enabled, textarea:enabled",
      ) ??
      dialog;
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Let open listboxes/comboboxes close themselves first.
        if (e.defaultPrevented) return;
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === firstEl || active === dialog)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      } else if (active && !dialog.contains(active)) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-3xl w-full ${size === "sm" ? "max-w-md" : "max-w-lg"} overflow-hidden shadow-2xl focus:outline-none`}
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-bold text-zinc-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-black transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-auto p-6">{children}</div>
      </motion.div>
    </div>
  );
};

export default Modal;
