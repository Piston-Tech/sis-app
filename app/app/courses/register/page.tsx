"use client";

import AppLayout from "@/components/AppLayout";
import apiClient from "@/services/apiClient";
import formatMoney from "@/utils/formatMoney";
import { Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const UserCoursesPage = () => {
  // Courses for catalog (can be moved to server eventually)
  const [catalogCourses, setCatalogCourses] = useState<any[]>([
    {
      id: 1,
      title: "Project Management Professional (PMP)",
      category: "Management",
      price: 300000,
      duration: "5 Weeks",
      level: "Advanced",
      description: "Industry-leading certification for project managers.",
    },
    {
      id: 2,
      title: "Business Analysis Masterclass",
      category: "Analysis",
      price: 250000,
      duration: "4 Weeks",
      level: "Intermediate",
      description:
        "Master the art of requirement gathering and process modeling.",
    },
    {
      id: 3,
      title: "Agile & Scrum Boot Camp",
      category: "Software",
      price: 180000,
      duration: "2 Weeks",
      level: "All Levels",
      description: "Learn to lead high-velocity development teams.",
    },
    {
      id: 4,
      title: "Data Analytics for Business",
      category: "Data Science",
      price: 280000,
      duration: "6 Weeks",
      level: "Intermediate",
      description: "Turn raw data into actionable business insights.",
    },
  ]);

  useEffect(() => {
    apiClient
      .get("/courses")
      .then((res) => {
        console.log(res.data);
        setCatalogCourses(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {catalogCourses.map((course) => {
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

                <div className="grid grid-cols-2 gap-4 mb-8">
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

export default UserCoursesPage;
