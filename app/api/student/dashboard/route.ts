import { NextResponse } from "next/server";
import { errorResponse, withErrorHandling } from "@/lib/api/respond";
import apiServer from "@/services/apiServer";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any -- aggregates loosely
   shaped backend payloads; see types/index.ts DashboardData for the output */

export const GET = withErrorHandling("student/dashboard", async () => {
  // 1. Get current user (student)
  const { data: meData, response: meResponse } = await apiServer<{
    user?: any;
  }>({
    url: "/auth/me",
    method: "GET",
  });
  if (meResponse.status === 401 || meResponse.status === 403) {
    return errorResponse(meResponse.status, "Unauthorized");
  }
  const student = meData?.user || null;

  // 2. Get student enrollments (brief list). The list is paginated
  // (default 20); ask for the maximum page size.
  const { data: enrollData } = await apiServer<{ data?: any[] }>({
    url: "/students/enrollments?limit=100",
    method: "GET",
  });

  const enrollments: any[] = enrollData?.data || [];

  // 3. Fetch detailed enrollment info to include sessions where available
  const detailPromises = enrollments.map((e) =>
    apiServer<{ data?: any }>({
      url: `/students/enrollments/${encodeURIComponent(e.enrollmentId)}`,
      method: "GET",
    }).catch(() => null),
  );

  const details = await Promise.all(detailPromises);

  // Flatten sessions from detailed enrollment data
  const sessions: any[] = [];
  details.forEach((d) => {
    if (!d) return;
    const enrollment = d.data?.data;
    const classSessions = enrollment?.class?.sessions || [];
    sessions.push(...classSessions);
  });

  // Build unique transactions list from enrollments
  const txMap = new Map<number, any>();
  enrollments.forEach((e) => {
    if (e.transaction && e.transaction.id)
      txMap.set(e.transaction.id, e.transaction);
  });
  const transactions = Array.from(txMap.values());

  // Aggregate payments across transactions
  const payments: any[] = [];
  transactions.forEach((t) => {
    const p = t.payments || [];
    if (Array.isArray(p)) payments.push(...p);
  });

  // Summary calculations. DECIMAL columns arrive as strings ("1000.00"), so
  // always convert before adding (otherwise `+` concatenates), and sum in
  // minor units to avoid float drift.
  const toMinor = (value: unknown) =>
    Math.round((parseFloat(String(value ?? 0)) || 0) * 100);
  const fromMinor = (minor: number) => minor / 100;

  // Only confirmed payments count as paid; a transaction may include
  // totalPaid (computed server-side) when payments aren't embedded.
  const paidMinor = transactions.reduce((sum, t) => {
    if (Array.isArray(t.payments)) {
      return (
        sum +
        t.payments
          .filter((p: any) => String(p.status).toUpperCase() === "RECEIVED")
          .reduce((s: number, p: any) => s + toMinor(p.amountPaid ?? p.amount), 0)
      );
    }
    return sum + toMinor(t.totalPaid);
  }, 0);
  const totalPaid = fromMinor(paidMinor);

  // Cost is counted once per transaction (several enrollments can share one);
  // enrollments without a transaction fall back to their class price.
  let costMinor = transactions.reduce((sum, t) => sum + toMinor(t.total), 0);
  enrollments.forEach((e) => {
    if (e.transaction?.id) return;
    costMinor += toMinor(
      e.class?.customClass?.price ??
        e.class?.course?.prices?.[0]?.price ??
        e.class?.course?.price,
    );
  });
  const totalCost = fromMinor(costMinor);

  const totalDiscount = fromMinor(
    transactions.reduce((sum, t) => sum + toMinor(t.discount), 0),
  );
  const totalOutstanding = Math.max(0, totalCost - totalPaid - totalDiscount);

  const totalSessions = sessions.length;
  const attendedSessions = sessions.filter(
    (s) => s.status === "Completed" || s.attended === true,
  ).length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;

  const completedEnrollments = enrollments.filter(
    (e) => e.status === "Completed",
  ).length;
  const completionRate =
    enrollments.length > 0
      ? Math.round((completedEnrollments / enrollments.length) * 100)
      : 0;

  const creditsEarned = enrollments.reduce(
    (sum, e) => sum + (e.class?.course?.credits ?? 0),
    0,
  );

  // Build a simple learningPath from enrollments (ordered by createdAt)
  const learningPath = enrollments
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime(),
    )
    .map((e) => ({
      courseId: e.class?.course?.id ?? e.courseId ?? null,
      title: e.class?.course?.title ?? e.class?.customClass?.title ?? "",
      status: e.status,
      progress: e.progress ?? null,
    }));

  const dashboard = {
    student,
    enrollments,
    transactions,
    payments,
    sessions,
    nextSession: sessions.find((s) => s.status === "Upcoming") || null,
    programs: [],
    learningPath,
    summary: {
      totalPaid,
      totalOutstanding,
      attendanceRate,
      completionRate,
      creditsEarned,
    },
  };

  return NextResponse.json(dashboard, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
});
