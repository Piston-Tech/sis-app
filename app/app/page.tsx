"use client";

import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { useEffect, useState } from "react";
import ProgressRing from "@/components/ProgressRing";
import {
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Layers,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Link from "next/link";

const UserDashboardPage = () => {
  const { currentUser: user } = useAuth();
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState({
    student: null,
    enrollments: [],
    transactions: [],
    sessions: [],
    nextSession: null,
    programs: [],
    learningPath: {
      id: "",
      title: "",
      goal: "",
      milestones: [],
    },
    summary: {
      totalPaid: 0,
      totalOutstanding: 0,
      attendanceRate: 0,
      completionRate: 0,
      creditsEarned: 0,
      gpa: 0,
    },
  });

  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get("/students/enrollments").then((res) => {
      setEnrollments(res.data.data);
    });
  }, []);

  if (!user) return null;

  const mainProgram = {
    id: "",
    title: "",
    courses: [], // Course IDs
    progress: 0,
    description: "",
    thumbnail: "",
  };

  const summary = {
    totalPaid: 0,
    totalOutstanding: 0,
    attendanceRate: 0,
    completionRate: 0,
    creditsEarned: 0,
    gpa: 0,
  };

  const nextSession = { notes: "Next Class" };

  const canJoin = false;
  const timeLeft = null;

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Course/Program Header */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
          <div className="p-8 md:p-12 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mb-4">
                Current Program
              </p>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter max-w-2xl leading-none">
                {mainProgram?.title || "General Studies - Professional Track"}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  GPA
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary.gpa?.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Credits Earned
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary.creditsEarned}
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {["Overview", "Support", "Media Center"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap pb-4 pt-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                  tab === t
                    ? "text-blue-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
                {tab === t && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Ready for Class? */}
              <section className="bg-slate-900 rounded-[3rem] p-10 text-white overflow-hidden relative group">
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-md">
                      <h3 className="text-3xl font-black tracking-tighter mb-4 leading-none">
                        Ready for Class?
                      </h3>
                      <p className="text-slate-400 text-sm font-medium mb-8">
                        {nextSession
                          ? `Your next session "${nextSession.notes || "In-person training"}" is coming up soon.`
                          : "You don't have any scheduled sessions today. Take this time to review your learning path or community discussions."}
                      </p>

                      {nextSession && (
                        <button
                          disabled={!canJoin}
                          className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                            canJoin
                              ? "bg-blue-600 hover:scale-105 shadow-blue-600/30 animate-pulse"
                              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                          }`}
                        >
                          {canJoin
                            ? "Join Live Session Now"
                            : "Classroom Opens 15m Before"}
                        </button>
                      )}
                    </div>

                    {nextSession && (
                      <div className="text-center p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-4">
                          Starts In
                        </p>
                        <div className="text-4xl font-black font-mono tracking-tighter mb-2">
                          {timeLeft || "CALCULATING"}
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
                          <div className="h-full bg-blue-500 w-2/3 animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent" />
              </section>

              {/* Your Courses - April 2026 */}
              <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Your Courses - April 2026
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Previewing active and upcoming enrollments
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        // We rely on the parent state update, but for better DX we can scroll
                      }}
                      className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] hover:opacity-70 transition-opacity"
                    >
                      View All
                    </button>
                    <div className="flex gap-2 text-slate-400">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                        1 of 3
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.slice(0, 3).map((e) => (
                    <Link href={`/courses/enrollments/${e.enrollmentId}`}>
                    <div
                      key={e.id}
                      className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="mb-6">
                        <div className="flex justify-between items-start mb-4">
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                              e.status === "Enrolled"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            {e.status === "Enrolled" ? "Upcoming" : "Ongoing"}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight line-clamp-2 leading-tight">
                          {e.class?.customClass?.title ||
                            e.class?.course?.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">
                            {e.delivery}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Academic Progress */}
              <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">
                  Academic Progress
                </h3>
                <div className="flex flex-col items-center gap-12">
                  <div className="grid grid-cols-2 gap-8 w-full">
                    <ProgressRing
                      percentage={summary.attendanceRate}
                      color="#3b82f6"
                      label="Attendance"
                    />
                    <ProgressRing
                      percentage={89}
                      color="#10b981"
                      label="Tuition Paid"
                    />
                  </div>
                  <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />
                  <div className="w-full flex justify-center">
                    <ProgressRing
                      percentage={summary.completionRate || 0}
                      color="#8b5cf6"
                      label="Pathway Completion"
                    />
                  </div>
                </div>
              </section>

              {/* Checklist */}
              <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                  Course Checklist
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Register for April Term", done: true },
                    { label: "Submit PMP Application", done: true },
                    { label: "Pay Term Tuition", done: true },
                    { label: "Review Course Syllabus", done: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                          item.done
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {item.done && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold ${item.done ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300"}`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {tab === "Support" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-5 space-y-8">
              {enrollments.map((e, idx) => (
                <section
                  key={`advisor-${e.id}`}
                  className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-20 h-20 bg-white/20 rounded-3xl border border-white/20 flex items-center justify-center text-3xl font-black">
                        {e.cba?.[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tighter">
                          {e.cba}
                        </h3>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">
                          Academic Advisor
                        </p>
                        <p className="text-[10px] text-white/60 font-medium">
                          For:{" "}
                          {e.class?.customClass?.title ||
                            e.class?.course?.title}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-indigo-100 mb-10">
                      Your Success Team is here to ensure you extract maximum
                      value from the P&F training curriculum. Reach out for help
                      with schedules, materials, or certification.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center justify-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                        <Phone className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          WhatsApp
                        </span>
                      </button>
                      <button className="flex items-center justify-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                        <Mail className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          Email
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500 rounded-full blur-[80px]" />
                </section>
              ))}

              <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Frequently Asked
                </h4>
                <div className="space-y-3">
                  {[
                    "When do I get my certificate?",
                    "How to reschedule a session?",
                    "Exam eligibility requirements",
                  ].map((faq) => (
                    <button
                      key={faq}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 group"
                    >
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors">
                        {faq}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="xl:col-span-7 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                <Send className="w-6 h-6 text-indigo-600" />
                Submit Client Support Ticket
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-10 font-bold uppercase tracking-widest">
                Direct link to Admin Panel CRT
              </p>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                    Request Category
                  </label>
                  <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-600/20 outline-none">
                    <option>Finance & Receipts</option>
                    <option>LMS Access Issues</option>
                    <option>Course Transfer</option>
                    <option>Certification Correction</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                    Details (Be Specific)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tell our administrators how we can help you..."
                    className="w-full p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-xs font-medium focus:ring-2 focus:ring-indigo-600/20 outline-none resize-none"
                  />
                </div>
                <button className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all">
                  Send Request to Academy CRT
                </button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Instant Sync with Admin CRM Department
                </p>
              </form>
            </div>
          </div>
        )}

        {tab === "Media Center" && (
          <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
            <Layers className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Media Center Coming Soon
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              This repository will contain session recordings, webinar archives,
              and training toolkits.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UserDashboardPage;
