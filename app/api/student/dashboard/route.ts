import { NextRequest, NextResponse } from "next/server";
import apiServer from "@/services/apiServer";

export async function GET(request: NextRequest) {
  try {
    // 1. Get current user (student)
    const { data: meData } = await apiServer({ url: "/auth/me", method: "GET" });
    const student = meData?.user || null;

    // 2. Get student enrollments (brief list)
    const { data: enrollData } = await apiServer({
      url: "/students/enrollments",
      method: "GET",
    });

    const enrollments: any[] = enrollData?.data || [];

    // 3. Fetch detailed enrollment info to include sessions where available
    const detailPromises = enrollments.map((e) =>
      apiServer({ url: `/students/enrollments/${e.enrollmentId}`, method: "GET" }).catch(
        () => null,
      ),
    );

    const details = (await Promise.all(detailPromises)).filter(Boolean) as
      | { data: any; response: Response }[]
      | [];

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
      if (e.transaction && e.transaction.id) txMap.set(e.transaction.id, e.transaction);
    });
    const transactions = Array.from(txMap.values());

    // Aggregate payments across transactions
    const payments: any[] = [];
    transactions.forEach((t) => {
      const p = t.payments || t.payments || [];
      if (Array.isArray(p)) payments.push(...p);
    });

    // Summary calculations
    const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid ?? p.amount ?? 0), 0);

    // Try to compute total cost: prefer explicit transaction.total, fallback to enrolled class price
    let totalCost = 0;
    enrollments.forEach((e) => {
      const txTotal = e.transaction?.total ?? null;
      if (typeof txTotal === "number") {
        totalCost += txTotal;
        return;
      }

      const classPrice =
        e.class?.customClass?.price ?? e.class?.course?.prices?.[0]?.price ?? e.class?.course?.price ?? 0;
      totalCost += classPrice || 0;
    });

    const totalDiscount = transactions.reduce((sum, t) => sum + (t.discount ?? 0), 0);
    const totalOutstanding = Math.max(0, totalCost - totalPaid - totalDiscount);

    const totalSessions = sessions.length;
    const attendedSessions = sessions.filter((s) => s.status === "Completed" || s.attended === true).length;
    const attendanceRate = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

    const completedEnrollments = enrollments.filter((e) => e.status === "Completed").length;
    const completionRate = enrollments.length > 0 ? Math.round((completedEnrollments / enrollments.length) * 100) : 0;

    const creditsEarned = enrollments.reduce((sum, e) => sum + (e.class?.course?.credits ?? 0), 0);

    // Build a simple learningPath from enrollments (ordered by createdAt)
    const learningPath = enrollments
      .slice()
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
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

    return NextResponse.json(dashboard, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
