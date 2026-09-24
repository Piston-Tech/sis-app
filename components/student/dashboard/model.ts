import {
  accountTotals,
  groupByTransaction,
  isEnrollmentClosed,
  isSessionCompleted,
  isSessionUpcomingOrOngoing,
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

  const activeEnrollment =
    data.enrollments.find((enrollment) =>
      sessionsFor(data, enrollment).some((session) => isSessionUpcomingOrOngoing(session, now)),
    ) ??
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
  if (/company|corporate/.test(payerType)) {
    billingEntity = data.student?.company?.name || "Your organisation";
  } else if (/student|individual|self/.test(payerType)) {
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
