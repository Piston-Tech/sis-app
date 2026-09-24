import formatMoney from "@/utils/formatMoney";
import type { Numeric, StudentEnrollment, StudentSession, StudentTransaction } from "./types";

/** Parses a backend number (numbers, decimal strings). Returns null if unknown. */
export const toAmount = (value: Numeric | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** "₦12,500.00", or "—" when the amount is unknown. */
export const naira = (value: Numeric | null | undefined) => {
  const amount = toAmount(value);
  return amount === null ? "—" : formatMoney(amount, true, "Nigerian Naira");
};

export const formatDate = (
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, options);
};

export const courseTitle = (enrollment: StudentEnrollment) =>
  enrollment.class?.customClass?.title ||
  enrollment.class?.course?.title ||
  "Untitled course";

export const courseDescription = (enrollment: StudentEnrollment) =>
  enrollment.class?.customClass?.description ||
  enrollment.class?.course?.description ||
  "";

/* ---------------------------------------------------------------- money */

export interface TransactionSummary {
  transaction: StudentTransaction;
  enrollments: StudentEnrollment[];
  /** null when the backend didn't return a total */
  total: number | null;
  discount: number;
  paid: number;
  /** null when the total is unknown */
  outstanding: number | null;
}

export const paidOn = (transaction: StudentTransaction) => {
  const fromBackend = toAmount(transaction.totalPaid);
  if (fromBackend !== null) return fromBackend;
  // Fallback: only count payments the academy has confirmed.
  return (transaction.payments ?? [])
    .filter((payment) => /^(received|confirmed)$/i.test(payment.status ?? ""))
    .reduce((sum, payment) => sum + (toAmount(payment.amountPaid) ?? 0), 0);
};

export const summariseTransaction = (
  transaction: StudentTransaction,
  enrollments: StudentEnrollment[] = [],
): TransactionSummary => {
  const total = toAmount(transaction.total);
  const discount = toAmount(transaction.discount) ?? 0;
  const paid = paidOn(transaction);
  return {
    transaction,
    enrollments,
    total,
    discount,
    paid,
    outstanding: total === null ? null : Math.max(0, total - discount - paid),
  };
};

/** One summary per distinct transaction referenced by the enrollments. */
export const groupByTransaction = (
  enrollments: StudentEnrollment[],
): TransactionSummary[] => {
  const groups = new Map<number, { transaction: StudentTransaction; items: StudentEnrollment[] }>();
  enrollments.forEach((enrollment) => {
    const transaction = enrollment.transaction;
    if (!transaction?.id) return;
    const group = groups.get(transaction.id) ?? { transaction, items: [] };
    group.items.push(enrollment);
    groups.set(transaction.id, group);
  });
  return Array.from(groups.values())
    .map(({ transaction, items }) => summariseTransaction(transaction, items))
    .sort(
      (a, b) =>
        new Date(b.transaction.createdAt ?? 0).getTime() -
        new Date(a.transaction.createdAt ?? 0).getTime(),
    );
};

export interface AccountTotals {
  billed: number;
  paid: number;
  outstanding: number;
  /** true if any transaction has no total, so the figures are incomplete */
  hasUnknownTotals: boolean;
  count: number;
}

export const accountTotals = (groups: TransactionSummary[]): AccountTotals =>
  groups.reduce<AccountTotals>(
    (acc, group) => ({
      billed: acc.billed + (group.total === null ? 0 : group.total - group.discount),
      paid: acc.paid + group.paid,
      outstanding: acc.outstanding + (group.outstanding ?? 0),
      hasUnknownTotals: acc.hasUnknownTotals || group.total === null,
      count: acc.count + 1,
    }),
    { billed: 0, paid: 0, outstanding: 0, hasUnknownTotals: false, count: 0 },
  );

export const paymentStatusLabel = (totals: AccountTotals) => {
  if (totals.count === 0) return "No invoices yet";
  if (totals.outstanding > 0) return totals.paid > 0 ? "Partially paid" : "Payment pending";
  return totals.hasUnknownTotals ? "Awaiting invoice total" : "All settled";
};

/* ------------------------------------------------------------- sessions */

const parseTime = (value: string | undefined, fallback: [number, number]) => {
  const [h, m] = String(value ?? "").split(":").map((part) => parseInt(part, 10));
  return [Number.isFinite(h) ? h : fallback[0], Number.isFinite(m) ? m : fallback[1]] as const;
};

/** Local calendar day of a session (ignores the UTC time part of `date`). */
const sessionDay = (session: StudentSession) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(session.date ?? ""));
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(session.date);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const sessionStart = (session: StudentSession) => {
  const day = sessionDay(session);
  if (!day) return null;
  const [h, m] = parseTime(session.startTime, [0, 0]);
  day.setHours(h, m, 0, 0);
  return day;
};

export const sessionEnd = (session: StudentSession) => {
  const day = sessionDay(session);
  if (!day) return null;
  const [h, m] = parseTime(session.endTime, [23, 59]);
  day.setHours(h, m, 59, 999);
  return day;
};

const normalise = (status?: string) => String(status ?? "").toLowerCase();

export const isSessionCompleted = (session: StudentSession) =>
  ["completed", "done"].includes(normalise(session.status));

export const isSessionCancelled = (session: StudentSession) =>
  ["cancelled", "canceled"].includes(normalise(session.status));

/** Not finished yet: in the future or currently running. */
export const isSessionUpcomingOrOngoing = (session: StudentSession, now = Date.now()) => {
  if (isSessionCompleted(session) || isSessionCancelled(session)) return false;
  const end = sessionEnd(session);
  return end ? end.getTime() >= now : false;
};

export const sortSessions = (sessions: StudentSession[]) =>
  sessions
    .slice()
    .sort((a, b) => (sessionStart(a)?.getTime() ?? 0) - (sessionStart(b)?.getTime() ?? 0));

export const isEnrollmentClosed = (enrollment: StudentEnrollment) =>
  ["completed", "cancelled", "canceled", "withdrawn"].includes(normalise(enrollment.status));

/** Only allow http(s) links from API data (e.g. admin-entered Zoom links). */
export const safeExternalUrl = (value?: string | null) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
};
