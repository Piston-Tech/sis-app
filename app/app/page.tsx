"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { MembershipTier, Student, UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";

interface DashboardProps {
  user: Student;
}

const LeadershipRadar = () => {
  const data = [
    { subject: "Communication", A: 120, fullMark: 150 },
    { subject: "Strategy", A: 98, fullMark: 150 },
    { subject: "Empathy", A: 86, fullMark: 150 },
    { subject: "Decision Making", A: 99, fullMark: 150 },
    { subject: "Coaching", A: 85, fullMark: 150 },
    { subject: "Adaptability", A: 65, fullMark: 150 },
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
          />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const KanbanBoard = () => {
  const columns = [
    { title: "Shortlist", count: 4, color: "bg-indigo-500" },
    { title: "Technical", count: 1, color: "bg-amber-500" },
    { title: "Partner", count: 0, color: "bg-emerald-500" },
  ];
  return (
    <div className="space-y-4 mt-6">
      {columns.map((col) => (
        <div
          key={col.title}
          className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all"
        >
          <div className={`w-2 h-10 rounded-full ${col.color}`} />
          <div className="flex-1">
            <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
              {col.title}
            </h5>
            <p className="text-sm font-bold text-slate-900">
              {col.count} Applications
            </p>
          </div>
          <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

const TrainingROIData = [
  { name: "W1", completion: 400, productivity: 240 },
  { name: "W2", completion: 300, productivity: 139 },
  { name: "W3", completion: 200, productivity: 980 },
  { name: "W4", completion: 278, productivity: 390 },
];

const Dashboard: React.FC<DashboardProps> = () => {
  const { currentUser: user } = useAuth();
  if (!user) return null;

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Dynamic Role-Based Hero */}
        <div className="relative p-10 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                    user.membershipTier === MembershipTier.ELITE
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : user.membershipTier === MembershipTier.PRO
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-white/10 text-white/60 border-white/20"
                  }`}
                >
                  {user.membershipTier || "No"} Membership
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">
                  Verified Account
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter mb-4">
                Hello, {user.firstName}!
              </h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                {user.persona === UserRole.JOB_SEEKER
                  ? "You're 3 certifications away from your Dream PM role at Google."
                  : user.persona === UserRole.SME_OWNER
                    ? "Your business scalability score increased by 14% this month."
                    : user.persona === UserRole.CORPORATE_ADMIN
                      ? "42 new employees have successfully completed onboarding."
                      : "Level up your executive presence with this week's Leadership workshop."}
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 min-w-[200px]">
              <div className="text-[10px] font-black uppercase text-blue-400 mb-2 tracking-[0.2em]">
                Current Streak
              </div>
              <div className="text-4xl font-black mb-1">
                12 <span className="text-lg opacity-40">Days</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-blue-500 h-full w-4/5 shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
              </div>
            </div>
          </div>

          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent"></div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Learning & Skill Hub */}
          <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Active Learning Tracks
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  Synced with P&F Global Curriculum
                </p>
              </div>
              <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                View Catalog
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Project Management Professional",
                  progress: 78,
                  tag: "PMP®",
                  color: "from-blue-600 to-blue-400",
                },
                {
                  title: "Advanced Business Analysis",
                  progress: 42,
                  tag: "IIBA®",
                  color: "from-indigo-600 to-indigo-400",
                },
              ].map((course, i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm text-xs border border-slate-100">
                      {course.tag}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900">
                        {course.progress}%
                      </span>
                      <p className="text-[10px] text-slate-400 font-black uppercase">
                        Complete
                      </p>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight mb-6">
                    {course.title}
                  </h4>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${course.color}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Contextual Widget */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {user.persona === UserRole.JOB_SEEKER
                ? "Career Pipeline"
                : user.persona === UserRole.SME_OWNER
                  ? "Growth Index"
                  : user.persona === UserRole.CORPORATE_ADMIN
                    ? "Department ROI"
                    : "Competency Profile"}
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">
              Real-time Performance Sync
            </p>

            <div className="flex-1 flex flex-col justify-center">
              {user.persona === UserRole.PROFESSIONAL && <LeadershipRadar />}
              {user.persona === UserRole.JOB_SEEKER && <KanbanBoard />}
              {user.persona === UserRole.SME_OWNER && (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm group hover:scale-105 transition-transform">
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-2">
                      Projected MRR
                    </p>
                    <p className="text-3xl font-black text-emerald-900 tracking-tighter">
                      ₦2.4M
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black mt-2">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
                      </svg>
                      +12.4%
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 shadow-sm group hover:scale-105 transition-transform">
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mb-2">
                      Employee Retention
                    </p>
                    <p className="text-3xl font-black text-blue-900 tracking-tighter">
                      94%
                    </p>
                    <p className="text-[10px] text-blue-400 mt-2 font-bold uppercase">
                      Optimal Range
                    </p>
                  </div>
                </div>
              )}
              {user.persona === UserRole.CORPORATE_ADMIN && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={TrainingROIData}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="name" hide />
                      <Tooltip
                        cursor={{ fill: "#f1f5f9", radius: 8 }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="completion"
                        fill="#2563eb"
                        radius={[8, 8, 8, 8]}
                        barSize={20}
                      />
                      <Bar
                        dataKey="productivity"
                        fill="#cbd5e1"
                        radius={[8, 8, 8, 8]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <button className="w-full mt-8 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
              Download Detailed Analytics
            </button>
          </div>

          {/* Global Resource Access */}
          <div className="md:col-span-3 bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-12">
              <div className="flex-1">
                <div className="inline-block px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black tracking-widest mb-6">
                  UNLIMITED REPOSITORY
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-6 leading-[1.1]">
                  Elite Library: 2,500+ Toolkits, Templates & Market Reports.
                </h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mb-10">
                  Access the full Piston & Fusion intellectual property
                  database. From Agile frameworks to SME scaling blueprints,
                  everything you need is one click away.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-10 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black text-sm hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1">
                    Open Resource Cloud
                  </button>
                  <button className="px-10 py-5 bg-white/10 text-white rounded-[1.5rem] font-black text-sm hover:bg-white/20 transition-all border border-white/10">
                    Browse Free Assets
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full lg:w-96">
                {[
                  { label: "Downloads", val: "14.2k" },
                  { label: "Experts", val: "120+" },
                  { label: "Templates", val: "2.5k" },
                  { label: "Daily Syncs", val: "400" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
                  >
                    <p className="text-2xl font-black text-white">{stat.val}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Polish */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
