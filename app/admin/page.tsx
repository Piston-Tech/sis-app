"use client";

import AdminLayout from "@/components/AdminLayout";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import { Stats } from "@/types";
import cn from "@/utils/cn";
import {
  Users,
  Building2,
  BookOpen,
  Calendar,
  CreditCard,
  Link,
  Plus,
  FileText,
  CheckSquare,
} from "lucide-react";
import { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>({
    studentsCount: 1,
    companiesCount: 1,
    classesCount: 1,
    coursesCount: 1,
    revenue: 1,
  });
  const [error, setError] = useState<string | null>(null);

  //   useEffect(() => {
  //     fetch("/api/stats")
  //       .then((res) => {
  //         if (!res.ok) throw new Error("Failed to fetch stats");
  //         return res.json();
  //       })
  //       .then(setStats)
  //       .catch((err) => {
  //         console.error(err);
  //         setError(err.message);
  //       });
  //   }, []);

  //   if (error)
  //     return (
  //       <div className="flex flex-col items-center justify-center h-full space-y-4">
  //         <p className="text-rose-600 font-semibold">Error: {error}</p>
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="px-4 py-2 bg-black text-white rounded-xl text-sm"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     );

  if (!stats)
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Overview
          </h1>
          <p className="text-zinc-500 mt-1">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            label="Total Students"
            value={stats.studentsCount}
            icon={Users}
            trend="+12%"
          />
          <StatCard
            label="Active Companies"
            value={stats.companiesCount}
            icon={Building2}
            trend="+5%"
          />
          <StatCard
            label="Courses"
            value={stats.coursesCount}
            icon={BookOpen}
          />
          <StatCard
            label="Ongoing Classes"
            value={stats.classesCount}
            icon={Calendar}
          />
          <StatCard
            label="Total Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={CreditCard}
            trend="+18%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card
            className="lg:col-span-2"
            title="Recent Transactions"
            subtitle="Latest payments and enrollments"
            action={
              <Link
                to="/transactions"
                className="text-xs font-semibold text-black hover:underline"
              >
                View All
              </Link>
            }
          >
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        John Doe
                      </p>
                      <p className="text-xs text-zinc-500">
                        PMP Certification - Oct Cohort
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">$1,200.00</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      Paid
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Add Student",
                  icon: Plus,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  label: "New Class",
                  icon: Calendar,
                  color: "bg-purple-50 text-purple-600",
                },
                {
                  label: "Create Invoice",
                  icon: FileText,
                  color: "bg-amber-50 text-amber-600",
                },
                {
                  label: "Attendance",
                  icon: CheckSquare,
                  color: "bg-emerald-50 text-emerald-600",
                },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all group"
                >
                  <div
                    className={cn(
                      "p-3 rounded-xl mb-3 transition-transform group-hover:scale-110",
                      action.color,
                    )}
                  >
                    <action.icon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
