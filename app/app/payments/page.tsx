"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { ChevronRight, CheckCircle2, FileText, Calendar, Send } from "lucide-react";

const UserPaymentsPage = () => {
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  
  // Payments Page Sub-tabs
  const [paymentSubTab, setPaymentSubTab] = useState('History');

  // Group enrollments by transaction
  const transactionGroups = Array.from(new Set([].map(e => e.transactionId)))
    .map(tid => {
        const enrollments = [].filter(e => e.transactionId === tid) || [];
        const transaction = enrollments[0]?.transaction;
        const payments = transaction?.payments || [];
        const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const totalCost = enrollments.reduce((sum, e) => sum + (e.class?.customClass?.price || 300000), 0);
        const discount = transaction?.discount || 0;
        const outstanding = Math.max(0, totalCost - totalPaid - discount);
        return { id: tid, transaction, enrollments, payments, totalPaid, totalCost, outstanding, discount };
    });

  const renderTransactionDetail = (groupId: number) => {
    const group = transactionGroups.find((t) => t.id === groupId);
    if (!group) return null;

    return (
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
        <button
          onClick={() => setSelectedTransactionId(null)}
          className="flex items-center gap-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:-translate-x-1 transition-transform">
            <ChevronRight className="w-4 h-4 transform rotate-180" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">
            Back to Transactions
          </span>
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-7 space-y-8">
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Transaction Summary
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    ID: {group.transaction?.transactionId}
                  </p>
                </div>
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${group.outstanding === 0 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                >
                  {group.outstanding === 0 ? "Paid in Full" : "Balance Pending"}
                </div>
              </div>

              <div className="p-8 space-y-10">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 px-2">
                    Associated Enrolments
                  </h5>
                  <div className="space-y-4">
                    {group.enrollments.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white mb-1">
                            {e.class?.customClass?.title ||
                              e.class?.course?.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Class ID: {e.class?.classId}
                          </p>
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          ₦
                          {(
                            e.class?.customClass?.price || 300000
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50 dark:border-white/5">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                      Next Payment Due
                    </p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {group.transaction?.nextPaymentDate
                        ? new Date(
                            group.transaction.nextPaymentDate,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                      Discount Applied
                    </p>
                    <p className="text-xl font-black text-blue-500">
                      ₦{group.discount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="xl:col-span-5 space-y-8">
            <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-8 underline decoration-blue-500 ring-offset-4 ring-offset-slate-900">
                  Payment Breakdown
                </h4>
                <div className="space-y-4 mb-20">
                  {group.payments?.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5"
                    >
                      <div>
                        <p className="text-sm font-black text-white">
                          {p.category}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase">
                          {new Date(p.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white font-mono">
                          ₦{p.amountPaid.toLocaleString()}
                        </p>
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${p.status === "Confirmed" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!group.payments || group.payments.length === 0) && (
                    <p className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-white/10 rounded-2xl">
                      No payments logged yet
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-10 border-t border-white/10">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase">
                      Total Cost
                    </span>
                    <span className="text-sm font-black font-mono">
                      ₦{group.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase">
                      Total Paid
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      ₦{group.totalPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-6 px-6 bg-blue-600/20 rounded-3xl border border-blue-500/30">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-300">
                      Remaining
                    </span>
                    <span className="text-2xl font-black font-mono text-white tracking-tighter">
                      ₦{group.outstanding.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-full h-full bg-blue-600/5 -z-0 blur-3xl rounded-full translate-x-1/2" />
            </section>
          </div>
        </div>
      </div>
    );
  };

  if (selectedTransactionId !== null)
    return renderTransactionDetail(selectedTransactionId);

  const summary = {
    totalPaid: 0,
    totalOutstanding: 0,
    attendanceRate: 0,
    completionRate: 0,
    creditsEarned: 0,
    gpa: 0,
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Sub-tabs for Payments */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto scrollbar-hide flex gap-8 px-8">
          {[
            "Upcoming Payments",
            "Offline Payment",
            "History",
            "How-to-pay",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setPaymentSubTab(tab)}
              className={`whitespace-nowrap pb-6 pt-6 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                paymentSubTab === tab
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "History"
                ? "Payment History"
                : tab === "Upcoming Payments"
                  ? "Upcoming"
                  : tab}
              {paymentSubTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {paymentSubTab === "History" && (
          <div className="space-y-8">
            {/* Transparency Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Total Paid To Date
                </p>
                <p className="text-3xl font-black text-emerald-600">
                  ₦{summary.totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Outstanding Balance
                </p>
                <p className="text-3xl font-black text-red-500">
                  ₦{summary.totalOutstanding.toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <p className="text-2xl font-black uppercase tracking-tight">
                    Active Scholar
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-emerald-100/40" />
              </div>
            </div>

            <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-white/5">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Financial Ledger
                </h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                  Select a transaction to view detailed receipt and enrolment
                  mapping
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 dark:border-slate-800">
                      <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Transaction ID
                      </th>
                      <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Enrollment(s)
                      </th>
                      <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Total cost
                      </th>
                      <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Total paid
                      </th>
                      <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Balance
                      </th>
                      <th className="p-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {transactionGroups.map((group) => (
                      <tr
                        key={group.id}
                        onClick={() =>
                          setSelectedTransactionId(group.id as number)
                        }
                        className="group hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="p-8">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase">
                              {group.transaction?.transactionId}
                            </span>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex flex-col gap-1">
                            {group.enrollments.slice(0, 1).map((e) => (
                              <span
                                key={e.id}
                                className="text-xs font-bold text-slate-600 dark:text-slate-400"
                              >
                                {e.class?.customClass?.title ||
                                  e.class?.course?.title}
                              </span>
                            ))}
                            {group.enrollments.length > 1 && (
                              <span className="text-[9px] font-black uppercase text-blue-500">
                                +{group.enrollments.length - 1} more enrolments
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-8 text-sm font-black text-slate-900 dark:text-white font-mono">
                          ₦{group.totalCost.toLocaleString()}
                        </td>
                        <td className="p-8 text-sm font-black text-emerald-600 font-mono">
                          ₦{group.totalPaid.toLocaleString()}
                        </td>
                        <td className="p-8">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${group.outstanding === 0 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                          >
                            {group.outstanding === 0
                              ? "Settled"
                              : `Pending ₦${group.outstanding.toLocaleString()}`}
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <button className="p-2 text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactionGroups.length === 0 && (
                  <div className="p-20 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">
                      No transaction records found in ledger
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {paymentSubTab === "Upcoming Payments" && (
          <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
            <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Upcoming Payments
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              You have no pending invoices. All active terms are settled.
            </p>
          </div>
        )}

        {paymentSubTab === "Offline Payment" && (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10">
              Direct Bank Transfer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Use the details below to make an offline payment. Once done,
                  upload your receipt for verification.
                </p>
                <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                      Bank Name
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase">
                      Guaranty Trust Bank (GTBank)
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                      Account Number
                    </p>
                    <p className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                      0112233445
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                      Account Name
                    </p>
                    <p className="text-base font-black text-blue-600">
                      Piston & Fusion Ltd.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center flex flex-col items-center justify-center group hover:border-blue-500 transition-all cursor-pointer">
                  <Send className="w-12 h-12 text-slate-300 group-hover:text-blue-600 mb-6" />
                  <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    Upload Receipt Image/PDF
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Max file size: 5MB
                  </p>
                </div>
                <button className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest">
                  Submit for Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentSubTab === "How-to-pay" && (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 max-w-4xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10">
              Payment Guidelines
            </h3>
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Find your Invoice",
                  desc: "Go to the Upcoming tab to see any pending invoices for your active term.",
                },
                {
                  step: "02",
                  title: "Choose Method",
                  desc: "Select between Online (Card/USSD) or Offline (Bank Transfer).",
                },
                {
                  step: "03",
                  title: "Sync Ledger",
                  desc: "Online payments sync instantly. Offline payments take 24-48h for bank reconciliation.",
                },
                {
                  step: "04",
                  title: "Download Receipt",
                  desc: "Once confirmed, your receipt appears in the History tab for download.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-8">
                  <span className="text-3xl font-black text-blue-100 dark:text-blue-900/40 leading-none">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UserPaymentsPage;
