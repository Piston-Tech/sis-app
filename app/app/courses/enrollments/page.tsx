"use client";

import AppLayout from "@/components/AppLayout";
import apiClient from "@/services/apiClient";
import formatMoney from "@/utils/formatMoney";
import {
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UserCoursesPage = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    apiClient.get("/students/enrollments").then((res) => {
      setEnrollments(res.data.data);
    });
  }, []);

  // Courses for catalog (can be moved to server eventually)
  // const [catalogCourses, setCatalogCourses] = useState<any[]>([
  //   {
  //     id: 1,
  //     title: "Project Management Professional (PMP)",
  //     category: "Management",
  //     price: 300000,
  //     duration: "5 Weeks",
  //     level: "Advanced",
  //     description: "Industry-leading certification for project managers.",
  //   },
  //   {
  //     id: 2,
  //     title: "Business Analysis Masterclass",
  //     category: "Analysis",
  //     price: 250000,
  //     duration: "4 Weeks",
  //     level: "Intermediate",
  //     description:
  //       "Master the art of requirement gathering and process modeling.",
  //   },
  //   {
  //     id: 3,
  //     title: "Agile & Scrum Boot Camp",
  //     category: "Software",
  //     price: 180000,
  //     duration: "2 Weeks",
  //     level: "All Levels",
  //     description: "Learn to lead high-velocity development teams.",
  //   },
  //   {
  //     id: 4,
  //     title: "Data Analytics for Business",
  //     category: "Data Science",
  //     price: 280000,
  //     duration: "6 Weeks",
  //     level: "Intermediate",
  //     description: "Turn raw data into actionable business insights.",
  //   },
  // ]);

  return (
    <div className="space-y-8">
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-white/5">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Enrollments
          </h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            Select an enrollment to view detailed class sessions and payment
            history
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800">
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  S/N
                </th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Course
                </th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Status
                </th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Payment Status
                </th>
                {/* <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Balance
                </th> */}
                <th className="p-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {enrollments.map((e, i) => (
                <tr
                  key={e.id}
                  onClick={() =>
                    router.push(`/courses/enrollments/${e.enrollmentId}`)
                  }
                  className="group hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="p-8">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {i + 1}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-3">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase">
                        {e.class?.customClass?.title || e.class?.course?.title}
                      </span>
                      <span className="text-xs font-black text-slate-400">
                        {e.class.course.code} • {e.class.course.category}
                      </span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase text-blue-500">
                        {e.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-8 text-sm font-black text-slate-900 dark:text-white font-mono">
                    {e.transaction.total < e.transaction.totalPaid
                      ? "Overpaid"
                      : e.transaction.total === e.transaction.totalPaid
                      ? "Settled"
                      : `Pending ₦${(e.transaction.total - e.transaction.totalPaid).toLocaleString()}`}
                  </td>
                  {/* <td className="p-8">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${group.outstanding === 0 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                    >
                      {group.outstanding === 0
                        ? "Settled"
                        : `Pending ₦${group.outstanding.toLocaleString()}`}
                    </span>
                  </td> */}
                  <td className="p-8 text-right">
                    <Link href={`/courses/enrollments/${e.enrollmentId}`}>
                      <button className="p-2 text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors cursor-pointer">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enrollments.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest">
                No courses found in ledger
              </p>
            </div>
          )}
        </div>
      </section>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {catalogCourses.map((course) => (
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
                {course.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₦{course.price.toLocaleString()}
                </span>
                <button className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:-translate-y-1 transition-all">
                  Enrol Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default UserCoursesPage;
