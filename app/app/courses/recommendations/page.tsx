"use client";

import apiClient from "@/services/apiClient";
import Course from "@/types/Course";
import formatMoney from "@/utils/formatMoney";
import { Clock, TrendingUp, CircleStar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TestPage = () => {
  const [data, setData] = useState<
    Array<
      Course & {
        popularity: number;
        recommendationScore: number;
        level: { id: number; name: string; prices: { price: number }[] };
      }
    >
  >([]);

  useEffect(() => {
    apiClient
      .post("/students/recommendations", {
        // persona: "Career Switcher",
        // currentCategory: "Project Management Courses",
        // currentSubCategory: "Scrum",
      })
      .then((data) => {
        setData(data.data.data);
        console.log("Recommendations:", data);
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {data.map((course) => {
          const prices = [
            ...(course?.level?.prices?.map((p: { price: number }) => p.price) ??
              []),
          ];
          return (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={`https://picsum.photos/seed/course-${course.id}/600/400`}
                  className="w-full h-full object-cover opacity-60"
                  alt={course.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {course.category}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-2">
                  {course.description || "No description available."}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {course.duration} days
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {course.level?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CircleStar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {course.recommendationScore} pts
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex flex-col gap-4 justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatMoney(Math.min(...prices), true, "Nigerian Naira")} -{" "}
                    {formatMoney(Math.max(...prices), true, "Nigerian Naira")}
                    {/* ₦{course.price.toLocaleString()} */}
                  </span>
                  <Link
                    className="w-full"
                    target="_blank"
                    href={
                      course.link ||
                      `https://pistonandfusion.org/programs?search=${encodeURIComponent(course.title)}`
                    }
                  >
                    <button className="w-full px-6 py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:-translate-y-1 transition-all">
                      Enrol Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestPage;
