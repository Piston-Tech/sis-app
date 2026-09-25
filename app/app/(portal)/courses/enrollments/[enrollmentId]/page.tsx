"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, ChevronLeft, Clock, MapPin, UserCheck, Video } from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import { EmptyState, ErrorState, LoadingState } from "@/components/student/States";
import { useEnrollment } from "@/components/student/queries";
import { getErrorStatus } from "@/components/student/errors";
import { sessionCompletion } from "@/components/student/dashboard/model";
import {
  courseTitle,
  formatDate,
  isSessionCompleted,
  isSessionUpcomingOrOngoing,
  safeExternalUrl,
  sortSessions,
} from "@/components/student/format";
import type { StudentSession } from "@/components/student/types";

const BackLink = () => (
  <Link
    href="/courses/enrollments"
    className="group inline-flex items-center gap-3 text-slate-600 transition-colors hover:text-slate-900"
  >
    <span className="rounded-xl bg-slate-100 p-2 transition-transform group-hover:-translate-x-1">
      <ChevronLeft className="h-4 w-4" aria-hidden />
    </span>
    <span className="text-sm font-bold uppercase tracking-wider">Back to enrollments</span>
  </Link>
);

const SessionItem = ({ session, index }: { session: StudentSession; index: number }) => {
  const completed = isSessionCompleted(session);
  const upcoming = isSessionUpcomingOrOngoing(session);
  const joinUrl = upcoming ? safeExternalUrl(session.zoomLink) : null;

  return (
    <li className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6 sm:flex-row sm:items-center">
      <div className="flex items-center gap-6">
        <div
          className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border font-black ${
            completed
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : upcoming
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600"
          }`}
          aria-hidden
        >
          <span className="mb-1 text-xs uppercase leading-none">
            {formatDate(session.date, { month: "short" })}
          </span>
          <span className="text-xl leading-none">{formatDate(session.date, { day: "numeric" })}</span>
        </div>
        <div>
          <p className="text-base font-black text-slate-900">{session.notes || `Session ${index + 1}`}</p>
          <p className="mt-1 text-sm text-slate-600">
            {formatDate(session.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {session.startTime ? ` • ${session.startTime}` : ""}
            {session.endTime ? ` – ${session.endTime}` : ""}
          </p>
          {session.venueDetails && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span className="whitespace-pre-line">{session.venueDetails}</span>
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {session.status && (
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
              completed ? "bg-emerald-100 text-emerald-800" : upcoming ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
            }`}
          >
            {session.status}
          </span>
        )}
        {joinUrl && (
          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Video className="h-4 w-4" aria-hidden />
            Join
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </li>
  );
};

const SingleEnrollmentPage = () => {
  const params = useParams<{ enrollmentId: string }>();
  const enrollmentId = params?.enrollmentId ?? "";
  const { data, isPending, isError, error, refetch } = useEnrollment(enrollmentId);

  if (isPending) return <LoadingState label="Loading enrollment..." />;

  if (isError && getErrorStatus(error) !== 404) {
    return (
      <div className="space-y-8">
        <BackLink />
        <ErrorState title="We couldn't load this enrollment" error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <BackLink />
        <EmptyState title="Enrollment not found" description="It may have been removed, or the link is incorrect." />
      </div>
    );
  }

  const sessions = sortSessions(data.class?.sessions ?? []);
  const details = [
    data.delivery && { icon: MapPin, text: data.delivery },
    data.class?.plannedStartDate && {
      icon: Calendar,
      text: `Starts ${formatDate(data.class.plannedStartDate)}`,
    },
    data.cba && { icon: UserCheck, text: data.cba },
  ].filter(Boolean) as { icon: typeof MapPin; text: string }[];

  return (
    <div className="space-y-10">
      <BackLink />

      <section className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-8 border-b border-slate-100 bg-slate-50/50 p-6 sm:p-10 md:flex-row">
          <div className="max-w-xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {data.class?.classId && (
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  {data.class.classId}
                </span>
              )}
              {data.status && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {data.status}
                </span>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-black leading-tight tracking-tighter text-slate-900 sm:text-4xl">
              {courseTitle(data)}
            </h1>
            {details.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-6 text-slate-600">
                {details.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                    <Icon className="h-4 w-4 text-blue-600" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {sessions.length > 0 && (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-xl">
              <ProgressRing percentage={sessionCompletion(sessions)} label="Sessions completed" />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="mb-8 flex items-center gap-3 text-xl font-black text-slate-900">
            <Clock className="h-6 w-6 text-blue-600" aria-hidden />
            Class schedule
          </h2>
          {sessions.length > 0 ? (
            <ul className="space-y-4">
              {sessions.map((session, index) => (
                <SessionItem key={session.id} session={session} index={index} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={Calendar} title="No sessions scheduled for this class yet" />
          )}
        </div>
      </section>
    </div>
  );
};

export default SingleEnrollmentPage;
