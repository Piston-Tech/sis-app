import Link from "next/link";
import { Award, CheckCircle2, ChevronRight } from "lucide-react";
import {
  courseDescription,
  courseTitle,
  formatDate,
  isSessionCompleted,
  isSessionUpcomingOrOngoing,
} from "../format";
import type { StudentEnrollment, StudentSession } from "../types";

interface Props {
  enrollment: StudentEnrollment;
  sessions: StudentSession[];
}

const SessionBadge = ({ session }: { session: StudentSession }) => {
  if (isSessionCompleted(session)) {
    return <span className="text-xs font-bold uppercase text-emerald-700">Completed</span>;
  }
  if (isSessionUpcomingOrOngoing(session)) {
    return <span className="text-xs font-bold uppercase text-blue-700">Upcoming</span>;
  }
  return (
    <span className="text-xs font-bold uppercase text-slate-600">{session.status || "Scheduled"}</span>
  );
};

const ActiveCourseCard = ({ enrollment, sessions }: Props) => {
  const description = courseDescription(enrollment);
  const visibleSessions = sessions.slice(0, 4);

  return (
    <section
      aria-labelledby="active-course-heading"
      className="space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="active-course-heading" className="text-xl font-black uppercase text-slate-900">
          Current course
        </h2>
        {enrollment.status && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
            {enrollment.status}
          </span>
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
            <Award className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-black uppercase leading-snug text-slate-900">
              {courseTitle(enrollment)}
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">
              {[
                enrollment.class?.classId && `Class ${enrollment.class.classId}`,
                enrollment.delivery,
                enrollment.class?.plannedStartDate &&
                  `Starts ${formatDate(enrollment.class.plannedStartDate)}`,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </div>
        </div>
        {description && <p className="text-sm leading-relaxed text-slate-700">{description}</p>}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Sessions</h3>
        {visibleSessions.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleSessions.map((session, index) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {session.notes || `Session ${index + 1}`}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatDate(session.date, { weekday: "short", day: "numeric", month: "short" })}
                    {session.startTime ? ` • ${session.startTime}` : ""}
                  </p>
                  <SessionBadge session={session} />
                </div>
                {isSessionCompleted(session) && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
            No sessions have been published for this course yet.
          </p>
        )}
      </div>

      <Link
        href={`/courses/enrollments/${encodeURIComponent(enrollment.enrollmentId)}`}
        className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline"
      >
        View full schedule <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
};

export default ActiveCourseCard;
