"use client";

import Card from "@/components/Card";
import {
  Plus,
  Search,
  Filter,
  Download,
  ChevronRight,
  FileText,
  Check,
  X,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import usePayment from "@/hooks/usePayment";
import { Payment } from "@/types";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import Link from "next/link";
import { Button } from "@/components/Form";

const AdminPayments = () => {
  const { payments, refreshPayments } = usePayment();
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  if (error)
    return <div className="p-10 text-center text-rose-600">Error: {error}</div>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Payments
            </h1>
            <p className="text-zinc-500 mt-1">
              Manage your payment directory and profiles.
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              setSelectedPayment(null);
            }}
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
          >
            <Plus size={18} />
            Add Payment
          </button>
        </header>

        <Card className="p-0">
          <div className="p-4 border-b border-zinc-100 flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search payments by name, email, or ID..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border border-zinc-100 rounded-xl hover:bg-zinc-50 text-zinc-600">
              <Filter size={18} />
            </button>
            <button className="p-2 border border-zinc-100 rounded-xl hover:bg-zinc-50 text-zinc-600">
              <Download size={18} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Payer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Status
                  </th> */}
                  <th className="px-6 py-4 w-16 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-zinc-900">
                        {p.transaction.payerType === "B2C"
                          ? `${p.transaction.payer.firstName} ${p.transaction.payer.lastName}`
                          : p.transaction.payer.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        {p.transaction.payerType === "B2C"
                          ? p.transaction.payer.studentId
                          : p.transaction.payer.companyId}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/transactions/${p.transaction.transactionId}`}
                      >
                        <span className="text-sm font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded-lg">
                          {p.transaction.transactionId}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                      {formatMoney(p.amountPaid, true, "Nigerian Naira")}
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-emerald-600 font-semibold">
                      {formatMoney(t.totalPaid, true, "Nigerian Naira")}
                    </td>
                    <td className="px-6 py-4 text-sm text-rose-600 font-semibold">
                      {formatMoney(t.balance, true, "Nigerian Naira")}
                    </td> */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                          p.status === "RECEIVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 w-16 text-right">
                      <div className="flex gap-2">
                        <button
                          // onClick={() => handleDeletePayment(p.id)}
                          className="flex gap-1 py-2 px-3 bg-black rounded-lg text-white cursor-pointer"
                        >
                          <Check strokeWidth={3} size={14} />
                          <span className="text-xs font-semibold">Approve</span>
                        </button>
                        <button
                          // onClick={() => handleDeletePayment(p.id)}
                          className="flex gap-1 py-2 px-3 bg-gray-200 rounded-lg text-black/70 cursor-pointer"
                        >
                          <X strokeWidth={3} size={14} />
                          <span className="text-xs font-semibold">Decline</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-zinc-500"
                    >
                      No payments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* <AnimatePresence>
          {showAddModal && (
            <PaymentFormModal
              payment={selectedPayment}
              onClose={() => {
                setShowAddModal(false);
                // fetchPayments();
                refreshPayments();
              }}
            />
          )}
        </AnimatePresence> */}
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
