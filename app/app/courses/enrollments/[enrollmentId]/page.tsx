"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  MapPin,
  Calendar,
  UserCheck,
  Clock,
  ExternalLink,
  FileText,
  Receipt,
  Download,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ProgressRing from "@/components/ProgressRing";
import apiClient from "@/services/apiClient";
import { Enrollment, Class, Course, Session } from "@/types";
import CustomClass from "@/types/CustomClass";

const SingleEnrollmentPage = () => {
  const params = useParams<{ enrollmentId: string }>();
  const router = useRouter();

  const [data, setData] = useState<
    | (Enrollment & {
        progress: number;
        class: Class & {
          customClass: CustomClass;
          course: Course;
          sessions: Array<Session>;
        };
      })
    | null
  >(null);

  const canJoin = false;

  useEffect(() => {
    apiClient
      .get(`/students/enrollments/${params.enrollmentId}`)
      .then((res) => {
        console.log(res.data);
        setData(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching enrollment:", err);
      });
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
      >
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:-translate-x-1 transition-transform">
          <ChevronRight className="w-4 h-4 transform rotate-180" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">
          Back to Overview
        </span>
      </button>

      {data && (
        <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-10 md:p-12 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  {data.class?.classId}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                  {data.status}
                </span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter mb-4">
                {data.class?.customClass?.title || data.class?.course?.title}
              </h2>
              <div className="flex flex-wrap gap-6 text-slate-500 mt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {data.delivery}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Cohort{" "}
                    {new Date(data.class?.plannedStartDate!).getFullYear()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {data.cba || "Assigned Advisor"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col items-center justify-center text-center">
              <ProgressRing
                percentage={data.progress || 0}
                color="#3b82f6"
                label="Completion"
              />
            </div>
          </div>

          <div className="p-10 md:p-12 grid grid-cols-1 xl:grid-cols-12 gap-12">
            <div className="xl:col-span-12">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-500" />
                Class Schedule
              </h3>
              <div className="space-y-4">
                {data.class.sessions.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all gap-4"
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-black ${
                          s.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : s.status === "Upcoming"
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30"
                              : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span className="text-[10px] uppercase leading-none opacity-60 mb-1">
                          {new Date(s.date).toLocaleDateString(undefined, {
                            month: "short",
                          })}
                        </span>
                        <span className="text-xl leading-none">
                          {new Date(s.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white">
                          {s.notes || `Session ${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(s.date).toLocaleDateString(undefined, {
                              weekday: "long",
                            })}
                          </span>
                          <div className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          s.status === "Completed"
                            ? "bg-emerald-100 text-emerald-600"
                            : s.status === "Upcoming"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.status === "Upcoming" && canJoin && (
                        <button className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:scale-105 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {data.class.sessions.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                    <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                      No sessions scheduled for this cohort yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-12">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <FileText className="w-6 h-6 text-amber-500" />
                Course Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Training Curriculum.pdf",
                    size: "2.4 MB",
                    type: "PDF",
                  },
                  {
                    name: "Agile_Framework_Diagram.png",
                    size: "4.1 MB",
                    type: "IMAGE",
                  },
                  {
                    name: "Introduction_Reading.docx",
                    size: "1.2 MB",
                    type: "DOC",
                  },
                ].map((file) => (
                  <div
                    key={file.name}
                    className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-amber-500 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl group-hover:bg-amber-500 transition-all">
                        <Receipt className="w-5 h-5 text-amber-600 group-hover:text-white transition-all" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[140px]">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {file.type} • {file.size}
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SingleEnrollmentPage;
