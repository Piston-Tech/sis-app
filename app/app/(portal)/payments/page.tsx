"use client";

import { useMemo, useState } from "react";
import { Building2, CalendarClock, ChevronDown, CreditCard, Mail } from "lucide-react";
import { BANK_DETAILS, hasBankDetails, SUPPORT_EMAIL } from "@/constants/links";
import InvoiceDownloadButton from "@/components/student/InvoiceDownloadButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/student/States";
import { useEnrollments } from "@/components/student/queries";
import {
  accountTotals,
  courseTitle,
  formatDate,
  groupByTransaction,
  naira,
  paymentStatusLabel,
  TransactionSummary,
} from "@/components/student/format";

const cardClass = "rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8";

const TransactionRow = ({ group }: { group: TransactionSummary }) => {
  const [open, setOpen] = useState(false);
  const detailsId = `transaction-${group.transaction.id}`;
  const settled = group.outstanding === 0;

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={detailsId}
        className="grid w-full grid-cols-1 gap-3 p-6 text-left hover:bg-slate-50 sm:grid-cols-[1.2fr_2fr_1fr_1fr_auto] sm:items-center"
      >
        <span className="font-mono text-sm font-bold text-slate-900">
          {group.transaction.transactionId || `#${group.transaction.id}`}
        </span>
        <span className="text-sm text-slate-700">
          {group.enrollments.map(courseTitle).join(", ")}
        </span>
        <span className="text-sm">
          <span className="block text-xs text-slate-600 sm:hidden">Paid</span>
          <span className="font-mono font-bold text-emerald-700">{naira(group.paid)}</span>
        </span>
        <span>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${
              settled
                ? "bg-emerald-100 text-emerald-800"
                : group.outstanding === null
                  ? "bg-slate-100 text-slate-700"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {settled
              ? "Settled"
              : group.outstanding === null
                ? "Total pending"
                : `${naira(group.outstanding)} due`}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div id={detailsId} className="grid grid-cols-1 gap-6 bg-slate-50 px-6 pb-6 pt-2 lg:grid-cols-2">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Total</dt>
              <dd className="font-mono font-bold text-slate-900">{naira(group.total)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Discount</dt>
              <dd className="font-mono font-bold text-slate-900">{naira(group.discount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Paid (confirmed)</dt>
              <dd className="font-mono font-bold text-emerald-700">{naira(group.paid)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
              <dt className="font-bold text-slate-900">Outstanding</dt>
              <dd className="font-mono font-black text-slate-900">{naira(group.outstanding)}</dd>
            </div>
            {group.transaction.nextPaymentDate && !settled && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Next payment due</dt>
                <dd className="font-bold text-slate-900">
                  {formatDate(group.transaction.nextPaymentDate)}
                </dd>
              </div>
            )}
          </dl>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700">
              Payments recorded
            </h3>
            {/* The backend omits individual payments for transactions paid by
                an organisation (B2B): only the summary above is shared */}
            {!Array.isArray(group.transaction.payments) ? (
              <p className="text-sm text-slate-600">
                This course is paid for by your organisation, so individual
                payments aren&apos;t listed here. The totals above show the
                current balance.
              </p>
            ) : group.transaction.payments.length === 0 ? (
              <p className="text-sm text-slate-600">No payments recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {(group.transaction.payments ?? []).map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 text-sm"
                  >
                    <span>
                      <span className="block font-bold text-slate-900">
                        {payment.category || "Payment"}
                      </span>
                      <span className="text-slate-600">{formatDate(payment.createdAt)}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-mono font-bold text-slate-900">
                        {naira(payment.amountPaid)}
                      </span>
                      {payment.status && (
                        <span className="text-xs font-bold uppercase text-slate-600">
                          {payment.status}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </li>
  );
};

const UserPaymentsPage = () => {
  const { data, isPending, isError, error, refetch } = useEnrollments();

  const groups = useMemo(() => groupByTransaction(data ?? []), [data]);
  const totals = useMemo(() => accountTotals(groups), [groups]);
  const upcoming = groups.filter((group) => (group.outstanding ?? 0) > 0);

  if (isPending) return <LoadingState label="Loading your payments..." />;
  if (isError) {
    return (
      <ErrorState title="We couldn't load your payments" error={error} onRetry={() => refetch()} />
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Payments</h1>

      {groups.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No invoices yet"
          description="When you're enrolled in a course, its fees and payments will appear here."
        />
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className={`${cardClass} flex flex-col-reverse`}>
              <dt className="mt-1 text-sm font-semibold text-slate-600">Total paid (confirmed)</dt>
              <dd className="text-3xl font-black text-emerald-700">{naira(totals.paid)}</dd>
            </div>
            <div className={`${cardClass} flex flex-col-reverse`}>
              <dt className="mt-1 text-sm font-semibold text-slate-600">Outstanding balance</dt>
              <dd className="text-3xl font-black text-slate-900">
                {totals.hasUnknownTotals && totals.outstanding === 0 ? "—" : naira(totals.outstanding)}
              </dd>
            </div>
            <div className={`${cardClass} flex flex-col-reverse`}>
              <dt className="mt-1 text-sm font-semibold text-slate-600">Status</dt>
              <dd className="text-2xl font-black text-slate-900">{paymentStatusLabel(totals)}</dd>
            </div>
          </dl>

          {upcoming.length > 0 && (
            <section aria-labelledby="upcoming-heading" className={cardClass}>
              <h2 id="upcoming-heading" className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900">
                <CalendarClock className="h-5 w-5 text-amber-600" aria-hidden />
                Balances due
              </h2>
              <ul className="space-y-3">
                {upcoming.map((group) => (
                  <li
                    key={group.transaction.id}
                    className="flex flex-col justify-between gap-2 rounded-2xl border border-amber-100 bg-amber-50 p-4 sm:flex-row sm:items-center"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {group.enrollments.map(courseTitle).join(", ")}
                    </span>
                    <span className="text-sm text-slate-700">
                      <span className="font-mono font-black text-slate-900">{naira(group.outstanding)}</span>
                      {group.transaction.nextPaymentDate &&
                        ` • due ${formatDate(group.transaction.nextPaymentDate)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section
            aria-labelledby="ledger-heading"
            className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <h2 id="ledger-heading" className="text-xl font-black text-slate-900">
                Transactions
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Select a transaction to see its breakdown and recorded payments.
              </p>
            </div>
            <ul>
              {groups.map((group) => (
                <TransactionRow key={group.transaction.id} group={group} />
              ))}
            </ul>
          </section>

          <div className="max-w-md">
            <InvoiceDownloadButton />
          </div>
        </>
      )}

      {hasBankDetails && (
        <section aria-labelledby="bank-heading" className={cardClass}>
          <h2 id="bank-heading" className="mb-6 flex items-center gap-2 text-xl font-black text-slate-900">
            <Building2 className="h-5 w-5 text-blue-700" aria-hidden />
            Pay by bank transfer
          </h2>
          <dl className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-100 bg-slate-50 p-6 sm:grid-cols-3">
            <div className="flex flex-col-reverse">
              <dt className="text-sm font-semibold text-slate-600">Bank</dt>
              <dd className="text-base font-black text-slate-900">{BANK_DETAILS.bankName}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-sm font-semibold text-slate-600">Account number</dt>
              <dd className="font-mono text-2xl font-black tracking-tight text-slate-900">
                {BANK_DETAILS.accountNumber}
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-sm font-semibold text-slate-600">Account name</dt>
              <dd className="text-base font-black text-slate-900">{BANK_DETAILS.accountName}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-700">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span>
              {SUPPORT_EMAIL && (
                <>
                  After paying, email your receipt to{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-blue-700 underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .{" "}
                </>
              )}
              Payments appear here once the academy has confirmed them.
            </span>
          </p>
        </section>
      )}
    </div>
  );
};

export default UserPaymentsPage;
