import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { courseTitle, formatDate, safeExternalUrl } from "../format";
import type { StudentEnrollment, StudentSession } from "../types";
import SessionCountdown from "./SessionCountdown";

interface Props {
  enrollment: StudentEnrollment;
  session: StudentSession | null;
}

/** Hero for a student with an ongoing course: their next real session. */
const NextSessionHero = ({ enrollment, session }: Props) => {
  const tierName = enrollment.tier?.name;
  const delivery = session?.delivery || enrollment.delivery;
  const joinUrl = safeExternalUrl(session?.zoomLink);

  return (
    <section
      aria-labelledby="next-session-heading"
      className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl sm:p-10"
    >
      <div className="relative z-10 flex flex-col justify-between gap-8 xl:flex-row xl:items-center">
        <div className="max-w-2xl space-y-4">
          {(tierName || delivery) && (
            <p className="inline-flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
              {tierName && (
                <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-blue-200">
                  {tierName}
                </span>
              )}
              {delivery && (
                <span className="rounded-full border border-white/20 px-3 py-1 text-slate-200">
                  {delivery}
                </span>
              )}
            </p>
          )}
          <h1 id="next-session-heading" className="text-3xl font-black leading-tight tracking-tight md:text-4xl">
            {session ? "Your next session" : "Your current course"}
          </h1>
          <p className="text-base font-medium text-slate-200">{courseTitle(enrollment)}</p>

          {session ? (
            <>
              <ul className="flex flex-wrap gap-4 pt-2 text-sm text-slate-200">
                <li className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-4 w-4 text-blue-300" aria-hidden />
                  {formatDate(session.date, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </li>
                {session.startTime && (
                  <li className="flex items-center gap-2 font-semibold">
                    <Clock className="h-4 w-4 text-blue-300" aria-hidden />
                    {session.startTime}
                    {session.endTime ? ` – ${session.endTime}` : ""}
                  </li>
                )}
              </ul>
              {session.venueDetails && (
                <p className="flex items-start gap-2 text-sm text-slate-200">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden />
                  <span className="whitespace-pre-line">{session.venueDetails}</span>
                </p>
              )}
              <div className="pt-4">
                {joinUrl ? (
                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4" aria-hidden />
                    Join online session
                  </a>
                ) : !session.venueDetails ? (
                  <p className="text-sm text-slate-300">
                    Joining details for this session haven&apos;t been published yet.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-300">
              No upcoming sessions have been scheduled for this course yet.
            </p>
          )}
        </div>

        {session && <SessionCountdown session={session} />}
      </div>
      <div aria-hidden className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
    </section>
  );
};

export default NextSessionHero;
