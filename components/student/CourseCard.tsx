import { Clock, ExternalLink, TrendingUp } from "lucide-react";
import { programLink } from "@/constants/links";
import { naira, safeExternalUrl, toAmount } from "./format";
import type { RecommendedCourse } from "./types";

/** "₦100,000.00 – ₦250,000.00", a single price, or "—" when unknown. */
export const priceRange = (course: RecommendedCourse) => {
  const prices = (course.level?.prices ?? [])
    .map((entry) => toAmount(entry.price))
    .filter((price): price is number => price !== null);
  if (prices.length === 0) return "—";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? naira(min) : `${naira(min)} – ${naira(max)}`;
};

export const courseCategory = (course: RecommendedCourse) =>
  course.subCategory?.category?.name || course.category || course.subCategory?.name || "";

const CourseCard = ({ course }: { course: RecommendedCourse }) => {
  const category = courseCategory(course);
  const duration = toAmount(course.duration);

  return (
    <article className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        {category && (
          <p className="mb-4 w-fit rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
            {category}
          </p>
        )}
        <h3 className="mb-3 text-xl font-black leading-tight text-slate-900">{course.title}</h3>
        {course.description && (
          <p className="mb-6 line-clamp-3 text-sm text-slate-600">{course.description}</p>
        )}

        <ul className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          {duration !== null && (
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden />
              {duration} {duration === 1 ? "day" : "days"}
            </li>
          )}
          {course.level?.name && (
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden />
              {course.level.name}
            </li>
          )}
        </ul>

        <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-6">
          <p>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Price
            </span>
            <span className="text-xl font-black text-slate-900">{priceRange(course)}</span>
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={programLink(course.title, safeExternalUrl(course.link))}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-700"
          >
            Enrol now
            <ExternalLink className="h-4 w-4" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
