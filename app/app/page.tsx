"use client";

import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { useEffect, useState } from "react";
// import ProgressRing from "@/components/ProgressRing";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Send,
  UserCheck,
} from "lucide-react";
// import apiClient from "@/services/apiClient";
// import Link from "next/link";
import Loading from "./loading";
import { DashboardData } from "@/types";

const ProgressRing = ({
  percentage,
  color,
  label,
}: {
  percentage: number;
  color: string;
  label: string;
}) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-slate-900 dark:text-white">
            {percentage}%
          </span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">
        {label}
      </span>
    </div>
  );
};

// const DashboardSkeleton = () => (
//   <div className="space-y-8 animate-pulse">
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       <div className="md:col-span-2 h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
//       <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
//     </div>
//     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//       <div className="lg:col-span-8 h-96 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
//       <div className="lg:col-span-4 h-96 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
//     </div>
//   </div>
// );

const UserDashboardPage = () => {
  const { currentUser: user } = useAuth();
  const activeTab = "Home";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [canJoin, setCanJoin] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<
    number | null
  >(null);

  // Dynamic Demo Simulator States for AI Studio Showcase
  const [demoLearnerState, setDemoLearnerState] = useState<"ACTIVE" | "ALUMNI">(
    "ACTIVE",
  );
  const [demoTierState, setDemoTierState] = useState<"Standard" | "Pro">("Pro");
  const [dailyFeedbackSubmitted, setDailyFeedbackSubmitted] =
    useState<boolean>(false);
  const [finalEvaluationSubmitted, setFinalEvaluationSubmitted] =
    useState<boolean>(false);

  // Active course specific checklist states
  const [downloadGuidesChecked, setDownloadGuidesChecked] = useState(false);
  const [joinGroupChecked, setJoinGroupChecked] = useState(false);
  const [completeEvaluationChecked, setCompleteEvaluationChecked] =
    useState(false);
  const [claimCertificateChecked, setClaimCertificateChecked] = useState(false);
  const [submitExamGuideChecked, setSubmitExamGuideChecked] = useState(false);

  // Form responses
  const [dailyRating, setDailyRating] = useState<number>(5);
  const [dailyComments, setDailyComments] = useState<string>("");
  const [finalRating, setFinalRating] = useState<number>(5);
  const [finalComments, setFinalComments] = useState<string>("");
  const [showDirectionsModal, setShowDirectionsModal] =
    useState<boolean>(false);

  // Home Page Sub-tabs
  const [homeSubTab, setHomeSubTab] = useState("Overview");

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

  // Group enrollments by transaction
  const transactionGroups = Array.from(
    new Set(data?.enrollments.map((e) => e.transactionId)),
  ).map((tid) => {
    const enrollments =
      data?.enrollments.filter((e) => e.transactionId === tid) || [];
    const transaction = enrollments[0]?.transaction;
    const payments = transaction?.payments || [];
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalCost = enrollments.reduce(
      (sum, e) => sum + (e.class?.customClass?.price || 300000),
      0,
    );
    const discount = transaction?.discount || 0;
    const outstanding = Math.max(0, totalCost - totalPaid - discount);
    return {
      id: tid,
      transaction,
      enrollments,
      payments,
      totalPaid,
      totalCost,
      outstanding,
      discount,
    };
  });

  const totalPaidAll = data?.summary?.totalPaid ?? transactionGroups.reduce(
    (sum, t) => sum + t.totalPaid,
    0,
  );
  const totalCostAll = transactionGroups.reduce(
    (sum, t) => sum + t.totalCost,
    0,
  );
  const totalDiscountAll = transactionGroups.reduce(
    (sum, t) => sum + t.discount,
    0,
  );
  const overallPaymentPercentage =
    totalCostAll > 0
      ? Math.round((totalPaidAll / (totalCostAll - totalDiscountAll)) * 100)
      : data?.summary && data.summary.totalOutstanding === 0
      ? 100
      : 0;

  const totalSessions = data?.sessions.length || 0;
  const attendedSessions =  0;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;

  const nextSession = data?.sessions.find((s) => s.status === "Upcoming");
  const activeEnrollment = data?.enrollments[0];

  const certCount = (() => {
    const lp: any = (data as any)?.learningPath;
    if (!lp) return 0;
    if (Array.isArray(lp)) {
      return lp.filter((m: any) => m.status === "Completed" || m.isCompleted).length;
    }
    // LearningPath object with milestones
    return (lp?.milestones?.filter((m: any) => m.isCompleted || m.status === "Completed")?.length || 0);
  })();

  useEffect(() => {
    setSelectedTransactionId(null);
    setSelectedEnrollmentId(null);
  }, [activeTab]);

  useEffect(() => {
    if (!nextSession) {
      setTimeLeft("");
      setCanJoin(false);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const sessionDate = new Date(nextSession.date).getTime();
      const [hoursStr, minutesStr] = nextSession.startTime.split(":");
      const targetTime =
        sessionDate +
        parseInt(hoursStr) * 3600000 +
        parseInt(minutesStr) * 60000;

      const distance = targetTime - now;

      if (distance < 0) {
        setTimeLeft("IN PROGRESS");
        setCanJoin(true);
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );

      // Enable join button 15 minutes before
      if (distance <= 15 * 60 * 1000) {
        setCanJoin(true);
      } else {
        setCanJoin(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextSession]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/student/dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Small delay for skeleton effect
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  const renderEnrolmentDetail = (enrollmentId: number) => {
    const enrollment = data?.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return null;

    const classSessions =
      data?.sessions.filter((s) => s.classId === enrollment.classId) || [];

    return (
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
        <button
          onClick={() => setSelectedEnrollmentId(null)}
          className="flex items-center gap-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:-translate-x-1 transition-transform">
            <ChevronRight className="w-4 h-4 transform rotate-180" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">
            Back to Overview
          </span>
        </button>

        <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-10 md:p-12 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  {enrollment.class?.classId}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                  {enrollment.status}
                </span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter mb-4">
                {enrollment.class?.customClass?.title ||
                  enrollment.class?.course?.title}
              </h2>
              <div className="flex flex-wrap gap-6 text-slate-500 mt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {enrollment.delivery}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Cohort{" "}
                    {new Date(
                      enrollment.class?.plannedStartDate!,
                    ).getFullYear()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {enrollment.cba || "Assigned Advisor"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col items-center justify-center text-center">
              <ProgressRing
                percentage={ 0}
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
                {classSessions.map((s, idx) => (
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
                {classSessions.length === 0 && (
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
      </div>
    );
  };

  const renderDirectionsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-2xl">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-blue-500 tracking-wider">
                  Onsite Coordinates
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Executive Hub & Campus
                </h4>
              </div>
            </div>
            <button
              onClick={() => setShowDirectionsModal(false)}
              className="p-1 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300 font-extrabold text-sm"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                Administrative Center Address
              </span>
              <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                Suite B4, 10 Anifowoshe Street, off Adebola Street, Ikeja,
                Lagos, Nigeria.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">
                  SSID NETWORK
                </span>
                <p className="text-xs font-black text-slate-800 dark:text-white">
                  PF_Academy_Guest
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">
                  SECURE ACCESS PASS
                </span>
                <p className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                  P&FAcademy2026!
                </p>
              </div>
            </div>

            <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-3xl border border-blue-100/50 dark:border-blue-900/30">
              <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5" /> Executive Hospitality
                Guidelines
              </h5>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 font-medium leading-tight">
                <li>
                  Lobby registration opens daily at{" "}
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    8:30 AM
                  </span>
                  . Present your digital membership card.
                </li>
                <li>
                  Hot tea, freshly ground cocoa, and snacks are available in the
                  Executive Lounge buffer.
                </li>
                <li>
                  Gourmet lunch buffet served at{" "}
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    1:00 PM
                  </span>{" "}
                  daily inside the private courtyard.
                </li>
                <li>
                  Underground secure parking is protected by active on-site
                  security personal.
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setShowDirectionsModal(false)}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.01] transition-transform"
          >
            Got it, Close Logistics Map
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );

  const renderStateSimulator = () => (
    <div className="bg-slate-950 border border-blue-500/20 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl">
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[9px] font-black uppercase text-blue-400 tracking-widest">
            ACADEMY STATE SELECTOR SIMULATOR
          </span>
          <p className="text-xs font-bold text-slate-300 mt-1 leading-tight">
            Toggle Student status & hybrid tiers directly to live-test our
            Career Portfolio Experience:
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="bg-white/5 rounded-xl p-1 border border-white/10 flex items-center gap-1">
            <button
              onClick={() => {
                setDemoLearnerState("ACTIVE");
                setHomeSubTab("Overview");
              }}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                demoLearnerState === "ACTIVE"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Active Learner (Enrolled)
            </button>
            <button
              onClick={() => {
                setDemoLearnerState("ALUMNI");
                setHomeSubTab("Overview");
              }}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                demoLearnerState === "ALUMNI"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Alumni (Between Courses)
            </button>
          </div>

          {demoLearnerState === "ACTIVE" && (
            <div className="bg-white/5 rounded-xl p-1 border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setDemoTierState("Standard")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  demoTierState === "Standard"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Standard Card
              </button>
              <button
                onClick={() => setDemoTierState("Pro")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  demoTierState === "Pro"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Pro (Hybrid/Onsite)
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -z-0 translate-x-1/2" />
    </div>
  );

  const renderActiveHero = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 text-white overflow-hidden relative group shadow-2xl animate-in slide-in-from-top-4 duration-500">
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {demoTierState === "Pro"
                ? "PRO HYBRID TRAINING BUNDLE COHORT"
                : "STANDARD ONLINE EXEC COURSE"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
            Next Active Live Session
          </h1>
          <p className="text-sm font-medium text-slate-300">
            Upcoming module:{" "}
            <span className="text-blue-400 font-black decoration-blue-500 underline underline-offset-4">
              Agile Scrum Master: High-Velocity Sprint Execution & Governance
            </span>
          </p>
          <div className="flex flex-wrap gap-4 text-slate-400 text-xs pt-2">
            <span className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-4 h-4 text-blue-500" /> Saturday, June 13,
              2026
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 text-blue-500" /> 09:00 AM - 04:00 PM
              (Lagos Local Time)
            </span>
          </div>

          <div className="pt-4">
            {demoTierState === "Standard" ? (
              <button
                onClick={() => window.open("https://zoom.us", "_blank")}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:-translate-y-0.5"
              >
                Join Live Class via Zoom
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <button
                  onClick={() => window.open("https://zoom.us", "_blank")}
                  className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider text-center transition-all shadow-lg shadow-blue-600/10"
                >
                  Join Online (Zoom)
                </button>
                <button
                  onClick={() => setShowDirectionsModal(true)}
                  className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-slate-700 hover:border-slate-600 text-center transition-all shadow-lg"
                >
                  Attend Onsite (Get Coord)
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] text-center min-w-[220px] flex flex-col justify-center shadow-xl backdrop-blur-sm self-start xl:self-center">
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] block mb-2">
            Live Session Starts In
          </span>
          <span className="text-3xl font-black font-mono tracking-tighter block text-white animate-pulse">
            00:14:52
          </span>
          <span className="text-[9px] text-slate-500 font-extrabold block mt-3 uppercase tracking-widest">
            Class Register Ready
          </span>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-0" />
    </div>
  );

  const renderAlumniHero = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-emerald-600 bg-emerald-100/60 dark:bg-emerald-500/10 font-black uppercase tracking-wider px-3 py-1 rounded-full">
              Piston & Fusion Alumni Network
            </span>
            <span className="text-[10px] text-blue-600 bg-blue-100/60 dark:bg-blue-500/10 font-black uppercase tracking-wider px-3 py-1 rounded-full">
              Upskilling Pathway Verified
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Welcome back, {user?.firstName}. Ready for your next career
            milestone?
          </h1>
          <p className="text-xs text-slate-500 font-semibold max-w-xl">
            You are currently in between courses. Frame your progress below as a
            professional credentials portfolio, download verified certificates,
            or plan your next accredited program.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
          <div className="text-left border-r border-slate-200 dark:border-slate-800 pr-6">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">
              Credentials Earned
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {certCount} Certificates
            </p>
          </div>
          <div className="text-left border-r border-slate-200 dark:border-slate-800 pr-6">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 font-mono">
              Upskilling Hours
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {data?.summary?.creditsEarned ?? 0} PDUs/CEUs
            </p>
          </div>
          <div className="text-left">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">
              Status
            </p>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Alumni Clear
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -z-0 translate-x-1/2" />
    </div>
  );

  const renderHomeSubTabs = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex items-center px-4">
      {["Overview", "Compliance & Reimbursement", "Media Center"].map((tab) => (
        <button
          key={tab}
          onClick={() => setHomeSubTab(tab)}
          className={`pb-4 pt-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all relative ${
            homeSubTab === tab
              ? "text-blue-600 font-black"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {tab}
          {homeSubTab === tab && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );

  const renderMilestonesSidebar = () => {
    return (
      <div className="space-y-8 lg:col-span-4">
        {/* ACTIONABLE TRAINING MILESTONE CHECKLIST */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6 animate-in fade-in duration-500">
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Upskilling Milestone Checklist
            </h4>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
              Your Tactical Short-Course Pipeline
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">
                Pre-Class Readiness
              </span>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all">
                  <input
                    type="checkbox"
                    checked={downloadGuidesChecked}
                    onChange={(e) => {
                      setDownloadGuidesChecked(e.target.checked);
                      if (e.target.checked)
                        alert(
                          "Downloading executive lecture notebooks and handbook resources...",
                        );
                    }}
                    className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-200 dark:bg-slate-800 border-none"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Download Lecture Guides
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase">
                      Course outline packet (PDF)
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all">
                  <input
                    type="checkbox"
                    checked={joinGroupChecked}
                    onChange={(e) => {
                      setJoinGroupChecked(e.target.checked);
                      if (e.target.checked)
                        alert(
                          "Opening WhatsApp class network group to associate and sync offline discussion boards!",
                        );
                    }}
                    className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-200 dark:bg-slate-800 border-none"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Join Class Networking Group
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase">
                      Continuous WhatsApp/Telegram Access
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">
                Post-Class Competency Mapping
              </span>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500 transition-all">
                  <input
                    type="checkbox"
                    checked={completeEvaluationChecked}
                    onChange={(e) => {
                      setCompleteEvaluationChecked(e.target.checked);
                      if (e.target.checked) {
                        alert(
                          "Prompting classroom appraisal review loop in left feed column...",
                        );
                        setDailyFeedbackSubmitted(false);
                        setFinalEvaluationSubmitted(false);
                      }
                    }}
                    className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-200 dark:bg-slate-800 border-none"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Complete Course Evaluation
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase">
                      Required for verification appraisal
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500 transition-all">
                  <input
                    type="checkbox"
                    checked={claimCertificateChecked}
                    onChange={(e) => {
                      setClaimCertificateChecked(e.target.checked);
                      if (e.target.checked) {
                        if (
                          !finalEvaluationSubmitted &&
                          !dailyFeedbackSubmitted
                        ) {
                          alert(
                            "Please complete the post-class evaluation loop first to audit metrics & unlock your plaque!",
                          );
                          setClaimCertificateChecked(false);
                        } else {
                          alert(
                            "Downloading minted secure ledgerville graduation plaque verification...",
                          );
                        }
                      }
                    }}
                    className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-200 dark:bg-slate-800 border-none"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Claim Verified Digital Certificate
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase">
                      Cryptographic plaque download
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-500 transition-all">
                  <input
                    type="checkbox"
                    checked={submitExamGuideChecked}
                    onChange={(e) => {
                      setSubmitExamGuideChecked(e.target.checked);
                      if (e.target.checked)
                        alert(
                          "Downloading specialized board exam application handbook (PMI-PMP, DevOps Scrum alliance, etc.)",
                        );
                    }}
                    className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-200 dark:bg-slate-800 border-none"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      External Exam Board Guide
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase">
                      PMP/CAPM Board Certification Steps
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* FINANCIAL ACCOUNT STATUS (Business Focused) */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
              Corporate Financial Status
            </span>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase mt-1">
              Tuition Ledger Clearance
            </h4>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Billing Entity
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-white uppercase">
                {user?.persona === "CORPORATE_ADMIN"
                  ? "Enterprise Sponsor"
                  : user?.persona === "SME_OWNER"
                    ? "Private SME Co"
                    : "Self-Paid Individual"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Status
              </span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-100/60 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                All Cleared
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              alert(
                "Downloading official tax e-receipt and corporate paid invoice backing sheet (PDF)",
              )
            }
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF Invoice & Receipt
          </button>
        </section>

        {/* QUICK ACTIONS DOCK */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-4">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
            Persistent Utilities
          </span>
          <h4 className="text-base font-black text-slate-900 dark:text-white uppercase">
            Quick Actions Dock
          </h4>

          <div className="space-y-3 pt-2">
            <button
              onClick={() =>
                alert(
                  "Generating your customized credentials audit verification (PDF formats)...",
                )
              }
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors border border-slate-100 dark:border-slate-800 rounded-xl text-left font-black text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex justify-between items-center"
            >
              <span>Download Latest Certificate</span>
              <Award className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() =>
                alert(
                  "An administrative request for a consolidated training invoice has been registered to your portal advisor.",
                )
              }
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors border border-slate-100 dark:border-slate-800 rounded-xl text-left font-black text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex justify-between items-center"
            >
              <span>Request Official Invoice</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() =>
                window.open("https://wa.me/2348000000000", "_blank")
              }
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors border border-slate-100 dark:border-slate-800 rounded-xl text-left font-black text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex justify-between items-center"
            >
              <span className="text-blue-600 dark:text-blue-400">
                Speak to a Program Advisor
              </span>
              <Phone className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderActiveBody = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Left Column: Contextual Activity Center */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Training Module Card */}
          <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
                  Accredited Block Syllabus
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1">
                  Active Upskilling Course
                </h3>
              </div>
              <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full tracking-widest">
                Enrolled Active
              </span>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-2xl">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-md font-black text-slate-900 dark:text-white uppercase leading-snug">
                    Agile Scrum Master Professional certification
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    PMI REP Center Id: 4120 • 24 CEUs
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Develop highly practical team backlog ownership skills,
                iterative velocity sizing, Kanban workspace routing, and
                executive project execution parameters. Led by PMI board
                certified fellows.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                Interactive Class Cohort Map (2 - 8 day seminar)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 flex items-center justify-center font-black text-xs">
                      D1
                    </span>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-800 dark:text-white">
                        Foundations & Sprints
                      </h5>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">
                        Completed
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 flex items-center justify-center font-black text-xs">
                      D2
                    </span>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-800 dark:text-white">
                        Estimations & Velocity
                      </h5>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">
                        Completed
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="p-4 bg-slate-100 dark:bg-white/10 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs animate-pulse">
                      D3
                    </span>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-900 dark:text-white">
                        Backlogs & Governance
                      </h5>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-bold">
                        Active Today
                      </span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex justify-between items-center opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-black text-xs">
                      D4
                    </span>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-800 dark:text-white">
                        Exam Board & Plaques
                      </h5>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">
                        Tomorrow
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Class Documents & Materials */}
          <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
                Audited Learning Backers
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1">
                Class Documents & Materials
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all flex flex-col justify-between h-40 group">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl w-fit">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase line-clamp-1">
                    Agile Handbook v3
                  </h5>
                  <span className="text-[9px] text-slate-400 font-mono">
                    PDF • 3.2 MB • Syllabus Map
                  </span>
                </div>
                <button
                  onClick={() =>
                    alert(
                      "Downloading official Agile Scrum executive handbook v3...",
                    )
                  }
                  className="text-[9px] font-black text-blue-600 group-hover:underline flex items-center gap-1 uppercase tracking-widest mt-2"
                >
                  <Download className="w-3 h-3" /> Download handbook
                </button>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between h-40 group">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl w-fit">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase line-clamp-1">
                    Sprint Grooming Template
                  </h5>
                  <span className="text-[9px] text-slate-400 font-mono">
                    XLSX • 1.8 MB • Action File
                  </span>
                </div>
                <button
                  onClick={() =>
                    alert(
                      "Downloading sprint sizing and backlog planning workspace model excel file...",
                    )
                  }
                  className="text-[9px] font-black text-emerald-600 group-hover:underline flex items-center gap-1 uppercase tracking-widest mt-2"
                >
                  <Download className="w-3 h-3" /> Download template
                </button>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between h-40 group">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl w-fit">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase line-clamp-1">
                    Mock Board Exams
                  </h5>
                  <span className="text-[9px] text-slate-400 font-mono">
                    PDF • 4.1 MB • Prep Bank
                  </span>
                </div>
                <button
                  onClick={() =>
                    alert("Downloading actual board exam case scenario pool...")
                  }
                  className="text-[9px] font-black text-indigo-600 group-hover:underline flex items-center gap-1 uppercase tracking-widest mt-2"
                >
                  <Download className="w-3 h-3" /> Download prep bank
                </button>
              </div>
            </div>
          </section>

          {/* Your Facilitator Section */}
          <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
                Continuous Quality Assurance
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1">
                Your Executive Trainer
              </h3>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-[2rem] shadow-lg flex items-center justify-center font-black text-2xl border-4 border-white dark:border-slate-900">
                WT
              </div>
              <div className="space-y-2 text-center md:text-left flex-1">
                <h4 className="text-md font-black text-slate-900 dark:text-white uppercase">
                  Dr. Wale Thompson, PMP, CSP-SM
                </h4>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">
                  Lead Agile Architect & PMI Board Fellow
                </p>
                <p className="text-xs text-slate-500 leading-normal font-medium">
                  Over 18 years of technical enterprise execution driving
                  digital agility and program portfolios at Chevron, GTBank, and
                  international upskilling cohorts.
                </p>
              </div>
            </div>

            {/* Quality appraisal form right inside feed */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-6 space-y-4">
              <h5 className="text-[11px] font-black text-slate-800 dark:text-white uppercase block">
                Rate your experience of Session 3:
              </h5>
              {!dailyFeedbackSubmitted ? (
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      Instructor rating:
                    </span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setDailyRating(star)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                            dailyRating >= star
                              ? "bg-blue-600 text-white scale-105 shadow-md shadow-blue-500/20"
                              : "bg-white dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          {star} ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                      Trainer comments:
                    </span>
                    <textarea
                      placeholder="Comment on Case Studies & delivery..."
                      rows={2}
                      value={dailyComments}
                      onChange={(e) => setDailyComments(e.target.value)}
                      className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setDailyFeedbackSubmitted(true);
                      alert(
                        "Thank you! Your quality appraisal submission has been verified.",
                      );
                    }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-transform hover:-translate-y-0.5"
                  >
                    Submit Quality Appraisal Feed
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <div>
                      <span className="text-[11px] font-black uppercase text-slate-800 dark:text-white">
                        Quality Appraisal Registered
                      </span>
                      <span className="text-[8px] text-slate-400 block uppercase font-mono">
                        Reference logged to portal ledger
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDailyFeedbackSubmitted(false)}
                    className="text-[9px] text-slate-400 hover:text-slate-900 dark:hover:text-white underline font-black uppercase tracking-widest"
                  >
                    Edit Feedback
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Milestones sidebar */}
        {renderMilestonesSidebar()}
      </div>
    );
  };

  const renderAlumniBody = () => {
    // Tailored cross-sell recommendation cards per user role
    const getRecs = () => {
      if (user?.persona === "SME_OWNER") {
        return [
          {
            title: "Primavera P6 Advanced Planning & Boardroom Scheduling",
            desc: "Accelerate structural PM growth, map board tasks, optimize corporate dependencies.",
            duration: "3 Days block",
            cost: "₦180,000",
            orig: "₦250,000",
          },
          {
            title: "Mini-MBA: Business Governance & Venture Raising",
            desc: "Pitch and raise venture seed funding with direct legal compliance registers.",
            duration: "4 Days intensive",
            cost: "₦220,000",
            orig: "₦320,000",
          },
        ];
      } else if (user?.persona === "JOB_SEEKER") {
        return [
          {
            title: "Agile Scrum Practitioner Boot Camp",
            desc: "Secure technical scrum executor qualifications and sync real-world case practices.",
            duration: "2 Days bootcamp",
            cost: "₦85,000",
            orig: "₦120,000",
          },
          {
            title: "Business Analysis Masterclass & Placement Pipe",
            desc: "Train extensively on modeling requirements for multinationals with HR referrals.",
            duration: "4 Weeks schedule",
            cost: "₦160,000",
            orig: "₦210,000",
          },
        ];
      } else {
        return [
          {
            title: "Advanced Executive Leadership & Agile Scaling structures",
            desc: "Optimize team execution and coordinate cross-functional contract governance.",
            duration: "5 Days Retreat",
            cost: "₦240,000",
            orig: "₦350,000",
          },
          {
            title: "Primavera P6 Portfolios Scheduling & Primavera Planning",
            desc: "Advanced planning matrices, resource leveling pools, and risk contingency plans.",
            duration: "3 Days block",
            cost: "₦190,000",
            orig: "₦280,000",
          },
        ];
      }
    };

    const recsList = getRecs();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Left Column: Recommendation Engine */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
                Continuous Education Engine
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1">
                Recommended Next Steps for Your Career Pathway
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Based on your specialized upskilling achievements, our academic
                directors recommend continuing your competence pathways:
              </p>
            </div>

            <div className="space-y-6">
              {recsList.map((rec, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800/50 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500/30 transition-all group"
                >
                  <div className="space-y-2 flex-1">
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase rounded tracking-wider">
                      Alumni Benefit: -30% Applied
                    </span>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      {rec.desc}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase mt-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> {rec.duration}
                      </span>
                    </div>
                  </div>

                  <div className="text-left md:text-right space-y-3 min-w-[140px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-6">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">
                        Exclusive Alumni Fee
                      </span>
                      <span className="text-xl font-black text-slate-950 dark:text-white font-mono">
                        {rec.cost}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through font-mono block">
                        {rec.orig}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        alert(
                          `Redirecting to registration portal with exclusive scholarship referral code applied!`,
                        )
                      }
                      className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all"
                    >
                      Enrol with Code
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* General Advice block */}
            <div className="p-6 bg-blue-50/50 dark:bg-blue-950/25 border border-blue-100/50 dark:border-blue-900/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left flex-1">
                <div className="p-3 bg-blue-600 text-white rounded-2xl hidden sm:block">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    Schedule a Personal Career Advisor Session
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                    Book a free 15-minute consultation with a senior executive
                    upskilling coordinator to surgically align coursework with
                    corporate promotions.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  window.open("https://wa.me/2348000000000", "_blank")
                }
                className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all w-full sm:w-auto text-center"
              >
                Book Consultation
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Milestones sidebar */}
        {renderMilestonesSidebar()}
      </div>
    );
  };

  const renderComplianceAndReimbursement = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Left Column (PO Billing Mapping, Line breakdowns) */}
      <div className="lg:col-span-8 space-y-8">
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50 dark:border-white/5">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Corporate Billing & Purchase Order (PO) Map
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Audit mappings and tax compliance registers
              </p>
            </div>
            <span className="px-3.5 py-1 bg-blue-100 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-wider">
              Sponsor Clearing Center
            </span>
          </div>

          {/* Corporate sponsor credentials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[8px] text-slate-400 font-bold uppercase block">
                Sponsor Corporation
              </span>
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase mt-1">
                {user?.persona === "SME_OWNER"
                  ? "Private Enterprise Funding"
                  : user?.persona === "JOB_SEEKER"
                    ? "Self-Paid Personal Plan"
                    : "Oando PLC / HR Training Div"}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[8px] text-slate-400 font-bold uppercase block">
                Purchase Order (PO) Ref
              </span>
              <p className="text-xs font-mono font-black text-slate-800 dark:text-white uppercase mt-1">
                {user?.persona === "JOB_SEEKER" ? "N/A" : "PO-PF-2026-092"}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[8px] text-slate-400 font-bold uppercase block">
                Clearing Registry
              </span>
              <p className="text-xs font-black text-emerald-600 mt-1 uppercase text-emerald-600 bg-emerald-100/50 px-2.5 py-0.5 rounded-full w-fit">
                100% Cleared
              </p>
            </div>
          </div>

          {/* Ledger Billing Matrix breakdown */}
          <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block mb-4">
            Official Executive Ledger
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-semibold text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                  <th className="pb-4">Training Item / Description</th>
                  <th className="pb-4 pr-4 text-right">Unit Price</th>
                  <th className="pb-4 pr-4 text-right">Corporate Disc.</th>
                  <th className="pb-4 text-right">Total Cleared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                <tr>
                  <td className="py-4">
                    <p className="font-black text-slate-800 dark:text-white uppercase leading-snug">
                      Project Management Academy Training Block (Agile Scrum
                      Hybrid)
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1 uppercase">
                      4 Days Executive Training Seminar
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right font-mono">₦300,000</td>
                  <td className="py-4 pr-4 text-right font-mono text-blue-600">
                    -₦30,000
                  </td>
                  <td className="py-4 text-right font-black font-mono text-slate-800 dark:text-white">
                    ₦270,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Right Column (Backup document lists & Generate Reimbursement Packets button) */}
      <div className="lg:col-span-4 space-y-8 font-semibold">
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Reimbursement Backup Vault
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            The backing documents are generated supporting your expense
            clearance. Submit to HR/finance to satisfy audit checks:
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-[11px] font-black uppercase text-slate-900 dark:text-white">
                    Certified Attendance Backup
                  </p>
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">
                    Verified 4 block days
                  </p>
                </div>
              </div>
              <Download
                className="w-4 h-4 text-slate-400 group-hover:text-blue-500"
                onClick={() =>
                  alert(
                    "Downloading official attendance audit backing sheet...",
                  )
                }
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-[11px] font-black uppercase text-slate-900 dark:text-white">
                    Tax Invoice Receipt
                  </p>
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">
                    RC-PF-2026-X89 • Paid
                  </p>
                </div>
              </div>
              <Download
                className="w-4 h-4 text-slate-400 group-hover:text-emerald-500"
                onClick={() =>
                  alert("Downloading original tax cleared corporate invoice...")
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-white/5">
            <button
              onClick={() => {
                alert(
                  `GENERATING EXECUTIVE COMPLIANCE PACKET...\nConsolidating:\n1. Signed Attendance Backer Letter\n2. Approved Curriculum Syllabus\n3. Verifiable Digital Certificate Plaque\n4. Paid Audit Tax-Receipt\nCompressed Bundle generated successfully as PF-Reimbursement-Packet-${user?.firstName}-${user?.lastName}.zip!`,
                );
              }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Generate Expense packet (ZIP)
            </button>
            <p className="text-center text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-3">
              Consolidates attendance, curriculum and receipt checks
            </p>
          </div>
        </section>
      </div>
    </div>
  );

  const renderMediaCenter = () => (
    <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed animate-in fade-in duration-500">
      <Layers className="w-16 h-16 text-slate-200 mx-auto mb-6" />
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
        Media Center Vault
      </h3>
      <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
        This centralized storage contains accredited webinar recordings,
        templates, checklist downloads and training manuals.
      </p>
    </div>
  );
  const renderSupport = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <div className="xl:col-span-5 space-y-8">
        {data?.enrollments.map((e, idx) => (
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
                    For: {e.class?.customClass?.title || e.class?.course?.title}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed text-indigo-100 mb-10">
                Your Success Team is here to ensure you extract maximum value
                from the P&F training curriculum. Reach out for help with
                schedules, materials, or certification.
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
  );

  if (selectedEnrollmentId !== null)
    return renderEnrolmentDetail(selectedEnrollmentId);

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* State-Based Dynamic UI Overhaul */}

        {/* Onsite directions / logistics modal */}
        {showDirectionsModal && renderDirectionsModal()}

        {/* Dynamic Simulator Interactive Widget */}
        {renderStateSimulator()}

        {/* Dynamic morphing Hero Header */}
        {demoLearnerState === "ACTIVE"
          ? renderActiveHero()
          : renderAlumniHero()}

        {/* Spacing & Selector Subtabs */}
        {renderHomeSubTabs()}

        {/* Body content rendering corresponding to exact active tab status */}
        {homeSubTab === "Overview" &&
          (demoLearnerState === "ACTIVE"
            ? renderActiveBody()
            : renderAlumniBody())}

        {homeSubTab === "Compliance & Reimbursement" &&
          renderComplianceAndReimbursement()}

        {homeSubTab === "Support" && renderSupport()}

        {homeSubTab === "Media Center" && renderMediaCenter()}
      </div>
    </AppLayout>
  );
};

export default UserDashboardPage;
