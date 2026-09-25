"use client";

import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "@/components/student/States";
import { useEnrollments } from "@/components/student/queries";
import { courseTitle, naira, summariseTransaction } from "@/components/student/format";
import type { StudentEnrollment } from "@/components/student/types";

const paymentStatus = (enrollment: StudentEnrollment) => {
  if (!enrollment.transaction) return "—";
  const { outstanding } = summariseTransaction(enrollment.transaction);
  if (outstanding === null) return "Awaiting invoice";
  return outstanding === 0 ? "Settled" : `${naira(outstanding)} due`;
};

const EnrollmentsPage = () => {
  const { data, isPending, isError, error, refetch } = useEnrollments();

  if (isPending) return <LoadingState label="Loading your enrollments..." />;
  if (isError) {
    return <ErrorState title="We couldn't load your enrollments" error={error} onRetry={() => refetch()} />;
  }

  return (
    <section
      aria-labelledby="enrollments-heading"
      className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-slate-50/30 p-6 sm:p-10">
        <h1 id="enrollments-heading" className="text-2xl font-black uppercase tracking-tight text-slate-900">
          Enrollments
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Select an enrollment to see its class sessions.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={BookOpen}
            title="You're not enrolled in any course yet"
            action={
              <Link
                href="/courses/recommendations"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                See recommended courses
              </Link>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600">
                <th scope="col" className="p-6">Course</th>
                <th scope="col" className="p-6">Status</th>
                <th scope="col" className="p-6">Payment</th>
                <th scope="col" className="p-6">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((enrollment) => {
                const href = `/courses/enrollments/${encodeURIComponent(enrollment.enrollmentId)}`;
                const course = enrollment.class?.course;
                const meta = [course?.code, course?.category].filter(Boolean).join(" • ");
                return (
                  <tr key={enrollment.id} className="hover:bg-slate-50">
                    <td className="p-6">
                      <Link href={href} className="text-sm font-black uppercase text-slate-900 hover:text-blue-700 hover:underline">
                        {courseTitle(enrollment)}
                      </Link>
                      {meta && <p className="mt-1 text-sm text-slate-600">{meta}</p>}
                    </td>
                    <td className="p-6 text-sm font-bold uppercase text-blue-800">
                      {enrollment.status || "—"}
                    </td>
                    <td className="p-6 font-mono text-sm font-bold text-slate-900">
                      {paymentStatus(enrollment)}
                    </td>
                    <td className="p-6 text-right">
                      <Link
                        href={href}
                        aria-label={`View ${courseTitle(enrollment)}`}
                        className="inline-flex rounded-lg p-2 text-slate-500 hover:text-slate-900"
                      >
                        <ChevronRight className="h-5 w-5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default EnrollmentsPage;
