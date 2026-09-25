"use client";

import { AlertCircle, Inbox, LoaderCircle, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobal } from "@/app/GlobalProvider";
import { getErrorMessage, getErrorStatus } from "./errors";

const boxClass =
  "flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center";

export const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <div className={boxClass} role="status" aria-live="polite">
    <LoaderCircle className="mb-4 h-8 w-8 animate-spin text-slate-400" aria-hidden />
    <p className="text-sm font-semibold text-slate-600">{label}</p>
  </div>
);

/**
 * A 401 means the session expired: drop the cached user/data and send the
 * student back to sign in instead of showing an error.
 */
export const useSignOutOnUnauthorized = (error: unknown) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { removeUser } = useGlobal();
  const unauthorized = getErrorStatus(error) === 401;

  useEffect(() => {
    if (!unauthorized) return;
    removeUser();
    queryClient.clear();
    router.replace("/auth");
  }, [unauthorized, removeUser, queryClient, router]);

  return unauthorized;
};

export const ErrorState = ({
  error,
  title = "We couldn't load this",
  onRetry,
}: {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}) => {
  const unauthorized = useSignOutOnUnauthorized(error);
  if (unauthorized) return <LoadingState label="Your session has ended. Redirecting to sign in..." />;

  return (
    <div className={`${boxClass} border-red-200`} role="alert">
      <AlertCircle className="mb-4 h-8 w-8 text-red-500" aria-hidden />
      <p className="text-base font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{getErrorMessage(error)}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
}) => (
  <div className={boxClass}>
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
      <Icon className="h-7 w-7 text-slate-500" aria-hidden />
    </div>
    <p className="text-base font-bold text-slate-900">{title}</p>
    {description && <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
