"use client";

import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import { adminDisplayName, useAdminGlobal } from "@/app/AdminProvider";
import { useResourceList } from "@/hooks/admin/useResourceList";
import { TransactionSummary, payerName } from "@/hooks/admin/types";
import { AdminResource, QueryValue } from "@/hooks/admin/api";
import { StatusContent } from "@/components/admin/TableStatusRow";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import formatNumber from "@/utils/formatNumber";
import {
  Users,
  Calendar,
  CreditCard,
  Banknote,
  Plus,
  FileText,
} from "lucide-react";
import Link from "next/link";

/** Count from the list endpoint's pagination.total (limit=1). */
const useCount = (
  resource: AdminResource,
  filters?: Record<string, QueryValue>,
) => {
  const { pagination, hasServerPagination, isLoading, error } = useResourceList(
    resource,
    { page: 1, limit: 1, filters },
  );
  if (isLoading) return "...";
  if (error || !hasServerPagination || !pagination) return "—";
  return formatNumber(pagination.total, false);
};

const AdminDashboard = () => {
  const { currentUser } = useAdminGlobal();

  const students = useCount("students");
  const classes = useCount("classes");
  const transactions = useCount("transactions");
  const pendingPayments = useCount("payments", { status: "PENDING" });

  const recent = useResourceList<TransactionSummary>("transactions", {
    page: 1,
    limit: 5,
    sort: "createdAt",
    order: "desc",
  });

  const quickActions = [
    {
      label: "Students",
      href: "/students",
      icon: Plus,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Classes",
      href: "/classes",
      icon: Calendar,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: FileText,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Payments",
      href: "/payments",
      icon: Banknote,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Overview
        </h1>
        <p className="text-zinc-500 mt-1">
          Welcome back{currentUser ? `, ${adminDisplayName(currentUser)}` : ""}.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={students} icon={Users} />
        <StatCard label="Classes" value={classes} icon={Calendar} />
        <StatCard label="Transactions" value={transactions} icon={CreditCard} />
        <StatCard
          label="Pending Payments"
          value={pendingPayments}
          icon={Banknote}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card
          className="lg:col-span-2"
          title="Recent Transactions"
          subtitle="Latest invoices and balances"
          action={
            <Link
              href="/transactions"
              className="text-xs font-semibold text-black hover:underline"
            >
              View All
            </Link>
          }
        >
          {recent.items.length === 0 ? (
            <div className="py-6 text-center text-sm">
              <StatusContent
                isLoading={recent.isLoading}
                error={recent.error}
                emptyText="No transactions recorded yet."
                onRetry={() => recent.refetch()}
              />
            </div>
          ) : (
            <ul className="space-y-4">
              {recent.items.map((t) => {
                const name = payerName(t.payerType, t.payer);
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0"
                  >
                    <Link
                      href={`/transactions/${encodeURIComponent(t.transactionId)}`}
                      className="flex items-center gap-4 hover:underline"
                    >
                      <div
                        aria-hidden="true"
                        className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs"
                      >
                        {name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase())
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {t.transactionId} •{" "}
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900">
                        {formatMoney(t.totalDue ?? 0, true, "Nigerian Naira")}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          t.status === "Paid"
                            ? "text-emerald-600"
                            : "text-amber-600",
                        )}
                      >
                        {t.status}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all group"
              >
                <div
                  aria-hidden="true"
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
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
