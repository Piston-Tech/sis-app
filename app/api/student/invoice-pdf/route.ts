import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/respond";
import apiServer from "@/services/apiServer";
import type { StatementEnrollmentInput } from "@/lib/student/statement";
import { renderStatementPdf, type StatementStudent } from "@/lib/student/statementPdf";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: meData, response: meResponse } = await apiServer<{
      user?: StatementStudent;
    }>({ url: "/auth/me", method: "GET" });

    if (meResponse.status === 401 || meResponse.status === 403) {
      return errorResponse(meResponse.status, "Unauthorized");
    }
    const student = meData?.user ?? null;

    // Paginated list (default 20); ask for the maximum page size
    const { data: enrollData } = await apiServer<{ data?: StatementEnrollmentInput[] }>({
      url: "/students/enrollments?limit=100",
      method: "GET",
    });

    const pdf = await renderStatementPdf(student, enrollData?.data ?? []);
    const id = String(student?.studentId || "student").replace(/[^A-Za-z0-9_-]/g, "");

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="statement-${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api] student/invoice-pdf failed:", error);
    return errorResponse(500, "Failed to generate invoice PDF");
  }
}
