import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AccountTotals, naira, paymentStatusLabel } from "../format";
import InvoiceDownloadButton from "../InvoiceDownloadButton";

interface Props {
  totals: AccountTotals;
  billingEntity: string | null;
}

const statusClass = (label: string) =>
  label === "All settled"
    ? "bg-emerald-100 text-emerald-800"
    : label === "Partially paid"
      ? "bg-amber-100 text-amber-800"
      : label === "Payment pending"
        ? "bg-rose-100 text-rose-800"
        : "bg-slate-100 text-slate-700";

/** Real balance summary (from the student's transactions). */
const AccountSummaryCard = ({ totals, billingEntity }: Props) => {
  const status = paymentStatusLabel(totals);

  return (
    <section
      aria-labelledby="account-summary-heading"
      className="space-y-4 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 id="account-summary-heading" className="text-base font-black uppercase text-slate-900">
        Fees &amp; payments
      </h2>

      <dl className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm">
        {billingEntity && (
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-slate-600">Billed to</dt>
            <dd className="text-right font-bold text-slate-900">{billingEntity}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-slate-600">Status</dt>
          <dd>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusClass(status)}`}>
              {status}
            </span>
          </dd>
        </div>
        {totals.count > 0 && (
          <>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-slate-600">Paid</dt>
              <dd className="font-mono font-bold text-slate-900">{naira(totals.paid)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-slate-600">Outstanding</dt>
              <dd className="font-mono font-bold text-slate-900">
                {totals.hasUnknownTotals && totals.outstanding === 0 ? "—" : naira(totals.outstanding)}
              </dd>
            </div>
          </>
        )}
      </dl>

      {totals.count > 0 && <InvoiceDownloadButton />}

      <Link
        href="/payments"
        className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline"
      >
        Payment details <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
};

export default AccountSummaryCard;
