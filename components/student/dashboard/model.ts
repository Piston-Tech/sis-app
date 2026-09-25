import {
  accountTotals,
  groupByTransaction,
  isEnrollmentClosed,
  isSessionCompleted,
  isSessionUpcomingOrOngoing,
  sessionStart,
  sortSessions,
} from "../format";
import type { DashboardResponse, StudentEnrollment, StudentSession } from "../types";

export interface DashboardModel {
  activeEnrollment: StudentEnrollment | null;
  activeSessions: StudentSession[];
  nextSession: StudentSession | null;
  completedCount: number;
  enrollmentCount: number;
  totals: ReturnType<typeof accountTotals>;
  billingEntity: string | null;
}

const sessionsFor = (data: DashboardResponse, enrollment: StudentEnrollment) =>
  sortSessions(data.sessions.filter((session) => session.classId === enrollment.classId));

/** Everything the dashboard shows, derived only from real API data. */
export const buildDashboardModel = (data: DashboardResponse): DashboardModel => {
  const now = Date.now();

  // The class whose next (or currently running) session comes soonest. The
  // API lists enrollments newest first, so "the first one with anything
  // upcoming" picked a class next month over one running today.
  const soonest = data.enrollments
    .map((enrollment) => ({
      enrollment,
      next: sessionsFor(data, enrollment).find((session) =>
        isSessionUpcomingOrOngoing(session, now),
      ),
    }))
    .filter((candidate) => candidate.next)
    .sort(
      (a, b) =>
        (sessionStart(a.next!)?.getTime() ?? Infinity) -
        (sessionStart(b.next!)?.getTime() ?? Infinity),
    )[0];

  const activeEnrollment =
    soonest?.enrollment ??
    data.enrollments.find((enrollment) => !isEnrollmentClosed(enrollment)) ??
    null;

  const activeSessions = activeEnrollment ? sessionsFor(data, activeEnrollment) : [];
  const nextSession =
    activeSessions.find((session) => isSessionUpcomingOrOngoing(session, now)) ?? null;

  const groups = groupByTransaction(data.enrollments);
  const latest = groups[0]?.transaction;
  const payerType = String(latest?.payerType ?? "").toLowerCase();
  const studentName = [data.student?.firstName, data.student?.middleName, data.student?.lastName]
    .filter(Boolean)
    .join(" ");

  let billingEntity: string | null = null;
  // Payer types are stored as B2B (organisation) / B2C (individual)
  if (/^b2b$|company|corporate/.test(payerType)) {
    billingEntity = data.student?.company?.name || "Your organisation";
  } else if (/^b2c$|student|individual|self/.test(payerType)) {
    billingEntity = studentName || "You";
  }

  return {
    activeEnrollment,
    activeSessions,
    nextSession,
    completedCount: data.enrollments.filter(
      (enrollment) => String(enrollment.status ?? "").toLowerCase() === "completed",
    ).length,
    enrollmentCount: data.enrollments.length,
    totals: accountTotals(groups),
    billingEntity,
  };
};

export const sessionCompletion = (sessions: StudentSession[]) =>
  sessions.length === 0
    ? 0
    : Math.round((sessions.filter(isSessionCompleted).length / sessions.length) * 100);
