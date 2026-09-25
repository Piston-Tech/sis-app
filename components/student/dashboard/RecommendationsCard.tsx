"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { programLink } from "@/constants/links";
import { priceRange } from "../CourseCard";
import { safeExternalUrl, toAmount } from "../format";
import { useRecommendations } from "../queries";

/** Top personalised recommendations from POST /students/recommendations. */
const RecommendationsCard = () => {
  const { data, isPending, isError, refetch } = useRecommendations();
  const items = (data ?? []).slice(0, 4);

  return (
    <section
      aria-labelledby="recommendations-heading"
      className="space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="recommendations-heading" className="text-xl font-black uppercase text-slate-900">
            Recommended for you
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Based on the career details in your profile.
          </p>
        </div>
        <Link
          href="/courses/recommendations"
          className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
        >
          View all
        </Link>
      </div>

      {isPending ? (
        <p className="text-sm text-slate-600" role="status">
          Loading recommendations...
        </p>
      ) : isError ? (
        <p className="text-sm text-slate-700" role="alert">
          We couldn&apos;t load recommendations.{" "}
          <button type="button" onClick={() => refetch()} className="font-bold text-blue-700 underline">
            Try again
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
          No recommendations yet. Complete your career details on your{" "}
          <Link href="/profile" className="font-bold text-blue-700 underline">
            profile
          </Link>{" "}
          to get personalised suggestions.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((course) => {
            const duration = toAmount(course.duration);
            return (
              <li
                key={course.id}
                className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px]"
              >
                <div className="min-w-0 space-y-1">
                  <h3 className="text-base font-black uppercase text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-600">
                    {[course.level?.name, duration !== null ? `${duration} days` : null]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
                <div className="space-y-3 border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0 lg:text-right">
                  <p>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Price</span>
                    <span className="block font-mono text-base font-black text-slate-900">{priceRange(course)}</span>
                  </p>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={programLink(course.title, safeExternalUrl(course.link))}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 lg:w-auto"
                  >
                    Enrol <ExternalLink className="h-4 w-4" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default RecommendationsCard;
