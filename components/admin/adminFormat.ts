import type { AdminActivity } from "@/types/AdminDetails";
import { ACCESS_LEVEL_LABELS, normaliseAccessLevel } from "@/utils/adminAccess";

/** "25 Sep 2026, 14:05" in Lagos time, or "Never" */
export const formatDateTime = (value: string | Date | null | undefined, empty = "Never") => {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return empty;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
};

const FIELD_LABELS: Record<string, string> = {
  firstName: "first name",
  lastName: "last name",
  email: "email",
  role: "department",
};

const ACTION_LABELS: Record<string, string> = {
  created: "Account created",
  invite_sent: "Invitation emailed",
  deactivated: "Account deactivated",
  reactivated: "Account reactivated",
  reset_link_sent: "Password reset link emailed",
  temporary_password_set: "Temporary password set",
  signed_out_everywhere: "Signed out on every device",
  password_changed: "Password changed",
  password_reset: "Password set from an emailed link",
};

const levelLabel = (value: unknown) => ACCESS_LEVEL_LABELS[normaliseAccessLevel(value)];

/** One line describing an activity entry, e.g. "Access: Admin access → Read-only" */
export const describeActivity = (entry: AdminActivity): string => {
  if (entry.action === "access_changed") {
    const { from, to } = (entry.details ?? {}) as { from?: unknown; to?: unknown };
    return `Access changed: ${levelLabel(from)} → ${levelLabel(to)}`;
  }
  if (entry.action === "updated") {
    const fields = Object.keys(entry.details ?? {})
      .map((key) => FIELD_LABELS[key] ?? key)
      .join(", ");
    return fields ? `Updated ${fields}` : "Details updated";
  }
  if (entry.action === "reset_link_sent" && entry.details?.requestedBy === "self") {
    return "Requested a password reset link";
  }
  return ACTION_LABELS[entry.action] ?? entry.action.replace(/_/g, " ");
};
