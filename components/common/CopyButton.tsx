"use client";

import cn from "@/utils/cn";
import { Check, Copy } from "lucide-react";
import {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const RESET_MS = 1500;

/** Clipboard write with a hidden-textarea fallback (http, older browsers). */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied etc. - try the fallback.
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    const previous = document.activeElement as HTMLElement | null;
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    previous?.focus();
    return ok;
  } catch {
    return false;
  }
};

/**
 * Small icon button that copies `value`. Shows a checkmark for 1.5s and
 * announces the result politely. Never triggers a surrounding row/link action.
 */
export default function CopyButton({
  value,
  label,
  className,
  size = 14,
}: {
  value: string;
  /** What is copied, e.g. "student ID" -> aria-label "Copy student ID". */
  label: string;
  className?: string;
  size?: number;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyText(value);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), RESET_MS);
  };

  // Keep Enter/Space from reaching row-level keyboard handlers.
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") e.stopPropagation();
  };

  if (!value) return null;

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={onClick}
        onKeyDown={onKeyDown}
        aria-label={`Copy ${label}`}
        title={state === "copied" ? "Copied" : `Copy ${label}`}
        className={cn(
          "inline-flex items-center justify-center rounded-md p-1 text-zinc-400 hover:text-black hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-black transition-colors",
          state === "copied" && "text-emerald-600 hover:text-emerald-600",
          state === "failed" && "text-rose-600 hover:text-rose-600",
          className,
        )}
      >
        {state === "copied" ? (
          <Check size={size} aria-hidden="true" />
        ) : (
          <Copy size={size} aria-hidden="true" />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied"
          ? "Copied"
          : state === "failed"
            ? "Could not copy"
            : ""}
      </span>
    </span>
  );
}

/** An ID (or any short code) followed by its copy button. */
export function CopyableId({
  value,
  label,
  className,
  children,
}: {
  value: string | null | undefined;
  label: string;
  className?: string;
  /** Custom rendering of the value (defaults to the value itself). */
  children?: ReactNode;
}) {
  if (!value) return null;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span>{children ?? value}</span>
      <CopyButton value={value} label={label} size={12} />
    </span>
  );
}
